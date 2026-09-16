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
    const WORKS = window.WORKS;
    const N = WORKS.length;

    // ---- Config (afinable en vivo) ----
    const CONFIG = {
        screensPerCard: 0.6,   // alto de la pista por card (pista ≈ N*este*100vh)
        transitWindow: 0.14,   // W: ventana en S del pase +1→-1 (solapamiento 1–2)
        maxRotateY: 20,        // deg de giro en los extremos
        depthZ: 5,             // rem de alejamiento en Z (progress²·-depthZ)
        sizeRange: [0.6, 0.95],
        exitStart: 0.82,       // S a partir del cual las cards ya pasaron y corre la salida
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

    // Monta el coverflow 3D (desktop, sin reduced-motion). Todo lo que había
    // suelto en el IIFE (cards, starfield, scroll) vive ahora acá adentro.
    const mountCoverflow = () => {
    // ---- Build cards ----
    const cardData = WORKS.map((work, i) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "card";
        el.dataset.index = String(i);
        el.setAttribute("aria-label", `${work.title} — ${work.catLabel}`);
        // Carril: pares arriba (−1), impares abajo (+1). Al alternar, las ~2 cards
        // que se solapan en el tránsito caen SIEMPRE en carriles distintos → no se
        // pisan verticalmente. El offset real (vmin) lo pone el CSS con --lane-gap.
        el.style.setProperty("--lane", i % 2 === 0 ? "-1" : "1");
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

    // ---- Partículas de fondo: starfield a la deriva (el mismo del cerebro) ----
    // Motes blancos que caen lento y flotan, reciclados en los bordes. Se pausan
    // cuando #work no está en vista. Bajo reduced-motion: sólo un frame estático.
    const canvas = section.querySelector(".work__grid");
    if (canvas && canvas.getContext) {
        const ctx = canvas.getContext("2d");
        const reduceStars = matchMedia("(prefers-reduced-motion: reduce)");
        let motes = [];
        let starRAF = 0;
        const dims = () => ({ w: canvas.offsetWidth || innerWidth, h: canvas.offsetHeight || innerHeight });
        const sizeStars = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const { w, h } = dims();
            canvas.width = Math.max(1, Math.round(w * dpr));
            canvas.height = Math.max(1, Math.round(h * dpr));
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        const seedStars = () => {
            const { w, h } = dims();
            const count = Math.round((w * h) / 14000);
            motes = Array.from({ length: count }, (_, i) => ({
                x: (i * 97.3) % w, y: (i * 61.7) % h,
                r: 0.5 + (i % 5) * 0.35,
                vx: ((i % 7) - 3) * 0.03, vy: 0.05 + (i % 3) * 0.04,
            }));
        };
        const paintStars = (move) => {
            const { w, h } = dims();
            ctx.clearRect(0, 0, w, h);
            for (const m of motes) {
                if (move) {
                    m.x += m.vx; m.y += m.vy;
                    if (m.y > h) m.y = 0;
                    if (m.x < 0) m.x = w; else if (m.x > w) m.x = 0;
                }
                ctx.globalAlpha = 0.25 + (m.r / 2) * 0.4;
                ctx.fillStyle = "#FFFFFF";   // --blanco
                ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1;
        };
        const loop = () => { paintStars(true); starRAF = requestAnimationFrame(loop); };
        const startStars = () => { if (!starRAF && !reduceStars.matches) starRAF = requestAnimationFrame(loop); };
        const stopStars = () => { cancelAnimationFrame(starRAF); starRAF = 0; };
        sizeStars(); seedStars(); paintStars(false);   // frame inicial estático
        new IntersectionObserver((e) => {
            e[0].isIntersecting ? startStars() : stopStars();
        }, { threshold: 0 }).observe(section);
        addEventListener("resize", () => { sizeStars(); seedStars(); paintStars(false); });
    }

    // ---- Scroll → progress ----
    // center_i = el S donde la card i queda centrada; progress ∈ [-1,1].
    // S < center → progress > 0 (card a la derecha, entrando); S = center → 0
    // (centrada); S > center → progress < 0 (salió por la izquierda).
    const W = CONFIG.transitWindow;
    // La card 0 queda centrada en S=0 (arriba de #work) y la última en S=1 → no
    // hay violeta vacío al entrar: ya ves una card apenas llegás a la sección.
    const centerOf = (i) => (N > 1 ? (i / (N - 1)) * CONFIG.exitStart : 0.5 * CONFIG.exitStart);

    const render = (S) => {
        // Progreso de salida (0 hasta exitStart, →1 al final). Lo consume el CSS
        // del overlay .work__exit y el reveal de #nosotros.
        const exitP = clamp((S - CONFIG.exitStart) / (1 - CONFIG.exitStart), 0, 1);
        section.style.setProperty("--work-exit", exitP.toFixed(4));
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

    // ---- Motor de scroll (ScrollTrigger sobre scroll NATIVO) ----
    // ScrollTrigger mapea el progreso de la pista de #work a S∈[0,1] y llama
    // render(S). NO usamos Lenis: era un smooth-scroll GLOBAL que lerpeaba toda
    // la página (incluido el recorrido del cerebro, que mente.js maneja con scroll
    // nativo) y la volvía lentísima. El scroll nativo mantiene el resto del sitio
    // como estaba. Bajo reduced-motion no se monta nada (Task 5 muestra el fallback).
    const initScroll = () => {
        const outer = section.querySelector(".work__outer");
        // Alto de la pista: cuánto scroll hay para recorrer todas las cards.
        outer.style.height = (N * CONFIG.screensPerCard * 100) + "vh";

        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => render(self.progress),
            onRefresh: (self) => render(self.progress),
        });
        ScrollTrigger.refresh();
        render(0);
    };

        initScroll();
    };   // fin mountCoverflow

    // Monta la galería vertical estática (tablet/mobile/reduced-motion). Grilla
    // con scroll normal + "Ver más" que revela de a lotes. Mismo modal.
    const mountGallery = () => {
        const gallery = section.querySelector(".work__gallery");
        const list = gallery.querySelector(".work__cards");
        const moreBtn = gallery.querySelector(".work__more");
        const BATCH = 6;   // lote inicial y por click (afinable)
        let shown = 0;

        const cellFor = (work, i) => {
            const li = document.createElement("li");
            li.className = "work__cell";
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "work__cell-btn";
            btn.setAttribute("aria-label", `${work.title} — ${work.catLabel}`);

            const media = document.createElement("span");
            media.className = "work__cell-media";
            if (work.portada) {
                const img = document.createElement("img");
                img.src = work.portada;
                img.alt = work.title;
                img.loading = "lazy";
                img.decoding = "async";
                media.appendChild(img);
            } else {
                btn.classList.add("work__cell--fallback");
                btn.style.setProperty("--card-hue", String(work.hue));
            }
            btn.appendChild(media);

            const cap = document.createElement("span");
            cap.className = "work__cell-cap";
            cap.innerHTML =
                `<span class="work__cell-title">${work.title}</span>` +
                `<span class="work__cell-tag">${work.catLabel}</span>`;
            btn.appendChild(cap);

            btn.addEventListener("click", () => {
                if (window.PortfolioModal) window.PortfolioModal.open(i);
            });
            li.appendChild(btn);
            return li;
        };

        const reveal = () => {
            const next = Math.min(shown + BATCH, N);
            for (let i = shown; i < next; i++) list.appendChild(cellFor(WORKS[i], i));
            shown = next;
            moreBtn.hidden = shown >= N;   // sin más → se oculta el botón
        };

        if (!N) {
            const li = document.createElement("li");
            li.className = "work__cell work__cell--empty";
            li.textContent = "Próximamente.";
            list.appendChild(li);
        } else {
            reveal();
            moreBtn.addEventListener("click", reveal);
        }

        gallery.hidden = false;
        section.classList.add("work--gallery");   // el CSS oculta el coverflow
    };

    // ---- Elegir modo: coverflow 3D (desktop, sin reduced-motion) o galería ----
    const coverflowMQ = matchMedia("(min-width: 1025px)");
    const reduceMQ = matchMedia("(prefers-reduced-motion: reduce)");
    const useCoverflow = () => coverflowMQ.matches && !reduceMQ.matches;

    if (useCoverflow()) mountCoverflow();
    else mountGallery();

    // Cruzar el breakpoint o togglear reduced-motion cambia de modo por completo;
    // recargar es la forma más robusta de re-montar sin restos del modo anterior.
    coverflowMQ.addEventListener("change", () => location.reload());
    reduceMQ.addEventListener("change", () => location.reload());
})();
