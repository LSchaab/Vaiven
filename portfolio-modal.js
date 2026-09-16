// portfolio-modal.js
// Modal de detalle de un trabajo: título + tag + herramientas (logos) +
// descripción + media (masonry de imágenes / video) + lightbox. Accesible:
// focus trap, Esc, restauración de foco, scroll de fondo bloqueado.
// Lo abre la escena (#work) con window.PortfolioModal.open(index).
// Ref: docs/superpowers/specs/2026-09-16-portfolio-galeria-plana-modal-design.md
(() => {
    "use strict";
    const modal = document.querySelector("#pf-modal");
    if (!modal || !window.WORKS) return;
    const WORKS = window.WORKS;

    const mTitle = modal.querySelector(".pf-modal-title");
    const mTag = modal.querySelector(".pf-modal-tag");
    const mTools = modal.querySelector(".pf-modal-tools");
    const mDesc = modal.querySelector(".pf-modal-desc");
    const mMedia = modal.querySelector(".pf-modal-media");
    const lb = modal.querySelector(".pf-lightbox");
    const lbImg = lb.querySelector(".pf-lb-img");
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

    // Media del modal: masonry de imágenes (galería a proporción real) o video.
    const renderMedia = (work) => {
        mMedia.innerHTML = "";
        const gallery = work.galeria || [];
        if (work.media === "video" && work.video) {
            const v = document.createElement("video");
            v.className = "pf-video";
            v.src = work.video;
            v.controls = true;
            v.playsInline = true;
            mMedia.appendChild(v);
        }
        if (gallery.length) {
            const grid = document.createElement("div");
            grid.className = "pf-gallery";
            gallery.forEach((src, i) => {
                const img = document.createElement("img");
                img.src = src;
                img.alt = `${work.title} — imagen ${i + 1}`;
                img.loading = "lazy";
                img.decoding = "async";
                img.addEventListener("click", () => openLightbox(gallery, i));
                grid.appendChild(img);
            });
            mMedia.appendChild(grid);
        }
        if (!gallery.length && !(work.media === "video" && work.video)) {
            const ph = document.createElement("p");
            ph.className = "pf-media-soon";
            ph.textContent = work.media === "video"
                ? "Video próximamente."
                : "Imágenes próximamente.";
            mMedia.appendChild(ph);
        }
    };

    const showLb = () => { lbImg.src = lbList[lbIndex]; lbImg.alt = `Imagen ${lbIndex + 1}`; };
    const openLightbox = (list, i) => {
        lbList = list; lbIndex = i;
        showLb();
        lb.hidden = false;
        lb.setAttribute("aria-hidden", "false");
        lb.querySelector(".pf-lb-close").focus();
    };
    const closeLightbox = () => {
        lb.hidden = true;
        lb.setAttribute("aria-hidden", "true");
    };
    const stepLb = (d) => {
        lbIndex = (lbIndex + d + lbList.length) % lbList.length;
        showLb();
    };

    const open = (index) => {
        const work = WORKS[index];
        if (!work) return;
        lastFocused = document.activeElement;

        mTitle.textContent = work.title;
        mTag.textContent = work.catLabel;
        mTag.style.setProperty("--card-hue", String(work.hue));
        renderTools(work);
        const desc = (work.descripcion || "").trim();
        mDesc.textContent = desc;
        mDesc.hidden = !desc;
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
