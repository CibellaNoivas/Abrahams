import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { connect as netConnect } from "node:net";
import { extname, join, normalize } from "node:path";
import { connect as tlsConnect } from "node:tls";

const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";
const root = process.cwd();
const home = process.env.USERPROFILE || process.env.HOME || "";
const timeZone = "America/Sao_Paulo";
const privateDataRoot = join(process.env.LOCALAPPDATA || home || root, "AbrahamsSite");
const bookingsPath = join(privateDataRoot, "agendamentos.json");
const catalogPath = join(privateDataRoot, "catalogo.json");
const availabilityDays = 28;
const appointmentDurationMinutes = 90;
const weekdaySlots = buildTimeSlots("09:00", "18:00", appointmentDurationMinutes);
const saturdaySlots = buildTimeSlots("09:00", "13:00", appointmentDurationMinutes);
const defaultBookingRecipients = "ibrahimhakkialtin@gmail.com,taner@cibellanoivas.com,camila@cibellanoivas.com";
const githubRepository = process.env.GITHUB_REPOSITORY || process.env.GH_REPOSITORY || "CibellaNoivas/Abrahams";
const githubDispatchToken = process.env.GITHUB_DISPATCH_TOKEN || process.env.GH_DISPATCH_TOKEN || "";
const githubDispatchEventType = process.env.GITHUB_DISPATCH_EVENT_TYPE || "abrahams_booking_created";
const googleCalendarId = process.env.GOOGLE_CALENDAR_ID || process.env.GCP_CALENDAR_ID || "camila@cibellanoivas.com";
const adminKey = process.env.ADMIN_KEY || "abrahams2026";
const companyWhatsappNumber = process.env.COMPANY_WHATSAPP || "5511915614927";
const supportedSegments = new Set([
  "Noivo",
  "Padrinho",
  "Black Tie / Gala",
  "Camisas & Bases",
  "Consultoria completa"
]);
let bookingWriteQueue = Promise.resolve();
let catalogWriteQueue = Promise.resolve();
let inMemoryBookings = [];
let inMemoryCatalog = [];
let diskPersistenceEnabled = true;
let catalogDiskPersistenceEnabled = true;

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

const generatedRoot = join(
  home,
  ".codex",
  "generated_images",
  "019dfebf-8bce-7f73-8768-d9cf51eb49d0"
);

function imageCandidates(fileName, ...fallbacks) {
  return [join(root, "assets", "images", fileName), ...fallbacks];
}

const mediaFiles = {
  "/media/abrahams-logo.png": imageCandidates(
    "abrahams-logo.png",
    join(home, "Downloads", "ChatGPT Image 7 May 2026 19_44_10.png")
  ),
  "/media/navy-fabric.png": imageCandidates(
    "navy-fabric.png",
    join(home, "Downloads", "ChatGPT Image 7 May 2026 21_48_21.png")
  ),
  "/media/abrahams-atelier-dark.png": imageCandidates(
    "abrahams-atelier-dark.png",
    join(home, "Downloads", "ChatGPT Image 7 May 2026 21_45_21.png")
  ),
  "/media/abrahams-lounge-light.png": imageCandidates(
    "abrahams-lounge-light.png",
    join(home, "Downloads", "7 May 2026 21_40_33.png")
  ),
  "/media/blue-atelier-suit.png": imageCandidates(
    "blue-atelier-suit.png",
    join(home, "Downloads", "ChatGPT Image 7 May 2026 21_37_54.png")
  ),
  "/media/generated-hero.png": imageCandidates(
    "generated-hero.png",
    join(generatedRoot, "ig_0aa6ea8a7c30c99a0169fbe861f56c81988e750fc4fff2e464.png")
  ),
  "/media/look-business.png": imageCandidates(
    "look-business.png",
    join(generatedRoot, "ig_0aa6ea8a7c30c99a0169fbe91e8b348198acbc64ffc8adf84a.png")
  ),
  "/media/look-casual.png": imageCandidates(
    "look-casual.png",
    join(generatedRoot, "ig_0aa6ea8a7c30c99a0169fbe9513a808198bf9f1dcb19c74b90.png")
  ),
  "/media/collection-detail.png": imageCandidates(
    "collection-detail.png",
    join(generatedRoot, "ig_0aa6ea8a7c30c99a0169fbe9a54fa481988ec7287e85828bca.png")
  ),
  "/media/shirts.png": imageCandidates(
    "shirts.png",
    join(generatedRoot, "ig_0aa6ea8a7c30c99a0169fbf76c2cc08198b780c79126a4c1a1.png")
  ),
  "/media/event-look.png": imageCandidates(
    "event-look.png",
    join(generatedRoot, "ig_0aa6ea8a7c30c99a0169fbf7bc3a408198860e734f8879d70b.png")
  )
};

const defaultCatalogItems = [
  {
    id: "ternos",
    title: "Ternos",
    label: "Cerimonial",
    image: "/media/look-business.png",
    text: "Ternos slim e clássicos para casamento, eventos e rotina executiva com caimento preciso.",
    tags: ["Slim", "Clássico", "Sob medida visual"]
  },
  {
    id: "calcas-de-alfaiataria",
    title: "Calças de alfaiataria",
    label: "Base",
    image: "/media/event-look.png",
    text: "Calças sociais em cortes atuais, pensadas para compor traje completo ou smart casual.",
    tags: ["Social", "Reta", "Slim"]
  },
  {
    id: "blazers",
    title: "Blazers",
    label: "Smart",
    image: "/media/look-casual.png",
    text: "Blazers modernos para elevar camisa, malha leve ou composição de evento sem excesso.",
    tags: ["Navy", "Grafite", "Texturizado"]
  },
  {
    id: "camisas",
    title: "Camisas",
    label: "Essencial",
    image: "/media/shirts.png",
    text: "Camisas brancas, azuis e bases formais para noivos, padrinhos e atendimento corporativo.",
    tags: ["Colarinho", "Punho", "Algodão"]
  },
  {
    id: "gravatas-borboleta",
    title: "Gravatas-borboleta",
    label: "Black tie",
    image: "/media/navy-fabric.png",
    text: "Papillons para cerimônias noturnas, black tie e looks com assinatura mais formal.",
    tags: ["Preto", "Navy", "Cetim"]
  },
  {
    id: "gravatas",
    title: "Gravatas",
    label: "Formal",
    image: "/media/collection-detail.png",
    text: "Gravatas discretas para casamento, formatura, eventos corporativos e recepções.",
    tags: ["Lisa", "Textura", "Champagne"]
  },
  {
    id: "abotoaduras",
    title: "Abotoaduras",
    label: "Detalhe",
    image: "/media/abrahams-atelier-dark.png",
    text: "Abotoaduras e pequenos acabamentos para finalizar o traje com presença silenciosa.",
    tags: ["Metal", "Cerimônia", "Presente"]
  }
];

function resolvePath(url) {
  const cleanUrl = decodeURIComponent(url.split("?")[0]);
  const requested = cleanUrl === "/" ? "/index.html" : cleanUrl;
  const normalized = normalize(requested).replace(/^(\.\.[/\\])+/, "");
  return join(root, normalized);
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function parseTimeToMinutes(time) {
  const [hour, minute] = String(time).split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTime(totalMinutes) {
  const hour = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minute = String(totalMinutes % 60).padStart(2, "0");
  return `${hour}:${minute}`;
}

function buildTimeSlots(openTime, closeTime, durationMinutes) {
  const open = parseTimeToMinutes(openTime);
  const close = parseTimeToMinutes(closeTime);
  const slots = [];
  for (let current = open; current + durationMinutes <= close; current += durationMinutes) {
    slots.push(minutesToTime(current));
  }
  return slots;
}

function requestUrl(request) {
  return new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
}

function ensureAdmin(request) {
  const key = requestUrl(request).searchParams.get("key");
  if (!adminKey || key !== adminKey) {
    throw makeHttpError(401, "Acesso restrito. Informe a chave correta.");
  }
}

function publicBooking(booking) {
  return {
    id: booking.id,
    status: booking.status,
    createdAt: booking.createdAt,
    date: booking.date,
    time: booking.time,
    slotLabel: booking.slotLabel,
    name: booking.name,
    age: booking.age,
    email: booking.email,
    phone: booking.phone,
    segment: booking.segment,
    eventDate: booking.eventDate,
    notes: booking.notes
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function bookingWhatsappUrl(booking) {
  const message = [
    "NOVO AGENDAMENTO - ABRAHAMS BY CIBELLA GROUP",
    `Cliente: ${booking.name}`,
    `Horario: ${booking.slotLabel}`,
    `Segmento: ${booking.segment}`,
    `Idade: ${booking.age || "nao informada"}`,
    `E-mail: ${booking.email}`,
    `WhatsApp: ${booking.phone}`,
    booking.eventDate ? `Data do evento: ${booking.eventDate}` : "",
    booking.notes ? `Detalhes: ${booking.notes}` : ""
  ].filter(Boolean).join("\n");
  return `https://wa.me/${companyWhatsappNumber}?text=${encodeURIComponent(message)}`;
}

function formatDateTimeForDisplay(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function renderAdminPage(bookings) {
  const ordered = [...bookings].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  const rows = ordered.map((booking) => `
    <article class="booking">
      <div class="booking-top">
        <div>
          <p class="meta">${escapeHtml(formatDateTimeForDisplay(booking.createdAt))}</p>
          <h2>${escapeHtml(booking.segment)} - ${escapeHtml(booking.name)}</h2>
        </div>
        <strong>${escapeHtml(booking.slotLabel || `${booking.date} ${booking.time}`)}</strong>
      </div>
      <dl>
        <div><dt>E-mail</dt><dd><a href="mailto:${escapeHtml(booking.email)}">${escapeHtml(booking.email)}</a></dd></div>
        <div><dt>WhatsApp</dt><dd><a href="https://wa.me/${escapeHtml(String(booking.phone || "").replace(/\D/g, ""))}">${escapeHtml(booking.phone)}</a></dd></div>
        <div><dt>Idade</dt><dd>${escapeHtml(booking.age || "Nao informada")}</dd></div>
        <div><dt>Data do evento</dt><dd>${escapeHtml(booking.eventDate || "Nao informada")}</dd></div>
      </dl>
      <p class="notes">${escapeHtml(booking.notes || "Sem observacoes.")}</p>
      <a class="button" target="_blank" rel="noopener noreferrer" href="${escapeHtml(bookingWhatsappUrl(booking))}">Abrir no WhatsApp</a>
    </article>
  `).join("");

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Agendamentos | Abrahams</title>
  <style>
    :root { color-scheme: dark; --navy:#08172b; --ink:#f6f2ea; --gold:#cfad68; --line:rgba(246,242,234,.16); }
    * { box-sizing: border-box; }
    body { margin:0; font-family: Inter, Arial, sans-serif; background: radial-gradient(circle at 20% 0%, #172a48, var(--navy) 42%, #050912); color:var(--ink); }
    main { width:min(1120px, calc(100% - 32px)); margin:0 auto; padding:48px 0; }
    header { display:flex; align-items:end; justify-content:space-between; gap:24px; margin-bottom:32px; border-bottom:1px solid var(--line); padding-bottom:20px; }
    h1 { margin:0; font-family: Georgia, serif; letter-spacing:.16em; font-size:clamp(28px, 5vw, 56px); font-weight:400; }
    .count { color:var(--gold); text-transform:uppercase; letter-spacing:.12em; font-weight:800; font-size:12px; }
    .grid { display:grid; gap:16px; }
    .booking { border:1px solid var(--line); background:rgba(246,242,234,.06); padding:22px; border-radius:8px; backdrop-filter: blur(18px); }
    .booking-top { display:flex; justify-content:space-between; gap:20px; align-items:start; }
    h2 { margin:6px 0 0; font-size:22px; font-weight:600; }
    .meta, dt { margin:0; color:rgba(246,242,234,.62); text-transform:uppercase; letter-spacing:.12em; font-size:11px; font-weight:800; }
    strong { color:var(--gold); font-size:20px; white-space:nowrap; }
    dl { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:14px; margin:22px 0; }
    dd { margin:6px 0 0; word-break:break-word; }
    a { color:inherit; }
    .notes { margin:0 0 18px; color:rgba(246,242,234,.78); line-height:1.65; }
    .button { display:inline-flex; min-height:42px; align-items:center; justify-content:center; border:1px solid var(--gold); color:#061225; background:var(--gold); padding:0 16px; text-decoration:none; text-transform:uppercase; letter-spacing:.12em; font-weight:900; font-size:12px; border-radius:6px; }
    .empty { border:1px dashed var(--line); padding:32px; color:rgba(246,242,234,.72); }
    .admin-actions { display:flex; align-items:center; gap:12px; flex-wrap:wrap; justify-content:flex-end; }
    @media (max-width: 780px) { header, .booking-top { display:block; } dl { grid-template-columns:1fr; } strong { display:block; margin-top:14px; } .admin-actions { justify-content:flex-start; margin-top:18px; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <p class="count">Painel privado</p>
        <h1>ABRAHAMS</h1>
      </div>
      <div class="admin-actions">
        <a class="button" href="/admin/catalogo?key=${encodeURIComponent(adminKey)}">Editar catalogo</a>
        <p class="count">${ordered.length} agendamento${ordered.length === 1 ? "" : "s"}</p>
      </div>
    </header>
    <section class="grid">${rows || '<p class="empty">Ainda nao ha agendamentos recebidos.</p>'}</section>
  </main>
</body>
</html>`;
}

function renderCatalogAdminPage(items, key) {
  const safeItems = JSON.stringify(items.map(publicCatalogItem)).replace(/</g, "\\u003c");
  const safeKey = JSON.stringify(key || "");
  const mediaOptions = JSON.stringify(Object.keys(mediaFiles));

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Catalogo | Abrahams</title>
  <style>
    :root { color-scheme: dark; --navy:#071744; --deep:#050914; --ink:#f8f3ea; --muted:rgba(248,243,234,.68); --gold:#cfad68; --line:rgba(248,243,234,.16); --panel:rgba(248,243,234,.07); }
    * { box-sizing:border-box; }
    body { margin:0; font-family: Manrope, Inter, Arial, sans-serif; background:radial-gradient(circle at 12% -10%, #22365f, var(--navy) 38%, var(--deep)); color:var(--ink); }
    main { width:min(1180px, calc(100% - 32px)); margin:0 auto; padding:42px 0 60px; }
    header { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; padding-bottom:22px; margin-bottom:22px; border-bottom:1px solid var(--line); }
    h1 { margin:0; font-family: Georgia, serif; font-weight:400; letter-spacing:.18em; font-size:clamp(30px, 5vw, 58px); }
    h2 { margin:0; font-size:20px; font-weight:700; }
    p { color:var(--muted); line-height:1.65; }
    a { color:inherit; }
    .kicker, .counter { color:var(--gold); text-transform:uppercase; letter-spacing:.14em; font-size:12px; font-weight:900; margin:0 0 8px; }
    .toolbar { display:flex; gap:12px; flex-wrap:wrap; align-items:center; justify-content:space-between; margin:0 0 18px; }
    .toolbar-actions { display:flex; gap:10px; flex-wrap:wrap; }
    button, .link-button { min-height:44px; border-radius:7px; border:1px solid var(--line); background:rgba(248,243,234,.08); color:var(--ink); padding:0 16px; font:800 12px/1 Manrope, Arial, sans-serif; text-transform:uppercase; letter-spacing:.12em; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; }
    button.primary { background:var(--gold); border-color:var(--gold); color:#061225; }
    button.danger { color:#ffcfbe; border-color:rgba(255,120,85,.35); }
    button:disabled { opacity:.55; cursor:not-allowed; }
    .status { min-height:28px; margin:8px 0 18px; color:var(--muted); }
    .status.ok { color:#bbf7d0; }
    .status.error { color:#fecaca; }
    .list { display:grid; gap:16px; }
    .product { display:grid; grid-template-columns:240px 1fr; gap:18px; border:1px solid var(--line); border-radius:8px; background:var(--panel); padding:16px; backdrop-filter:blur(18px); }
    .preview { min-height:260px; border-radius:6px; overflow:hidden; border:1px solid var(--line); background:#111927; }
    .preview img { width:100%; height:100%; object-fit:cover; display:block; }
    .product-head { display:flex; align-items:start; justify-content:space-between; gap:12px; margin-bottom:14px; }
    .product-form { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:12px; }
    label { display:grid; gap:7px; color:var(--muted); text-transform:uppercase; letter-spacing:.12em; font-size:11px; font-weight:900; }
    label.wide { grid-column:1 / -1; }
    input, textarea { width:100%; border:1px solid var(--line); border-radius:6px; background:rgba(248,243,234,.92); color:#111827; padding:13px 14px; font:600 14px/1.4 Manrope, Arial, sans-serif; outline:none; }
    textarea { min-height:96px; resize:vertical; }
    input:focus, textarea:focus { border-color:var(--gold); box-shadow:0 0 0 3px rgba(207,173,104,.18); }
    .help { color:var(--muted); font-size:13px; margin:18px 0 0; }
    @media (max-width: 840px) {
      header, .toolbar { display:block; }
      .toolbar-actions { margin-top:14px; }
      .product { grid-template-columns:1fr; }
      .preview { min-height:220px; }
      .product-form { grid-template-columns:1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <p class="kicker">Painel privado</p>
        <h1>CATALOGO</h1>
        <p>Adicione, remova ou edite os produtos que aparecem na secao Catalogo do site.</p>
      </div>
      <p class="counter"><span id="count">0</span> produtos</p>
    </header>
    <section class="toolbar" aria-label="Acoes do catalogo">
      <div class="toolbar-actions">
        <button type="button" id="add-product">Adicionar produto</button>
        <button type="button" class="primary" id="save-catalog">Salvar catalogo</button>
      </div>
      <div class="toolbar-actions">
        <a class="link-button" href="/?catalogo=1#catalogo" target="_blank" rel="noopener noreferrer">Ver site</a>
        <a class="link-button" href="/admin?key=${encodeURIComponent(key || "")}">Agendamentos</a>
      </div>
    </section>
    <p id="status" class="status" role="status" aria-live="polite"></p>
    <datalist id="media-options"></datalist>
    <section id="catalog-list" class="list" aria-label="Produtos do catalogo"></section>
    <p class="help">Imagem pode ser um caminho existente como /media/look-business.png ou uma URL https de imagem. Depois de salvar, atualize o site e a vitrine muda automaticamente.</p>
  </main>
  <script>
    const adminKey = ${safeKey};
    const mediaOptions = ${mediaOptions};
    let items = ${safeItems};
    const list = document.getElementById("catalog-list");
    const statusEl = document.getElementById("status");
    const countEl = document.getElementById("count");
    const saveButton = document.getElementById("save-catalog");
    const optionList = document.getElementById("media-options");

    mediaOptions.forEach((path) => {
      const option = document.createElement("option");
      option.value = path;
      optionList.append(option);
    });

    function setStatus(message, type) {
      statusEl.textContent = message || "";
      statusEl.className = "status " + (type || "");
    }

    function makeField(labelText, field, value, wide, multiline) {
      const label = document.createElement("label");
      label.textContent = labelText;
      if (wide) label.className = "wide";
      const input = document.createElement(multiline ? "textarea" : "input");
      input.value = Array.isArray(value) ? value.join(", ") : (value || "");
      input.dataset.field = field;
      if (field === "image") input.setAttribute("list", "media-options");
      label.append(input);
      return label;
    }

    function readTags(value) {
      return String(value || "").split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 6);
    }

    function render() {
      list.replaceChildren();
      countEl.textContent = String(items.length);
      items.forEach((item, index) => {
        const article = document.createElement("article");
        article.className = "product";
        article.dataset.index = String(index);

        const preview = document.createElement("div");
        preview.className = "preview";
        const image = document.createElement("img");
        image.alt = item.title || "Produto Abrahams";
        image.src = item.image || "/media/collection-detail.png";
        preview.append(image);

        const body = document.createElement("div");
        const head = document.createElement("div");
        head.className = "product-head";
        const titleWrap = document.createElement("div");
        const small = document.createElement("p");
        small.className = "kicker";
        small.textContent = item.label || "Linha";
        const title = document.createElement("h2");
        title.textContent = item.title || "Produto";
        titleWrap.append(small, title);
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "danger";
        remove.dataset.action = "remove";
        remove.textContent = "Remover";
        head.append(titleWrap, remove);

        const form = document.createElement("div");
        form.className = "product-form";
        form.append(
          makeField("Titulo", "title", item.title),
          makeField("Etiqueta", "label", item.label),
          makeField("Imagem", "image", item.image, true),
          makeField("Descricao", "text", item.text, true, true),
          makeField("Tags separadas por virgula", "tags", item.tags, true)
        );

        body.append(head, form);
        article.append(preview, body);
        list.append(article);
      });
    }

    list.addEventListener("input", (event) => {
      const field = event.target.dataset.field;
      const card = event.target.closest(".product");
      if (!field || !card) return;
      const item = items[Number(card.dataset.index)];
      if (!item) return;
      if (field === "tags") {
        item.tags = readTags(event.target.value);
      } else {
        item[field] = event.target.value;
      }
      if (field === "title") {
        card.querySelector("h2").textContent = item.title || "Produto";
        card.querySelector("img").alt = item.title || "Produto Abrahams";
      }
      if (field === "label") {
        card.querySelector(".kicker").textContent = item.label || "Linha";
      }
      if (field === "image") {
        card.querySelector("img").src = item.image || "/media/collection-detail.png";
      }
      setStatus("Alteracao ainda nao salva.", "");
    });

    list.addEventListener("click", (event) => {
      if (event.target.dataset.action !== "remove") return;
      const card = event.target.closest(".product");
      const index = Number(card.dataset.index);
      items.splice(index, 1);
      render();
      setStatus("Produto removido da tela. Clique em Salvar catalogo para confirmar.", "");
    });

    document.getElementById("add-product").addEventListener("click", () => {
      items.push({
        id: "",
        title: "Novo produto",
        label: "Linha",
        image: "/media/collection-detail.png",
        text: "Descricao do produto para aparecer no catalogo.",
        tags: ["Novo"]
      });
      render();
      list.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "center" });
      setStatus("Novo produto criado. Edite os campos e salve.", "");
    });

    saveButton.addEventListener("click", async () => {
      saveButton.disabled = true;
      setStatus("Salvando catalogo...", "");
      try {
        const response = await fetch("/api/admin/catalogo?key=" + encodeURIComponent(adminKey), {
          method: "PUT",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ items })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Nao foi possivel salvar.");
        items = data.items || items;
        render();
        setStatus("Catalogo salvo. O site ja esta usando esses produtos.", "ok");
      } catch (error) {
        setStatus(error.message || "Erro ao salvar catalogo.", "error");
      } finally {
        saveButton.disabled = false;
      }
    });

    render();
  </script>
</body>
</html>`;
}

function makeHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function readRequestBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1_000_000) {
      throw makeHttpError(413, "Formulario muito grande.");
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function cleanText(value, maxLength = 160) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanLongText(value, maxLength = 1400) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function slugify(value) {
  return cleanText(value, 80)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function normalizeCatalogImage(value) {
  const image = cleanText(value, 260);
  if (!image) {
    return "/media/collection-detail.png";
  }
  if (image.startsWith("/") || image.startsWith("https://") || image.startsWith("http://")) {
    return image;
  }
  return "/media/collection-detail.png";
}

function normalizeCatalogTags(value) {
  const raw = Array.isArray(value) ? value : String(value || "").split(",");
  return raw
    .map((tag) => cleanText(tag, 34))
    .filter(Boolean)
    .slice(0, 6);
}

function sanitizeCatalogItem(item, index, usedIds) {
  if (!item || typeof item !== "object") {
    throw makeHttpError(400, "Produto invalido no catalogo.");
  }

  const title = cleanText(item.title, 80);
  const text = cleanLongText(item.text, 360);
  if (!title || !text) {
    throw makeHttpError(400, "Cada produto precisa de titulo e descricao.");
  }

  let id = slugify(item.id || title) || `produto-${index + 1}`;
  while (usedIds.has(id)) {
    id = `${id}-${index + 1}`;
  }
  usedIds.add(id);

  return {
    id,
    title,
    label: cleanText(item.label, 42) || "Linha",
    image: normalizeCatalogImage(item.image),
    text,
    tags: normalizeCatalogTags(item.tags)
  };
}

function sanitizeCatalogList(value) {
  const rawItems = Array.isArray(value) ? value : [];
  const usedIds = new Set();
  const items = rawItems.slice(0, 80).map((item, index) => sanitizeCatalogItem(item, index, usedIds));
  if (!items.length) {
    throw makeHttpError(400, "O catalogo precisa de pelo menos um produto.");
  }
  return items;
}

function publicCatalogItem(item) {
  return {
    id: item.id,
    title: item.title,
    label: item.label,
    image: item.image,
    text: item.text,
    tags: Array.isArray(item.tags) ? item.tags : []
  };
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isRealDate(day, month, year) {
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function normalizeDisplayDate(value) {
  const raw = cleanText(value, 10);
  if (!raw) {
    return "";
  }

  let day;
  let month;
  let year;
  const br = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (br) {
    [, day, month, year] = br;
  } else if (iso) {
    [, year, month, day] = iso;
  } else {
    throw makeHttpError(400, "Informe a data do evento no formato DD/MM/AAAA.");
  }

  const numericDay = Number(day);
  const numericMonth = Number(month);
  const numericYear = Number(year);
  if (!isRealDate(numericDay, numericMonth, numericYear)) {
    throw makeHttpError(400, "Informe uma data do evento valida.");
  }

  return `${String(numericDay).padStart(2, "0")}/${String(numericMonth).padStart(2, "0")}/${numericYear}`;
}

async function loadBookings() {
  if (!diskPersistenceEnabled) {
    return inMemoryBookings;
  }

  try {
    const data = await withTimeout(readFile(bookingsPath, "utf8"), "Leitura da agenda");
    const bookings = JSON.parse(data);
    inMemoryBookings = Array.isArray(bookings) ? bookings : [];
    return inMemoryBookings;
  } catch (error) {
    if (error.code === "ENOENT") {
      return inMemoryBookings;
    }
    diskPersistenceEnabled = false;
    console.warn(`Agenda em modo memoria: ${error.message}`);
    return inMemoryBookings;
  }
}

async function saveBookings(bookings) {
  inMemoryBookings = bookings;
  if (!diskPersistenceEnabled) {
    return;
  }

  try {
    await withTimeout(mkdir(privateDataRoot, { recursive: true }), "Criacao da pasta de agenda");
    await withTimeout(writeFile(bookingsPath, `${JSON.stringify(bookings, null, 2)}\n`, "utf8"), "Gravacao da agenda");
  } catch (error) {
    diskPersistenceEnabled = false;
    console.warn(`Agenda em modo memoria: ${error.message}`);
  }
}

async function loadCatalog() {
  if (!catalogDiskPersistenceEnabled) {
    return inMemoryCatalog.length ? inMemoryCatalog : defaultCatalogItems;
  }

  try {
    const data = await withTimeout(readFile(catalogPath, "utf8"), "Leitura do catalogo");
    const parsed = JSON.parse(data);
    const items = sanitizeCatalogList(Array.isArray(parsed) ? parsed : parsed.items);
    inMemoryCatalog = items;
    return items;
  } catch (error) {
    if (error.code === "ENOENT") {
      inMemoryCatalog = defaultCatalogItems;
      return defaultCatalogItems;
    }
    catalogDiskPersistenceEnabled = false;
    console.warn(`Catalogo em modo memoria: ${error.message}`);
    return inMemoryCatalog.length ? inMemoryCatalog : defaultCatalogItems;
  }
}

async function saveCatalog(items) {
  const cleanItems = sanitizeCatalogList(items);
  inMemoryCatalog = cleanItems;
  if (!catalogDiskPersistenceEnabled) {
    return cleanItems;
  }

  try {
    await withTimeout(mkdir(privateDataRoot, { recursive: true }), "Criacao da pasta do catalogo");
    await withTimeout(
      writeFile(catalogPath, `${JSON.stringify({ updatedAt: new Date().toISOString(), items: cleanItems }, null, 2)}\n`, "utf8"),
      "Gravacao do catalogo"
    );
  } catch (error) {
    catalogDiskPersistenceEnabled = false;
    console.warn(`Catalogo em modo memoria: ${error.message}`);
  }
  return cleanItems;
}

function withBookingLock(task) {
  const run = bookingWriteQueue.then(task, task);
  bookingWriteQueue = run.catch(() => {});
  return run;
}

function withCatalogLock(task) {
  const run = catalogWriteQueue.then(task, task);
  catalogWriteQueue = run.catch(() => {});
  return run;
}

function withTimeout(promise, label, milliseconds = 1500) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} excedeu ${milliseconds}ms`)), milliseconds);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function dateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return {
    ymd: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute)
  };
}

function dateAtNoonUtc(ymd) {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function ymdFromDate(date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function addDays(ymd, count) {
  const date = dateAtNoonUtc(ymd);
  date.setUTCDate(date.getUTCDate() + count);
  return ymdFromDate(date);
}

function labelForDate(ymd) {
  const date = dateAtNoonUtc(ymd);
  const year = new Intl.DateTimeFormat("pt-BR", { timeZone, year: "numeric" }).format(date);
  const weekday = new Intl.DateTimeFormat("pt-BR", { timeZone, weekday: "long" }).format(date);
  const day = new Intl.DateTimeFormat("pt-BR", { timeZone, day: "2-digit" }).format(date);
  const monthNumber = new Intl.DateTimeFormat("pt-BR", { timeZone, month: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("pt-BR", { timeZone, month: "short" })
    .format(date)
    .replace(".", "");
  const monthLong = new Intl.DateTimeFormat("pt-BR", { timeZone, month: "long" }).format(date);
  return {
    weekday,
    day,
    month,
    year,
    compactLabel: `${day}/${monthNumber}/${year}`,
    label: `${weekday}, ${day} de ${monthLong} de ${year}`
  };
}

function weekdayForDate(ymd) {
  return dateAtNoonUtc(ymd).getUTCDay();
}

function isPastSlot(ymd, time) {
  const now = dateParts();
  if (ymd < now.ymd) {
    return true;
  }
  if (ymd > now.ymd) {
    return false;
  }
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute <= now.minutes + 90;
}

function buildAvailability(bookings) {
  const booked = new Set(
    bookings
      .filter((booking) => booking.status !== "cancelled")
      .map((booking) => `${booking.date}|${booking.time}`)
  );
  const start = dateParts().ymd;
  const days = [];

  for (let index = 0; index < availabilityDays; index += 1) {
    const date = addDays(start, index);
    const weekday = weekdayForDate(date);
    if (weekday === 0) {
      continue;
    }

    const slots = (weekday === 6 ? saturdaySlots : weekdaySlots)
      .filter((time) => !booked.has(`${date}|${time}`) && !isPastSlot(date, time))
      .map((time) => ({ time }));

    if (slots.length > 0) {
      days.push({
        date,
        ...labelForDate(date),
        slots
      });
    }
  }

  return { timeZone, days };
}

function validateBooking(payload, availability) {
  const date = cleanText(payload.date, 10);
  const time = cleanText(payload.time, 5);
  const name = cleanText(payload.name, 120);
  const email = cleanText(payload.email, 160).toLowerCase();
  const phone = cleanText(payload.phone, 80);
  const segment = cleanText(payload.segment, 80);
  const eventDate = normalizeDisplayDate(payload.eventDate);
  const notes = cleanLongText(payload.notes, 1400);
  const age = Number(payload.age);

  if (!name || !Number.isInteger(age) || age < 13 || age > 100 || !email || !phone || !segment) {
    throw makeHttpError(400, "Preencha nome, idade, e-mail, WhatsApp e segmento.");
  }
  if (!isEmail(email)) {
    throw makeHttpError(400, "Informe um e-mail valido.");
  }
  if (!supportedSegments.has(segment)) {
    throw makeHttpError(400, "Escolha um segmento valido.");
  }

  const matchingDay = availability.days.find((day) => day.date === date);
  const matchingSlot = matchingDay?.slots.find((slot) => slot.time === time);
  if (!matchingDay || !matchingSlot) {
    throw makeHttpError(409, "Este horario acabou de ficar indisponivel. Escolha outro horario.");
  }

  return {
    id: randomUUID(),
    status: "requested",
    createdAt: new Date().toISOString(),
    date,
    time,
    slotLabel: `${matchingDay.label} às ${time}`,
    name,
    age,
    email,
    phone,
    segment,
    eventDate,
    notes
  };
}

function emailRecipient() {
  return process.env.BOOKING_TO_EMAIL || process.env.SMTP_TO || defaultBookingRecipients;
}

function calendarRecipients() {
  return process.env.CALENDAR_ATTENDEE_EMAILS || emailRecipient();
}

function smtpIsConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && emailRecipient());
}

function headerSafe(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

function extractEmail(address) {
  const match = String(address || "").match(/<([^>]+)>/);
  return headerSafe(match ? match[1] : address);
}

function parseEmailList(value) {
  return String(value || "")
    .split(",")
    .map((item) => extractEmail(item))
    .filter(Boolean);
}

function encodeHeader(value) {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function escapeIcsText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldIcsLine(line) {
  const chunks = [];
  let current = line;
  while (Buffer.byteLength(current, "utf8") > 73) {
    let length = 0;
    let index = 0;
    for (const char of current) {
      const nextLength = length + Buffer.byteLength(char, "utf8");
      if (nextLength > 73) {
        break;
      }
      length = nextLength;
      index += char.length;
    }
    chunks.push(current.slice(0, index));
    current = current.slice(index);
  }
  chunks.push(current);
  return chunks.map((chunk, index) => (index === 0 ? chunk : ` ${chunk}`)).join("\r\n");
}

function formatIcsDate(date, time = "00:00") {
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");
  return `${year}${month}${day}T${hour}${minute}00`;
}

function formatUtcIcsDate(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function addMinutesToTime(date, time, minutesToAdd) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute + minutesToAdd, 0));
  const nextYear = String(utcDate.getUTCFullYear()).padStart(4, "0");
  const nextMonth = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
  const nextDay = String(utcDate.getUTCDate()).padStart(2, "0");
  const nextHour = String(utcDate.getUTCHours()).padStart(2, "0");
  const nextMinute = String(utcDate.getUTCMinutes()).padStart(2, "0");
  return {
    date: `${nextYear}-${nextMonth}-${nextDay}`,
    time: `${nextHour}:${nextMinute}`
  };
}

function buildCalendarInvite(booking, request, attendees) {
  const start = addMinutesToTime(booking.date, booking.time, 0);
  const end = addMinutesToTime(booking.date, booking.time, appointmentDurationMinutes);
  const organizerEmail = extractEmail(process.env.CALENDAR_ORGANIZER_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER || attendees[0] || "");
  const summary = `${booking.segment} - ${booking.name}`;
  const location = "R. João Amaro, 31 - Cidade Monções, São Paulo - SP, 04583-030";
  const description = [
    formatReport(booking, request),
    "",
    "Este convite foi criado automaticamente pelo formulario de agendamento do site Abrahams."
  ].join("\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "PRODID:-//Abrahams by Cibella Group//Agendamento//PT-BR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${booking.id}@abrahams-cibella`,
    `DTSTAMP:${formatUtcIcsDate()}`,
    `DTSTART;TZID=${timeZone}:${formatIcsDate(start.date, start.time)}`,
    `DTEND;TZID=${timeZone}:${formatIcsDate(end.date, end.time)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "SEQUENCE:0"
  ];

  if (organizerEmail) {
    lines.push(`ORGANIZER;CN=Abrahams by Cibella Group:mailto:${organizerEmail}`);
  }
  attendees.forEach((email) => {
    lines.push(`ATTENDEE;CN=${escapeIcsText(email)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${email}`);
  });
  if (process.env.INCLUDE_CLIENT_IN_INVITE === "true") {
    lines.push(`ATTENDEE;CN=${escapeIcsText(booking.name)};ROLE=OPT-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${booking.email}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}

function formatReport(booking, request) {
  const createdAt = new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    dateStyle: "full",
    timeStyle: "short"
  }).format(new Date(booking.createdAt));

  return [
    "NOVO AGENDAMENTO - ABRAHAMS BY CIBELLA GROUP",
    "",
    "Resumo do atendimento",
    `- Cliente: ${booking.name}`,
    `- Idade: ${booking.age}`,
    `- Segmento procurado: ${booking.segment}`,
    `- Horario escolhido: ${booking.slotLabel} (America/Sao_Paulo)`,
    booking.eventDate ? `- Data do evento: ${booking.eventDate}` : "- Data do evento: nao informada",
    "",
    "Contato",
    `- E-mail: ${booking.email}`,
    `- WhatsApp/telefone: ${booking.phone}`,
    "",
    "Observacoes do cliente",
    booking.notes || "Sem observacoes adicionais.",
    "",
    "Relatorio operacional",
    `- Protocolo: ${booking.id}`,
    `- Solicitado em: ${createdAt}`,
    `- Origem: formulario do site`,
    `- IP: ${request.socket.remoteAddress || "nao identificado"}`,
    `- Navegador: ${request.headers["user-agent"] || "nao identificado"}`,
    "",
    "Proximo passo sugerido",
    "Confirmar disponibilidade final com o cliente e preparar curadoria inicial de traje conforme segmento informado."
  ].join("\n");
}

function readSmtpResponse(socket) {
  return new Promise((resolve, reject) => {
    let chunks = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("SMTP timeout"));
    }, 18_000);
    const cleanup = () => {
      clearTimeout(timer);
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("end", onEnd);
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    const onEnd = () => {
      cleanup();
      reject(new Error("SMTP connection closed"));
    };
    const onData = (chunk) => {
      chunks += chunk.toString("utf8");
      const lines = chunks.split(/\r?\n/).filter(Boolean);
      if (lines.length && /^\d{3} /.test(lines[lines.length - 1])) {
        cleanup();
        resolve(chunks);
      }
    };

    socket.on("data", onData);
    socket.once("error", onError);
    socket.once("end", onEnd);
  });
}

async function smtpCommand(socket, command, expectedCodes) {
  const responsePromise = readSmtpResponse(socket);
  if (command) {
    socket.write(`${command}\r\n`);
  }
  const response = await responsePromise;
  const lastLine = response.split(/\r?\n/).filter(Boolean).at(-1) || "";
  const code = Number(lastLine.slice(0, 3));
  if (!expectedCodes.includes(code)) {
    throw new Error(`SMTP command failed: ${command || "greeting"} -> ${lastLine}`);
  }
  return response;
}

function waitForSocket(socket, eventName) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      socket.off(eventName, onEvent);
      socket.off("error", onError);
    };
    const onEvent = () => {
      cleanup();
      resolve();
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    socket.once(eventName, onEvent);
    socket.once("error", onError);
  });
}

function buildMimeMessage({ from, to, replyTo, subject, text, calendarInvite }) {
  const headers = [
    `From: ${headerSafe(from)}`,
    `To: ${headerSafe(to)}`,
    `Reply-To: ${headerSafe(replyTo)}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0"
  ];

  if (!calendarInvite) {
    return [
      ...headers,
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: 8bit",
      "",
      text
    ].join("\r\n");
  }

  const boundary = `abrahams-${randomUUID()}`;
  return [
    ...headers,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    "",
    `--${boundary}`,
    "Content-Type: text/calendar; charset=UTF-8; method=REQUEST; name=agendamento-abrahams.ics",
    "Content-Transfer-Encoding: 8bit",
    "Content-Disposition: attachment; filename=agendamento-abrahams.ics",
    "",
    calendarInvite,
    `--${boundary}--`
  ].join("\r\n");
}

async function sendSmtpMail({ from, to, replyTo, subject, text, calendarInvite }) {
  const host = process.env.SMTP_HOST;
  const portNumber = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || portNumber === 465;
  const ehlo = process.env.SMTP_EHLO || "abrahams.local";
  const recipients = parseEmailList(to);
  let socket = secure ? tlsConnect({ host, port: portNumber, servername: host }) : netConnect({ host, port: portNumber });

  if (secure) {
    await waitForSocket(socket, "secureConnect");
  } else {
    await waitForSocket(socket, "connect");
  }

  socket.setTimeout(18_000);
  await smtpCommand(socket, null, [220]);
  await smtpCommand(socket, `EHLO ${ehlo}`, [250]);

  if (!secure) {
    await smtpCommand(socket, "STARTTLS", [220]);
    socket = tlsConnect({ socket, servername: host });
    await waitForSocket(socket, "secureConnect");
    socket.setTimeout(18_000);
    await smtpCommand(socket, `EHLO ${ehlo}`, [250]);
  }

  await smtpCommand(socket, "AUTH LOGIN", [334]);
  await smtpCommand(socket, Buffer.from(process.env.SMTP_USER || "", "utf8").toString("base64"), [334]);
  await smtpCommand(socket, Buffer.from(process.env.SMTP_PASS || "", "utf8").toString("base64"), [235]);
  await smtpCommand(socket, `MAIL FROM:<${extractEmail(from)}>`, [250]);
  for (const recipient of recipients) {
    await smtpCommand(socket, `RCPT TO:<${recipient}>`, [250, 251]);
  }
  await smtpCommand(socket, "DATA", [354]);

  const message = buildMimeMessage({ from, to, replyTo, subject, text, calendarInvite }).replace(/^\./gm, "..");

  const dataResponse = readSmtpResponse(socket);
  socket.write(`${message}\r\n.\r\n`);
  const sentResponse = await dataResponse;
  const lastLine = sentResponse.split(/\r?\n/).filter(Boolean).at(-1) || "";
  if (!lastLine.startsWith("250")) {
    throw new Error(`SMTP send failed: ${lastLine}`);
  }

  try {
    await smtpCommand(socket, "QUIT", [221]);
  } finally {
    socket.end();
  }
}

async function notifyBooking(booking, request) {
  if (!smtpIsConfigured()) {
    console.warn("Agendamento salvo sem envio de e-mail. Configure SMTP_HOST, SMTP_USER, SMTP_PASS e BOOKING_TO_EMAIL.");
    return { sent: false, configured: false };
  }

  const from = process.env.SMTP_FROM || `"Abrahams Agendamento" <${process.env.SMTP_USER}>`;
  const reportRecipients = parseEmailList(emailRecipient());
  const calendarAttendees = parseEmailList(calendarRecipients());
  const attendees = calendarAttendees.length ? calendarAttendees : reportRecipients;
  const to = Array.from(new Set([...reportRecipients, ...attendees])).join(",");
  const replyTo = `"${headerSafe(booking.name)}" <${booking.email}>`;
  await sendSmtpMail({
    from,
    to,
    replyTo,
    subject: `Novo agendamento Abrahams - ${booking.name} - ${booking.date} ${booking.time}`,
    text: formatReport(booking, request),
    calendarInvite: buildCalendarInvite(booking, request, attendees)
  });
  return { sent: true, configured: true };
}

function githubCalendarIsConfigured() {
  return Boolean(githubRepository && githubDispatchToken);
}

async function dispatchCalendarWorkflow(booking) {
  if (!githubCalendarIsConfigured()) {
    return { queued: false, configured: false };
  }

  const response = await fetch(`https://api.github.com/repos/${githubRepository}/dispatches`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${githubDispatchToken}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    body: JSON.stringify({
      event_type: githubDispatchEventType,
      client_payload: {
        booking_id: booking.id,
        name: booking.name,
        segment: booking.segment,
        date: booking.date,
        time: booking.time,
        email: booking.email,
        phone: booking.phone,
        notes: booking.notes,
        event_date: booking.eventDate,
        calendar_id: googleCalendarId
      }
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`GitHub dispatch falhou: ${response.status} ${detail}`);
  }

  return { queued: true, configured: true };
}

createServer(async (request, response) => {
  const cleanUrl = decodeURIComponent((request.url || "/").split("?")[0]);
  try {
    if (cleanUrl === "/admin" && request.method === "GET") {
      ensureAdmin(request);
      const bookings = await loadBookings();
      response.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      });
      response.end(renderAdminPage(bookings));
      return;
    }

    if (cleanUrl === "/admin/catalogo" && request.method === "GET") {
      ensureAdmin(request);
      const catalog = await loadCatalog();
      response.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      });
      response.end(renderCatalogAdminPage(catalog, requestUrl(request).searchParams.get("key")));
      return;
    }

    if (cleanUrl === "/api/catalogo" && request.method === "GET") {
      const catalog = await loadCatalog();
      sendJson(response, 200, {
        ok: true,
        count: catalog.length,
        items: catalog.map(publicCatalogItem)
      });
      return;
    }

    if (cleanUrl === "/api/admin/catalogo" && request.method === "GET") {
      ensureAdmin(request);
      const catalog = await loadCatalog();
      sendJson(response, 200, {
        ok: true,
        count: catalog.length,
        media: Object.keys(mediaFiles),
        items: catalog.map(publicCatalogItem)
      });
      return;
    }

    if (cleanUrl === "/api/admin/catalogo" && (request.method === "PUT" || request.method === "POST")) {
      ensureAdmin(request);
      let payload;
      try {
        payload = JSON.parse((await readRequestBody(request)).replace(/^\uFEFF/, "") || "{}");
      } catch {
        throw makeHttpError(400, "JSON invalido.");
      }
      const catalog = await withCatalogLock(async () => saveCatalog(payload.items));
      sendJson(response, 200, {
        ok: true,
        count: catalog.length,
        items: catalog.map(publicCatalogItem)
      });
      return;
    }

    if (cleanUrl === "/api/admin/agendamentos" && request.method === "GET") {
      ensureAdmin(request);
      const bookings = await loadBookings();
      sendJson(response, 200, {
        ok: true,
        count: bookings.length,
        bookings: bookings.map(publicBooking)
      });
      return;
    }

    if (cleanUrl === "/api/agendamentos/disponibilidade" && request.method === "GET") {
      const bookings = await loadBookings();
      sendJson(response, 200, buildAvailability(bookings));
      return;
    }

    if (cleanUrl === "/api/agendamentos" && request.method === "POST") {
      let payload;
      try {
        payload = JSON.parse((await readRequestBody(request)).replace(/^\uFEFF/, "") || "{}");
      } catch {
        throw makeHttpError(400, "JSON invalido.");
      }
      const booking = await withBookingLock(async () => {
        const bookings = await loadBookings();
        const availability = buildAvailability(bookings);
        const nextBooking = validateBooking(payload, availability);
        bookings.push(nextBooking);
        await saveBookings(bookings);
        return nextBooking;
      });

      let calendar = { queued: false, configured: githubCalendarIsConfigured() };
      if (calendar.configured) {
        try {
          calendar = await withTimeout(dispatchCalendarWorkflow(booking), "Envio ao GitHub Calendar", 4500);
        } catch (error) {
          console.error("Falha ao acionar workflow de Calendar:", error);
          calendar = { queued: false, configured: true };
        }
      }

      const email = {
        sent: false,
        configured: smtpIsConfigured(),
        queued: smtpIsConfigured()
      };
      if (email.configured) {
        notifyBooking(booking, request).catch((error) => {
          console.error("Falha ao enviar e-mail de agendamento:", error);
        });
      } else {
        console.warn("Agendamento salvo sem envio de e-mail. Configure SMTP_HOST, SMTP_USER, SMTP_PASS e BOOKING_TO_EMAIL.");
      }

      sendJson(response, 201, {
        ok: true,
        booking: {
          id: booking.id,
          date: booking.date,
          time: booking.time,
          slotLabel: booking.slotLabel
        },
        calendar,
        email
      });
      return;
    }

    if (cleanUrl.startsWith("/api/")) {
      sendJson(response, 404, { error: "Endpoint nao encontrado." });
      return;
    }

    if (cleanUrl.startsWith("/.server-data/")) {
      throw makeHttpError(404, "Arquivo nao encontrado");
    }

    const mediaCandidates = mediaFiles[cleanUrl];
    let filePath = resolvePath(request.url || "/");
    let data;
    if (mediaCandidates) {
      for (const candidate of mediaCandidates) {
        try {
          data = await readFile(candidate);
          filePath = candidate;
          break;
        } catch {
          // Try the next candidate. Production uses repository assets; local dev can fall back to Downloads.
        }
      }
      if (!data) {
        throw makeHttpError(404, "Imagem nao encontrada");
      }
    } else {
      data = await readFile(filePath);
    }
    response.writeHead(200, {
      "Content-Type": types[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(data);
  } catch (error) {
    if (cleanUrl.startsWith("/api/")) {
      if (!error.status) {
        console.error("Erro na API:", error);
      }
      const payload = { error: error.status ? error.message : "Erro interno no servidor." };
      if (!error.status && process.env.DEBUG_API_ERRORS === "1") {
        payload.detail = error.message;
      }
      sendJson(response, error.status || 500, payload);
      return;
    }
    response.writeHead(error.status || 404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(error.message || "Arquivo nao encontrado");
  }
}).listen(port, host, () => {
  console.log(`Abrahams disponivel em http://localhost:${port} e http://127.0.0.1:${port}`);
});
