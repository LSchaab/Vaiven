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
        const poster = work.portada || galeria[0] || "";
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
                img.src = item.src;
                img.alt = `${work.title} — imagen ${i + 1}`;
                img.loading = "lazy";
                img.decoding = "async";
                img.addEventListener("click", () => openLightbox(items, i));
                grid.appendChild(img);
            } else {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "pf-vtile";
                btn.setAttribute("aria-label", `${work.title} — video`);
                if (item.poster) btn.style.backgroundImage = `url("${item.poster}")`;
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

        mTitle.textContent = work.title;
        mKicker.textContent = work.catLabel;
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

    window.PortfolioModal = { open, close, openLightbox, closeLightbox };
})();
