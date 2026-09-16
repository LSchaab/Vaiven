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
    const fallback = section.querySelector(".pf-fallback");

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
        // centrar el carrusel y posicionar en 3D
        state.center = Math.floor(track.children.length / 2);
        layout();
    };

    // Coverflow tunables (afinables en vivo).
    const GAP = 300;    // px de separación lateral entre cards vecinas
    const ANGLE = 38;   // deg de rotación por paso
    const DEPTH = 140;  // px de hundimiento en Z por paso
    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

    const cards = () => Array.from(track.children);

    const layout = () => {
        const list = cards();
        state.center = clamp(state.center, 0, Math.max(0, list.length - 1));
        list.forEach((card, i) => {
            const k = i - state.center;            // offset con signo al centro
            const ak = Math.abs(k);
            card.style.setProperty("--x", (k * GAP) + "px");
            card.style.setProperty("--rot", (-k * ANGLE) + "deg");
            card.style.setProperty("--z", (-ak * DEPTH) + "px");
            card.style.setProperty("--s", (1 - Math.min(ak, 3) * 0.06).toFixed(3));
            card.style.setProperty("--op", ak > 3 ? "0" : (1 - ak * 0.18).toFixed(2));
            card.style.zIndex = String(100 - ak);
            card.classList.toggle("pf-card--center", k === 0);
        });
    };

    const go = (delta) => { state.center += delta; layout(); };

    // Fallback estático accesible: lista completa de disciplinas + works. La leen
    // los lectores de pantalla siempre; se muestra visualmente bajo reduced-motion.
    const renderFallback = () => {
        fallback.innerHTML = "";
        window.PORTFOLIO.forEach((cat) => {
            const h = document.createElement("h3");
            h.textContent = cat.label;
            fallback.appendChild(h);
            const ul = document.createElement("ul");
            if (!cat.works.length) {
                const li = document.createElement("li");
                li.textContent = "Próximamente.";
                ul.appendChild(li);
            } else {
                cat.works.forEach((w) => {
                    const li = document.createElement("li");
                    li.textContent = w.title;
                    ul.appendChild(li);
                });
            }
            fallback.appendChild(ul);
        });
    };

    const zona = section;   // .zona-portfolio
    const setLight = (hue) => {
        if (hue == null) {
            zona.style.setProperty("--pf-lit", "0");
        } else {
            zona.style.setProperty("--pf-hue", String(hue));
            zona.style.setProperty("--pf-lit", "1");
        }
    };

    const openCategory = (key) => {
        const cat = window.PORTFOLIO.find((c) => c.key === key);
        if (!cat) return;
        state.level = 1;
        state.activeCat = key;
        render();          // repuebla con works + re-centra + layout
        setLight(cat.hue); // re-ilumina la escena en el hue de la disciplina
    };

    const back = () => {
        state.level = 0;
        state.activeCat = null;
        render();
        setLight(null);
    };

    const init = () => {
        render();
        renderFallback();
        section.querySelector(".pf-prev").addEventListener("click", () => go(-1));
        section.querySelector(".pf-next").addEventListener("click", () => go(1));

        // teclado: ← → mueven el centro cuando el foco está en la sección
        section.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") { go(-1); e.preventDefault(); }
            if (e.key === "ArrowRight") { go(1); e.preventDefault(); }
        });

        // click en una card: si es lateral, la trae al centro; si ya está
        // centrada y es una categoría (Nivel 0), abre esa categoría.
        track.addEventListener("click", (e) => {
            const card = e.target.closest(".pf-card");
            if (!card) return;
            const i = cards().indexOf(card);
            if (i !== state.center) { state.center = i; layout(); return; }
            if (state.level === 0 && card.dataset.cat) openCategory(card.dataset.cat);
        });

        backBtn.addEventListener("click", back);

        // drag lateral (pointer): cada ~90px de arrastre = un paso
        let dragX = null, moved = 0;
        track.addEventListener("pointerdown", (e) => { dragX = e.clientX; moved = 0; });
        window.addEventListener("pointermove", (e) => {
            if (dragX === null) return;
            const dx = e.clientX - dragX;
            if (Math.abs(dx) > 90) { go(dx < 0 ? 1 : -1); dragX = e.clientX; moved++; }
        });
        window.addEventListener("pointerup", () => { dragX = null; });
    };

    window.Portfolio = { init, state, render, layout, go, openCategory, back, hueFilter };
    init();
})();
