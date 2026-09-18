// trabajo.js — standalone per-work page.
// Reads ?id=<slug> from the URL, finds the work in window.WORKS (built by
// portfolio-data.js), and renders: title, kicker, tools, media gallery, lightbox.
// Mirrors portfolio-modal.js rendering logic as closely as practical.
// Comments in English; UI copy in Argentine Spanish.
(() => {
    "use strict";

    // ---- Parse slug from URL ----
    const params = new URLSearchParams(location.search);
    const slug = params.get("id") || "";

    // ---- Helper: HTML-escape a string to prevent injection ----
    const esc = (str) =>
        String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");

    // ---- Back button behaviour ----
    // history.back() only when we actually came from our own site (preserves the
    // portfolio scroll position). Otherwise (direct open, empty/foreign referrer,
    // some mobile browsers) fall back to a guaranteed navigation to the grid.
    const backBtn = document.getElementById("tj-back");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            const cameFromSite =
                document.referrer && document.referrer.indexOf(location.origin) === 0;
            if (cameFromSite && history.length > 1) {
                history.back();
            } else {
                location.href = "index.html#work";
            }
        });
    }

    // ---- Wait for WORKS to be available (script order: portfolio-data.js first) ----
    const init = () => {
        const WORKS = window.WORKS;
        const container = document.getElementById("tj-container");
        if (!container) return;

        // ---- Not found / missing slug ----
        if (!WORKS || !slug) {
            renderNotFound(container);
            return;
        }

        const work = WORKS.find((w) => w.slug === slug);
        if (!work) {
            renderNotFound(container);
            return;
        }

        // ---- Apply hue tint to root ----
        document.documentElement.style.setProperty("--card-hue", String(work.hue));

        // ---- Page title ----
        document.title = `${work.title} — VAI VEN`;

        // ---- Render sections ----
        renderHero(work);
        renderTools(work);
        renderMedia(work);

        // ---- Build lightbox (hidden initially) ----
        buildLightbox();
    };

    // ---- Render "not found" message ----
    const renderNotFound = (container) => {
        container.innerHTML =
            `<div class="tj-not-found">` +
            `<p>No encontramos ese trabajo. 😕</p>` +
            `<a href="index.html#work">← Volver al portfolio</a>` +
            `</div>`;
    };

    // ---- Render hero: kicker + title (with ↗ link if work.url) ----
    const renderHero = (work) => {
        const kicker = document.getElementById("tj-kicker");
        const titleEl = document.getElementById("tj-title");
        if (kicker) kicker.textContent = work.catLabel || "";
        if (titleEl) {
            if (work.url) {
                // Render title as external link with ↗ icon (mirrors portfolio-modal.js TASK C)
                titleEl.innerHTML =
                    `<a class="tj-title-link" href="${esc(work.url)}" target="_blank" rel="noopener noreferrer">` +
                    esc(work.title) +
                    `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"` +
                    ` viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"` +
                    ` stroke-linecap="round" stroke-linejoin="round"` +
                    ` style="display:inline-block;width:0.7em;height:0.7em;margin-left:0.3em;vertical-align:middle;opacity:0.8;">` +
                    `<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>` +
                    `</a>`;
            } else {
                titleEl.textContent = work.title;
            }
        }
    };

    // ---- Render tools as logo chips ----
    const renderTools = (work) => {
        const toolsEl = document.getElementById("tj-tools");
        if (!toolsEl) return;
        const tools = work.tools || [];
        if (!tools.length) { toolsEl.hidden = true; return; }
        toolsEl.hidden = false;
        const ul = document.createElement("ul");
        ul.className = "tj-tools";
        tools.forEach((key) => {
            const li = document.createElement("li");
            li.className = "tj-tool";
            const img = document.createElement("img");
            img.src = `resources/logos/${key}.svg`;
            img.alt = key;
            img.title = key;
            img.decoding = "async";
            li.appendChild(img);
            ul.appendChild(li);
        });
        // Replace the placeholder content
        toolsEl.innerHTML = "";
        toolsEl.appendChild(ul);
    };

    // ---- Lightbox state ----
    let lbList = [];
    let lbIndex = 0;
    let lbEl = null;
    let lbImg = null;
    let lbVid = null;

    // ---- Build the lightbox DOM (appended to body) ----
    const buildLightbox = () => {
        lbEl = document.createElement("div");
        lbEl.className = "tj-lightbox";
        lbEl.hidden = true;
        lbEl.setAttribute("aria-modal", "true");
        lbEl.setAttribute("role", "dialog");
        lbEl.setAttribute("aria-label", "Imagen ampliada");

        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "tj-lb-close";
        closeBtn.setAttribute("aria-label", "Cerrar imagen");
        closeBtn.setAttribute("data-lb-close", "");
        closeBtn.textContent = "✕";

        const prevBtn = document.createElement("button");
        prevBtn.type = "button";
        prevBtn.className = "tj-lb-nav tj-lb-prev";
        prevBtn.setAttribute("aria-label", "Anterior");
        prevBtn.textContent = "◂";

        lbImg = document.createElement("img");
        lbImg.className = "tj-lb-img";
        lbImg.src = "";
        lbImg.alt = "";

        lbVid = document.createElement("video");
        lbVid.className = "tj-lb-vid";
        lbVid.controls = true;
        lbVid.playsInline = true;
        lbVid.hidden = true;

        const nextBtn = document.createElement("button");
        nextBtn.type = "button";
        nextBtn.className = "tj-lb-nav tj-lb-next";
        nextBtn.setAttribute("aria-label", "Siguiente");
        nextBtn.textContent = "▸";

        lbEl.append(closeBtn, prevBtn, lbImg, lbVid, nextBtn);
        document.body.appendChild(lbEl);

        // ---- Lightbox event listeners ----
        closeBtn.addEventListener("click", closeLightbox);
        prevBtn.addEventListener("click", () => stepLb(-1));
        nextBtn.addEventListener("click", () => stepLb(1));
        // Click on backdrop (the lightbox itself, not its children) closes it
        lbEl.addEventListener("click", (e) => {
            if (e.target === lbEl || e.target.dataset.lbClose !== undefined) closeLightbox();
        });

        document.addEventListener("keydown", onKeydown);
    };

    const onKeydown = (e) => {
        if (!lbEl || lbEl.hidden) return;
        if (e.key === "Escape") { closeLightbox(); e.preventDefault(); return; }
        if (e.key === "ArrowLeft") { stepLb(-1); e.preventDefault(); return; }
        if (e.key === "ArrowRight") { stepLb(1); e.preventDefault(); return; }
    };

    const showLb = () => {
        const item = lbList[lbIndex];
        const isVideo = item.type === "video";
        lbImg.hidden = isVideo;
        lbVid.hidden = !isVideo;
        if (isVideo) {
            lbVid.src = item.src;
            lbVid.currentTime = 0;
            lbVid.play().catch(() => {});
        } else {
            lbVid.pause();
            lbImg.src = item.src;
            lbImg.alt = `Imagen ${lbIndex + 1}`;
        }
    };

    const openLightbox = (list, i) => {
        lbList = list;
        lbIndex = i;
        showLb();
        lbEl.hidden = false;
        lbEl.querySelector(".tj-lb-close").focus();
    };

    const closeLightbox = () => {
        if (lbVid) lbVid.pause();
        if (lbEl) lbEl.hidden = true;
    };

    const stepLb = (d) => {
        if (lbVid) lbVid.pause();
        lbIndex = (lbIndex + d + lbList.length) % lbList.length;
        showLb();
    };

    // ---- Render media (mirrors portfolio-modal.js renderMedia) ----
    const renderMedia = (work) => {
        const mediaEl = document.getElementById("tj-media");
        if (!mediaEl) return;
        mediaEl.innerHTML = "";

        const galeria = work.galeria || [];
        const images = [];

        // Portada as first gallery tile (if not already in galeria)
        if (galeria.length && work.portada && !galeria.includes(work.portada)) {
            images.push({ type: "image", src: work.portada });
        }
        galeria.forEach((src) => images.push({ type: "image", src }));

        const poster = work.portada || "";
        const videos = [];
        if (work.video)   videos.push({ type: "video", src: work.video,   poster });
        if (work.proceso) videos.push({ type: "video", src: work.proceso, poster });

        const items = [...images, ...videos];

        // Solo-video (no gallery images, single video): large inline player.
        if (!images.length && videos.length === 1) {
            // If portada is null (pure video work with no thumb), check for placeholder
            if (!work.portada && !work.video && work.media === "video") {
                const ph = document.createElement("p");
                ph.className = "tj-media-soon";
                ph.textContent = "VIDEO — próximamente";
                mediaEl.appendChild(ph);
                return;
            }
            const v = document.createElement("video");
            v.className = "tj-video";
            v.src = videos[0].src;
            v.controls = true;
            v.playsInline = true;
            mediaEl.appendChild(v);
            return;
        }

        // No media at all: placeholder
        if (!items.length) {
            const ph = document.createElement("p");
            ph.className = "tj-media-soon";
            ph.textContent = work.media === "video"
                ? "VIDEO — próximamente"
                : "Imágenes próximamente.";
            mediaEl.appendChild(ph);
            return;
        }

        // Gallery grid
        const grid = document.createElement("div");
        grid.className = "tj-gallery";
        items.forEach((item, i) => {
            if (item.type === "image") {
                const img = document.createElement("img");
                img.src = item.src;
                img.alt = `${work.title} — imagen ${i + 1}`;
                img.loading = i < 4 ? "eager" : "lazy";
                img.decoding = "async";
                img.addEventListener("click", () => openLightbox(items, i));
                grid.appendChild(img);
            } else {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "tj-vtile";
                btn.setAttribute("aria-label", `${work.title} — video`);
                if (item.poster) {
                    btn.style.backgroundImage = `url("${item.poster}")`;
                } else {
                    // No portada: show first frame of video as thumbnail
                    const vposter = document.createElement("video");
                    vposter.className = "tj-vtile-vid";
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
                play.className = "tj-vtile-play";
                play.setAttribute("aria-hidden", "true");
                play.textContent = "▶";
                btn.appendChild(play);
                btn.addEventListener("click", () => openLightbox(items, i));
                grid.appendChild(btn);
            }
        });
        mediaEl.appendChild(grid);
    };

    // ---- Bootstrap ----
    // portfolio-data.js loads synchronously before this script (defer), so
    // window.WORKS is already populated when DOMContentLoaded fires.
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
