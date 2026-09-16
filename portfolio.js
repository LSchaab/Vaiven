// Portfolio — galería plana de todos los trabajos + modal de detalle.
// Task 1: pared (grid vertical). Hover tag (Task 2), modal (Tasks 3-5) y
// accesibilidad (Task 7) se agregan encima.
// Ref: docs/superpowers/specs/2026-09-16-portfolio-galeria-plana-modal-design.md
(() => {
    "use strict";
    const section = document.querySelector("#portfolio");
    if (!section || !window.PORTFOLIO) return;

    const wall = section.querySelector(".pf-wall");

    // Brain-hue → filtro CSS (sepia+saturate para que el hue-rotate tiña un fondo neutro).
    const hueFilter = (hue) => `sepia(1) saturate(4) hue-rotate(${hue}deg)`;

    // Aplanar: una sola lista con la categoría embebida en cada work.
    const WORKS = window.PORTFOLIO.flatMap((cat) =>
        cat.works.map((w) => ({
            ...w, catKey: cat.key, catLabel: cat.label, hue: cat.hue,
        }))
    );

    // Card de la pared: botón accesible con portada 16:9 (o fallback teñido),
    // título y tag de categoría (la tag se muestra en hover/focus por CSS).
    const makeCard = (work, index) => {
        const li = document.createElement("li");
        li.className = "pf-card";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pf-card-btn";
        btn.dataset.index = String(index);
        btn.setAttribute("aria-label", `${work.title} — ${work.catLabel}`);

        if (work.portada) {
            const img = document.createElement("img");
            img.className = "pf-card-img";
            img.src = work.portada;
            img.alt = work.title;
            img.loading = "lazy";
            img.decoding = "async";
            btn.appendChild(img);
        } else {
            btn.classList.add("pf-card--fallback");
            btn.style.setProperty("--card-hue", String(work.hue));
        }

        const cap = document.createElement("span");
        cap.className = "pf-cap";
        cap.textContent = work.title;
        btn.appendChild(cap);

        const tag = document.createElement("span");
        tag.className = "pf-tag";
        tag.textContent = work.catLabel;
        tag.style.setProperty("--card-hue", String(work.hue));
        btn.appendChild(tag);

        li.appendChild(btn);
        return li;
    };

    const renderWall = () => {
        wall.innerHTML = "";
        WORKS.forEach((w, i) => wall.appendChild(makeCard(w, i)));
    };

    renderWall();

    // ----- Deformación sutil: tilt al mouse + entrada al scrollear -----
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const noHover = matchMedia("(hover: none)");

    // Tilt: la card se inclina hacia el mouse. Sólo con hover real y sin reduced-motion.
    if (!reduce.matches && !noHover.matches) {
        const TILT = 8; // grados máx
        wall.addEventListener("pointermove", (e) => {
            const btn = e.target.closest(".pf-card-btn");
            if (!btn) return;
            const r = btn.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            btn.style.setProperty("--rx", (px * TILT).toFixed(2) + "deg");
            btn.style.setProperty("--ry", (-py * TILT).toFixed(2) + "deg");
        });
        wall.addEventListener("pointerout", (e) => {
            const btn = e.target.closest(".pf-card-btn");
            if (!btn) return;
            btn.style.setProperty("--rx", "0deg");
            btn.style.setProperty("--ry", "0deg");
        });
    }

    // Entrada: revelar cada card al entrar en viewport (stagger natural por scroll).
    if (!reduce.matches) {
        section.classList.add("pf-anim");
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) {
                    en.target.classList.add("is-in");
                    io.unobserve(en.target);
                }
            });
        }, { threshold: 0.12 });
        wall.querySelectorAll(".pf-card").forEach((c) => io.observe(c));
    }

    // ----- Modal -----
    const modal = document.querySelector("#pf-modal");
    const mTitle = modal.querySelector(".pf-modal-title");
    const mTag = modal.querySelector(".pf-modal-tag");
    const mTools = modal.querySelector(".pf-modal-tools");
    const mDesc = modal.querySelector(".pf-modal-desc");
    let lastFocused = null;

    const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    // Herramientas → chips con logo (resources/logos/<key>.svg). Oculta si no hay.
    const renderTools = (work) => {
        mTools.innerHTML = "";
        const tools = work.tools || [];
        if (!tools.length) { mTools.hidden = true; return; }
        mTools.hidden = false;
        const h = document.createElement("h4");
        h.className = "pf-modal-subhead";
        h.textContent = "Herramientas";
        mTools.appendChild(h);
        const ul = document.createElement("ul");
        ul.className = "pf-tools-list";
        tools.forEach((key) => {
            const li = document.createElement("li");
            li.className = "pf-tool";
            const img = document.createElement("img");
            img.src = `resources/logos/${key}.svg`;
            img.alt = key;
            img.title = key;
            img.decoding = "async";
            li.appendChild(img);
            ul.appendChild(li);
        });
        mTools.appendChild(ul);
    };

    const open = (index) => {
        const work = WORKS[index];
        if (!work) return;
        lastFocused = document.activeElement;

        mTitle.textContent = work.title;
        mTag.textContent = work.catLabel;
        mTag.style.setProperty("--card-hue", String(work.hue));
        renderTools(work);
        // Descripción (se oculta si está vacía — no inventar copy).
        const desc = (work.descripcion || "").trim();
        mDesc.textContent = desc;
        mDesc.hidden = !desc;

        modal.hidden = false;
        document.body.classList.add("pf-modal-open");
        // foco al botón de cerrar
        modal.querySelector(".pf-modal-close").focus();
    };

    const close = () => {
        modal.hidden = true;
        document.body.classList.remove("pf-modal-open");
        if (lastFocused && lastFocused.focus) lastFocused.focus();
    };

    // Delegación: click en cualquier card abre su modal.
    wall.addEventListener("click", (e) => {
        const btn = e.target.closest(".pf-card-btn");
        if (!btn) return;
        open(Number(btn.dataset.index));
    });

    // Cerrar: X, backdrop (elementos con data-close).
    modal.addEventListener("click", (e) => {
        if (e.target.closest("[data-close]")) close();
    });

    // Teclado: Esc cierra; Tab queda atrapado dentro del modal (focus trap).
    modal.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { close(); return; }
        if (e.key !== "Tab") return;
        const items = Array.from(modal.querySelectorAll(FOCUSABLE))
            .filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    });

    window.Portfolio = { WORKS, renderWall, hueFilter, open, close };
})();
