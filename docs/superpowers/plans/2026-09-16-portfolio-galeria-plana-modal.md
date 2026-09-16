# Portfolio — galería plana + modal + portal · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el carrusel 3D de dos niveles (v1) por una **galería plana de todos los trabajos** con **modal de detalle** (herramientas + descripción + galería masonry o video), y una **transición de "portal"** en la que el cerebro se desvanece y un portal cápsula se expande hasta convertirse en la sección.

**Architecture:** Sitio estático vanilla (HTML/CSS/JS, sin build ni framework). Datos en `portfolio-data.js` (`window.PORTFOLIO`, por categoría). Render e interacción en `portfolio.js` (`window.Portfolio`), que aplana los works a una lista única. La galería es una grilla CSS con scroll vertical normal. El modal es un `<dialog>`-like accesible poblado por JS. La transición vive en `mente.js` (dueño del escenario sticky) + CSS, derivada de `--salida-progress`.

**Tech Stack:** HTML5, CSS3 (custom properties, grid, `columns` para masonry, transforms), JavaScript vanilla (ES2015+, IIFE con `"use strict"`). Sin librerías. Sin test runner.

## Global Constraints

- **Vanilla-first.** Sin librerías nuevas ni build step. Módulos IIFE con `"use strict"`.
- **Colores solo por tokens** (`styles.css :root`). Nunca hex hardcodeado. Sección portfolio en `--violeta-claro`. Portal interior/fondo `--violeta-claro`, campo `--negro`.
- **Cards de la pared: portada 16:9 a sangre** (`object-fit: cover`). Fallback donde falte portada: fondo teñido en brain-hue + título.
- **Brain-hue por disciplina:** `hue` de cada categoría en `portfolio-data.js` (mirror de `BEAT_HUE` en `mente.js`: 340/200/10/140/210).
- **Idioma:** comentarios de código en inglés; copy/contenido en español (argentino).
- **Naming:** kebab-case para archivos y clases CSS.
- **Accesibilidad WCAG AA:** cards = botones enfocables; modal con focus trap + Esc + restauración de foco; tag visible en hover **y** focus; `prefers-reduced-motion` con degradado; imágenes con `alt`.
- **No inventar contenido:** autores omitidos; `descripcion` vacía se oculta (no rellenar). Títulos derivados de archivos y `tools` son **provisionales** (comentados como tales).
- **Wording del portal:** `NOSOTROS RESOLVEMOS`.
- **No test runner.** Cada tarea cierra con **verificación visual en Chrome**. Servir con `pnpm dlx serve -l 8080 .` y abrir en Chrome:
  `& "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:8080"`.
  (El server suele quedar corriendo entre tareas.)

Referencia viva del diseño: `docs/superpowers/specs/2026-09-16-portfolio-galeria-plana-modal-design.md`.

---

## File Structure

- **Modify** `portfolio-data.js` — extiende cada work con campos opcionales (`tools`, `descripcion`, `galeria`, `video`); siembra `galeria`/`tools` reales/provisionales en algunos works para poder verificar el modal.
- **Rewrite** `portfolio.js` — aplana works; render de la pared; deformación sutil (tilt al mouse + entrada por IntersectionObserver); apertura/cierre del modal; herramientas + descripción; media (masonry + lightbox / video); fallback accesible.
- **Modify** `index.html` — nuevo markup de `#portfolio` (header + `ul.pf-wall` + `.pf-fallback`); esqueleto del modal `#pf-modal`; portal `.salida-portal` dentro de `.mente-stage`; **quitar** `.salida-intro`.
- **Modify** `styles.css` — **quitar** CSS de coverflow/drill-in/`.salida-intro`; **mantener** card 16:9 + fallback + sección violeta; **agregar** pared grid, hover tag, deformación sutil (perspectiva/tilt + entrada), modal, masonry, lightbox, portal + expansión.
- **Modify** `mente.js` — reemplazar `renderSalida` (slide a la izquierda + `--cerebro-exit-x`) por el fade del cerebro; el portal lo maneja el CSS vía `--salida-progress` (ya se calcula).

---

### Task 1: Datos extendidos + pared plana (grilla vertical de todos los trabajos)

Aplana todos los works a una sola pared con scroll vertical. Cards 16:9 + fallback brain-hue. Sin interacción todavía (hover en Task 2, modal en Task 3). Remueve el JS de coverflow/drill-in.

**Files:**
- Modify: `portfolio-data.js`
- Rewrite: `portfolio.js`
- Modify: `index.html` (reemplazar el contenido de `<section id="portfolio">`)
- Modify: `styles.css` (reemplazar el bloque de coverflow por el de la pared)

**Interfaces:**
- Consumes: `window.PORTFOLIO` (array de categorías `{key,label,hue,portada,works}`).
- Produces: `window.Portfolio = { WORKS, renderWall, hueFilter }`.
  `WORKS: Array<Work>` donde `Work = {title, portada, media, catKey, catLabel, hue, tools?, descripcion?, galeria?, video?}`.
  Cada `.pf-card-btn` lleva `data-index` = índice en `WORKS`.

- [ ] **Step 1: Extender los datos en `portfolio-data.js`**

Reemplazar el bloque `works` de las categorías `grafico` y `modelado3d` por versiones con `galeria`/`tools` (reales donde existen; `tools` marcadas provisionales). Dejar `motion`/`web`/`campanas` como están (sus works no cambian de forma; los campos opcionales se omiten). Reemplazar exactamente el array `works` de `grafico`:

```javascript
            works: [
                {
                    title: "Inari", portada: null, media: "image",
                    // real process images (diseno_grafico/Poster_Inari/*)
                    galeria: [
                        "diseno_grafico/Poster_Inari/1_fonod.png",
                        "diseno_grafico/Poster_Inari/2_fondo2.png",
                        "diseno_grafico/Poster_Inari/3_zorro1.png",
                        "diseno_grafico/Poster_Inari/5_geishas1.png",
                        "diseno_grafico/Poster_Inari/6_tori1.png",
                        "diseno_grafico/Poster_Inari/9_color1.png",
                        "diseno_grafico/Poster_Inari/10_sombrasluces.png",
                        "diseno_grafico/Poster_Inari/12_finaldetalles.png",
                        "diseno_grafico/Poster_Inari/13_titulo.png",
                    ],
                    tools: ["photoshop", "illustrator"], // provisional — confirmar con el equipo
                },
                { title: "Lightyear",    portada: null, media: "image" },
                { title: "Perfume",      portada: null, media: "image" },
                { title: "Infinity War", portada: null, media: "image" },
                { title: "Interstellar", portada: null, media: "image" },
            ],
```

Y reemplazar exactamente el array `works` de `modelado3d`:

```javascript
            works: [
                {
                    title: "Caja de fantasía", portada: null, media: "image",
                    galeria: [
                        "3d/caja_fantasia/RENDER1.png",
                        "3d/caja_fantasia/RENDER2.png",
                        "3d/caja_fantasia/RENDER3.png",
                        "3d/caja_fantasia/RENDER4.png",
                        "3d/caja_fantasia/malla_wirefame.png",
                        "3d/caja_fantasia/render_wireframe.png",
                    ],
                    tools: ["blender", "substance-3d-painter"], // provisional
                },
                { title: "Máquina expendedora", portada: null, media: "image" },
                {
                    title: "Personaje toon", portada: null, media: "image",
                    galeria: [
                        "3d/personaje_toon/pj_toon_mesh.jpeg",
                        "3d/personaje_toon/pj_toon_sintextura.jpeg",
                    ],
                    tools: ["blender"], // provisional
                },
            ],
```

Actualizar el comentario de cabecera de `portfolio-data.js` para documentar los campos opcionales (agregar debajo del bloque de comentario existente, dentro del IIFE, antes de `window.PORTFOLIO`):

```javascript
    // Work opcional (todo lo de detalle del modal puede faltar → se oculta):
    //   tools: string[]  (keys de resources/logos/<key>.svg)
    //   descripcion: string
    //   galeria: string[] (rutas de imágenes a proporción real, para el masonry)
    //   video: string     (ruta/URL; sólo si media === "video")
```

- [ ] **Step 2: Reescribir `portfolio.js` (pared plana, sin interacción)**

Reemplazar TODO el contenido de `portfolio.js` por:

```javascript
// Portfolio — galería plana de todos los trabajos + modal de detalle.
// Task 1: pared (grid vertical). Hover tag (Task 2), modal (Tasks 3-5) y
// accesibilidad (Task 7) se agregan encima.
// Ref: docs/superpowers/specs/2026-09-16-portfolio-galeria-plana-modal-design.md
(() => {
    "use strict";
    const section = document.querySelector("#portfolio");
    if (!section || !window.PORTFOLIO) return;

    const wall = section.querySelector(".pf-wall");

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

        const cap = document.createElement("span");
        cap.className = "pf-cap";
        cap.textContent = work.title;
        btn.appendChild(cap);

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

    renderWall();

    window.Portfolio = { WORKS, renderWall, hueFilter };
})();
```

- [ ] **Step 3: Reemplazar el markup de `#portfolio` en `index.html`**

Reemplazar TODA la sección `<section id="portfolio" …> … </section>` (la de la v1, con `.pf-stage`/`.pf-track`/`.pf-nav`/`.pf-back`/`.pf-cue`) por:

```html
        <!-- Portfolio: galería plana de TODOS los trabajos (sin niveles de
             categoría). Cards 16:9; hover → tag de categoría; click → modal.
             Render: portfolio.js. Ref: spec 2026-09-16-portfolio-galeria-plana-modal. -->
        <section id="portfolio" class="zona-portfolio" aria-label="Portfolio">
            <div class="pf-head">
                <h2 class="pf-title erratic" data-text="portfolio">portfolio</h2>
                <p class="pf-sub">Todo lo que resolvimos, en un solo lugar.</p>
            </div>

            <ul class="pf-wall" role="list"></ul>

            <!-- Fallback estático accesible (lectores de pantalla siempre; visible
                 como lista bajo reduced-motion). Lo puebla portfolio.js (Task 7). -->
            <div class="pf-fallback"></div>
        </section>
```

- [ ] **Step 4: Reemplazar el CSS de coverflow por el de la pared en `styles.css`**

Localizar el bloque `PORTFOLIO — isla interactiva, carrusel de dos niveles` (de la v1). Reemplazar desde `.zona-portfolio {` hasta el final de `.pf-fallback { display: none; … }` (todo el bloque del carrusel: `.pf-viewport/.pf-track/.pf-card` coverflow, `.pf-nav`, `.pf-back`, `.pf-cue`, `.zona-portfolio::before`, etc.), por el bloque de la pared. Reemplazar también el `@media (prefers-reduced-motion)` del portfolio (se rehace en Task 7 — por ahora quitarlo). Bloque nuevo:

```css
/* ==========================================================================
   PORTFOLIO v2 — galería plana de todos los trabajos + modal
   Ref: docs/superpowers/specs/2026-09-16-portfolio-galeria-plana-modal-design.md
   ========================================================================== */
.zona-portfolio {
    display: block;                 /* scroll vertical normal (no centrado) */
    position: relative;
    min-height: 100vh;
    background: var(--violeta-claro);
    color: var(--blanco);
    padding: clamp(2rem, 6vw, 5rem) 0 5rem;
}
.pf-head { text-align: center; padding: 0 1.5rem; }
.pf-title {
    margin: 0;
    font-size: clamp(2rem, 7vw, 4.5rem);
    font-weight: 800;
    text-transform: lowercase;
}
.pf-sub {
    margin: 0.4rem 0 0;
    font-family: var(--font-alt);
    opacity: 0.85;
}

/* Pared: grilla fluida con scroll vertical. */
.pf-wall {
    list-style: none;
    margin: clamp(1.5rem, 4vw, 3rem) auto 0;
    padding: 0 clamp(1rem, 4vw, 3rem);
    width: min(1200px, 100%);
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
    gap: 1.2rem;
}
.pf-card { position: relative; }

/* Card = botón. Marco 16:9 a sangre. */
.pf-card-btn {
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    position: relative;
    aspect-ratio: 16 / 9;
    border-radius: 8px;
    overflow: hidden;
    background: var(--negro);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
    cursor: pointer;
    color: var(--blanco);
}
.pf-card-img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
}
/* Fallback sin portada: fondo teñido en el brain-hue de la disciplina. */
.pf-card--fallback {
    background:
        linear-gradient(135deg, rgba(255,255,255,0.12), rgba(0,0,0,0.35)),
        var(--negro);
    filter: sepia(1) saturate(4) hue-rotate(calc(var(--card-hue, 0) * 1deg));
}
.pf-cap {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    padding: 0.6rem 0.8rem;
    font-family: var(--font-alt);
    font-weight: 700;
    text-align: left;
    color: var(--blanco);
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
}

.pf-fallback { display: none; }   /* sólo visible bajo reduced-motion (Task 7) */
```

- [ ] **Step 5: Verificar en el navegador**

Servir y abrir Chrome en `#portfolio`. Esperado:
- Una **grilla** con **todos** los trabajos (14 cards: 5 gráfico + 3 3D + 5 motion + 1 campañas; Web no tiene works). Scroll vertical normal.
- Motion y Campañas con portada real; el resto con fallback teñido (hues 340/200) + título.
- Sin errores en consola. `window.Portfolio.WORKS.length` = 14.

- [ ] **Step 6: Commit**

```bash
git add portfolio-data.js portfolio.js index.html styles.css
git commit -m "feat(portfolio): galería plana de todos los trabajos (reemplaza carrusel v1)"
```

---

### Task 2: Hover (oscurecer + tag) + deformación sutil (tilt al mouse + entrada)

Al pasar el mouse (o enfocar por teclado) una card, se oscurece un toque y aparece la tag con la categoría, teñida con el hue de la disciplina. Además, **deformación sutil**: la card se inclina en 3D hacia el mouse (tilt) con una sombra que la levanta, y **entra al aparecer en viewport** (stagger natural por scroll). Todo esto sólo con hover real y sin `prefers-reduced-motion` (en touch/reduced-motion las cards quedan estáticas y visibles).

**Files:**
- Modify: `styles.css` (hover/tag + perspectiva/tilt + entrada)
- Modify: `portfolio.js` (tilt al mouse + IntersectionObserver de entrada; guards touch/reduced-motion)

**Interfaces:**
- Consumes: `wall`, `.pf-card-btn`, `.pf-card`, `.pf-tag[style="--card-hue"]` (Task 1).
- Produces: la card recibe `--rx`/`--ry` (deg) por JS en hover; `.pf-card.is-in` al entrar en viewport; `section` recibe la clase `pf-anim` cuando la entrada está activa.

- [ ] **Step 1: Agregar el overlay de oscurecido + la tag (en `styles.css`)**

Agregar después de la regla `.pf-cap { … }` del bloque de la pared:

```css
/* Overlay de oscurecido en hover/focus. */
.pf-card-btn::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
}
.pf-card-btn:hover::after,
.pf-card-btn:focus-visible::after { opacity: 1; }

/* Tag de categoría: aparece en hover/focus, teñida con el hue de la disciplina. */
.pf-tag {
    position: absolute;
    top: 0.6rem; left: 0.6rem;
    z-index: 1;                 /* sobre el overlay ::after */
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    font-family: var(--font-alt);
    font-weight: 700;
    font-size: 0.8rem;
    line-height: 1;
    color: var(--negro);
    background: hsl(calc(var(--card-hue, 0) * 1deg) 70% 60%);
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.25s ease, transform 0.25s ease;
    pointer-events: none;
}
.pf-card-btn:hover .pf-tag,
.pf-card-btn:focus-visible .pf-tag {
    opacity: 1;
    transform: translateY(0);
}
```

- [ ] **Step 2: Agregar la deformación sutil (tilt + entrada) en `styles.css`**

Agregar después de las reglas de la tag:

```css
/* Deformación sutil: cada card tiene su propia perspectiva; el botón se inclina
   hacia el mouse (JS setea --rx/--ry) con una sombra que lo levanta. */
.pf-card { perspective: 800px; }
.pf-card-btn {
    transform: rotateX(var(--ry, 0deg)) rotateY(var(--rx, 0deg));
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    will-change: transform;
}
.pf-card-btn:hover { box-shadow: 0 22px 60px rgba(0, 0, 0, 0.55); }

/* Entrada: revelar cada card al aparecer en viewport. Scoped a .pf-anim (que
   agrega el JS) para que, sin JS o bajo reduced-motion, las cards se vean igual. */
.pf-anim .pf-card {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.5s ease, transform 0.5s ease;
}
.pf-anim .pf-card.is-in { opacity: 1; transform: none; }
```

- [ ] **Step 3: Agregar el tilt + IntersectionObserver en `portfolio.js`**

Insertar este bloque **antes** de la línea `window.Portfolio = { WORKS, renderWall, hueFilter };` (al final del IIFE):

```javascript
    // ----- Deformación sutil: tilt al mouse + entrada al scrollear -----
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const noHover = matchMedia("(hover: none)");

    // Tilt: la card se inclina hacia el mouse. Sólo con hover real y sin reduced-motion.
    if (!reduce.matches && !noHover.matches) {
        const TILT = 8; // grados máx
        wall.addEventListener("pointermove", (e) => {
            const btn = e.target.closest(".pf-card-btn");
            if (!btn) return;
            const r = btn.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            btn.style.setProperty("--rx", (px * TILT).toFixed(2) + "deg");
            btn.style.setProperty("--ry", (-py * TILT).toFixed(2) + "deg");
        });
        wall.addEventListener("pointerout", (e) => {
            const btn = e.target.closest(".pf-card-btn");
            if (!btn) return;
            btn.style.setProperty("--rx", "0deg");
            btn.style.setProperty("--ry", "0deg");
        });
    }

    // Entrada: revelar cada card al entrar en viewport (stagger natural por scroll).
    if (!reduce.matches) {
        section.classList.add("pf-anim");
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) {
                    en.target.classList.add("is-in");
                    io.unobserve(en.target);
                }
            });
        }, { threshold: 0.12 });
        wall.querySelectorAll(".pf-card").forEach((c) => io.observe(c));
    }

```

- [ ] **Step 4: Verificar en el navegador**

En `#portfolio`:
- Al pasar el mouse por una card se oscurece y aparece arriba-izquierda la tag con el nombre de la disciplina, con color distinto por categoría (gráfico rosado ~340, 3D celeste ~200, motion rojo-naranja ~10, campañas azul ~210).
- La card **se inclina hacia el mouse** (tilt 3D suave) y se levanta con sombra; al salir, vuelve a plano.
- Al **scrollear**, las cards **entran** (fade + subida) a medida que aparecen.
- Con Tab, al enfocar una card se ve el foco + la tag. Sin errores.

- [ ] **Step 5: Commit**

```bash
git add styles.css portfolio.js
git commit -m "feat(portfolio): hover (oscurece+tag) + deformación sutil (tilt al mouse + entrada)"
```

---

### Task 3: Modal base — abrir/cerrar accesible (título + tag)

Click (o Enter/Espacio) en una card abre un modal con el título y la tag de categoría. Cierra con X, Esc y click en el backdrop. Focus trap, restauración de foco y bloqueo de scroll de fondo.

**Files:**
- Modify: `index.html` (agregar el esqueleto `#pf-modal` al final de `<main>`)
- Modify: `portfolio.js` (delegación de click en la pared + `open`/`close` + a11y)
- Modify: `styles.css` (estilos del modal: backdrop, dialog, head, close)

**Interfaces:**
- Consumes: `WORKS`, `.pf-card-btn[data-index]` (Task 1).
- Produces: `window.Portfolio.open(index)`, `window.Portfolio.close()`.
  Poblado del modal: `.pf-modal-title`, `.pf-modal-tag` (media/tools/desc en Tasks 4-5).

- [ ] **Step 1: Agregar el esqueleto del modal en `index.html`**

Antes de `</main>` (después de la `<section id="contacto">`), agregar:

```html
        <!-- Modal de proyecto (lo puebla portfolio.js). role=dialog + focus trap. -->
        <div class="pf-modal" id="pf-modal" hidden role="dialog" aria-modal="true"
             aria-labelledby="pf-modal-title">
            <div class="pf-modal-backdrop" data-close></div>
            <div class="pf-modal-dialog" role="document">
                <button class="pf-modal-close" type="button" aria-label="Cerrar" data-close>✕</button>
                <header class="pf-modal-head">
                    <h3 class="pf-modal-title" id="pf-modal-title"></h3>
                    <span class="pf-modal-tag"></span>
                </header>
                <div class="pf-modal-body">
                    <div class="pf-modal-media"></div>
                    <aside class="pf-modal-meta">
                        <div class="pf-modal-tools"></div>
                        <p class="pf-modal-desc"></p>
                    </aside>
                </div>
            </div>
        </div>
```

- [ ] **Step 2: `portfolio.js` — click en la pared + open/close + a11y**

Reemplazar la línea `window.Portfolio = { WORKS, renderWall, hueFilter };` y el cierre `})();` (el bloque de tilt de la Task 2 queda arriba, intacto) por:

```javascript
    // ----- Modal -----
    const modal = document.querySelector("#pf-modal");
    const mTitle = modal.querySelector(".pf-modal-title");
    const mTag = modal.querySelector(".pf-modal-tag");
    let lastFocused = null;

    const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const open = (index) => {
        const work = WORKS[index];
        if (!work) return;
        lastFocused = document.activeElement;

        mTitle.textContent = work.title;
        mTag.textContent = work.catLabel;
        mTag.style.setProperty("--card-hue", String(work.hue));
        // (media / tools / descripción los completan las Tasks 4-5)

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
        if (e.key === "Escape") { close(); return; }
        if (e.key !== "Tab") return;
        const items = Array.from(modal.querySelectorAll(FOCUSABLE))
            .filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    });

    window.Portfolio = { WORKS, renderWall, hueFilter, open, close };
})();
```

- [ ] **Step 3: `styles.css` — estilos del modal (agregar al final del bloque PORTFOLIO v2)**

```css
/* ---- Modal de proyecto ---- */
body.pf-modal-open { overflow: hidden; }   /* bloquea el scroll de fondo */

.pf-modal {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(1rem, 4vw, 3rem);
}
.pf-modal[hidden] { display: none; }
.pf-modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(2px);
}
.pf-modal-dialog {
    position: relative;
    z-index: 1;
    width: min(1000px, 100%);
    max-height: 90vh;
    overflow: auto;
    background: var(--violeta-claro);
    color: var(--blanco);
    border-radius: 12px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
    padding: clamp(1.2rem, 3vw, 2.2rem);
}
.pf-modal-close {
    position: absolute;
    top: 0.8rem; right: 0.8rem;
    width: 40px; height: 40px;
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 50%;
    background: transparent;
    color: var(--blanco);
    font-size: 1rem;
    cursor: pointer;
}
.pf-modal-close:hover,
.pf-modal-close:focus-visible { background: rgba(255,255,255,0.15); }
.pf-modal-head {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    flex-wrap: wrap;
    padding-right: 3rem;          /* deja lugar a la X */
    margin-bottom: 1.2rem;
}
.pf-modal-title {
    margin: 0;
    font-size: clamp(1.4rem, 4vw, 2.4rem);
    font-weight: 800;
}
.pf-modal-tag {
    padding: 0.25rem 0.7rem;
    border-radius: 999px;
    font-family: var(--font-alt);
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--negro);
    background: hsl(calc(var(--card-hue, 0) * 1deg) 70% 60%);
}
.pf-modal-body {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.4rem;
}
@media (min-width: 720px) {
    .pf-modal-body { grid-template-columns: 2fr 1fr; }
}
```

- [ ] **Step 4: Verificar en el navegador**

En `#portfolio`: click en cualquier card abre el modal con el título y la tag (color por categoría). Cierra con la X, con Esc y clickeando el fondo oscuro. Con Tab el foco no se escapa del modal; al cerrar, el foco vuelve a la card que lo abrió. El fondo no scrollea con el modal abierto. Sin errores.

- [ ] **Step 5: Commit**

```bash
git add index.html portfolio.js styles.css
git commit -m "feat(portfolio): modal base (abrir/cerrar accesible, título + tag)"
```

---

### Task 4: Modal — herramientas (logos) + descripción

Puebla las herramientas (chips con logos de `resources/logos/`) y la descripción corta. Secciones vacías se ocultan.

**Files:**
- Modify: `portfolio.js` (poblar `.pf-modal-tools` y `.pf-modal-desc` en `open`)
- Modify: `styles.css` (estilos de chips de herramientas + descripción)

**Interfaces:**
- Consumes: `open(index)`, `WORKS[i].tools?`, `WORKS[i].descripcion?`, `.pf-modal-tools`, `.pf-modal-desc` (Task 3).
- Produces: `renderTools(work)` (helper interno). Sin API pública nueva.

- [ ] **Step 1: `portfolio.js` — poblar tools + descripción**

En el IIFE, agregar referencias junto a `mTitle`/`mTag`:

```javascript
    const mTools = modal.querySelector(".pf-modal-tools");
    const mDesc = modal.querySelector(".pf-modal-desc");
```

Agregar el helper antes de `open`:

```javascript
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
```

Dentro de `open`, después de setear el tag (antes de `modal.hidden = false;`), agregar:

```javascript
        renderTools(work);
        // Descripción (se oculta si está vacía — no inventar copy).
        const desc = (work.descripcion || "").trim();
        mDesc.textContent = desc;
        mDesc.hidden = !desc;
```

- [ ] **Step 2: `styles.css` — chips de herramientas + descripción**

Agregar al final del bloque PORTFOLIO v2:

```css
.pf-modal-meta { font-family: var(--font-alt); }
.pf-modal-subhead {
    margin: 0 0 0.5rem;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.8;
}
.pf-tools-list {
    list-style: none;
    margin: 0 0 1.2rem;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
}
.pf-tool {
    width: 44px; height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.14);
}
.pf-tool img { width: 26px; height: 26px; object-fit: contain; }
.pf-modal-desc { margin: 0; line-height: 1.5; opacity: 0.92; }
.pf-modal-tools[hidden],
.pf-modal-desc[hidden] { display: none; }
```

- [ ] **Step 3: Verificar en el navegador**

- Abrir "Inari" (gráfico): en el panel derecho se ven los chips **Photoshop** e **Illustrator** bajo "Herramientas". No hay descripción → no aparece el bloque de descripción (sin hueco).
- Abrir "Lightyear" (sin tools ni descripción): no aparece "Herramientas" ni descripción.
- Los logos cargan (no íconos rotos). Sin errores.

- [ ] **Step 4: Commit**

```bash
git add portfolio.js styles.css
git commit -m "feat(portfolio): modal muestra herramientas (logos) + descripción (oculta si vacías)"
```

---

### Task 5: Modal — media (masonry de imágenes + lightbox / video)

Puebla el área de media: para proyectos de imagen, un masonry (CSS `columns`) con las imágenes a proporción real; click en una abre un lightbox con prev/next. Para proyectos de video, un `<video>`. Si no hay media, un placeholder.

**Files:**
- Modify: `index.html` (agregar la capa de lightbox dentro de `#pf-modal`)
- Modify: `portfolio.js` (poblar `.pf-modal-media` + lógica de lightbox)
- Modify: `styles.css` (masonry, video, lightbox)

**Interfaces:**
- Consumes: `open(index)`, `WORKS[i].media`, `WORKS[i].galeria?`, `WORKS[i].video?`, `.pf-modal-media` (Tasks 3-4).
- Produces: `renderMedia(work)`, `openLightbox(list, i)`, `closeLightbox()` (helpers internos).

- [ ] **Step 1: `index.html` — capa de lightbox dentro del modal**

Dentro de `#pf-modal`, después de `</div>` de `.pf-modal-dialog` (y antes del cierre de `.pf-modal`), agregar:

```html
                <div class="pf-lightbox" hidden aria-hidden="true">
                    <button class="pf-lb-close" type="button" aria-label="Cerrar imagen" data-lb-close>✕</button>
                    <button class="pf-lb-nav pf-lb-prev" type="button" aria-label="Anterior">◂</button>
                    <img class="pf-lb-img" src="" alt="">
                    <button class="pf-lb-nav pf-lb-next" type="button" aria-label="Siguiente">▸</button>
                </div>
```

- [ ] **Step 2: `portfolio.js` — render de media + lightbox**

Agregar la referencia junto a las otras del modal:

```javascript
    const mMedia = modal.querySelector(".pf-modal-media");
    const lb = modal.querySelector(".pf-lightbox");
    const lbImg = lb.querySelector(".pf-lb-img");
    let lbList = [];
    let lbIndex = 0;
```

Agregar los helpers antes de `open`:

```javascript
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
```

Dentro de `open`, agregar (después de `mDesc.hidden = !desc;`):

```javascript
        renderMedia(work);
        closeLightbox();   // por si quedó abierto de un modal anterior
```

Enganchar los controles del lightbox (agregar junto a los otros listeners del modal, antes del `window.Portfolio = …`):

```javascript
    lb.querySelector(".pf-lb-prev").addEventListener("click", () => stepLb(-1));
    lb.querySelector(".pf-lb-next").addEventListener("click", () => stepLb(1));
    lb.addEventListener("click", (e) => {
        if (e.target.closest("[data-lb-close]") || e.target === lb) closeLightbox();
    });
```

Y en el handler de teclado del modal, al principio (antes del `if (e.key === "Escape")`), interceptar cuando el lightbox está abierto:

```javascript
        if (!lb.hidden) {
            if (e.key === "Escape") { closeLightbox(); e.preventDefault(); return; }
            if (e.key === "ArrowLeft") { stepLb(-1); e.preventDefault(); return; }
            if (e.key === "ArrowRight") { stepLb(1); e.preventDefault(); return; }
        }
```

Exponer los helpers en el objeto público:

```javascript
    window.Portfolio = { WORKS, renderWall, hueFilter, open, close, openLightbox, closeLightbox };
```

- [ ] **Step 3: `styles.css` — masonry + video + lightbox**

Agregar al final del bloque PORTFOLIO v2:

```css
/* Masonry: columnas fluidas; cada imagen a su proporción real. */
.pf-gallery { columns: 3 200px; column-gap: 0.8rem; }
.pf-gallery img {
    width: 100%;
    display: block;
    margin: 0 0 0.8rem;
    border-radius: 6px;
    cursor: zoom-in;
    break-inside: avoid;
}
.pf-video { width: 100%; border-radius: 8px; display: block; }
.pf-media-soon {
    margin: 0;
    padding: 2rem;
    text-align: center;
    font-family: var(--font-alt);
    opacity: 0.75;
    border: 1px dashed rgba(255, 255, 255, 0.35);
    border-radius: 8px;
}

/* Lightbox: overlay sobre el modal. */
.pf-lightbox {
    position: fixed;
    inset: 0;
    z-index: 110;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.9);
    padding: clamp(1rem, 4vw, 3rem);
}
.pf-lightbox[hidden] { display: none; }
.pf-lb-img {
    max-width: 90vw;
    max-height: 85vh;
    object-fit: contain;
    border-radius: 6px;
}
.pf-lb-nav, .pf-lb-close {
    flex: none;
    width: 48px; height: 48px;
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 50%;
    background: transparent;
    color: var(--blanco);
    font-size: 1.2rem;
    cursor: pointer;
}
.pf-lb-close { position: absolute; top: 1rem; right: 1rem; }
.pf-lb-nav:hover, .pf-lb-close:hover { background: rgba(255,255,255,0.15); }
```

- [ ] **Step 4: Verificar en el navegador**

- Abrir "Inari": el panel de media muestra un **masonry** con las 9 imágenes de proceso, cada una a su proporción real (no recortadas). Click en una → **lightbox** grande; `◂ ▸` y las flechas del teclado pasan de imagen; Esc cierra el lightbox (no el modal).
- Abrir "Caja de fantasía" (3D): masonry con los 6 renders/wireframes.
- Abrir "The Sandman" (motion, sin `video` cargado aún): muestra "Video próximamente."
- Abrir "Lightyear" (sin galería): "Imágenes próximamente."
- Sin errores.

- [ ] **Step 5: Commit**

```bash
git add index.html portfolio.js styles.css
git commit -m "feat(portfolio): modal media — masonry de imágenes + lightbox / video"
```

---

### Task 6: Transición — el cerebro se desvanece y el portal se expande

Reemplaza la fase salida de la v1 (slide a la izquierda + `.salida-intro`). Al terminar la absorción, el cerebro se **desvanece** y detrás aparece un **portal cápsula** con "NOSOTROS RESOLVEMOS" vertical; el portal **se expande** hasta llenar la pantalla en `--violeta-claro`, empalmando con la sección `#portfolio` (mismo fondo).

**Files:**
- Modify: `index.html` (agregar `.salida-portal` dentro de `.mente-stage`; **quitar** `.salida-intro`)
- Modify: `mente.js` (simplificar `renderSalida`: sólo fade del cerebro; sin `--cerebro-exit-x`)
- Modify: `styles.css` (portal + expansión; quitar `.salida-intro` y el exit-x del cerebro)

**Interfaces:**
- Consumes: `--salida-progress` (0..1) en `.mente-stage` (ya lo calcula `render()` en `mente.js`).
- Produces: `.salida-portal` que crece con `--salida-progress`; el cerebro se desvanece con `--salida-progress`.

- [ ] **Step 1: `index.html` — portal en el escenario; quitar la intro vieja**

Reemplazar el bloque `.salida-intro` (título + card) por el portal:

```html
                <!-- Portal de salida: aparece detrás del cerebro cuando éste se
                     desvanece, y se expande hasta ser la sección portfolio. -->
                <div class="salida-portal" aria-hidden="true">
                    <span class="salida-portal-word">NOSOTROS RESOLVEMOS</span>
                </div>
```

- [ ] **Step 2: `mente.js` — simplificar la fase salida (sólo fade del cerebro)**

Reemplazar la función `renderSalida` por (ya no hay slide lateral; el portal lo maneja el CSS con `--salida-progress`):

```javascript
    // Fase 3 (salida): el cerebro se desvanece; el portal (CSS) se expande detrás.
    // Todo derivado de --salida-progress; nada que calcular acá salvo dejar la
    // variable seteada (lo hace render()). Se mantiene la firma por claridad.
    const renderSalida = (salidaP) => { void salidaP; };
```

(Se deja de setear `--cerebro-exit-x`. El fade del cerebro pasa a ser 100% CSS.)

- [ ] **Step 3: `styles.css` — portal + expansión; quitar exit-x del cerebro y `.salida-intro`**

3a. En la regla del cerebro que compone el transform de salida (la que usa `--cerebro-exit-x`), quitar el `translateX` de salida. Reemplazar:

```css
    transform:
        translateX(calc(var(--cerebro-exit-x, 0) * 1vw))
        scale(calc(0.6 + var(--hero-progress) * 0.75));
```

por:

```css
    transform: scale(calc(0.6 + var(--hero-progress) * 0.75));
```

(Se mantiene la regla de `opacity` que hace el fade final del cerebro con `--salida-progress`.)

3b. Eliminar TODO el bloque CSS de `.salida-intro`, `.salida-titulo` y `.salida-card` (de la v1).

3c. Agregar el bloque del portal (al final de la zona del escenario, junto a las reglas de salida):

```css
/* Portal de salida: cápsula oscura que aparece detrás del cerebro y crece hasta
   llenar la pantalla en violeta, empalmando con la sección #portfolio.
   Todo atado a --salida-progress (lo setea mente.js). */
.salida-portal {
    position: absolute;
    left: 50%; top: 50%;
    translate: -50% -50%;
    z-index: 6;                 /* detrás del cerebro (que se desvanece encima) */
    /* crece desde una cápsula chica hasta desbordar el viewport (corners afuera
       → la pantalla queda toda violeta). */
    width: calc(42vmin + var(--salida-progress, 0) * 260vmax);
    height: calc(74vmin + var(--salida-progress, 0) * 260vmax);
    border-radius: 9999px;
    background:
        radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1.6px) 0 0 / 14px 14px,
        var(--violeta-claro);
    /* aparece apenas arranca la salida; el crecimiento la vuelve el fondo. */
    opacity: clamp(0, calc(var(--salida-progress, 0) * 6), 1);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    pointer-events: none;
}
.salida-portal-word {
    font-family: var(--font-alt);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--blanco);
    writing-mode: vertical-rl;
    text-orientation: upright;
    white-space: nowrap;
    font-size: clamp(1.2rem, 4vmin, 2.4rem);
    /* la palabra se desvanece a medida que el portal se expande. */
    opacity: clamp(0, calc(1 - var(--salida-progress, 0) * 3), 1);
}
```

- [ ] **Step 4: Verificar en el navegador**

Scrollear despacio pasando el final de herramientas. Esperado:
- Al terminar la absorción, el cerebro **se desvanece** (sin irse a un costado).
- Detrás aparece un **portal cápsula** violeta con "NOSOTROS RESOLVEMOS" vertical.
- Al seguir scrolleando, el portal **se expande** hasta llenar la pantalla de violeta; la palabra se desvanece.
- Al terminar, el escenario se despinea y queda la sección `#portfolio` (misma violeta) sin salto brusco.
- Scrolleando hacia arriba, todo se revierte (el cerebro vuelve).

- [ ] **Step 5: Commit**

```bash
git add index.html mente.js styles.css
git commit -m "feat(portfolio): transición portal — el cerebro se desvanece y el portal se expande"
```

---

### Task 7: Accesibilidad — fallback estático + reduced-motion

Contenido accesible siempre legible; bajo `prefers-reduced-motion`, sin transición de portal (ya la corta `mente.js`) y con el fallback de texto visible bajo la pared.

**Files:**
- Modify: `portfolio.js` (poblar `.pf-fallback` con la lista de todos los trabajos)
- Modify: `styles.css` (bloque `@media (prefers-reduced-motion: reduce)` del portfolio)

**Interfaces:**
- Consumes: `WORKS` (Task 1), `.pf-fallback`.
- Produces: `renderFallback()` (helper interno; se llama al iniciar).

- [ ] **Step 1: `portfolio.js` — poblar el fallback estático**

Agregar la referencia junto a `const wall = …`:

```javascript
    const fallback = section.querySelector(".pf-fallback");
```

Agregar el helper y llamarlo (después de `renderWall();`):

```javascript
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
```

En la línea donde se llama `renderWall();` (la primera, después de definir `renderWall`), agregar debajo:

```javascript
    renderFallback();
```

- [ ] **Step 2: `styles.css` — degradado accesible (agregar al final del bloque PORTFOLIO v2)**

```css
@media (prefers-reduced-motion: reduce) {
    /* El portal no anima (mente.js hace return temprano); asegurar que no tape nada. */
    .salida-portal { display: none; }
    /* Mostrar la lista de texto accesible bajo la pared. */
    .pf-fallback {
        display: block;
        width: min(88vw, 900px);
        margin: 2rem auto 0;
        color: var(--blanco);
    }
    .pf-fallback ul { margin: 0; padding-left: 1.2rem; }
    .pf-fallback li { margin: 0.2rem 0; font-family: var(--font-alt); opacity: 0.9; }
    /* Sin transiciones ni tilt en la pared (el JS ya no agrega .pf-anim ni el
       tilt bajo reduced-motion; esto cubre el resto). Cards visibles por defecto. */
    .pf-card-btn, .pf-card-btn::after, .pf-tag { transition: none; }
    .pf-card { opacity: 1; transform: none; }
}
```

- [ ] **Step 3: Verificar en el navegador**

En DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce". En `#portfolio`:
- Debajo de la pared aparece la **lista de texto** con los 14 trabajos y su categoría.
- El portal no se ve/interfiere; la sección `#portfolio` queda accesible directamente.
- Navegación por teclado: Tab recorre las cards (foco visible + tag), Enter abre el modal, dentro del modal Tab queda atrapado, Esc cierra.

- [ ] **Step 4: Commit**

```bash
git add portfolio.js styles.css
git commit -m "feat(portfolio): fallback accesible + degradado reduced-motion"
```

---

## Self-Review

**Spec coverage:**
- §5 transición portal (cerebro se desvanece → portal cápsula con "NOSOTROS RESOLVEMOS" → expande) → **Task 6**. ✅
- §6 pared plana (todos los works, scroll vertical, 16:9 + fallback, hover oscurece + tag, **deformación sutil: tilt al mouse + entrada al scrollear**) → **Tasks 1 (pared), 2 (hover/tag + tilt + entrada)**. ✅
- §7 modal (título, tag, herramientas-logos, descripción, media masonry/video, lightbox, cerrar X/Esc/click-afuera, focus trap) → **Tasks 3 (base+a11y), 4 (tools+desc), 5 (media+lightbox)**. ✅
- §8 datos (flatten + campos opcionales) → **Task 1**. ✅
- §9 wording "NOSOTROS RESOLVEMOS" → **Task 6**. ✅
- §10 remover v1 (coverflow/drill-in/drag/salida-intro) → **Tasks 1 (JS/CSS pared), 6 (salida-intro/exit-x)**. ✅
- §11 accesibilidad (fallback, reduced-motion, alt, foco) → **Tasks 3, 7** (+ alt/foco en 1). ✅

**Placeholder scan:** Sin "TBD/TODO" en pasos; todo el código escrito. `descripcion`/`video` vacíos y `works: []` de Web son estados de datos reales (contenido pendiente del equipo), no placeholders del plan — disparan "próximamente"/ocultamiento definidos. `tools` sembradas marcadas provisionales por constraint.

**Type consistency:** `WORKS` con `{title,portada,media,catKey,catLabel,hue,tools?,descripcion?,galeria?,video?}` usado igual en Tasks 1/3/4/5/7. Helpers `renderWall`, `hueFilter`, `open(index)`, `close`, `renderTools(work)`, `renderMedia(work)`, `openLightbox(list,i)`, `closeLightbox`, `stepLb(d)`, `renderFallback` definidos y referenciados con los mismos nombres. Clases CSS consistentes: `.pf-wall/.pf-card/.pf-card-btn/.pf-card-img/.pf-cap/.pf-tag` (pared), `.pf-anim`/`.is-in` (entrada), `.pf-modal*` (modal), `.pf-gallery/.pf-video/.pf-media-soon/.pf-lightbox/.pf-lb-*` (media), `.salida-portal/.salida-portal-word` (portal). Variables: `--card-hue` (tags/fallback), `--rx`/`--ry` (tilt de la card), `--salida-progress` (stage). Edición incremental de `portfolio.js`: Task 2 inserta el bloque de tilt/entrada **antes** de la línea `window.Portfolio = …`; Task 3 reemplaza esa línea + cierre (no toca el bloque de tilt); Task 7 inserta `renderFallback();` tras `renderWall();`. Sin colisiones de anclas. ✅

Nota de riesgo (tuning, no bloqueante): ritmo/tamaños de la expansión del portal (`260vmax`, umbrales de opacidad) y colores exactos del portal se afinan en vivo; aislados como valores en sus reglas.
