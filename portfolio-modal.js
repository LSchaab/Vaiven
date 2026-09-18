// portfolio-modal.js
// Modal de detalle de un trabajo: header (kicker categoría + título en el color de
// la categoría + herramientas/logos) + media (grilla de imágenes/video o player
// inline) + lightbox con soporte de video. La portada/mockup entra como primer tile.
// Accesible: focus trap, Esc, restauración de foco, scroll de fondo bloqueado.
// Lo abre la escena (#work) con window.PortfolioModal.open(index).
// Ref: docs/superpowers/specs/2026-09-18-modal-proyecto-galeria-adaptable-design.md
(() => {
    "use strict";
    const modal = document.querySelector("#pf-modal");
    if (!modal || !window.WORKS) return;
    const WORKS = window.WORKS;

    const mTitle = modal.querySelector(".pf-modal-title");
    const mKicker = modal.querySelector(".pf-modal-kicker");
    const mTools = modal.querySelector(".pf-modal-tools");
    const mMedia = modal.querySelector(".pf-modal-media");
    const lb = modal.querySelector(".pf-lightbox");
    const lbImg = lb.querySelector(".pf-lb-img");
    const lbVid = lb.querySelector(".pf-lb-vid");
    let lbList = [];
    let lbIndex = 0;
    let lastFocused = null;

    const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    // Imágenes que muestra el modal de un trabajo (mismo orden y mismas rutas que
    // renderMedia → lo precargado es exactamente lo que después se pide).
    const imageSrcsOf = (work) => {
        const galeria = (work && work.galeria) || [];
        const srcs = [];
        // La portada/mockup también entra a la galería, como primer tile (sin duplicar).
        if (galeria.length && work.portada && !galeria.includes(work.portada)) srcs.push(work.portada);
        galeria.forEach((src) => srcs.push(src));
        return srcs;
    };

    // ----- Precarga de galerías -----
    // Cola con límite de descargas simultáneas: el fondo va de a 2 y con prioridad
    // baja (no traba el resto del sitio); lo urgente (card al frente / hover / modal
    // abierto) se adelanta en la cola y puede usar hasta 6. Los Image quedan
    // referenciados en PRE → el modal los encuentra en caché y ya sabe su tamaño.
    const PRE = new Map();       // src → Image (pedida o ya cargada)
    const queue = [];            // [{ src, urgent }]
    const queued = new Set();
    let active = 0;
    const limit = () => (queue.length && queue[0].urgent ? 6 : 2);
    const pump = () => {
        while (queue.length && active < limit()) {
            const { src, urgent } = queue.shift();
            queued.delete(src);
            if (PRE.has(src)) continue;
            const im = new Image();
            im.decoding = "async";
            im.fetchPriority = urgent ? "high" : "low";
            const done = () => { active--; pump(); };
            im.addEventListener("load", done, { once: true });
            im.addEventListener("error", done, { once: true });
            PRE.set(src, im);
            active++;
            im.src = src;
        }
    };
    const enqueue = (srcs, urgent) => {
        const todo = srcs.filter((s) => !PRE.has(s));
        if (!todo.length) return;
        if (urgent) {
            // sacar de la cola las que ya estaban (en baja) y ponerlas adelante
            const set = new Set(todo);
            for (let i = queue.length - 1; i >= 0; i--) {
                if (set.has(queue[i].src)) queue.splice(i, 1);
            }
            queue.unshift(...todo.map((src) => ({ src, urgent: true })));
            todo.forEach((s) => queued.add(s));
        } else {
            todo.forEach((src) => {
                if (queued.has(src)) return;
                queued.add(src);
                queue.push({ src, urgent: false });
            });
        }
        pump();
    };
    const preloadWork = (index, urgent = false) => {
        const work = WORKS[index];
        if (work) enqueue(imageSrcsOf(work), urgent);
    };
    // Todas las galerías, en el orden de las cards. Respeta "ahorro de datos".
    const preloadAll = () => {
        const c = navigator.connection;
        if (c && c.saveData) return;
        WORKS.forEach((w) => enqueue(imageSrcsOf(w), false));
    };

    // Herramientas → chips con logo (resources/logos/<key>.svg). Oculta si no hay.
    const renderTools = (work) => {
        mTools.innerHTML = "";
        const tools = work.tools || [];
        if (!tools.length) { mTools.hidden = true; return; }
        mTools.hidden = false;
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

    // Media del modal: lista unificada (imágenes + videos). Con galería → grilla de
    // tiles (video = botón con poster + ▶). Solo-video sin galería → player inline.
    const renderMedia = (work) => {
        mMedia.innerHTML = "";
        const galeria = work.galeria || [];
        const images = [];
        // La portada/mockup también entra a la galería, como primer tile (sin duplicar).
        if (galeria.length && work.portada && !galeria.includes(work.portada)) {
            images.push({ type: "image", src: work.portada });
        }
        galeria.forEach((src) => images.push({ type: "image", src }));
        // Miniatura del video: SOLO la portada. Si no hay (ej. 3D), el tile cae al
        // primer frame del propio video (así nunca muestra algo que no está en él).
        const poster = work.portada || "";
        const videos = [];
        if (work.video)   videos.push({ type: "video", src: work.video,   poster });
        if (work.proceso) videos.push({ type: "video", src: work.proceso, poster });
        const items = [...images, ...videos];

        // Solo-video (sin galería, un único video): reproductor grande inline.
        if (!images.length && videos.length === 1) {
            const v = document.createElement("video");
            v.className = "pf-video";
            v.src = videos[0].src;
            v.controls = true;
            v.playsInline = true;
            mMedia.appendChild(v);
            return;
        }
        // Sin ninguna media: placeholder.
        if (!items.length) {
            const ph = document.createElement("p");
            ph.className = "pf-media-soon";
            ph.textContent = work.media === "video"
                ? "Video próximamente."
                : "Imágenes próximamente.";
            mMedia.appendChild(ph);
            return;
        }
        // Grilla de tiles.
        const grid = document.createElement("div");
        grid.className = "pf-gallery";
        items.forEach((item, i) => {
            if (item.type === "image") {
                const img = document.createElement("img");
                // Si ya se precargó, sabemos su tamaño → reserva el lugar exacto
                // (la grilla no salta al aparecer).
                const pre = PRE.get(item.src);
                if (pre && pre.naturalWidth) {
                    img.width = pre.naturalWidth;
                    img.height = pre.naturalHeight;
                }
                img.alt = `${work.title} — imagen ${i + 1}`;
                // Todas eager: con lazy, dentro del modal las de abajo tardaban en
                // pedirse y el proyecto parecía vacío.
                img.loading = "eager";
                img.decoding = "async";
                img.src = item.src;
                if (!img.complete) {
                    // Todavía bajando: bloque tenue del tamaño estimado + fade al llegar.
                    img.classList.add("is-loading");
                    const settle = () => {
                        img.classList.remove("is-loading");
                        img.classList.add("is-loaded");
                    };
                    img.addEventListener("load", settle, { once: true });
                    img.addEventListener("error", settle, { once: true });
                }
                img.addEventListener("click", () => openLightbox(items, i));
                grid.appendChild(img);
            } else {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "pf-vtile";
                btn.setAttribute("aria-label", `${work.title} — video`);
                if (item.poster) {
                    btn.style.backgroundImage = `url("${item.poster}")`;
                } else {
                    // Sin portada: mostramos el primer frame del video como miniatura.
                    const vposter = document.createElement("video");
                    vposter.className = "pf-vtile-vid";
                    vposter.src = item.src;
                    vposter.preload = "metadata";
                    vposter.muted = true;
                    vposter.playsInline = true;
                    vposter.tabIndex = -1;
                    vposter.addEventListener("loadedmetadata", () => {
                        try { vposter.currentTime = 0.1; } catch (e) {}
                    });
                    btn.appendChild(vposter);
                }
                const play = document.createElement("span");
                play.className = "pf-vtile-play";
                play.setAttribute("aria-hidden", "true");
                play.textContent = "▶";
                btn.appendChild(play);
                btn.addEventListener("click", () => openLightbox(items, i));
                grid.appendChild(btn);
            }
        });
        mMedia.appendChild(grid);
    };

    const showLb = () => {
        const item = lbList[lbIndex];
        const isVideo = item.type === "video";
        lbImg.hidden = isVideo;
        lbVid.hidden = !isVideo;
        if (isVideo) {
            lbVid.src = item.src;
            lbVid.currentTime = 0;
            lbVid.play().catch(() => {});   // arranca; si el browser lo bloquea, queda con controles
        } else {
            lbVid.pause();
            lbImg.src = item.src;
            lbImg.alt = `Imagen ${lbIndex + 1}`;
        }
    };
    const openLightbox = (list, i) => {
        lbList = list; lbIndex = i;
        showLb();
        lb.hidden = false;
        lb.setAttribute("aria-hidden", "false");
        lb.querySelector(".pf-lb-close").focus();
    };
    const closeLightbox = () => {
        lbVid.pause();
        lb.hidden = true;
        lb.setAttribute("aria-hidden", "true");
    };
    const stepLb = (d) => {
        lbVid.pause();
        lbIndex = (lbIndex + d + lbList.length) % lbList.length;
        showLb();
    };

    const open = (index) => {
        const work = WORKS[index];
        if (!work) return;
        lastFocused = document.activeElement;

        if (work.url) {
            // Render title as an external link with a ↗ icon.
            // Escape the title to prevent injection.
            const safeTitle = work.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            mTitle.innerHTML =
                `<a class="pf-modal-title-link" href="${work.url}" target="_blank" rel="noopener noreferrer"` +
                ` style="color:inherit;text-decoration:none;"` +
                `>${safeTitle}` +
                `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"` +
                ` viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"` +
                ` stroke-linecap="round" stroke-linejoin="round"` +
                ` style="display:inline-block;width:0.7em;height:0.7em;margin-left:0.3em;vertical-align:middle;opacity:0.8;">` +
                `<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>` +
                `</a>`;
        } else {
            mTitle.textContent = work.title;
        }
        mKicker.textContent = work.catLabel;
        preloadWork(index, true);   // lo que falte de este proyecto pasa adelante en la cola
        // hue de la categoría en la raíz → lo leen el título y el fondo del diálogo
        modal.style.setProperty("--card-hue", String(work.hue));
        renderTools(work);
        renderMedia(work);
        closeLightbox();

        modal.hidden = false;
        document.body.classList.add("pf-modal-open");
        modal.querySelector(".pf-modal-close").focus();
    };

    const close = () => {
        modal.hidden = true;
        document.body.classList.remove("pf-modal-open");
        if (lastFocused && lastFocused.focus) lastFocused.focus();
    };

    modal.addEventListener("click", (e) => {
        if (e.target.closest("[data-close]")) close();
    });

    modal.addEventListener("keydown", (e) => {
        if (!lb.hidden) {
            if (e.key === "Escape") { closeLightbox(); e.preventDefault(); return; }
            if (e.key === "ArrowLeft") { stepLb(-1); e.preventDefault(); return; }
            if (e.key === "ArrowRight") { stepLb(1); e.preventDefault(); return; }
        }
        if (e.key === "Escape") { close(); return; }
        if (e.key !== "Tab") return;
        const items = Array.from(modal.querySelectorAll(FOCUSABLE))
            .filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    });

    lb.querySelector(".pf-lb-prev").addEventListener("click", () => stepLb(-1));
    lb.querySelector(".pf-lb-next").addEventListener("click", () => stepLb(1));
    lb.addEventListener("click", (e) => {
        if (e.target.closest("[data-lb-close]") || e.target === lb) closeLightbox();
    });

    window.PortfolioModal = { open, close, openLightbox, closeLightbox, preloadWork, preloadAll };
})();
