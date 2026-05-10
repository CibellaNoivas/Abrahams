(function bootAbrahams() {
  if (!window.React || !window.ReactDOM) {
    window.setTimeout(bootAbrahams, 40);
    return;
  }

  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const { useEffect, useMemo, useRef, useState } = React;
  const h = (type, props, ...children) =>
    React.createElement(type, props || {}, ...children.flat().filter(Boolean));

  const phoneDisplay = "+55 11 91561-4927";
  const whatsappNumber = "5511915614927";
  const whatsappUrl =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá, quero atendimento Abrahams by Cibella Group.")}`;
  const instagramUrl = "https://www.instagram.com/abrahamsbycn/";
  const emails = ["ibrahimhakkialtin@gmail.com", "taner@cibellanoivas.com", "camila@cibellanoivas.com"];
  const scheduleNote = "Segunda a sexta, 09:00 às 18:00. Sábado, 09:00 às 13:00. Domingo fechado.";

  const media = {
    logo: "/media/abrahams-logo.png",
    fabric: "/media/navy-fabric.png",
    atelierDark: "/media/abrahams-atelier-dark.png",
    loungeLight: "/media/abrahams-lounge-light.png",
    blueAtelier: "/media/blue-atelier-suit.png",
    suit: "/media/look-business.png",
    casual: "/media/look-casual.png",
    shirts: "/media/shirts.png",
    event: "/media/event-look.png",
    detail: "/media/collection-detail.png"
  };

  const navItems = [
    ["Início", "#inicio"],
    ["Catálogo", "#catalogo"],
    ["Atelier", "#atelier"],
    ["Lookbook", "#lookbook"],
    ["Agendamento", "#agendamento"],
    ["Contato", "#contato"]
  ];

  const catalogItems = [
    {
      id: "ternos",
      title: "Ternos",
      label: "Cerimonial",
      image: media.suit,
      text: "Ternos slim e clássicos para casamento, eventos e rotina executiva com caimento preciso.",
      tags: ["Slim", "Clássico", "Sob medida visual"],
      detail: "Para noivos, padrinhos, formaturas e eventos sociais, com foco em proporção, ombro limpo e presença sem exagero."
    },
    {
      id: "calcas",
      title: "Calças de alfaiataria",
      label: "Base",
      image: media.event,
      text: "Calças sociais em cortes atuais, pensadas para compor traje completo ou smart casual.",
      tags: ["Social", "Reta", "Slim"],
      detail: "Base versátil para montar combinações com blazer, camisa, malha leve ou traje completo para trabalho e evento."
    },
    {
      id: "blazers",
      title: "Blazers",
      label: "Smart",
      image: media.casual,
      text: "Blazers modernos para elevar camisa, malha leve ou composição de evento sem excesso.",
      tags: ["Navy", "Grafite", "Texturizado"],
      detail: "Uma peça de transição para rotina, jantar, reunião e ocasiões em que o visual precisa ficar mais refinado."
    },
    {
      id: "camisas",
      title: "Camisas",
      label: "Essencial",
      image: media.shirts,
      text: "Camisas brancas, azuis e bases formais para noivos, padrinhos e atendimento corporativo.",
      tags: ["Colarinho", "Punho", "Algodão"],
      detail: "Camisas limpas e elegantes para sustentar o traje, equilibrando colarinho, punho, tecido e caimento."
    },
    {
      id: "gravatas-borboleta",
      title: "Gravatas-borboleta",
      label: "Black tie",
      image: media.fabric,
      text: "Papillons para cerimônias noturnas, black tie e looks com assinatura mais formal.",
      tags: ["Preto", "Navy", "Cetim"],
      detail: "Acessório certo para cerimônias noturnas, black tie e composições com leitura mais sofisticada."
    },
    {
      id: "gravatas",
      title: "Gravatas",
      label: "Formal",
      image: media.detail,
      text: "Gravatas discretas para casamento, formatura, eventos corporativos e recepções.",
      tags: ["Lisa", "Textura", "Champagne"],
      detail: "Modelos em tons sóbrios e texturas controladas para fechar o traje sem competir com o conjunto."
    },
    {
      id: "abotoaduras",
      title: "Abotoaduras",
      label: "Detalhe",
      image: media.atelierDark,
      text: "Abotoaduras e pequenos acabamentos para finalizar o traje com presença silenciosa.",
      tags: ["Metal", "Cerimônia", "Presente"],
      detail: "Detalhes pequenos, mas importantes, para camisa social, cerimônia, presente e acabamento final do visual."
    }
  ];

  const lookbook = [
    { category: "Atelier", image: media.blueAtelier, title: "Azul noturno e precisão" },
    { category: "Abrahams", image: media.atelierDark, title: "Sala de atendimento privado" },
    { category: "Cibella", image: media.loungeLight, title: "Arquitetura calma, presença clara" },
    { category: "Textura", image: media.fabric, title: "Tecido, linha e sombra" },
    { category: "Terno", image: media.suit, title: "Silhueta social contemporânea" },
    { category: "Camisas", image: media.shirts, title: "Base limpa para cerimônia" }
  ];

  const rituals = [
    ["01", "Curadoria", "Entendemos evento, horário, paleta, dress code e a imagem que o cliente quer projetar."],
    ["02", "Composição", "Selecionamos terno, blazer, calça, camisa e acessórios com equilíbrio entre corpo e ocasião."],
    ["03", "Ajuste visual", "Refinamos proporções, comprimentos e detalhes para fotografia, movimento e presença."],
    ["04", "Entrega", "O traje sai pronto para casamento, festa, noite, trabalho ou encontro importante."]
  ];

  const segments = ["Noivo", "Padrinho", "Black Tie / Gala", "Camisas & Bases", "Consultoria completa"];
  const emptyBookingForm = {
    name: "",
    age: "",
    email: "",
    phone: "",
    segment: "Noivo",
    eventDate: "",
    notes: ""
  };

  function formatEventDateInput(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) {
      return digits;
    }
    if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  function Button({ children, href, variant = "primary", className = "" }) {
    const base = "btn";
    return h("a", { href, className: `${base} btn-${variant} ${className}` }, children);
  }

  function BrandMark({ light = false }) {
    return h(
      "a",
      { href: "#inicio", className: `brand-mark ${light ? "is-light" : ""}`, "aria-label": "Abrahams by Cibella Group" },
      h("strong", null, "ABRAHAMS"),
      h("span", null, "by Cibella Group")
    );
  }

  function Header() {
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState("dark");
    const logoLight = theme === "dark" && !open;

    useEffect(() => {
      const updateTheme = () => {
        const probeY = 44;
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
        h(BrandMark, { light: logoLight }),
        h("nav", { className: "desktop-nav", "aria-label": "Navegação principal" }, links),
        h("a", { href: "#agendamento", className: "header-cta" }, "Agendar"),
        h(
          "button",
          {
            className: "menu-button",
            type: "button",
            onClick: () => setOpen(!open),
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
        h("nav", null, links, Button({ href: "#agendamento", className: "mt-5 w-full", children: "Agendar visita" }))
      )
    );
  }

  function Hero() {
    const slides = useMemo(
      () => [
        { image: media.blueAtelier, label: "Atelier", title: "Alfaiataria masculina com presença de cerimônia." },
        { image: media.atelierDark, label: "Abrahams", title: "Trajes para o momento em que tudo fica registrado." },
        { image: media.fabric, label: "Textura", title: "Navy profundo, corte limpo e detalhe silencioso." }
      ],
      []
    );
    const [active, setActive] = useState(0);

    useEffect(() => {
      const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 5600);
      return () => window.clearInterval(timer);
    }, [slides.length]);

    const slide = slides[active];

    return h(
      "section",
      { id: "inicio", className: "hero-section", "data-header-theme": "dark" },
      h("img", { className: "hero-bg", src: slide.image, alt: "" }),
      h("div", { className: "hero-scrim" }),
      h(
        "div",
        { className: "hero-inner" },
        h(
          "div",
          { className: "hero-copy reveal" },
          h("p", { className: "eyebrow" }, "Abrahams by Cibella Group"),
          h("h1", null, slide.title),
          h("p", { className: "hero-lede" }, "Ternos, blazers, calças, camisas e acessórios para homens que querem chegar bem em casamento, evento, trabalho e rotina."),
          h("div", { className: "hero-actions" }, Button({ href: "#catalogo", variant: "light", children: "Ver catálogo" }), Button({ href: "#agendamento", variant: "ghost", children: "Atendimento privado" }))
        ),
        h(
          "div",
          { className: "hero-control reveal" },
          slides.map((item, index) =>
            h(
              "button",
              { key: item.label, type: "button", className: index === active ? "is-active" : "", onClick: () => setActive(index) },
              h("span", null, `0${index + 1}`),
              h("strong", null, item.label)
            )
          )
        )
      )
    );
  }

  function AtelierMotion() {
    const canvasRef = useRef(null);
    const sectionRef = useRef(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
      const canvas = canvasRef.current;
      const section = sectionRef.current;
      if (!canvas || !section) {
        return undefined;
      }

      let cleanup = () => {};
      let cancelled = false;

      const buildScene = async () => {
        try {
          const THREE = await import("https://unpkg.com/three@0.164.1/build/three.module.js");
          if (cancelled) {
            return;
          }

          const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance"
          });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
          renderer.outputColorSpace = THREE.SRGBColorSpace;
          renderer.setClearColor(0x000000, 0);

          const scene = new THREE.Scene();
          scene.fog = new THREE.Fog(0x071744, 7, 16);

          const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
          camera.position.set(0, 0.2, 7.2);

          const group = new THREE.Group();
          scene.add(group);

          const ambient = new THREE.AmbientLight(0xfbf7ef, 0.42);
          scene.add(ambient);

          const keyLight = new THREE.DirectionalLight(0xf7dfb0, 2.6);
          keyLight.position.set(-3.8, 4.6, 5.6);
          scene.add(keyLight);

          const rimLight = new THREE.PointLight(0xc7a86b, 6.2, 12);
          rimLight.position.set(3.4, 1.4, 3.2);
          scene.add(rimLight);

          const clothMaterials = [
            new THREE.MeshPhysicalMaterial({
              color: 0x071744,
              roughness: 0.74,
              metalness: 0.05,
              clearcoat: 0.32,
              transparent: true,
              opacity: 0.92,
              side: THREE.DoubleSide
            }),
            new THREE.MeshPhysicalMaterial({
              color: 0x0b1f33,
              roughness: 0.8,
              metalness: 0.03,
              clearcoat: 0.22,
              transparent: true,
              opacity: 0.72,
              side: THREE.DoubleSide
            }),
            new THREE.MeshPhysicalMaterial({
              color: 0x161616,
              roughness: 0.86,
              metalness: 0.08,
              clearcoat: 0.2,
              transparent: true,
              opacity: 0.62,
              side: THREE.DoubleSide
            })
          ];

          const stripeMaterial = new THREE.LineBasicMaterial({
            color: 0xc7a86b,
            transparent: true,
            opacity: 0.62
          });

          const waveZ = (x, y, offset) =>
            Math.sin(x * 1.05 + offset) * 0.18 + Math.cos(y * 3.2 + offset * 0.8) * 0.08;

          const ribbons = [];
          const ribbonSettings = [
            { y: 0.35, z: -0.45, rx: -0.18, ry: -0.46, rz: -0.08, scale: 1.08, offset: 0.2, mat: 0 },
            { y: -0.08, z: -0.08, rx: -0.12, ry: 0.32, rz: 0.07, scale: 0.98, offset: 1.7, mat: 1 },
            { y: -0.52, z: 0.2, rx: -0.08, ry: -0.2, rz: 0.14, scale: 0.88, offset: 3.2, mat: 2 }
          ];

          ribbonSettings.forEach((settings, index) => {
            const geometry = new THREE.PlaneGeometry(7.2, 2.15, 112, 30);
            const positions = geometry.attributes.position;
            const base = new Float32Array(positions.array);
            for (let i = 0; i < positions.count; i += 1) {
              const x = positions.getX(i);
              const y = positions.getY(i);
              positions.setZ(i, waveZ(x, y, settings.offset));
            }
            geometry.computeVertexNormals();

            const mesh = new THREE.Mesh(geometry, clothMaterials[settings.mat]);
            mesh.position.set(0.85, settings.y, settings.z);
            mesh.rotation.set(settings.rx, settings.ry, settings.rz);
            mesh.scale.setScalar(settings.scale);
            group.add(mesh);

            const stripeGroup = new THREE.Group();
            for (let line = 0; line < 8; line += 1) {
              const y = -0.86 + line * 0.25;
              const points = [];
              for (let step = 0; step < 80; step += 1) {
                const x = -3.45 + step * (6.9 / 79);
                points.push(new THREE.Vector3(x, y, waveZ(x, y, settings.offset) + 0.018));
              }
              const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
              const stripe = new THREE.Line(lineGeometry, stripeMaterial);
              stripeGroup.add(stripe);
            }
            stripeGroup.position.copy(mesh.position);
            stripeGroup.rotation.copy(mesh.rotation);
            stripeGroup.scale.copy(mesh.scale);
            group.add(stripeGroup);

            ribbons.push({ mesh, stripeGroup, base, offset: settings.offset, index });
          });

          const lapelGroup = new THREE.Group();
          lapelGroup.position.set(-1.3, 0.15, 1.05);
          lapelGroup.rotation.set(-0.08, -0.28, 0.02);
          group.add(lapelGroup);

          const createTriangle = (points, color, opacity = 0.96) => {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute("position", new THREE.Float32BufferAttribute(points.flat(), 3));
            geometry.computeVertexNormals();
            const material = new THREE.MeshPhysicalMaterial({
              color,
              roughness: 0.7,
              metalness: 0.08,
              clearcoat: 0.38,
              transparent: true,
              opacity,
              side: THREE.DoubleSide
            });
            return new THREE.Mesh(geometry, material);
          };

          lapelGroup.add(
            createTriangle(
              [
                [-0.12, 1.58, 0],
                [-1.05, -1.25, 0.08],
                [0.15, -0.48, 0.12]
              ],
              0x071744
            )
          );
          lapelGroup.add(
            createTriangle(
              [
                [0.22, 1.48, 0.05],
                [1.05, -1.18, 0.06],
                [-0.08, -0.48, 0.14]
              ],
              0x0b1f33,
              0.9
            )
          );
          lapelGroup.add(
            createTriangle(
              [
                [-0.08, 1.08, 0.02],
                [0.28, -0.8, 0.18],
                [-0.28, -0.8, 0.18]
              ],
              0xc7a86b,
              0.78
            )
          );

          const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xc7a86b, transparent: true, opacity: 0.86 });
          [
            [
              [-0.12, 1.58, 0.02],
              [-1.05, -1.25, 0.1],
              [0.15, -0.48, 0.14]
            ],
            [
              [0.22, 1.48, 0.08],
              [1.05, -1.18, 0.08],
              [-0.08, -0.48, 0.16]
            ]
          ].forEach((points) => {
            const linePoints = points.map((point) => new THREE.Vector3(...point));
            const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(linePoints), edgeMaterial);
            lapelGroup.add(line);
          });

          const particleGeometry = new THREE.BufferGeometry();
          const particlePositions = [];
          for (let i = 0; i < 150; i += 1) {
            const radius = 2.2 + Math.random() * 3.8;
            const angle = Math.random() * Math.PI * 2;
            particlePositions.push(
              Math.cos(angle) * radius,
              -1.95 + Math.random() * 4.1,
              -1.8 + Math.sin(angle) * radius * 0.34
            );
          }
          particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(particlePositions, 3));
          const particles = new THREE.Points(
            particleGeometry,
            new THREE.PointsMaterial({
              color: 0xc7a86b,
              size: 0.018,
              transparent: true,
              opacity: 0.72
            })
          );
          scene.add(particles);

          const pointer = { x: 0, y: 0 };
          let visible = true;

          const resize = () => {
            const rect = section.getBoundingClientRect();
            const width = Math.max(320, Math.floor(rect.width));
            const height = Math.max(360, Math.floor(rect.height));
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
          };

          const onPointerMove = (event) => {
            const rect = section.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * -2;
          };

          const observer = new IntersectionObserver(
            ([entry]) => {
              visible = entry.isIntersecting;
            },
            { threshold: 0.08 }
          );

          const clock = new THREE.Clock();
          let frameId = 0;

          const animate = () => {
            frameId = window.requestAnimationFrame(animate);
            if (!visible) {
              return;
            }

            const time = clock.getElapsedTime();
            camera.position.x += (pointer.x * 0.34 - camera.position.x) * 0.04;
            camera.position.y += (0.2 + pointer.y * 0.16 - camera.position.y) * 0.04;
            camera.lookAt(0, 0, 0);

            group.rotation.y = Math.sin(time * 0.32) * 0.08 + pointer.x * 0.035;
            group.rotation.x = pointer.y * 0.025;
            lapelGroup.rotation.y = -0.28 + Math.sin(time * 0.46) * 0.08 + pointer.x * 0.04;
            lapelGroup.position.y = 0.15 + Math.sin(time * 0.72) * 0.045;
            particles.rotation.y = time * 0.035;

            ribbons.forEach(({ mesh, stripeGroup, base, offset, index }) => {
              const positions = mesh.geometry.attributes.position;
              for (let i = 0; i < positions.count; i += 1) {
                const x = base[i * 3];
                const y = base[i * 3 + 1];
                const z = base[i * 3 + 2] + waveZ(x, y, offset + time * (0.36 + index * 0.06)) * 0.42;
                positions.setXYZ(i, x, y + Math.sin(time * 0.42 + x + index) * 0.012, z);
              }
              positions.needsUpdate = true;
              mesh.geometry.computeVertexNormals();
              mesh.position.x = 0.85 + Math.sin(time * 0.28 + index) * 0.08;
              stripeGroup.position.x = mesh.position.x;
            });

            renderer.render(scene, camera);
          };

          resize();
          observer.observe(section);
          section.addEventListener("pointermove", onPointerMove);
          window.addEventListener("resize", resize);
          animate();
          setReady(true);

          cleanup = () => {
            window.cancelAnimationFrame(frameId);
            observer.disconnect();
            section.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("resize", resize);
            renderer.dispose();
            clothMaterials.forEach((material) => material.dispose());
            stripeMaterial.dispose();
            edgeMaterial.dispose();
            scene.traverse((object) => {
              if (object.geometry) {
                object.geometry.dispose();
              }
              if (object.material && !Array.isArray(object.material)) {
                object.material.dispose();
              }
            });
          };
        } catch (error) {
          console.warn("Atelier 3D fallback ativo:", error);
          section.classList.add("is-fallback");
        }
      };

      buildScene();

      return () => {
        cancelled = true;
        cleanup();
      };
    }, []);

    return h(
      "section",
      {
        ref: sectionRef,
        className: `atelier-motion-section ${ready ? "is-ready" : ""}`,
        "data-header-theme": "dark",
        "aria-label": "Experiência visual Abrahams"
      },
      h("canvas", { ref: canvasRef, className: "atelier-motion-canvas", "aria-hidden": "true" }),
      h("div", { className: "atelier-motion-glow", "aria-hidden": "true" }),
      h(
        "div",
        { className: "atelier-motion-copy reveal" },
        h("p", { className: "eyebrow" }, "Movimento"),
        h("h2", null, "Alfaiataria que acompanha a presença."),
        h("p", null, "Camadas de tecido, luz e precisão em uma leitura contemporânea do traje masculino."),
        h(
          "div",
          { className: "motion-signals" },
          h("span", null, "Curadoria 1h30"),
          h("span", null, "Navy profundo"),
          h("span", null, "Acabamento Abrahams")
        )
      )
    );
  }

  function SectionIntro({ eyebrow, title, text, light = false }) {
    return h(
      "div",
      { className: `section-intro reveal ${light ? "is-light" : ""}` },
      h("p", { className: "eyebrow" }, eyebrow),
      h("h2", null, title),
      text && h("p", null, text)
    );
  }

  function Identity() {
    return h(
      "section",
      { className: "identity-section", "data-header-theme": "light" },
      h(
        "div",
        { className: "identity-grid" },
        h("figure", { className: "identity-image reveal" }, h("img", { src: media.loungeLight, alt: "Ambiente Abrahams by Cibella Group" })),
        h(
          "div",
          { className: "identity-copy reveal" },
          h("p", { className: "eyebrow" }, "Identidade"),
          h("h2", null, "Azul noturno, ivory quente e assinatura calma."),
          h("p", null, "A direção visual combina a assinatura Abrahams com texturas navy, luz quente e ambientes de atelier. O resultado é masculino, limpo e premium sem parecer distante."),
          h(
            "div",
            { className: "swatch-row" },
            [["Navy", "#071744"], ["Ivory", "#FBF7EF"], ["Champagne", "#C7A86B"], ["Charcoal", "#161616"]].map(([name, color]) =>
              h("span", { key: name }, h("i", { style: { background: color } }), name)
            )
          )
        )
      )
    );
  }

  function Catalog() {
    return h(
      "section",
      { id: "catalogo", className: "catalog-section section-pad", "data-header-theme": "light" },
      h(
        "div",
        { className: "section-wrap" },
        h(SectionIntro, {
          eyebrow: "Catálogo",
          title: "Tudo para montar o traje completo.",
          text: "Uma seleção de alfaiataria e acessórios masculinos para comprar com orientação, consistência visual e acabamento premium."
        }),
        h(
          "div",
          { className: "catalog-grid" },
          catalogItems.map((item, index) =>
            h(
              "article",
              { key: item.title, className: `catalog-card reveal ${index === 0 ? "is-featured" : ""}` },
              h("div", { className: "catalog-media" }, h("img", { src: item.image, alt: item.title })),
              h(
                "div",
                { className: "catalog-content" },
                h("span", null, item.label),
                h("h3", null, h("a", { href: `#categoria-${item.id}` }, item.title)),
                h("p", null, item.text),
                h("ul", null, item.tags.map((tag) => h("li", { key: tag }, tag))),
                h(
                  "div",
                  { className: "catalog-links" },
                  h("a", { href: `#categoria-${item.id}` }, "Ver categoria"),
                  h("a", { href: whatsappUrl, target: "_blank", rel: "noopener noreferrer" }, "Consultar peça")
                )
              )
            )
          )
        )
      )
    );
  }

  function CategoryShowcase() {
    return h(
      "section",
      { id: "categorias", className: "category-section section-pad", "data-header-theme": "light" },
      h(
        "div",
        { className: "section-wrap" },
        h(SectionIntro, {
          eyebrow: "Categorias",
          title: "Entre direto na peça que procura.",
          text: "Cada linha tem uma leitura própria. Escolha a categoria e fale com a equipe para montar o visual completo."
        }),
        h(
          "nav",
          { className: "category-jump reveal", "aria-label": "Categorias Abrahams" },
          catalogItems.map((item) => h("a", { key: item.id, href: `#categoria-${item.id}` }, item.title))
        ),
        h(
          "div",
          { className: "category-list" },
          catalogItems.map((item, index) =>
            h(
              "article",
              { key: item.id, id: `categoria-${item.id}`, className: `category-panel reveal ${index % 2 ? "is-reverse" : ""}` },
              h("div", { className: "category-panel-media" }, h("img", { src: item.image, alt: item.title })),
              h(
                "div",
                { className: "category-panel-copy" },
                h("span", null, item.label),
                h("h3", null, item.title),
                h("p", null, item.detail || item.text),
                h("ul", null, item.tags.map((tag) => h("li", { key: tag }, tag))),
                h("div", { className: "category-actions" }, Button({ href: "#agendamento", variant: "primary", children: "Agendar curadoria" }), Button({ href: whatsappUrl, variant: "outline", children: "WhatsApp" }))
              )
            )
          )
        )
      )
    );
  }

  function Atelier() {
    return h(
      "section",
      { id: "atelier", className: "atelier-section section-pad", "data-header-theme": "dark" },
      h(
        "div",
        { className: "atelier-grid" },
        h(
          "div",
          { className: "atelier-images reveal" },
          h("img", { src: media.atelierDark, alt: "Atelier Abrahams by Cibella Group" }),
          h("img", { src: media.fabric, alt: "Textura de tecido navy Abrahams" })
        ),
        h(
          "div",
          { className: "atelier-copy reveal" },
          h("p", { className: "eyebrow" }, "Atelier"),
          h("h2", null, "Um processo simples para escolher bem."),
          h("p", null, "Abrahams by Cibella Group atende o homem que precisa de uma roupa bem resolvida, seja para casamento, evento formal, reunião importante ou uso social no dia a dia."),
          h(
            "div",
            { className: "ritual-list" },
            rituals.map(([number, title, text]) =>
              h("article", { key: number }, h("span", null, number), h("div", null, h("h3", null, title), h("p", null, text)))
            )
          )
        )
      )
    );
  }

  function Lookbook() {
    return h(
      "section",
      { id: "lookbook", className: "lookbook-section section-pad", "data-header-theme": "light" },
      h(
        "div",
        { className: "section-wrap" },
        h(SectionIntro, {
          eyebrow: "Lookbook",
          title: "Referências para vestir presença.",
          text: "Ambientes, texturas e silhuetas que mostram a linguagem Abrahams: masculina, urbana, refinada e sem excesso."
        }),
        h(
          "div",
          { className: "lookbook-masonry" },
          lookbook.map((item, index) =>
            h(
              "figure",
              { key: item.title, className: `lookbook-tile reveal tile-${index}` },
              h("img", { src: item.image, alt: item.title }),
              h("figcaption", null, h("span", null, item.category), h("strong", null, item.title))
            )
          )
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
    const canSubmit =
      selectedDay &&
      selectedTime &&
      form.name.trim() &&
      form.age &&
      form.email.trim() &&
      form.phone.trim() &&
      form.segment &&
      !submitting;

    const loadAvailability = async (preferredDate = selectedDate, preferredTime = selectedTime) => {
      setLoading(true);
      try {
        const response = await fetch("/api/agendamentos/disponibilidade", { headers: { Accept: "application/json" } });
        if (!response.ok) {
          throw new Error("Nao foi possivel carregar a agenda.");
        }
        const data = await response.json();
        const days = Array.isArray(data.days) ? data.days : [];
        const nextDay = days.find((day) => day.date === preferredDate) || days[0];
        const nextTime =
          nextDay?.slots.find((slot) => slot.time === preferredTime)?.time || nextDay?.slots[0]?.time || "";
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

    const updateForm = (field, value) => {
      setForm((current) => ({ ...current, [field]: value }));
    };

    const chooseDay = (day) => {
      setSelectedDate(day.date);
      setSelectedTime(day.slots[0]?.time || "");
      setConfirmationUrl("");
      if (status.type === "error") {
        setStatus({ type: "idle", message: "" });
      }
    };

    const handleSubmit = async (event) => {
      event.preventDefault();
      if (!canSubmit) {
        setStatus({ type: "error", message: "Preencha os dados obrigatórios e escolha um horário disponível." });
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
          if (response.status === 409) {
            await loadAvailability("", "");
          }
          throw new Error(data.error || "Não foi possível solicitar este horário.");
        }

        const slotLabel = data.booking?.slotLabel || "horário solicitado";
        const protocol = data.booking?.id ? ` Protocolo: ${data.booking.id}.` : "";
        const confirmText = [
          "NOVO AGENDAMENTO - ABRAHAMS BY CIBELLA GROUP",
          `Cliente: ${form.name}`,
          protocol.trim(),
          `Horário: ${slotLabel}`,
          `Segmento: ${form.segment}`,
          `Idade: ${form.age}`,
          `E-mail: ${form.email}`,
          `WhatsApp: ${form.phone}`,
          form.eventDate ? `Data do evento: ${form.eventDate}` : "Data do evento: não informada",
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
        const calendarNote = data.calendar?.queued
          ? " Também foi enviado para o Google Calendar da equipe."
          : data.email?.queued
            ? " Também foi enviado por e-mail para a equipe."
            : " Pedido salvo no painel privado. O WhatsApp da loja foi aberto com o aviso pronto.";
        setStatus({
          type: "success",
          message: `${slotLabel}. Pedido recebido.${calendarNote}`
        });
        setForm({ ...emptyBookingForm });
        await loadAvailability(selectedDate, selectedTime);
      } catch (error) {
        if (whatsappWindow && !whatsappWindow.closed) {
          whatsappWindow.close();
        }
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
          eyebrow: "Agendamento",
          title: "Escolha o dia, o horário e conte o que precisa.",
          text: `O cliente vê apenas horários disponíveis. ${scheduleNote} Cada atendimento reserva 1h30 para curadoria e prova.`,
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
              h(
                "strong",
                null,
                selectedDay && selectedTime ? `${selectedDay.label} às ${selectedTime}` : "Selecione um horário"
              ),
              h("p", null, scheduleNote)
            ),
            h(
              "div",
              { className: "form-grid" },
              h(
                "label",
                null,
                h("span", null, "Nome completo"),
                h("input", {
                  type: "text",
                  value: form.name,
                  onChange: (event) => updateForm("name", event.target.value),
                  required: true,
                  autoComplete: "name"
                })
              ),
              h(
                "label",
                null,
                h("span", null, "Idade"),
                h("input", {
                  type: "text",
                  maxLength: "3",
                  value: form.age,
                  onChange: (event) => updateForm("age", event.target.value),
                  required: true,
                  inputMode: "numeric"
                })
              ),
              h(
                "label",
                null,
                h("span", null, "E-mail"),
                h("input", {
                  type: "text",
                  value: form.email,
                  onChange: (event) => updateForm("email", event.target.value),
                  required: true,
                  autoComplete: "email",
                  inputMode: "email"
                })
              ),
              h(
                "label",
                null,
                h("span", null, "WhatsApp"),
                h("input", {
                  type: "text",
                  value: form.phone,
                  onChange: (event) => updateForm("phone", event.target.value),
                  required: true,
                  autoComplete: "tel",
                  inputMode: "tel"
                })
              ),
              h(
                "label",
                null,
                h("span", null, "Segmento procurado"),
                h(
                  "select",
                  {
                    value: form.segment,
                    onChange: (event) => updateForm("segment", event.target.value),
                    required: true
                  },
                  segments.map((segment) => h("option", { key: segment, value: segment }, segment))
                )
              ),
              h(
                "label",
                null,
                h("span", null, "Data do evento"),
                h("input", {
                  type: "text",
                  placeholder: "DD/MM/AAAA",
                  maxLength: "10",
                  value: form.eventDate,
                  onChange: (event) => updateForm("eventDate", formatEventDateInput(event.target.value)),
                  inputMode: "numeric"
                })
              ),
              h(
                "label",
                { className: "is-wide" },
                h("span", null, "Detalhes para a curadoria"),
                h("textarea", {
                  rows: 4,
                  value: form.notes,
                  onChange: (event) => updateForm("notes", event.target.value),
                  placeholder: "Ex.: casamento à noite, traje para padrinhos, preferência por azul, precisa de camisa e acessórios."
                })
              )
            ),
            h("button", { className: "booking-submit", type: "submit", disabled: loading || submitting || !selectedDay || !selectedTime }, submitting ? "Enviando..." : "Solicitar agendamento"),
            status.message &&
              h(
                "div",
                { className: `form-status is-${status.type}`, role: status.type === "error" ? "alert" : "status" },
                h("p", null, status.message),
                confirmationUrl &&
                  status.type === "success" &&
                  h("a", { href: confirmationUrl, target: "_blank", rel: "noopener noreferrer" }, "Enviar aviso no WhatsApp")
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
          h("p", { className: "eyebrow" }, "Contato"),
          h("h2", null, "Atendimento junto ao universo Cibella."),
          h("p", null, "R. João Amaro, 31 - Cidade Monções, São Paulo - SP, 04583-030"),
          h(
            "div",
            { className: "contact-lines" },
            h("a", { href: whatsappUrl }, `WhatsApp Abrahams ${phoneDisplay}`),
            h("a", { href: instagramUrl, target: "_blank", rel: "noopener noreferrer" }, "Instagram @abrahamsbycn"),
            emails.map((email) => h("a", { key: email, href: `mailto:${email}` }, email))
          ),
          h("div", { className: "contact-actions" }, Button({ href: "#agendamento", variant: "primary", children: "Agendar visita" }), Button({ href: whatsappUrl, variant: "outline", children: "WhatsApp Abrahams" }))
        ),
        h(
          "div",
          { className: "map-card reveal", "aria-label": "Imagem do espaço Abrahams by Cibella Group" },
          h("div", null, h("span", null, "São Paulo"), h("strong", null, "Cidade Monções"), h("p", null, "Atendimento masculino por agendamento."))
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
        h("p", { className: "eyebrow reveal" }, "Abrahams by Cibella Group"),
        h("h2", { className: "reveal" }, "Monte seu visual completo com a Abrahams."),
        h("p", { className: "reveal" }, "Terno, blazer, calça, camisa, gravata, gravata-borboleta e abotoaduras em uma curadoria só."),
        h(
          "div",
          { className: "final-actions mt-9 reveal" },
          Button({ href: "#agendamento", variant: "light", children: "Agendar atendimento" }),
          Button({ href: whatsappUrl, variant: "ghost", children: "WhatsApp Abrahams" })
        )
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
        "aria-label": `Falar com a Abrahams pelo WhatsApp ${phoneDisplay}`
      },
      h("span", null, "WhatsApp Abrahams"),
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
        h("div", null, h(BrandMark, { light: true }), h("p", null, "Alfaiataria, camisas e acessórios masculinos.")),
        h(
          "div",
          null,
          h("a", { href: instagramUrl, target: "_blank", rel: "noopener noreferrer" }, "Instagram"),
          h("a", { href: whatsappUrl }, "WhatsApp"),
          emails.map((email) => h("a", { key: email, href: `mailto:${email}` }, email)),
          h("p", null, `© ${year} Abrahams by Cibella Group.`),
          h("a", { className: "admin-console-link", href: "/admin/login", "aria-label": "Acesso interno Abrahams" }, "console")
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
        if (!window.location.hash) {
          return;
        }
        document.querySelector(window.location.hash)?.scrollIntoView({ block: "start" });
      };
      const timers = [80, 350, 900, 1500].map((delay) => window.setTimeout(scrollToHash, delay));
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
      h("main", null, h(Hero), h(AtelierMotion), h(Identity), h(Catalog), h(CategoryShowcase), h(Atelier), h(Lookbook), h(Scheduling), h(Contact), h(FinalCta)),
      h(Footer),
      h(FloatingWhatsapp)
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
