# Portfolio `#work` — carrusel 3D scroll-driven · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el coverflow del portfolio por la mecánica "WORK" de wodniack.dev — cards (cada una = un trabajo) que cruzan la pantalla de derecha a izquierda girando en 3D, controladas por scroll.

**Architecture:** Sitio estático vanilla. GSAP + ScrollTrigger + Lenis por CDN mapean el scroll de la sección a un escalar `S∈[0,1]`; JS reparte `S` entre las cards y escribe sólo custom properties (`--progress`/`--y`/`--size`); **todo el movimiento lo resuelve el CSS**. El click abre el modal de detalle existente (extraído a su propio archivo). La transición cerebro→portal existente hace de entrada de `#work` (sin máscara SVG).

**Tech Stack:** HTML5, CSS3 (custom properties, 3D transforms, `content-visibility`), JavaScript vanilla (IIFE, `"use strict"`), GSAP 3 + ScrollTrigger + Lenis (CDN). Sin build. Sin test runner.

## Global Constraints

- **Vanilla + CDN.** Sin bundler ni build step. Módulos IIFE con `"use strict"`. GSAP/ScrollTrigger/Lenis sólo por `<script>` CDN (desviación documentada de "default vanilla", pedida por Luly).
- **Colores sólo por tokens** (`styles.css :root`). Nunca hex hardcodeado. Sección `#work` en `--violeta-claro`; fallback de card teñido en brain-hue.
- **Movimiento en CSS.** JS lee `S` una vez por frame y escribe **sólo** variables CSS (`--progress`, `--y`, `--size`, `--state`, `--scroll-progress`). Sin layout thrashing. Un solo loop (ticker de GSAP / raf de Lenis). Escribir `--progress` **sólo si cambió**.
- **Brain-hue por disciplina:** `hue` de cada categoría en `portfolio-data.js` (340/200/10/140/210).
- **Idioma:** comentarios de código en inglés; copy en español (argentino).
- **Naming:** kebab-case para archivos; clases BEM-ish (`.work__inner`, `.card__caption`).
- **Accesibilidad WCAG AA:** cards = `<button>` enfocables con `aria-label`; modal con focus trap + Esc + restauración de foco (ya existe); `prefers-reduced-motion` degrada a fallback estático; videos con `poster`.
- **No inventar contenido:** autores omitidos; `descripcion`/`video` vacíos se ocultan. Títulos y `tools` provisionales son datos reales pendientes, no placeholders del plan.
- **N = 14 works reales** (5 gráfico + 3 3D + 5 motion + 1 campañas; web sin works). Videos mp4 aún no existen → las cards muestran poster/fallback.
- **No test runner.** Cada tarea cierra con **verificación visual en Chrome**. Servir con `pnpm dlx serve -l 8080 .` y abrir:
  `& "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:8080"`.

Referencia viva del diseño: `docs/superpowers/specs/2026-09-16-work-carrusel-scroll-3d-design.md`.

---

## File Structure

- **Modify** `portfolio-data.js` — agregar `window.WORKS` (lista aplanada; index = posición) que consumen la escena y el modal.
- **Modify** `index.html` — agregar los `<script>` CDN (GSAP/ScrollTrigger/Lenis, `defer`); cambiar `portfolio.js` por `portfolio-modal.js` + `work-carousel.js`; reemplazar el markup de `#portfolio` por `#work`.
- **Create** `portfolio-modal.js` — modal de detalle (extraído de `portfolio.js`), consume `window.WORKS`, expone `window.PortfolioModal = { open, close }`.
- **Create** `work-carousel.js` — escena: build de cards/letras/canvas, `CONFIG`, `render(S)` (progress + video/inview + state + parallax), motor de scroll (Lenis+ScrollTrigger), reduced-motion.
- **Delete** `portfolio.js` — su lógica se reparte entre los dos nuevos.
- **Modify** `styles.css` — reemplazar el bloque del coverflow por el CSS de `#work` (escena, card 3D, letras, caption, canvas). Mantener el CSS del modal y del portal.

---

### Task 1: Datos aplanados + librerías por CDN

Fundación: exponer `window.WORKS` (lista única que consumen escena y modal) y cargar GSAP/ScrollTrigger/Lenis. El coverflow actual sigue funcionando (no se toca todavía).

**Files:**
- Modify: `portfolio-data.js`
- Modify: `index.html` (agregar scripts CDN)

**Interfaces:**
- Produces: `window.WORKS: Array<Work>` con `Work = {title, portada, media, catKey, catLabel, hue, tools?, descripcion?, galeria?, video?}`. Index = posición en el array.
- Produces: globals `gsap`, `ScrollTrigger`, `Lenis` disponibles antes de los scripts del sitio.

- [ ] **Step 1: Agregar `window.WORKS` en `portfolio-data.js`**

Justo antes del `})();` final (después de asignar `window.PORTFOLIO = [...]`), agregar:

```javascript
    // Flattened list consumed by the carousel (#work) and the detail modal.
    // Index into this array is the card index. Category fields embedded per work.
    window.WORKS = window.PORTFOLIO.flatMap((cat) =>
        cat.works.map((w) => ({
            ...w, catKey: cat.key, catLabel: cat.label, hue: cat.hue,
        }))
    );
```

- [ ] **Step 2: Cargar GSAP/ScrollTrigger/Lenis por CDN en `index.html`**

Reemplazar exactamente estas dos líneas:

```html
    <script src="portfolio-data.js" defer></script>
    <script src="portfolio.js" defer></script>
```

por (los CDN van con `defer` para preservar el orden de ejecución antes de `work-carousel.js`; `portfolio.js` se mantiene por ahora, se reemplaza en Task 2):

```html
    <script src="portfolio-data.js" defer></script>
    <!-- Scroll suave (Lenis) + mapeo de scroll (GSAP ScrollTrigger) para #work.
         Por CDN: el sitio no tiene build. Ref: spec 2026-09-16-work-carrusel. -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js" defer></script>
    <script src="portfolio.js" defer></script>
```

- [ ] **Step 3: Verificar en el navegador**

Servir y abrir Chrome. En la consola:
- `window.WORKS.length` → **14**.
- `typeof gsap`, `typeof ScrollTrigger`, `typeof Lenis` → todos `"function"` (o `"object"` para `gsap`).
- El coverflow del portfolio sigue funcionando igual (no se rompió nada). Sin errores en consola.

- [ ] **Step 4: Commit**

```bash
git add portfolio-data.js index.html
git commit -m "feat(work): datos aplanados (window.WORKS) + GSAP/ScrollTrigger/Lenis por CDN"
```

---

### Task 2: Escena `#work` — cards en 3D (preview estático) + modal extraído

Reemplaza el coverflow por la escena `#work`: build de cards desde `window.WORKS`, CSS 3D de la card, y un `render(S)` completo (progress + inview/video + state + parallax) llamado estáticamente en `S=0.5` para ver cards. Extrae el modal a `portfolio-modal.js`. Borra `portfolio.js`. Sin scroll todavía (Task 3).

**Files:**
- Create: `portfolio-modal.js`
- Create: `work-carousel.js`
- Delete: `portfolio.js`
- Modify: `index.html` (markup de `#work` + swap de scripts)
- Modify: `styles.css` (reemplazar bloque coverflow por bloque `#work`)

**Interfaces:**
- Consumes: `window.WORKS` (Task 1), `#pf-modal` (markup existente).
- Produces: `window.PortfolioModal = { open(index), close() }`.
- Produces: `window.WorkCarousel = { CONFIG, render(S), N }`. `render(S: number 0..1)` posiciona todas las cards y setea `--state`/`--scroll-progress`. `CONFIG` = `{screensPerCard, transitWindow, maxRotateY, depthZ, sizeRange, yRange, lerp}`.

- [ ] **Step 1: Crear `portfolio-modal.js` (modal extraído de `portfolio.js`)**

Crear el archivo con TODO el contenido:

```javascript
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
```

- [ ] **Step 2: Crear `work-carousel.js` (build + render estático)**

Crear el archivo con TODO el contenido:

```javascript
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
```

- [ ] **Step 3: `index.html` — markup de `#work` + swap de scripts**

3a. Reemplazar TODA la sección `<section id="portfolio" …> … </section>` (la del coverflow) por:

```html
        <!-- Portfolio: carrusel 3D "WORK" (mecánica wodniack). Las cards cruzan
             en 3D controladas por scroll. Render: work-carousel.js; detalle:
             portfolio-modal.js. Ref: spec 2026-09-16-work-carrusel-scroll-3d. -->
        <section id="work" class="zona-work" aria-label="Portfolio">
            <div class="work__outer">
                <div class="work__inner">
                    <h2 class="work__title erratic" data-text="portfolio">portfolio</h2>
                    <canvas class="work__grid" aria-hidden="true"></canvas>
                    <div class="work__scene">
                        <!-- letras del título y cards: las inyecta work-carousel.js -->
                    </div>
                </div>
            </div>
            <!-- Fallback estático accesible (lectores de pantalla siempre; visible
                 bajo reduced-motion). Lo puebla work-carousel.js. -->
            <div class="pf-fallback"></div>
        </section>
```

3b. Reemplazar la línea `<script src="portfolio.js" defer></script>` por:

```html
    <script src="portfolio-modal.js" defer></script>
    <script src="work-carousel.js" defer></script>
```

- [ ] **Step 4: Borrar `portfolio.js`**

```bash
git rm portfolio.js
```

- [ ] **Step 5: `styles.css` — reemplazar el bloque del coverflow por el de `#work`**

Localizar el bloque `PORTFOLIO v2 — galería plana …` (empieza en el comentario `/* ===… PORTFOLIO v2 …` y va hasta el final de `.pf-fallback { display: none; … }`, justo antes de `/* ---- Modal de proyecto ---- */`). Reemplazar **sólo esa parte** (la de la pared/coverflow: `.zona-portfolio`, `.pf-head`, `.pf-title`, `.pf-sub`, `.pf-wall`, `.pf-card*`, `.pf-cap`, `.pf-tag`, hover, `.pf-fallback { display:none }`) por el bloque de abajo. **Mantener intacto** todo lo del modal (`.pf-modal*`, masonry, lightbox) y el `@media (prefers-reduced-motion)` (se rehace en Task 5).

```css
/* ==========================================================================
   PORTFOLIO #work — carrusel 3D scroll-driven (mecánica wodniack)
   Movimiento 100% CSS desde custom properties (work-carousel.js las setea).
   Ref: docs/superpowers/specs/2026-09-16-work-carrusel-scroll-3d-design.md
   ========================================================================== */
.zona-work {
    position: relative;
    background: var(--violeta-claro);
    color: var(--blanco);
    --scroll-progress: 0;
}
.work__outer {
    position: relative;
    /* alto de la pista lo setea JS en Task 3 (N * screensPerCard * 100vh) */
    min-height: 100lvh;
}
.work__inner {
    position: sticky;
    top: 0;
    height: 100lvh;
    overflow: hidden;
    display: grid;
    place-items: center;
}
.work__title {
    position: absolute;
    top: clamp(1.5rem, 5vh, 3rem);
    left: 50%;
    transform: translateX(-50%);
    margin: 0;
    z-index: 3;
    font-size: clamp(1.6rem, 5vw, 3rem);
    font-weight: 800;
    text-transform: lowercase;
    pointer-events: none;
}
.work__grid {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    z-index: 1;
}
.work__scene {
    position: absolute; inset: 0;
    z-index: 2;
    perspective: 40rem;
    transform-style: preserve-3d;
}

/* Card: absoluta y centrada; todo el movimiento por --progress/--y/--size. */
.card {
    position: absolute; top: 50%; left: 50%;
    width: min(50vw, 640px);
    aspect-ratio: 16 / 9;
    margin: 0; padding: 0; border: 0;
    border-radius: 10px;
    overflow: hidden;
    background: var(--negro);
    color: var(--blanco);
    cursor: pointer;
    transform-style: preserve-3d;
    will-change: transform;
    content-visibility: hidden;      /* fuera de rango no se renderiza */
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    transform:
        rotateY(calc(var(--progress, 1) * (var(--max-rot, 20) * -1deg)))
        translate3d(
            calc(var(--progress, 1) * (50vw + 100%) - 50%),
            calc(var(--y, 0) * 50% - 50%),
            calc(var(--progress, 1) * var(--progress, 1) * (var(--depth, 5) * -1rem))
        )
        scale(var(--size, 0.8));
}
.card.is-inview { content-visibility: visible; }
.card__media { position: absolute; inset: 0; }
.card__img, .card__video {
    width: 100%; height: 100%;
    object-fit: cover; display: block;
}
.card--fallback {
    background:
        linear-gradient(135deg, rgba(255,255,255,0.12), rgba(0,0,0,0.35)),
        var(--negro);
    filter: sepia(1) saturate(4) hue-rotate(calc(var(--card-hue, 0) * 1deg));
}
.card__caption {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    z-index: 1;
    display: flex; justify-content: space-between; align-items: baseline;
    gap: 0.5rem;
    padding: 0.7rem 0.9rem;
    font-family: var(--font-alt);
    text-align: left;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.72), transparent);
}
.card__title { font-weight: 700; }
.card__count { font-size: 0.8rem; opacity: 0.8; letter-spacing: 0.04em; }

.pf-fallback { display: none; }   /* sólo visible bajo reduced-motion (Task 5) */
```

- [ ] **Step 6: Verificar en el navegador**

Servir y abrir Chrome en `#work` (`http://localhost:8080/#work`). Esperado (preview estático, `S=0.5`):
- Se ve **una card centrada** (la del medio del array) y quizás una vecina entrando/saliendo, girada en 3D. El resto ocultas (`content-visibility`).
- La card centrada muestra su poster (Motion/Campañas) o el fallback teñido + caption con título y contador `#NN/14`.
- **Click en la card → abre el modal** de detalle (título, tag; masonry si tiene galería). Cierra con X/Esc.
- `window.WorkCarousel.N` = 14; `window.PortfolioModal` existe. Sin errores en consola.

- [ ] **Step 7: Commit**

```bash
git add portfolio-modal.js work-carousel.js index.html styles.css
git commit -m "feat(work): escena #work con cards 3D (preview estático) + modal extraído; borra coverflow"
```

---

### Task 3: Motor de scroll (Lenis + ScrollTrigger)

Conecta el scroll: Lenis para el scroll suave, ScrollTrigger para mapear el progreso de la pista a `S∈[0,1]`, un solo ticker que llama `render(S)`. Las cards cruzan de derecha a izquierda al scrollear. Bajo `prefers-reduced-motion` no se monta el motor (lo maneja Task 5).

**Files:**
- Modify: `work-carousel.js` (reemplazar el preview estático por el motor)

**Interfaces:**
- Consumes: `render(S)`, `CONFIG`, `section`, `N` (Task 2); globals `gsap`/`ScrollTrigger`/`Lenis` (Task 1).
- Produces: la pista (`.work__outer`) con alto `N*screensPerCard*100vh`; `render` llamado en cada frame de scroll. `section` con clase `work--static` bajo reduced-motion.

- [ ] **Step 1: Reemplazar el preview estático por el motor de scroll**

En `work-carousel.js`, reemplazar exactamente:

```javascript
    window.WorkCarousel.render = render;

    // Preview estático (REEMPLAZADO por el motor de scroll en Task 3): centra una
    // card del medio para poder verificar el build y el CSS 3D sin scroll.
    render(0.5);
})();
```

por:

```javascript
    window.WorkCarousel.render = render;

    // ---- Motor de scroll (Lenis + ScrollTrigger) ----
    // Lenis suaviza el scroll; ScrollTrigger mapea el progreso de la pista a
    // S∈[0,1]; un único ticker de GSAP corre el loop. Bajo reduced-motion no se
    // monta nada (Task 5 muestra el fallback estático).
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");

    const initScroll = () => {
        const outer = section.querySelector(".work__outer");
        // Alto de la pista: cuánto scroll hay para recorrer todas las cards.
        outer.style.height = (N * CONFIG.screensPerCard * 100) + "vh";

        gsap.registerPlugin(ScrollTrigger);
        const lenis = new Lenis({ lerp: CONFIG.lerp });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);

        ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => render(self.progress),
            onRefresh: (self) => render(self.progress),
        });
        render(0);
    };

    if (reduce.matches) {
        section.classList.add("work--static");   // Task 5 lo estiliza
    } else {
        initScroll();
    }
})();
```

- [ ] **Step 2: Verificar en el navegador**

Servir y abrir Chrome. Scrollear la sección `#work`:
- Las cards **cruzan de derecha a izquierda** girando en 3D: entran giradas desde la derecha, se enderezan en el centro, salen por la izquierda girando al revés.
- Hay **1–2 cards en tránsito** a la vez (solapamiento). El scroll se siente **suave** (Lenis).
- La primera card entra al empezar la sección; la última sale al final. Click en una card centrada abre el modal.
- Sin errores en consola. El scroll de la página fuera de `#work` sigue normal.

- [ ] **Step 3: Commit**

```bash
git add work-carousel.js
git commit -m "feat(work): motor de scroll (Lenis + ScrollTrigger) — las cards cruzan en 3D al scrollear"
```

---

### Task 4: Capas secundarias — letras dispersas + parallax + grilla canvas

Agrega las letras del título que se dispersan al entrar (`--state`), el parallax sutil (`--scroll-progress`) y la grilla de fondo en canvas. `render(S)` ya setea `--state` y `--scroll-progress` (Task 2); acá se agregan los consumidores.

**Files:**
- Modify: `work-carousel.js` (build de letras + canvas)
- Modify: `styles.css` (CSS de `.scene__letter`, parallax, canvas)

**Interfaces:**
- Consumes: `scene`, `section`, `seeded`, `render` que ya setea `--state`/`--scroll-progress` (Task 2).
- Produces: `.scene__letter` con `--progress`/`--iy` por letra; grilla dibujada en `.work__grid`.

- [ ] **Step 1: `work-carousel.js` — build de letras + grilla canvas**

Insertar este bloque **justo antes** de `// ---- Scroll → progress ----` (después del bloque del fallback estático):

```javascript
    // ---- Letras del título dispersas (capa detrás de las cards) ----
    // Cada letra tiene un slot horizontal fijo (--progress 0..1) y un --iy
    // sembrado; se dispersan según --state (lo setea render). Decorativas.
    const TITLE = "portfolio";
    const M = TITLE.length;
    [...TITLE].forEach((ch, j) => {
        const el = document.createElement("span");
        el.className = "scene__letter";
        el.setAttribute("aria-hidden", "true");
        el.setAttribute("data-letter", ch);
        el.textContent = ch;
        el.style.setProperty("--progress", (M > 1 ? j / (M - 1) : 0.5).toFixed(3));
        el.style.setProperty("--iy", (seeded(1000 + j) * 2 - 1).toFixed(3));
        scene.appendChild(el);
    });

    // ---- Grilla de fondo (canvas 2D estático; parallax por CSS) ----
    const canvas = section.querySelector(".work__grid");
    if (canvas && canvas.getContext) {
        const ctx = canvas.getContext("2d");
        const drawGrid = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = (canvas.width = Math.max(1, Math.round(canvas.offsetWidth * dpr)));
            const h = (canvas.height = Math.max(1, Math.round(canvas.offsetHeight * dpr)));
            ctx.clearRect(0, 0, w, h);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
            ctx.lineWidth = 1;
            const step = 44 * dpr;
            for (let x = 0; x <= w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
            for (let y = 0; y <= h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
        };
        drawGrid();
        addEventListener("resize", drawGrid);
    }
```

- [ ] **Step 2: `styles.css` — letras, parallax y canvas**

Agregar después de la regla `.card__count { … }` (dentro del bloque `#work`, antes de `.pf-fallback { display: none; }`):

```css
/* Parallax sutil: la escena y la grilla se mueven con --scroll-progress. */
.work__scene { transform: translateY(calc(var(--scroll-progress, 0) * -15%)); }
.work__grid  { transform: translateY(calc(var(--scroll-progress, 0) * -5%)); }

/* Letras del título dispersas. --state (0→1) las abre; --progress = slot fijo. */
.scene__letter {
    position: absolute; top: 50%; left: 50%;
    z-index: 0;
    margin: 0;
    font-family: var(--font-alt);
    font-weight: 800;
    text-transform: uppercase;
    font-size: clamp(4rem, 22vh, 16rem);
    line-height: 1;
    color: rgba(255, 255, 255, 0.06);
    pointer-events: none;
    --head: calc((var(--progress, 0.5) - 0.5) * -2);
    --ahead: calc(var(--head) * var(--head));
    transform:
        translate(-50%, -50%)
        rotateY(calc(var(--head) * -10deg * var(--state, 0)))
        translate3d(
            calc(var(--head) * 50vw * var(--state, 0)),
            calc(var(--iy, 0) * 50% * var(--ahead) * var(--state, 0)),
            0
        );
}
.scene__letter::before {
    content: attr(data-letter);
    position: absolute; inset: 0; z-index: -1;
    opacity: min(calc(var(--state, 0) * 2), 1);
    transform: scale(1.05, 1.02);
}
```

- [ ] **Step 3: Verificar en el navegador**

Servir y abrir Chrome en `#work`:
- Detrás de las cards se ve una **grilla sutil** de fondo (líneas tenues).
- Al entrar a la sección, las **letras de "portfolio"** se dispersan hacia los costados (se abren desde el centro) a medida que arranca el scroll.
- Al scrollear, la escena tiene un **parallax** leve (deriva vertical). La grilla se mueve un poco menos.
- Sin errores. Redimensionar la ventana redibuja la grilla nítida.

- [ ] **Step 4: Commit**

```bash
git add work-carousel.js styles.css
git commit -m "feat(work): letras dispersas del título + parallax + grilla de fondo (canvas)"
```

---

### Task 5: Responsive, reduced-motion, accesibilidad y empalme con el portal

Cierra el trabajo: mobile sin parallax/scale y sin caption; `prefers-reduced-motion` degrada a fallback estático accesible; y se verifica el empalme cerebro→portal → `#work` (ambos violeta, sin doble transición).

**Files:**
- Modify: `styles.css` (media queries mobile + reduced-motion)

**Interfaces:**
- Consumes: clases `#work` (Task 2-4), `section.work--static` (Task 3), `.pf-fallback` poblado (Task 2).
- Produces: degradados responsivos y accesibles; sin API nueva.

- [ ] **Step 1: `styles.css` — mobile + reduced-motion**

Reemplazar el `@media (prefers-reduced-motion: reduce)` del portfolio (el que quedó del coverflow, con `.salida-portal { display:none } … .pf-fallback { … }`) por los dos bloques de abajo. Si ya no existe ese media query, agregarlos al final del bloque `#work` (después de `.scene__letter::before`).

```css
/* ---- Mobile: sin parallax ni scale; caption oculto; card más grande ---- */
@media (max-width: 576px), (max-height: 767px) and (orientation: landscape) {
    .work__scene, .work__grid { transform: none; }   /* sin parallax */
    .card {
        width: min(80vw, 560px);                      /* video hasta ~80vw */
        --size: 1 !important;                         /* sin scale (pisa el inline) */
    }
    .card__caption { display: none; }                 /* sin caption */
    .scene__letter { font-size: clamp(3rem, 30vw, 9rem); }
}

/* ---- Reduced-motion: sin carrusel; grilla estática + fallback accesible ---- */
@media (prefers-reduced-motion: reduce) {
    .salida-portal { display: none; }   /* el portal no anima (mente.js hace return) */
    .work__outer { height: auto !important; }
    .work__inner {
        position: static;
        height: auto;
        overflow: visible;
        padding: 3rem 1.5rem;
        display: block;
    }
    .work__scene { display: none; }     /* sin carrusel 3D */
    .work__grid { transform: none; }    /* grilla estática, ya no anima */
    .pf-fallback {
        display: block;
        width: min(88vw, 900px);
        margin: 2rem auto 0;
        color: var(--blanco);
    }
    .pf-fallback ul { margin: 0; padding-left: 1.2rem; }
    .pf-fallback li { margin: 0.2rem 0; font-family: var(--font-alt); opacity: 0.9; }
}
```

- [ ] **Step 2: Verificar en el navegador**

Servir y abrir Chrome:
- **Desktop normal:** `#work` intacto (carrusel, letras, grilla, parallax).
- **Mobile** (DevTools responsive <576px): sin parallax, cards más grandes sin scale variable, sin caption; el carrusel sigue cruzando al scrollear.
- **Reduced-motion** (DevTools → Rendering → *Emulate prefers-reduced-motion: reduce*): `#work` muestra el **título + la lista de texto** con los 14 trabajos y su categoría; sin carrusel; el portal no interfiere.
- **Empalme portal → #work:** scrollear despacio desde el final del recorrido del cerebro. Al terminar de abrirse el portal (pantalla en `--violeta-claro`), arranca la pista de `#work` (mismo violeta) y la **card 0 entra desde la derecha** — sin salto de color ni pantalla violeta muerta intermedia. (Si el empalme necesita ajuste, es tuning en vivo: `start`/`end` del ScrollTrigger de `#work` y el ritmo de `--salida-progress`; no bloquea.)

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "feat(work): responsive (mobile sin parallax/scale) + reduced-motion (fallback accesible) + empalme portal"
```

---

## Self-Review

**Spec coverage:**
- §Stack (vanilla + GSAP/ScrollTrigger/Lenis por CDN) → **Task 1**. ✅
- §Arquitectura (split `work-carousel.js` + `portfolio-modal.js`, borrar `portfolio.js`, `window.WORKS`) → **Tasks 1-2**. ✅
- §Estructura de la escena (markup `#work` sin máscara SVG) → **Task 2**. ✅
- §Mecánica card (CSS 3D desde `--progress/--y/--size`, `progress²` en Z) → **Task 2** (CSS + build). ✅
- §Scroll→progress (`center_i`, clamp, write-on-change, un ticker) → **Tasks 2 (fórmula) + 3 (motor)**. ✅
- §Capas secundarias (letras `--state`, parallax `--scroll-progress`, canvas grid) → **Task 4**. ✅
- §Datos (poster + video-si-existe + fallback teñido + contador `#NN/14`; click→modal) → **Task 2**. ✅
- §Config object → **Task 2** (`CONFIG` con los 7 campos). ✅
- §Responsive / reduced-motion / a11y (fallback, poster, teclado) → **Tasks 2 (fallback/aria) + 5 (media queries)**. ✅
- §Integración portal (portal abre en `#work`, sin máscara) → **Task 5** (verificación/empalme). ✅

**Placeholder scan:** Sin "TBD/TODO". `descripcion`/`video` vacíos y works sin portada son estados de datos reales (contenido pendiente del equipo), no placeholders — disparan ocultamiento/fallback definidos. Videos mp4 pendientes: la mecánica funciona con poster/fallback (constraint declarado).

**Type consistency:** `window.WORKS` (Task 1) consumido por `work-carousel.js` y `portfolio-modal.js` con la misma forma. `window.PortfolioModal.open(index)` definido en Task 2, llamado en el click de la card (Task 2). `window.WorkCarousel = { CONFIG, N, render }` consistente entre Tasks 2-3. `render(S)` setea `--progress/--y`(build)/`--size`(build)/`--state`/`--scroll-progress`; los consumen el CSS de card (Task 2) y de letras/parallax (Task 4). Vars CSS: `--max-rot`/`--depth` (seteadas en JS Task 2, usadas en `.card`), `--card-hue` (fallback), `--progress`/`--iy` (letras). Clases: `.work__outer/__inner/__title/__grid/__scene`, `.card`/`.card__media/__img/__video/__caption/__title/__count`, `.card--fallback`, `.card.is-inview`, `.scene__letter`, `.pf-fallback`, `.work--static`. Sin colisiones. Anchor de reemplazo Task 3 (el bloque `render(0.5)`) coincide con lo escrito en Task 2. ✅

Nota de riesgo (tuning, no bloqueante): valores de `CONFIG` (solapamiento/rotación/Z/track), empalme `start/end` del ScrollTrigger con el portal, y densidad/opacidad de la grilla se afinan en vivo; aislados como valores en sus reglas.
```
