// Portfolio — carrusel 3D (coverflow) de todos los trabajos + modal de detalle.
// Las cards se posicionan en 3D y se navega con el mouse (scrub por hover),
// arrastrando o con las flechas. Click en una card abre su modal.
// Ref: docs/superpowers/specs/2026-09-16-portfolio-galeria-plana-modal-design.md
(() => {
    "use strict";
    const section = document.querySelector("#portfolio");
    if (!section || !window.PORTFOLIO) return;

    const wall = section.querySelector(".pf-wall");
    const fallback = section.querySelector(".pf-fallback");

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

        // (sin título visible en la card — el título vive en el modal)

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

    // Fallback estático accesible: lista de todos los trabajos con su categoría.
    // Lo leen los lectores de pantalla siempre; visible bajo reduced-motion.
    const renderFallback = () => {
        fallback.innerHTML = "";
        const ul = document.createElement("ul");
        WORKS.forEach((w) => {
            const li = document.createElement("li");
            li.textContent = `${w.title} — ${w.catLabel}`;
            ul.appendChild(li);
        });
        if (!WORKS.length) {
            const li = document.createElement("li");
            li.textContent = "Próximamente.";
            ul.appendChild(li);
        }
        fallback.appendChild(ul);
    };

    renderWall();
    renderFallback();

    // ----- Carrusel 3D (coverflow curvo, scroll-driven) -----
    // Se navega con la RUEDA/scroll (no siguiendo el mouse): cada tramo mueve el
    // centro y las cards recorren una curva 3D — aparecen desde la derecha y se
    // van por la izquierda a medida que scrolleás. En los extremos, el scroll se
    // suelta a la página. Drag y flechas también funcionan. Click abre el modal.
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");

    // Feel del coverflow (afinable en vivo).
    const GAP = 260;        // px de separación lateral entre cards vecinas
    const ANGLE = 46;       // deg de rotación por paso (deformación)
    const DEPTH = 210;      // px de hundimiento en Z por paso
    const ARC = 30;         // px de caída vertical por paso² (curva, no una línea)
    const EASE = 0.12;      // suavizado del scrub
    const WHEEL_STEP = 0.5; // cuánto avanza el centro por tramo de rueda
    const clampN = (v, a, b) => Math.min(Math.max(v, a), b);

    const N = WORKS.length;
    const cardEls = () => Array.from(wall.querySelectorAll(".pf-card"));
    let center = 0;   // posición actual (fraccional)
    let target = 0;   // posición objetivo
    let intro = 1;    // 1→0: entrada "desde la derecha" en la primera vista

    const layout = () => {
        cardEls().forEach((card, i) => {
            // durante la entrada (intro→0) todo arranca corrido a la derecha
            const k = (i - center) + intro * (N + 2);
            const ak = Math.abs(k);
            const y = ak * ak * ARC;                 // curva: los extremos caen
            card.style.setProperty("--x", (k * GAP).toFixed(1) + "px");
            card.style.setProperty("--y", y.toFixed(1) + "px");
            card.style.setProperty("--rot", (-k * ANGLE).toFixed(1) + "deg");
            card.style.setProperty("--z", (-ak * DEPTH).toFixed(1) + "px");
            card.style.setProperty("--s", (1 - Math.min(ak, 3) * 0.08).toFixed(3));
            card.style.setProperty("--op", ak > 3.2 ? "0" : (1 - ak * 0.22).toFixed(2));
            card.style.zIndex = String(1000 - Math.round(ak * 10));
            card.classList.toggle("pf-card--center", ak < 0.5 && intro < 0.02);
        });
    };

    // Lerp hacia target + decaimiento de la entrada; se detiene al asentarse.
    let raf = 0;
    const settling = () => Math.abs(target - center) > 0.0008 || intro > 0.002;
    const tick = () => {
        center += (target - center) * EASE;
        if (Math.abs(target - center) < 0.0008) center = target;
        intro = intro > 0.002 ? intro + (0 - intro) * 0.06 : 0;
        layout();
        raf = settling() ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const animateTo = (t) => { target = clampN(t, 0, N - 1); kick(); };

    // Bajo reduced-motion la pared es grilla plana (CSS); no montamos el carrusel.
    if (!reduce.matches) {
        layout();  // estado inicial (cards fuera, a la derecha)

        // Entrada "desde la derecha": arranca cuando la sección entra en vista.
        const io = new IntersectionObserver((ents) => {
            ents.forEach((en) => { if (en.isIntersecting) { kick(); io.disconnect(); } });
        }, { threshold: 0.2 });
        io.observe(section);

        // Scroll-driven: la rueda recorre el carrusel; en los extremos se suelta
        // a la página (para poder salir de la sección scrolleando).
        wall.addEventListener("wheel", (e) => {
            const dir = Math.sign(e.deltaY);
            if (!dir) return;
            if ((target <= 0 && dir < 0) || (target >= N - 1 && dir > 0)) return;
            e.preventDefault();
            animateTo(target + dir * WHEEL_STEP);
        }, { passive: false });

        // Drag (mouse/touch) como alternativa.
        let dragging = false, dragStartX = 0, dragStartTarget = 0, dragMoved = false;
        wall.addEventListener("pointerdown", (e) => {
            dragging = true; dragMoved = false;
            dragStartX = e.clientX; dragStartTarget = target;
            if (wall.setPointerCapture) wall.setPointerCapture(e.pointerId);
        });
        wall.addEventListener("pointermove", (e) => {
            if (!dragging) return;
            const r = wall.getBoundingClientRect();
            const dx = (e.clientX - dragStartX) / r.width;
            if (Math.abs(e.clientX - dragStartX) > 6) dragMoved = true;
            animateTo(dragStartTarget - dx * (N - 1));
        });
        const endDrag = () => { dragging = false; };
        wall.addEventListener("pointerup", endDrag);
        wall.addEventListener("pointercancel", endDrag);

        // Flechas (el foco en una card burbujea hasta acá).
        wall.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") { animateTo(Math.round(target) - 1); e.preventDefault(); }
            else if (e.key === "ArrowRight") { animateTo(Math.round(target) + 1); e.preventDefault(); }
        });

        // Guard: si el click fue el final de un arrastre, no abrir el modal.
        wall.addEventListener("click", (e) => {
            if (dragMoved) { dragMoved = false; e.stopImmediatePropagation(); e.preventDefault(); }
        }, true);

        addEventListener("resize", layout);
    }

    // ----- Modal -----
    const modal = document.querySelector("#pf-modal");
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
        // Descripción (se oculta si está vacía — no inventar copy).
        const desc = (work.descripcion || "").trim();
        mDesc.textContent = desc;
        mDesc.hidden = !desc;
        renderMedia(work);
        closeLightbox();   // por si quedó abierto de un modal anterior

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

    window.Portfolio = { WORKS, renderWall, hueFilter, open, close, openLightbox, closeLightbox };
})();
