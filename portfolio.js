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

    window.Portfolio = { WORKS, renderWall, hueFilter };
})();
