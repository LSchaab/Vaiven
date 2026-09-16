// Portfolio — carrusel 3D de dos niveles (categorías → trabajos).
// Task 2: render plano de Nivel 1. El coverflow 3D (Task 3), el drill-in
// (Task 4) y la accesibilidad (Task 6) se agregan encima.
// Ref: docs/superpowers/specs/2026-09-15-portfolio-carrusel-3d-design.md
(() => {
    "use strict";
    const section = document.querySelector("#portfolio");
    if (!section || !window.PORTFOLIO) return;

    const track = section.querySelector(".pf-track");
    const crumb = section.querySelector(".pf-crumb");
    const backBtn = section.querySelector(".pf-back");

    // Brain-hue → filtro CSS. Igual que el placeholder de mente.js: sepia+saturate
    // aportan saturación para que el hue-rotate SÍ tiña una imagen/fondo neutro.
    const hueFilter = (hue) => `sepia(1) saturate(4) hue-rotate(${hue}deg)`;

    const state = { level: 0, activeCat: null, center: 0 };

    // Construye una card (categoría o work). `item` tiene {label|title, portada, hue}.
    const makeCard = (item, hue) => {
        const li = document.createElement("li");
        li.className = "pf-card";
        const name = item.label || item.title;
        if (item.portada) {
            const img = document.createElement("img");
            img.className = "pf-card-img";
            img.src = item.portada;
            img.alt = name;
            img.decoding = "async";
            li.appendChild(img);
        } else {
            // Fallback: fondo en brain-hue (sin imagen recortada).
            li.classList.add("pf-card--fallback");
            li.style.setProperty("--card-hue", String(hue));
        }
        const cap = document.createElement("span");
        cap.className = "pf-card-cap";
        cap.textContent = name;
        li.appendChild(cap);
        return li;
    };

    const render = () => {
        track.innerHTML = "";
        if (state.level === 0) {
            crumb.textContent = "";
            backBtn.hidden = true;
            window.PORTFOLIO.forEach((cat) => {
                const card = makeCard(cat, cat.hue);
                card.dataset.cat = cat.key;
                track.appendChild(card);
            });
        } else {
            const cat = window.PORTFOLIO.find((c) => c.key === state.activeCat);
            crumb.textContent = cat.label;
            backBtn.hidden = false;
            if (!cat.works.length) {
                const li = document.createElement("li");
                li.className = "pf-card pf-card--soon";
                li.style.setProperty("--card-hue", String(cat.hue));
                li.innerHTML = '<span class="pf-card-cap">próximamente</span>';
                track.appendChild(li);
            } else {
                cat.works.forEach((w) => track.appendChild(makeCard(w, cat.hue)));
            }
        }
    };

    const init = () => { render(); };

    window.Portfolio = { init, state, render, hueFilter };
    init();
})();
