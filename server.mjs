import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";
const root = process.cwd();
const timeZone = "America/Sao_Paulo";
const dataRoot = join(process.env.LOCALAPPDATA || process.env.HOME || "/tmp", "AbrahamsSite");
const bookingsPath = join(dataRoot, "agendamentos.json");
const weekdaySlots = ["10:00", "11:30", "14:00", "15:30", "17:00"];
const saturdaySlots = ["10:00", "11:30", "13:00"];
const supportedSegments = new Set(["Noivo", "Padrinho", "Ternos", "Calcas", "Blazers", "Camisas", "Acessorios", "Consultoria completa"]);
const githubRepository = process.env.GITHUB_REPOSITORY || "CibellaNoivas/Abrahams";
const githubDispatchToken = process.env.GITHUB_DISPATCH_TOKEN || process.env.GH_DISPATCH_TOKEN || "";
const githubDispatchEventType = process.env.GITHUB_DISPATCH_EVENT_TYPE || "abrahams_booking_created";
let inMemoryBookings = [];
let queue = Promise.resolve();

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(payload));
}

function makeHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1_000_000) throw makeHttpError(413, "Formulario muito grande.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function clean(value, max = 160) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function loadBookings() {
  try {
    const data = await readFile(bookingsPath, "utf8");
    inMemoryBookings = JSON.parse(data);
  } catch {}
  return Array.isArray(inMemoryBookings) ? inMemoryBookings : [];
}

async function saveBookings(bookings) {
  inMemoryBookings = bookings;
  try {
    await mkdir(dataRoot, { recursive: true });
    await writeFile(bookingsPath, `${JSON.stringify(bookings, null, 2)}\n`, "utf8");
  } catch {
    // Deployment platforms can be read-only; memory fallback keeps the booking flow alive.
  }
}

function withLock(task) {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
}

function dateParts(date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date).map((p) => [p.type, p.value]));
  return { ymd: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

function dateAtNoonUtc(ymd) {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function ymdFromDate(date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function addDays(ymd, count) {
  const date = dateAtNoonUtc(ymd);
  date.setUTCDate(date.getUTCDate() + count);
  return ymdFromDate(date);
}

function labelForDate(ymd) {
  const date = dateAtNoonUtc(ymd);
  const weekday = new Intl.DateTimeFormat("pt-BR", { timeZone, weekday: "long" }).format(date);
  const day = new Intl.DateTimeFormat("pt-BR", { timeZone, day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("pt-BR", { timeZone, month: "short" }).format(date).replace(".", "");
  return { weekday, day, month, label: `${weekday}, ${day} ${month}` };
}

function isPastSlot(ymd, time) {
  const now = dateParts();
  if (ymd < now.ymd) return true;
  if (ymd > now.ymd) return false;
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute <= now.minutes + 90;
}

function buildAvailability(bookings) {
  const booked = new Set(bookings.filter((b) => b.status !== "cancelled").map((b) => `${b.date}|${b.time}`));
  const start = dateParts().ymd;
  const days = [];
  for (let index = 0; index < 28; index += 1) {
    const date = addDays(start, index);
    const weekday = dateAtNoonUtc(date).getUTCDay();
    if (weekday === 0 || weekday === 1) continue;
    const slots = (weekday === 6 ? saturdaySlots : weekdaySlots).filter((time) => !booked.has(`${date}|${time}`) && !isPastSlot(date, time)).map((time) => ({ time }));
    if (slots.length) days.push({ date, ...labelForDate(date), slots });
  }
  return { timeZone, days };
}

function validateBooking(payload, availability) {
  const date = clean(payload.date, 10);
  const time = clean(payload.time, 5);
  const name = clean(payload.name, 120);
  const email = clean(payload.email, 160).toLowerCase();
  const phone = clean(payload.phone, 80);
  const segment = clean(payload.segment, 80);
  const eventDate = clean(payload.eventDate, 10);
  const notes = clean(payload.notes, 1200);
  const age = Number(payload.age);
  if (!name || !Number.isInteger(age) || age < 13 || age > 100 || !email || !phone || !segment) throw makeHttpError(400, "Preencha nome, idade, e-mail, WhatsApp e segmento.");
  if (!isEmail(email)) throw makeHttpError(400, "Informe um e-mail valido.");
  if (!supportedSegments.has(segment)) throw makeHttpError(400, "Escolha um segmento valido.");
  const matchingDay = availability.days.find((day) => day.date === date);
  const matchingSlot = matchingDay?.slots.find((slot) => slot.time === time);
  if (!matchingDay || !matchingSlot) throw makeHttpError(409, "Este horario ficou indisponivel. Escolha outro horario.");
  return { id: randomUUID(), status: "requested", createdAt: new Date().toISOString(), date, time, slotLabel: `${matchingDay.label} as ${time}`, name, age, email, phone, segment, eventDate, notes };
}

async function dispatchCalendarWorkflow(booking) {
  if (!githubDispatchToken) return { queued: false, configured: false };
  const response = await fetch(`https://api.github.com/repos/${githubRepository}/dispatches`, {
    method: "POST",
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${githubDispatchToken}`, "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28" },
    body: JSON.stringify({ event_type: githubDispatchEventType, client_payload: { booking_id: booking.id, name: booking.name, segment: booking.segment, date: booking.date, time: booking.time, email: booking.email, phone: booking.phone, notes: booking.notes, event_date: booking.eventDate } })
  });
  if (!response.ok) throw new Error(`GitHub dispatch failed: ${response.status}`);
  return { queued: true, configured: true };
}

function resolvePath(url) {
  const cleanUrl = decodeURIComponent(url.split("?")[0]);
  const requested = cleanUrl === "/" ? "/index.html" : cleanUrl;
  return join(root, normalize(requested).replace(/^(\.\.[/\\])+/, ""));
}

createServer(async (request, response) => {
  const cleanUrl = decodeURIComponent((request.url || "/").split("?")[0]);
  try {
    if (cleanUrl === "/api/agendamentos/disponibilidade" && request.method === "GET") {
      sendJson(response, 200, buildAvailability(await loadBookings()));
      return;
    }
    if (cleanUrl === "/api/agendamentos" && request.method === "POST") {
      const payload = JSON.parse((await readBody(request)).replace(/^\uFEFF/, "") || "{}");
      const booking = await withLock(async () => {
        const bookings = await loadBookings();
        const next = validateBooking(payload, buildAvailability(bookings));
        bookings.push(next);
        await saveBookings(bookings);
        return next;
      });
      let calendar = { queued: false, configured: Boolean(githubDispatchToken) };
      try { calendar = await dispatchCalendarWorkflow(booking); } catch (error) { console.error(error); calendar = { queued: false, configured: true }; }
      sendJson(response, 201, { ok: true, booking: { id: booking.id, date: booking.date, time: booking.time, slotLabel: booking.slotLabel }, calendar });
      return;
    }
    if (cleanUrl.startsWith("/api/")) { sendJson(response, 404, { error: "Endpoint nao encontrado." }); return; }
    const filePath = resolvePath(request.url || "/");
    const data = await readFile(filePath);
    response.writeHead(200, { "Content-Type": types[extname(filePath)] || "application/octet-stream", "Cache-Control": "no-store" });
    response.end(data);
  } catch (error) {
    if (cleanUrl.startsWith("/api/")) { sendJson(response, error.status || 500, { error: error.status ? error.message : "Erro interno." }); return; }
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Arquivo nao encontrado");
  }
}).listen(port, host, () => console.log(`Abrahams disponivel em http://localhost:${port}`));
