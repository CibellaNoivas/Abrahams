(() => {
  const { useEffect, useMemo, useState } = React;
  const h = (type, props, ...children) => React.createElement(type, props || {}, ...children.flat().filter(Boolean));
  const phone = "+55 11 91402-0888";
  const whatsappNumber = "5511914020888";
  const emails = ["ibrahimhakkialtin@gmail.com", "taner@cibellanoivas.com", "camila@cibellanoivas.com"];
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Ola, quero atendimento Abrahams by Cibella Group.")}`;

  const media = {
    hero: "./assets/images/blue-atelier-suit.svg",
    fabric: "./assets/images/navy-fabric.svg",
    dark: "./assets/images/abrahams-atelier-dark.svg",
    lounge: "./assets/images/abrahams-lounge-light.svg",
    suit: "./assets/images/look-business.svg",
    pants: "./assets/images/event-look.svg",
    blazer: "./assets/images/look-casual.svg",
    shirts: "./assets/images/shirts.svg",
    detail: "./assets/images/collection-detail.svg"
  };

  const catalog = [
    ["Ternos", "Cerimonial", media.suit, "Ternos slim e classicos para casamento, eventos e rotina executiva com caimento preciso."],
    ["Calcas de alfaiataria", "Base", media.pants, "Calcas sociais em cortes atuais para compor traje completo ou smart casual."],
    ["Blazers", "Smart", media.blazer, "Blazers modernos para elevar camisa, malha leve ou composicao de evento sem excesso."],
    ["Camisas", "Essencial", media.shirts, "Camisas brancas, azuis e bases formais para noivos, padrinhos e rotina profissional."],
    ["Gravatas-borboleta", "Black tie", media.fabric, "Papillons para cerimonias noturnas, black tie e looks com assinatura mais formal."],
    ["Gravatas", "Formal", media.detail, "Gravatas discretas para casamento, formatura, eventos corporativos e recepcoes."],
    ["Abotoaduras", "Detalhe", media.dark, "Pequenos acabamentos para finalizar o traje com presenca silenciosa."]
  ];

  const segments = ["Noivo", "Padrinho", "Ternos", "Calcas", "Blazers", "Camisas", "Acessorios", "Consultoria completa"];

  function Brand({ light = false }) {
    return h("a", { className: `brand ${light ? "is-light" : ""}`, href: "#inicio" }, h("strong", null, "ABRAHAMS"), h("span", null, "by Cibella Group"));
  }

  function Button({ href, children, variant = "primary" }) {
    return h("a", { className: `btn ${variant}`, href }, children);
  }

  function Header() {
    const [dark, setDark] = useState(true);
    const [open, setOpen] = useState(false);
    useEffect(() => {
      const onScroll = () => {
        const section = [...document.querySelectorAll("[data-header]")].find((item) => {
          const rect = item.getBoundingClientRect();
          return rect.top <= 50 && rect.bottom > 50;
        });
        setDark((section?.dataset.header || "light") === "dark");
      };
      onScroll();
      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("resize", onScroll);
      return () => { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); };
    }, []);
    const links = [["Inicio", "#inicio"], ["Catalogo", "#catalogo"], ["Atelier", "#atelier"], ["Agendamento", "#agendamento"], ["Contato", "#contato"]];
    return h("header", { className: `site-header ${dark && !open ? "on-dark" : "on-light"}` },
      h("div", { className: "header-inner" }, h(Brand, { light: dark && !open }), h("nav", { className: "desktop-nav" }, links.map(([label, href]) => h("a", { href, key: label }, label))), h("a", { className: "header-cta", href: "#agendamento" }, "Agendar"), h("button", { className: "menu", onClick: () => setOpen(!open), "aria-label": "Abrir menu" }, "☰")),
      open && h("nav", { className: "mobile-nav" }, links.map(([label, href]) => h("a", { href, key: label, onClick: () => setOpen(false) }, label)))
    );
  }

  function Hero() {
    return h("section", { id: "inicio", className: "hero", "data-header": "dark" }, h("img", { src: media.hero, alt: "Atelier Abrahams", className: "hero-img" }), h("div", { className: "scrim" }), h("div", { className: "hero-content reveal" }, h("p", { className: "eyebrow" }, "Abrahams by Cibella Group"), h("h1", null, "Alfaiataria masculina com presenca de cerimonia."), h("p", null, "Ternos, blazers, calcas, camisas e acessorios para homens que querem chegar bem em casamento, evento, trabalho e rotina."), h("div", { className: "actions" }, Button({ href: "#catalogo", variant: "light", children: "Ver catalogo" }), Button({ href: whatsappUrl, variant: "ghost", children: "WhatsApp" }))));
  }

  function Intro({ eyebrow, title, text, light }) {
    return h("div", { className: `intro reveal ${light ? "light" : ""}` }, h("p", { className: "eyebrow" }, eyebrow), h("h2", null, title), h("p", null, text));
  }

  function Identity() {
    return h("section", { className: "identity", "data-header": "light" }, h("img", { src: media.lounge, alt: "Ambiente Abrahams" }), h("div", { className: "reveal" }, h("p", { className: "eyebrow" }, "Identidade"), h("h2", null, "Azul noturno, ivory quente e assinatura calma."), h("p", null, "Uma atmosfera masculina, urbana e refinada, com luz quente, serifas elegantes e detalhes em soft gold.")));
  }

  function Catalog() {
    return h("section", { id: "catalogo", className: "catalog section", "data-header": "light" }, h(Intro, { eyebrow: "Catalogo", title: "Tudo para montar o traje completo.", text: "Uma selecao de alfaiataria e acessorios masculinos para comprar com orientacao e acabamento premium." }), h("div", { className: "catalog-grid" }, catalog.map(([title, label, image, text], index) => h("article", { className: `card reveal ${index === 0 ? "wide" : ""}`, key: title }, h("img", { src: image, alt: title }), h("div", null, h("span", null, label), h("h3", null, title), h("p", null, text), h("a", { href: whatsappUrl }, "Consultar peca"))))));
  }

  function Atelier() {
    return h("section", { id: "atelier", className: "atelier section", "data-header": "dark" }, h("div", { className: "atelier-media reveal" }, h("img", { src: media.dark, alt: "Atelier escuro" }), h("img", { src: media.fabric, alt: "Tecido navy" })), h("div", { className: "reveal" }, h("p", { className: "eyebrow" }, "Atelier"), h("h2", null, "Um processo simples para escolher bem."), h("p", null, "Da curadoria de silhueta ao ajuste visual, cada atendimento organiza terno, camisa, calca, blazer e acessorios para a ocasiao certa."), h("ul", { className: "steps" }, ["Curadoria", "Composicao", "Ajuste visual", "Entrega"].map((item, index) => h("li", { key: item }, h("span", null, `0${index + 1}`), item)))));
  }

  function Lookbook() {
    const items = [["Atelier", media.hero], ["Textura", media.fabric], ["Camisas", media.shirts], ["Detalhes", media.detail]];
    return h("section", { id: "lookbook", className: "lookbook section", "data-header": "light" }, h(Intro, { eyebrow: "Lookbook", title: "Referencias para vestir presenca.", text: "Ambientes, texturas e silhuetas que mostram a linguagem Abrahams: masculina, urbana, refinada e sem excesso." }), h("div", { className: "look-grid" }, items.map(([title, image]) => h("figure", { key: title, className: "reveal" }, h("img", { src: image, alt: title }), h("figcaption", null, title)))));
  }

  function Booking() {
    const empty = { name: "", age: "", email: "", phone: "", segment: "Noivo", eventDate: "", notes: "" };
    const [availability, setAvailability] = useState({ days: [] });
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [form, setForm] = useState(empty);
    const [status, setStatus] = useState("");
    const [wa, setWa] = useState("");
    const day = availability.days.find((item) => item.date === date);
    useEffect(() => { fetch("/api/agendamentos/disponibilidade").then((r) => r.json()).then((data) => { setAvailability(data); setDate(data.days?.[0]?.date || ""); setTime(data.days?.[0]?.slots?.[0]?.time || ""); }).catch(() => setStatus("Agenda indisponivel agora.")); }, []);
    const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
    const submit = async (event) => {
      event.preventDefault();
      setStatus("Enviando...");
      setWa("");
      try {
        const response = await fetch("/api/agendamentos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, date, time }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Nao foi possivel agendar.");
        const text = `Ola, solicitei um agendamento Abrahams. Horario: ${data.booking.slotLabel}. Nome: ${form.name}. Segmento: ${form.segment}.`;
        setWa(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`);
        setStatus(data.calendar?.queued ? `${data.booking.slotLabel}. Enviado para o Google Calendar da equipe.` : `${data.booking.slotLabel}. Pedido recebido. Confirme pelo WhatsApp.`);
        setForm(empty);
      } catch (error) { setStatus(error.message); }
    };
    return h("section", { id: "agendamento", className: "booking section", "data-header": "dark" }, h(Intro, { eyebrow: "Agendamento", title: "Escolha o dia, o horario e conte o que precisa.", text: "O pedido pode acionar automaticamente o Google Calendar da equipe via GitHub Actions.", light: true }), h("div", { className: "booking-box reveal" }, h("div", { className: "slot-panel" }, h("h3", null, "Horarios"), h("div", { className: "days" }, availability.days.map((item) => h("button", { type: "button", className: item.date === date ? "active" : "", onClick: () => { setDate(item.date); setTime(item.slots[0]?.time || ""); }, key: item.date }, h("span", null, item.weekday), h("strong", null, item.day), h("em", null, item.month)))), h("div", { className: "times" }, (day?.slots || []).map((slot) => h("button", { type: "button", className: slot.time === time ? "active" : "", onClick: () => setTime(slot.time), key: slot.time }, slot.time)))), h("form", { onSubmit: submit, className: "booking-form" }, h("input", { placeholder: "Nome completo", value: form.name, onChange: (e) => update("name", e.target.value), required: true }), h("input", { placeholder: "Idade", type: "number", min: "13", max: "100", value: form.age, onChange: (e) => update("age", e.target.value), required: true }), h("input", { placeholder: "E-mail", type: "email", value: form.email, onChange: (e) => update("email", e.target.value), required: true }), h("input", { placeholder: "WhatsApp", value: form.phone, onChange: (e) => update("phone", e.target.value), required: true }), h("select", { value: form.segment, onChange: (e) => update("segment", e.target.value) }, segments.map((item) => h("option", { key: item, value: item }, item))), h("input", { type: "date", value: form.eventDate, onChange: (e) => update("eventDate", e.target.value) }), h("textarea", { placeholder: "Detalhes para a curadoria", value: form.notes, onChange: (e) => update("notes", e.target.value) }), h("button", null, "Solicitar agendamento"), status && h("p", { className: "status" }, status), wa && h("a", { href: wa, target: "_blank", rel: "noreferrer", className: "whatsapp-confirm" }, "Confirmar pelo WhatsApp"))));
  }

  function Contact() {
    return h("section", { id: "contato", className: "contact section", "data-header": "light" }, h("div", null, h("p", { className: "eyebrow" }, "Contato"), h("h2", null, "Atendimento junto ao universo Cibella."), h("p", null, "R. Joao Amaro, 31 - Cidade Moncoes, Sao Paulo - SP, 04583-030"), h("a", { href: whatsappUrl }, `WhatsApp ${phone}`), emails.map((email) => h("a", { href: `mailto:${email}`, key: email }, email))), h("img", { src: media.lounge, alt: "Espaco Abrahams" }));
  }

  function Footer() {
    return h("footer", { className: "footer", "data-header": "dark" }, h(Brand, { light: true }), h("p", null, `© ${new Date().getFullYear()} Abrahams by Cibella Group.`));
  }

  function App() {
    useEffect(() => { const obs = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")), { threshold: 0.12 }); document.querySelectorAll(".reveal").forEach((el) => obs.observe(el)); return () => obs.disconnect(); }, []);
    return h(React.Fragment, null, h(Header), h("main", null, h(Hero), h(Identity), h(Catalog), h(Atelier), h(Lookbook), h(Booking), h(Contact)), h(Footer));
  }

  ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
