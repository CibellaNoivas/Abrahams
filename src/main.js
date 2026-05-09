(function bootCibella() {
  if (!window.React || !window.ReactDOM) {
    window.setTimeout(bootCibella, 40);
    return;
  }

  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const { useEffect, useMemo, useRef, useState } = React;
  const h = (type, props, ...children) =>
    React.createElement(type, props || {}, ...children.flat().filter(Boolean));

  const phoneDisplay = "+55 11 91561-4927";
  const whatsappNumber = "5511915614927";
  const whatsappMessage = "Olá, quero agendar um atendimento privado na Cibella Noivas.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const instagramUrl = "https://www.instagram.com/cibella_noivas/";
  const emails = ["Camila@cibellanoivas.com", "Mayara@cibellanoivas.com"];
  const address = "R. João Amaro, 31 - Cidade Monções, São Paulo - SP, 04583-030";
  const scheduleNote = "Segunda a sexta, 09:00 às 18:00. Sábado, 09:00 às 13:00.";

  const image = (url, width = 1800) => `${url}?format=${width}w`;
  const media = {
    hero: image("https://images.squarespace-cdn.com/content/v1/682d1caf449a767a3497ba85/65e0da4d-f120-4ecc-a702-8004299260a7/getimg_ai_img-CpKQLxo4xttgLus8YoU8X.jpg", 2500),
    atelier: image("https://images.squarespace-cdn.com/content/v1/682d1caf449a767a3497ba85/10644b54-c67c-4634-8551-6219c26280aa/Gemini_Generated_Image_75g5r475g5r475g5.png", 1800),
    lace: image("https://images.squarespace-cdn.com/content/v1/682d1caf449a767a3497ba85/2b2b80b6-899e-41e8-9609-f97a1a5d5b52/ChatGPT+Image+17+Kas+2025+17_05_39.png", 1800),
    modest: image("https://images.squarespace-cdn.com/content/v1/682d1caf449a767a3497ba85/3060e449-181c-4c8d-8955-0e56cdf0b07c/ChatGPT+Image+31+Tem+2025+19_05_15.png", 1800),
    editorial: image("https://images.squarespace-cdn.com/content/v1/682d1caf449a767a3497ba85/7beb090b-f2a6-4919-8a68-1eb54094ae43/ChatGPT+Image+20+de+ago.+de+2025%2C+15_29_19.png", 1800),
    veil: image("https://images.squarespace-cdn.com/content/v1/682d1caf449a767a3497ba85/a30b61dc-f35d-4ff6-b010-1d6a4025b0be/Gemini_Generated_Image_vvyuwivvyuwivvyu.png", 1800),
    gown: image("https://images.squarespace-cdn.com/content/v1/682d1caf449a767a3497ba85/b8e62aaa-2657-4586-818e-b94a343ca09c/ChatGPT+Image+28+Ara+2025+12_53_40.png", 1800),
    fitting: image("https://images.squarespace-cdn.com/content/v1/682d1caf449a767a3497ba85/c876a76d-f79e-4d99-91fb-36f09cff05b8/Gemini_Generated_Image_yg465byg465byg46+%281%29.png", 1800),
    jewel: image("https://images.squarespace-cdn.com/content/v1/682d1caf449a767a3497ba85/c9fdd50f-6f75-4484-be7d-e64f84909fe4/Gemini_Generated_Image_tlslq3tlslq3tlsl.png", 1800),
    final: image("https://images.squarespace-cdn.com/content/v1/682d1caf449a767a3497ba85/f5b060fe-707e-485c-ab0a-c9271cdd3dc2/ChatGPT+Image+10+Ara+2025+14_33_48.png", 2200)
  };

  const navItems = [
    ["Início", "#inicio"],
    ["Coleção", "#colecao"],
    ["Atelier", "#atelier"],
    ["Experiência", "#experiencia"],
    ["Agendamento", "#agendamento"],
    ["Contato", "#contato"]
  ];

  const collection = [
    {
      name: "Aylin",
      type: "Princesa moderna",
      image: media.atelier,
      text: "Volume nobre, renda luminosa e presença cerimonial para uma entrada inesquecível."
    },
    {
      name: "Samia",
      type: "Modesta couture",
      image: media.modest,
      text: "Manga longa, transparência controlada e acabamento pensado para fé, tradição e elegância."
    },
    {
      name: "Emel",
      type: "Glamour turco",
      image: media.lace,
      text: "Bordados com brilho silencioso, cintura desenhada e caimento de fotografia editorial."
    },
    {
      name: "Pinar",
      type: "Romântico minimal",
      image: media.gown,
      text: "Linhas limpas, saia fluida e detalhes que deixam a noiva respirar dentro do vestido."
    }
  ];

  const rituals = [
    ["01", "Escuta privada", "Entendemos cerimônia, cultura, fé, corpo, orçamento e data antes de mostrar qualquer peça."],
    ["02", "Curadoria", "Selecionamos vestidos importados da Turquia, opções sob medida, véus, tiaras e joalheria."],
    ["03", "Prova orientada", "A noiva experimenta silhuetas com direção de imagem, proporção e conforto real."],
    ["04", "Refino final", "Ajustes, acabamento e entrega são pensados para foto, movimento, cerimônia e festa."]
  ];

  const segments = [
    "Venda de vestido de noiva",
    "Sob medida",
    "Aluguel de vestido",
    "Moda modesta / religiosa",
    "Plus size",
    "Acessórios e véus"
  ];

  const emptyBookingForm = {
    name: "",
    age: "",
    email: "",
    phone: "",
    segment: "Venda de vestido de noiva",
    eventDate: "",
    notes: ""
  };

  function formatEventDateInput(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  function Button({ children, href, variant = "primary", className = "", target }) {
    return h(
      "a",
      {
        href,
        target,
        rel: target ? "noopener noreferrer" : undefined,
        className: `btn btn-${variant} ${className}`
      },
      h("span", null, children),
      h("i", { "aria-hidden": "true" })
    );
  }

  function BrandMark({ light = false }) {
    return h(
      "a",
      { href: "#inicio", className: `brand-mark ${light ? "is-light" : ""}`, "aria-label": "Cibella Noivas" },
      h("strong", null, "CIBELLA"),
      h("span", null, "NOIVAS")
    );
  }

  function Header() {
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState("dark");

    useEffect(() => {
      const updateTheme = () => {
        const probeY = 48;
        const sections = Array.from(document.querySelectorAll("[data-header-theme]"));
        const current = sections.find((section) => {
          const rect = section.getBoundingClientRect();
          return rect.top <= probeY && rect.bottom > probeY;
        });
        setTheme(current?.dataset.headerTheme || "light");
      };

      updateTheme();
      window.addEventListener("scroll", updateTheme, { passive: true });
      window.addEventListener("resize", updateTheme);
      return () => {
        window.removeEventListener("scroll", updateTheme);
        window.removeEventListener("resize", updateTheme);
      };
    }, []);

    const links = navItems.map(([label, href]) =>
      h("a", { key: label, href, onClick: () => setOpen(false), className: "header-link" }, label)
    );

    return h(
      "header",
      { className: `site-header ${theme === "dark" ? "is-on-dark" : "is-on-light"} ${open ? "is-open" : ""}` },
      h(
        "div",
        { className: "header-shell" },
        h(BrandMark, { light: theme === "dark" && !open }),
        h("nav", { className: "desktop-nav", "aria-label": "Navegação principal" }, links),
        h("a", { href: "#agendamento", className: "header-cta" }, "Agendar"),
        h(
          "button",
          {
            className: "menu-button",
            type: "button",
            onClick: () => setOpen((value) => !value),
            "aria-expanded": open,
            "aria-label": open ? "Fechar menu" : "Abrir menu"
          },
          h("span", { className: "sr-only" }, open ? "Fechar menu" : "Abrir menu"),
          h("span", { className: open ? "is-open" : "" })
        )
      ),
      h(
        "div",
        { className: `mobile-menu ${open ? "is-visible" : ""}` },
        h("nav", null, links, h(Button, { href: "#agendamento", className: "mobile-cta" }, "Agendar atendimento"))
      )
    );
  }

  function Hero() {
    const slides = useMemo(
      () => [
        { image: media.hero, label: "Turkish couture", title: "Vestidos de noiva importados da Turquia, escolhidos para uma presença rara." },
        { image: media.modest, label: "Modest bridal", title: "Elegância para noivas que vestem fé, cultura e identidade." },
        { image: media.final, label: "Private fitting", title: "Um atendimento calmo, preciso e inteiramente dedicado à noiva." }
      ],
      []
    );
    const [active, setActive] = useState(0);
    const [pointer, setPointer] = useState({ x: 50, y: 50 });

    useEffect(() => {
      const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 6400);
      return () => window.clearInterval(timer);
    }, [slides.length]);

    const slide = slides[active];

    return h(
      "section",
      {
        id: "inicio",
        className: "hero-section",
        "data-header-theme": "dark",
        onPointerMove: (event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setPointer({
            x: ((event.clientX - rect.left) / rect.width) * 100,
            y: ((event.clientY - rect.top) / rect.height) * 100
          });
        },
        style: { "--pointer-x": `${pointer.x}%`, "--pointer-y": `${pointer.y}%` }
      },
      h("img", { className: "hero-bg", src: slide.image, alt: "" }),
      h("div", { className: "hero-veil" }),
      h(
        "div",
        { className: "hero-inner" },
        h(
          "div",
          { className: "hero-copy reveal" },
          h("h1", null, slide.title),
          h(
            "p",
            { className: "hero-lede" },
            "Uma bridal maison em São Paulo para vestidos de R$4.000 a R$20.000, com tecidos importados, prova privada e atenção à modéstia, ao corpo e ao sonho de cada noiva."
          ),
          h(
            "div",
            { className: "hero-actions" },
            h(Button, { href: "#agendamento", variant: "light" }, "Agendar Atendimento"),
            h(Button, { href: "#colecao", variant: "ghost" }, "Ver Coleção")
          )
        ),
        h(
          "div",
          { className: "hero-dossier reveal" },
          h(
            "div",
            { className: "hero-index" },
            slides.map((item, index) =>
              h(
                "button",
                {
                  key: item.label,
                  type: "button",
                  className: index === active ? "is-active" : "",
                  onClick: () => setActive(index),
                  "aria-pressed": index === active
                },
                h("span", null, `0${index + 1}`),
                h("strong", null, item.label)
              )
            )
          ),
          h(
            "dl",
            { className: "hero-facts" },
            h("div", null, h("dt", null, "Faixa"), h("dd", null, "R$4k-R$20k")),
            h("div", null, h("dt", null, "Tamanho"), h("dd", null, "Até 80")),
            h("div", null, h("dt", null, "Origem"), h("dd", null, "Turquia"))
          )
        )
      )
    );
  }

  function SectionIntro({ title, text, light = false }) {
    return h(
      "div",
      { className: `section-intro reveal ${light ? "is-light" : ""}` },
      h("h2", null, title),
      text && h("p", null, text)
    );
  }

  function Signature() {
    return h(
      "section",
      { className: "signature-section", "data-header-theme": "light" },
      h(
        "div",
        { className: "signature-grid" },
        h(
          "div",
          { className: "signature-statement reveal" },
          h("h2", null, "Luxo aqui é silêncio, proporção e cuidado."),
          h(
            "p",
            null,
            "A Cibella Noivas nasce para uma cliente que quer sentir qualidade antes de ver brilho: tecidos importados, acabamento refinado, atendimento privado e vestidos que respeitam a essência de cada mulher."
          )
        ),
        h(
          "div",
          { className: "signature-columns reveal" },
          h("article", null, h("span", null, "01"), h("strong", null, "Importados da Turquia"), h("p", null, "Seleção de modelos com tecidos, bordados e silhuetas de linguagem internacional.")),
          h("article", null, h("span", null, "02"), h("strong", null, "Modéstia com couture"), h("p", null, "Opções para noivas muçulmanas, religiosas e mulheres que desejam cobertura sem perder sofisticação.")),
          h("article", null, h("span", null, "03"), h("strong", null, "Corpo real"), h("p", null, "Plus size até o tamanho 80 e possibilidade de sob medida para presença e conforto."))
        )
      )
    );
  }

  function Collection() {
    const [active, setActive] = useState(collection[0].name);
    const activeItem = collection.find((item) => item.name === active) || collection[0];

    return h(
      "section",
      { id: "colecao", className: "collection-section section-pad", "data-header-theme": "light" },
      h(
        "div",
        { className: "section-wrap" },
        h(SectionIntro, {
          title: "Uma coleção feita para entrar devagar na memória.",
          text: "Modelos de venda, aluguel, sob medida e acessórios para noivas que procuram glamour, romantismo, originalidade e um acabamento que aguenta o olhar de perto."
        }),
        h(
          "div",
          { className: "collection-stage reveal" },
          h(
            "div",
            { className: "collection-image" },
            h("img", { src: activeItem.image, alt: `Vestido ${activeItem.name}` })
          ),
          h(
            "div",
            { className: "collection-copy" },
            h("p", { className: "collection-number" }, `Coleção 0${collection.findIndex((item) => item.name === activeItem.name) + 1}`),
            h("h3", null, activeItem.name),
            h("strong", null, activeItem.type),
            h("p", null, activeItem.text),
            h(
              "div",
              { className: "collection-tabs", role: "tablist", "aria-label": "Vestidos em destaque" },
              collection.map((item) =>
                h(
                  "button",
                  {
                    key: item.name,
                    type: "button",
                    className: item.name === active ? "is-active" : "",
                    onClick: () => setActive(item.name),
                    "aria-pressed": item.name === active
                  },
                  h("span", null, item.name),
                  h("small", null, item.type)
                )
              )
            ),
            h(Button, { href: whatsappUrl, target: "_blank", variant: "outline" }, "Consultar disponibilidade")
          )
        )
      )
    );
  }

  function SilkCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return undefined;
      const context = canvas.getContext("2d");
      let frame = 0;
      let animationId = 0;
      let pointerX = 0.5;
      let pointerY = 0.5;

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.floor(rect.width * ratio));
        canvas.height = Math.max(1, Math.floor(rect.height * ratio));
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
      };

      const move = (event) => {
        const rect = canvas.getBoundingClientRect();
        pointerX = (event.clientX - rect.left) / rect.width;
        pointerY = (event.clientY - rect.top) / rect.height;
      };

      const draw = () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        frame += 0.012;
        context.clearRect(0, 0, width, height);

        for (let line = 0; line < 18; line += 1) {
          const yBase = height * (0.1 + line * 0.045);
          context.beginPath();
          for (let step = 0; step <= 120; step += 1) {
            const x = (step / 120) * width;
            const wave =
              Math.sin(step * 0.17 + frame * (1.6 + line * 0.03)) * (12 + line * 0.28) +
              Math.cos(step * 0.05 + frame + pointerX * 2.4) * 9 +
              (pointerY - 0.5) * 20;
            const y = yBase + wave + Math.sin(frame + line) * 14;
            if (step === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
          }
          context.strokeStyle = line % 3 === 0 ? "rgba(183, 154, 97, .28)" : "rgba(248, 243, 234, .16)";
          context.lineWidth = line % 3 === 0 ? 1.2 : 0.7;
          context.stroke();
        }

        animationId = window.requestAnimationFrame(draw);
      };

      resize();
      draw();
      window.addEventListener("resize", resize);
      canvas.addEventListener("pointermove", move);
      return () => {
        window.cancelAnimationFrame(animationId);
        window.removeEventListener("resize", resize);
        canvas.removeEventListener("pointermove", move);
      };
    }, []);

    return h("canvas", { ref: canvasRef, className: "silk-canvas", "aria-hidden": "true" });
  }

  function Atelier() {
    return h(
      "section",
      { id: "atelier", className: "atelier-section", "data-header-theme": "dark" },
      h(SilkCanvas),
      h(
        "div",
        { className: "atelier-inner" },
        h(
          "div",
          { className: "atelier-copy reveal" },
          h("h2", null, "O vestido ideal começa antes do espelho."),
          h(
            "p",
            null,
            "Começa na escuta: que cerimônia é essa, que tradição precisa ser honrada, que silhueta faz a noiva respirar melhor, que detalhe fica para sempre nas fotografias."
          ),
          h(
            "div",
            { className: "ritual-list" },
            rituals.map(([number, title, text]) =>
              h("article", { key: number }, h("span", null, number), h("div", null, h("h3", null, title), h("p", null, text)))
            )
          )
        ),
        h(
          "div",
          { className: "atelier-media reveal" },
          h("img", { src: media.fitting, alt: "Atendimento privado Cibella Noivas" }),
          h("img", { src: media.jewel, alt: "Detalhe de acessórios de noiva Cibella" })
        )
      )
    );
  }

  function Modesty() {
    return h(
      "section",
      { className: "modesty-section section-pad", "data-header-theme": "light" },
      h(
        "div",
        { className: "modesty-grid" },
        h(
          "figure",
          { className: "modesty-image reveal" },
          h("img", { src: media.editorial, alt: "Noiva com vestido elegante Cibella Noivas" })
        ),
        h(
          "div",
          { className: "modesty-copy reveal" },
          h("h2", null, "Modéstia não diminui o luxo. Ela dá direção."),
          h(
            "p",
            null,
            "A curadoria contempla mulheres muçulmanas, religiosas, plus size e noivas que desejam cobertura, mangas, véus longos, caimentos mais fechados ou um vestido sob medida sem abrir mão de beleza."
          ),
          h(
            "dl",
            { className: "modesty-facts" },
            h("div", null, h("dt", null, "Serviços"), h("dd", null, "Venda, aluguel, sob medida e acessórios")),
            h("div", null, h("dt", null, "Estilos"), h("dd", null, "Glamour, moderno, princesa, romântico, vintage")),
            h("div", null, h("dt", null, "Pagamento"), h("dd", null, "Pix à vista e crédito parcelado"))
          )
        )
      )
    );
  }

  function Experience() {
    return h(
      "section",
      { id: "experiencia", className: "experience-section section-pad", "data-header-theme": "light" },
      h(
        "div",
        { className: "section-wrap" },
        h(SectionIntro, {
          title: "A experiência precisa ser tão bem desenhada quanto o vestido.",
          text: "Nada de provar às pressas. A proposta é um atendimento por agendamento, com direção de imagem e uma seleção inicial preparada antes da noiva chegar."
        }),
        h(
          "div",
          { className: "experience-rail reveal" },
          h("article", null, h("span", null, "90 dias"), h("h3", null, "Antecedência mínima recomendada"), h("p", null, "Tempo para escolher, ajustar e finalizar o vestido com tranquilidade.")),
          h("article", null, h("span", null, "1h30"), h("h3", null, "Atendimento privado"), h("p", null, "Janela reservada para escuta, prova e curadoria de acessórios.")),
          h("article", null, h("span", null, "Maison"), h("h3", null, "Universo completo"), h("p", null, "Vestido, véu, sapato, joalheria, coroas e tiaras em uma só conversa."))
        )
      )
    );
  }

  function Scheduling() {
    const [availability, setAvailability] = useState({ timeZone: "America/Sao_Paulo", days: [] });
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [form, setForm] = useState(emptyBookingForm);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: "idle", message: "" });
    const [confirmationUrl, setConfirmationUrl] = useState("");

    const selectedDay = availability.days.find((day) => day.date === selectedDate);
    const canSubmit = selectedDay && selectedTime && form.name.trim() && form.email.trim() && form.phone.trim() && form.segment && !submitting;

    const loadAvailability = async (preferredDate = selectedDate, preferredTime = selectedTime) => {
      setLoading(true);
      try {
        const response = await fetch("/api/agendamentos/disponibilidade", { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error("Não foi possível carregar a agenda.");
        const data = await response.json();
        const days = Array.isArray(data.days) ? data.days : [];
        const nextDay = days.find((day) => day.date === preferredDate) || days[0];
        const nextTime = nextDay?.slots.find((slot) => slot.time === preferredTime)?.time || nextDay?.slots[0]?.time || "";
        setAvailability({ timeZone: data.timeZone || "America/Sao_Paulo", days });
        setSelectedDate(nextDay?.date || "");
        setSelectedTime(nextTime);
        if (!days.length) {
          setStatus({ type: "error", message: "Nenhum horário disponível nos próximos dias." });
        }
      } catch {
        setStatus({ type: "error", message: "A agenda não carregou agora. Tente novamente em instantes." });
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadAvailability("", "");
    }, []);

    const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    const chooseDay = (day) => {
      setSelectedDate(day.date);
      setSelectedTime(day.slots[0]?.time || "");
      setConfirmationUrl("");
      if (status.type === "error") setStatus({ type: "idle", message: "" });
    };

    const handleSubmit = async (event) => {
      event.preventDefault();
      if (!canSubmit) {
        setStatus({ type: "error", message: "Preencha nome, e-mail, WhatsApp e escolha um horário disponível." });
        return;
      }

      let whatsappWindow = null;
      try {
        whatsappWindow = window.open("about:blank", "_blank");
      } catch {
        whatsappWindow = null;
      }

      setSubmitting(true);
      setConfirmationUrl("");
      setStatus({ type: "loading", message: "Enviando solicitação..." });
      try {
        const response = await fetch("/api/agendamentos", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...form, date: selectedDate, time: selectedTime })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 409) await loadAvailability("", "");
          throw new Error(data.error || "Não foi possível solicitar este horário.");
        }

        const slotLabel = data.booking?.slotLabel || "horário solicitado";
        const protocol = data.booking?.id ? `Protocolo: ${data.booking.id}` : "";
        const confirmText = [
          "NOVO AGENDAMENTO - CIBELLA NOIVAS",
          `Cliente: ${form.name}`,
          protocol,
          `Horário: ${slotLabel}`,
          `Interesse: ${form.segment}`,
          `E-mail: ${form.email}`,
          `WhatsApp: ${form.phone}`,
          form.eventDate ? `Data do casamento: ${form.eventDate}` : "Data do casamento: não informada",
          form.notes ? `Detalhes: ${form.notes}` : "Detalhes: sem observações"
        ]
          .filter(Boolean)
          .join("\n");
        const notifyUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(confirmText)}`;
        setConfirmationUrl(notifyUrl);
        if (whatsappWindow) {
          whatsappWindow.location.href = notifyUrl;
        } else {
          window.setTimeout(() => {
            window.location.href = notifyUrl;
          }, 1200);
        }
        setStatus({
          type: "success",
          message: `${slotLabel}. Pedido recebido. O WhatsApp da loja foi aberto com o aviso pronto.`
        });
        setForm({ ...emptyBookingForm });
        await loadAvailability(selectedDate, selectedTime);
      } catch (error) {
        if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.close();
        setConfirmationUrl("");
        setStatus({ type: "error", message: error.message || "Algo não fechou. Tente novamente." });
      } finally {
        setSubmitting(false);
      }
    };

    return h(
      "section",
      { id: "agendamento", className: "schedule-section section-pad", "data-header-theme": "dark" },
      h(
        "div",
        { className: "section-wrap" },
        h(SectionIntro, {
          title: "Escolha um horário e conte qual vestido precisa existir.",
          text: `${scheduleNote} Cada atendimento reserva 1h30 para curadoria, prova e orientação.`,
          light: true
        }),
        h(
          "div",
          { className: "scheduler-shell reveal" },
          h(
            "div",
            { className: "scheduler-calendar" },
            h(
              "div",
              { className: "scheduler-heading" },
              h("span", null, "Agenda"),
              h("strong", null, "Próximos horários")
            ),
            loading
              ? h("p", { className: "scheduler-muted" }, "Carregando horários...")
              : h(
                  React.Fragment,
                  null,
                  h(
                    "div",
                    { className: "day-strip" },
                    availability.days.map((day) =>
                      h(
                        "button",
                        {
                          key: day.date,
                          type: "button",
                          className: day.date === selectedDate ? "day-button is-active" : "day-button",
                          onClick: () => chooseDay(day),
                          "aria-pressed": day.date === selectedDate
                        },
                        h("span", null, day.weekday),
                        h("strong", null, day.day),
                        h("em", null, `${day.month} ${day.year || ""}`.trim())
                      )
                    )
                  ),
                  h(
                    "div",
                    { className: "time-grid" },
                    selectedDay?.slots.map((slot) =>
                      h(
                        "button",
                        {
                          key: slot.time,
                          type: "button",
                          className: slot.time === selectedTime ? "time-button is-active" : "time-button",
                          onClick: () => setSelectedTime(slot.time),
                          "aria-pressed": slot.time === selectedTime
                        },
                        h("span", null, slot.time),
                        h("small", null, "Disponível")
                      )
                    )
                  )
                )
          ),
          h(
            "form",
            { className: "scheduler-form", onSubmit: handleSubmit },
            h(
              "div",
              { className: "selected-appointment" },
              h("span", null, "Horário escolhido"),
              h("strong", null, selectedDay && selectedTime ? `${selectedDay.label} às ${selectedTime}` : "Selecione um horário"),
              h("p", null, "A equipe prepara uma primeira curadoria antes da chegada da noiva.")
            ),
            h(
              "div",
              { className: "form-grid" },
              h("label", null, h("span", null, "Nome completo"), h("input", { type: "text", value: form.name, onChange: (event) => updateForm("name", event.target.value), required: true, autoComplete: "name" })),
              h("label", null, h("span", null, "WhatsApp"), h("input", { type: "text", value: form.phone, onChange: (event) => updateForm("phone", event.target.value), required: true, autoComplete: "tel", inputMode: "tel" })),
              h("label", null, h("span", null, "E-mail"), h("input", { type: "text", value: form.email, onChange: (event) => updateForm("email", event.target.value), required: true, autoComplete: "email", inputMode: "email" })),
              h("label", null, h("span", null, "Data do casamento"), h("input", { type: "text", placeholder: "DD/MM/AAAA", maxLength: "10", value: form.eventDate, onChange: (event) => updateForm("eventDate", formatEventDateInput(event.target.value)), inputMode: "numeric" })),
              h(
                "label",
                null,
                h("span", null, "Interesse"),
                h(
                  "select",
                  { value: form.segment, onChange: (event) => updateForm("segment", event.target.value), required: true },
                  segments.map((segment) => h("option", { key: segment, value: segment }, segment))
                )
              ),
              h("label", null, h("span", null, "Idade opcional"), h("input", { type: "text", maxLength: "3", value: form.age, onChange: (event) => updateForm("age", event.target.value.replace(/\D/g, "")), inputMode: "numeric" })),
              h("label", { className: "is-wide" }, h("span", null, "Detalhes para a curadoria"), h("textarea", { rows: 4, value: form.notes, onChange: (event) => updateForm("notes", event.target.value), placeholder: "Ex.: vestido modesto, plus size, aluguel, sob medida, cerimônia religiosa, véu longo, orçamento desejado." }))
            ),
            h("button", { className: "booking-submit", type: "submit", disabled: loading || submitting || !selectedDay || !selectedTime }, submitting ? "Enviando..." : "Solicitar atendimento privado"),
            status.message &&
              h(
                "div",
                { className: `form-status is-${status.type}`, role: status.type === "error" ? "alert" : "status" },
                h("p", null, status.message),
                confirmationUrl && status.type === "success" && h("a", { href: confirmationUrl, target: "_blank", rel: "noopener noreferrer" }, "Enviar aviso no WhatsApp")
              )
          )
        )
      )
    );
  }

  function Contact() {
    return h(
      "section",
      { id: "contato", className: "contact-section", "data-header-theme": "light" },
      h(
        "div",
        { className: "contact-grid" },
        h(
          "div",
          { className: "contact-copy reveal" },
          h("h2", null, "Atendimento em São Paulo, com conversa direta."),
          h("p", null, address),
          h(
            "div",
            { className: "contact-lines" },
            h("a", { href: whatsappUrl, target: "_blank", rel: "noopener noreferrer" }, `WhatsApp ${phoneDisplay}`),
            emails.map((email) => h("a", { key: email, href: `mailto:${email}` }, email)),
            h("a", { href: instagramUrl, target: "_blank", rel: "noopener noreferrer" }, "@cibella_noivas")
          ),
          h("div", { className: "contact-actions" }, h(Button, { href: "#agendamento", variant: "primary" }, "Agendar visita"), h(Button, { href: whatsappUrl, variant: "outline", target: "_blank" }, "WhatsApp"))
        ),
        h(
          "div",
          { className: "contact-visual reveal", "aria-label": "Imagem editorial Cibella Noivas" },
          h("img", { src: media.veil, alt: "" }),
          h("div", null, h("span", null, "Cidade Monções"), h("strong", null, "R. João Amaro, 31"), h("p", null, "Atendimento privado por agendamento."))
        )
      )
    );
  }

  function FinalCta() {
    return h(
      "section",
      { className: "final-cta", "data-header-theme": "dark" },
      h(
        "div",
        { className: "final-inner" },
        h("h2", { className: "reveal" }, "O vestido certo não chama atenção. Ele sustenta presença."),
        h("p", { className: "reveal" }, "Agende uma visita para ver coleção, sob medida, moda modesta, plus size e acessórios com a equipe Cibella Noivas."),
        h("div", { className: "final-actions reveal" }, h(Button, { href: "#agendamento", variant: "light" }, "Agendar atendimento"), h(Button, { href: whatsappUrl, target: "_blank", variant: "ghost" }, "Falar no WhatsApp"))
      )
    );
  }

  function FloatingWhatsapp() {
    return h(
      "a",
      {
        className: "floating-whatsapp",
        href: whatsappUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": `Falar com a Cibella Noivas pelo WhatsApp ${phoneDisplay}`
      },
      h("span", null, "WhatsApp"),
      h("strong", null, phoneDisplay)
    );
  }

  function Footer() {
    const year = new Date().getFullYear();
    return h(
      "footer",
      { className: "footer", "data-header-theme": "dark" },
      h(
        "div",
        { className: "footer-inner" },
        h("div", null, h(BrandMark, { light: true }), h("p", null, "Vestidos de noiva, sob medida, moda modesta, plus size e acessórios.")),
        h(
          "div",
          null,
          h("a", { href: instagramUrl, target: "_blank", rel: "noopener noreferrer" }, "Instagram"),
          h("a", { href: whatsappUrl, target: "_blank", rel: "noopener noreferrer" }, "WhatsApp"),
          emails.map((email) => h("a", { key: email, href: `mailto:${email}` }, email)),
          h("p", null, `© ${year} Cibella Noivas.`)
        )
      )
    );
  }

  function App() {
    useEffect(() => {
      const items = document.querySelectorAll(".reveal");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      items.forEach((item) => observer.observe(item));
      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      const scrollToHash = () => {
        if (!window.location.hash) return;
        document.querySelector(window.location.hash)?.scrollIntoView({ block: "start" });
      };
      const timers = [80, 320, 900].map((delay) => window.setTimeout(scrollToHash, delay));
      window.addEventListener("hashchange", scrollToHash);
      return () => {
        timers.forEach((timer) => window.clearTimeout(timer));
        window.removeEventListener("hashchange", scrollToHash);
      };
    }, []);

    return h(
      React.Fragment,
      null,
      h(Header),
      h("main", null, h(Hero), h(Signature), h(Collection), h(Atelier), h(Modesty), h(Experience), h(Scheduling), h(Contact), h(FinalCta)),
      h(Footer),
      h(FloatingWhatsapp)
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
