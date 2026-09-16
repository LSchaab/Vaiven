// work-carousel.js
// Carrusel 3D "WORK" (mecánica wodniack): las cards cruzan la pantalla de derecha
// a izquierda girando en 3D, controladas por scroll. Todo el movimiento lo
// resuelve el CSS a partir de custom properties; acá sólo mapeamos scroll→progress
// y escribimos las variables. Ref: spec 2026-09-16-work-carrusel-scroll-3d-design.
(() => {
    "use strict";
    const section = document.querySelector("#work");
    if (!section || !window.WORKS) return;

    const scene = section.querySelector(".work__scene");
    const fallback = section.querySelector(".pf-fallback");
    const WORKS = window.WORKS;
    const N = WORKS.length;

    // ---- Config (afinable en vivo) ----
    const CONFIG = {
        screensPerCard: 1.2,   // alto de la pista por card (pista ≈ N*este*100vh)
        transitWindow: 0.14,   // W: ventana en S del pase +1→-1 (solapamiento 1–2)
        maxRotateY: 20,        // deg de giro en los extremos
        depthZ: 5,             // rem de alejamiento en Z (progress²·-depthZ)
        sizeRange: [0.6, 0.95],
        yRange: [-1, 1],
        lerp: 0.1,             // suavizado de Lenis (Task 3)
    };
    window.WorkCarousel = { CONFIG, N };

    // maxRotateY/depthZ → CSS (los usa el transform de .card)
    scene.style.setProperty("--max-rot", String(CONFIG.maxRotateY));
    scene.style.setProperty("--depth", String(CONFIG.depthZ));

    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
    // random determinístico por índice (estable entre reloads)
    const seeded = (n) => {
        let t = Math.imul(n + 1, 2654435761) >>> 0;
        t = (t ^ (t >>> 15)) >>> 0;
        return (t % 100000) / 100000;
    };
    const fromRange = (r, u) => r[0] + u * (r[1] - r[0]);

    // ---- Build cards ----
    const cardData = WORKS.map((work, i) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "card";
        el.dataset.index = String(i);
        el.setAttribute("aria-label", `${work.title} — ${work.catLabel}`);
        el.style.setProperty("--y", fromRange(CONFIG.yRange, seeded(i * 2)).toFixed(3));
        el.style.setProperty("--size", fromRange(CONFIG.sizeRange, seeded(i * 2 + 1)).toFixed(3));

        const media = document.createElement("span");
        media.className = "card__media";
        if (work.portada) {
            const img = document.createElement("img");
            img.className = "card__img";
            img.src = work.portada;
            img.alt = work.title;
            img.loading = "lazy";
            img.decoding = "async";
            media.appendChild(img);
        } else {
            el.classList.add("card--fallback");
            el.style.setProperty("--card-hue", String(work.hue));
        }
        let video = null;
        if (work.video) {
            video = document.createElement("video");
            video.className = "card__video";
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = "none";
            if (work.portada) video.poster = work.portada;
            video.dataset.src = work.video;   // lazy: se asigna src al entrar en rango
            media.appendChild(video);
        }
        el.appendChild(media);

        const cap = document.createElement("span");
        cap.className = "card__caption";
        cap.innerHTML =
            `<span class="card__title">${work.title}</span>` +
            `<span class="card__count">#${String(i + 1).padStart(2, "0")}/${N}</span>`;
        el.appendChild(cap);

        el.addEventListener("click", () => {
            if (window.PortfolioModal) window.PortfolioModal.open(i);
        });

        scene.appendChild(el);
        return { el, video, inview: false, lastP: 2 };
    });

    // ---- Fallback estático accesible (lectores de pantalla siempre; visible bajo
    //      reduced-motion). ----
    if (fallback) {
        const ul = document.createElement("ul");
        WORKS.forEach((w) => {
            const li = document.createElement("li");
            li.textContent = `${w.title} — ${w.catLabel}`;
            ul.appendChild(li);
        });
        if (!N) { const li = document.createElement("li"); li.textContent = "Próximamente."; ul.appendChild(li); }
        fallback.appendChild(ul);
    }

    // ---- Scroll → progress ----
    // center_i = el S donde la card i queda centrada; progress ∈ [-1,1].
    // S < center → progress > 0 (card a la derecha, entrando); S = center → 0
    // (centrada); S > center → progress < 0 (salió por la izquierda).
    const W = CONFIG.transitWindow;
    const centerOf = (i) => (N > 1 ? W / 2 + i * (1 - W) / (N - 1) : 0.5);

    const render = (S) => {
        // parallax + dispersión de letras (los consumen el CSS de Task 4)
        section.style.setProperty("--scroll-progress", S.toFixed(4));
        scene.style.setProperty("--state", clamp(S / 0.08, 0, 1).toFixed(4));

        cardData.forEach((c, i) => {
            const p = clamp((centerOf(i) - S) / (W / 2), -1, 1);
            if (p !== c.lastP) {
                c.el.style.setProperty("--progress", p.toFixed(4));
                c.lastP = p;
            }
            const inview = Math.abs(p) < 1;
            if (inview !== c.inview) {
                c.inview = inview;
                c.el.classList.toggle("is-inview", inview);
                if (c.video) {
                    if (inview) {
                        if (!c.video.src && c.video.dataset.src) c.video.src = c.video.dataset.src;
                        c.video.play().catch(() => {});
                    } else {
                        c.video.pause();
                    }
                }
            }
        });
    };

    window.WorkCarousel.render = render;

    // Preview estático (REEMPLAZADO por el motor de scroll en Task 3): centra una
    // card del medio para poder verificar el build y el CSS 3D sin scroll.
    render(0.5);
})();
