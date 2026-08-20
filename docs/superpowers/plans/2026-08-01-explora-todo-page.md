# Explorá Todo Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `explora.html` — a new page where visitors filter and search all 25 portfolio placeholder projects by category and by tool/software used, per `specs/02-explora-todo-page.md`.

**Architecture:** A third static page (`explora.html` + `explora.js` + `explora.css`), following the same self-contained-per-page pattern as `portfolio.html`/`portfolio.js`. It reads project data from a **new shared `data.js`** file, extracted from `portfolio.js`'s `CATEGORIES` object (see "Why `data.js`" below — this is a necessary addition beyond what the spec's file list named, discovered while planning).

**Tech Stack:** Vanilla HTML/CSS/JS, GSAP 3.12.5 (already loaded via CDN elsewhere in the site, no new dependency). No build step, no package.json, no test runner exists in this repo — every task's "test" is a concrete manual check (serve locally, open in the browser, run a one-line check in the DevTools console).

## Why `data.js` (a deviation worth flagging)

The spec (§3) describes `explora.js` reading "from a flattened version of `portfolio.js`'s `CATEGORIES` data." While mapping that out, I found it can't work by literally including `portfolio.js` on `explora.html`: `portfolio.js` has top-level code that assumes `portfolio.html`'s specific DOM (e.g. `document.querySelector(".cat-title").dataset.text = cat.title` runs unconditionally at the top level). On `explora.html`, `.cat-title` doesn't exist, so that line would throw immediately and halt the whole script — including the parts explora.js needs.

The fix: extract just the `CATEGORIES` object (plus a new `TOOLS` lookup table, needed for rendering tool chips/icons consistently) into their own file, `data.js`, with zero DOM side effects. Both `portfolio.html` and `explora.html` load `data.js` before their own page script. `portfolio.js` loses its inline `CATEGORIES` definition but is otherwise untouched — a mechanical, low-risk extraction, not a rewrite.

## Prerequisite (do this before Task 1)

Luly's in-progress Spec #1 work (the uncommitted changes to `portfolio.js`/`portfolio.css` — per-category hero animations + `proyectos` data) should be committed on its own first, so this plan's commits stay isolated to Spec #2 and don't get tangled with unrelated prior work. Whoever executes this plan should check `git status` and, if those files are still uncommitted, commit them separately before starting Task 1.

## Global Constraints

- No build step, no package manager, no test runner — vanilla HTML/CSS/JS only (CLAUDE.md).
- Colors only via existing CSS custom properties in `styles.css` (`--naranja`, `--azul`, `--lila`, `--amarillo`, `--verde-agua-claro`, `--negro`, `--blanco`, etc.) — never a hardcoded hex.
- Copy in Spanish (Argentine, informal), code comments in English.
- GSAP 3.12.5 via the same CDN `<script>` tag already used in `portfolio.html` — no new dependency.
- `prefers-reduced-motion: reduce` must disable stagger/entrance/exit animation, exactly matching the existing `reduceMotion` guard pattern in `portfolio.js`.
- 10 filterable tool keys (spec §4): `blender`, `substance`, `after-effects`, `illustrator`, `photoshop`, `figma`, `html`, `css`, `js`, `php`. `vs-code`/`vercel` logos stay unused.
- Filter combination logic (spec §5): category is single-select (AND against everything else); tools are multi-select (OR among selected tools, AND against category); search is live and ANDs on top of both.
- Cards are not clickable links (spec §7) — no project detail pages exist.
- Masonry grid (spec §8) — implemented as CSS multi-column (`columns:`), not fixed `nth-child` spans (the existing `.bento-item` grid hardcodes spans for exactly 5 items, which won't work for a grid whose visible count changes with every filter).

---

### Task 1: Extract shared data into `data.js`, add `tools` to all 25 projects

**Files:**
- Create: `data.js`
- Modify: `portfolio.js:38-140` (delete the `CATEGORIES` block — the erratic-type helpers above it and everything below it stay)
- Modify: `portfolio.html:16-17` (add `data.js` script tag before `portfolio.js`'s)

**Interfaces:**
- Produces: global `CATEGORIES` (same shape as before, each `proyectos` entry now also has `tools: [...]`), global `TOOLS` (`{ [key]: { label, logo } }`) — both consumed by every later task.

- [ ] **Step 1: Create `data.js` with `TOOLS` and the full `CATEGORIES` object (tools added)**

```js
// data.js — shared project data for the whole site. portfolio.html AND
// explora.html both load this (via a <script> tag) before their own page
// script. Has no DOM side effects — safe to include anywhere.
//
//   TOOLS      — the 10 filterable tool keys used by explora.js's chips and
//                every project card's tool-icon row. Never hardcode a logo
//                path or tool label anywhere else — always look it up here.
//   CATEGORIES — one entry per portfolio discipline (specs/01). Shape is
//                unchanged from before except each `proyectos` entry now
//                also has a `tools` array (specs/02 §4).
const TOOLS = {
    blender:         { label: "Blender",             logo: "resources/logos/Blender-Logo.png" },
    substance:       { label: "Substance 3D Painter", logo: "resources/logos/substance-3d-painter.png" },
    "after-effects": { label: "After Effects",        logo: "resources/logos/adobe-after-effects.png" },
    illustrator:     { label: "Illustrator",          logo: "resources/logos/adobe-illustrator.png" },
    photoshop:       { label: "Photoshop",            logo: "resources/logos/adobe-photoshop.png" },
    figma:           { label: "Figma",                logo: "resources/logos/figma.png" },
    html:            { label: "HTML",                 logo: "resources/logos/html-5.png" },
    css:             { label: "CSS",                  logo: "resources/logos/css-3.png" },
    js:              { label: "JavaScript",           logo: "resources/logos/js.png" },
    php:             { label: "PHP",                  logo: "resources/logos/php.png" },
};

const CATEGORIES = {
    "3d": {
        title: "3D",
        desc: "No es magia, es Cinema 4D, Blender, ZBrush y Substance, pero queda como magia. El realismo es nuestro extremo, y también el delirio de crear cosas que todavía no existen.",
        anim: "orbit",
        cutouts: [
            { src: "resources/cerebro.webp", depth: 42, pos: "cutout-left" },
            { src: "resources/ojo_1.webp",   depth: 26, pos: "cutout-right" },
        ],
        proyectos: [
            { title: "Cráneo Roto", blurb: "Estudio de anatomía low-poly con textura procedural.", tools: ["blender", "substance"] },
            { title: "Objeto Cotidiano #04", blurb: "Render fotorrealista de un objeto que no debería existir.", tools: ["blender", "substance"] },
            { title: "Personaje: Estática", blurb: "Rigging y pose de un personaje original para animación.", tools: ["blender"] },
            { title: "Entorno Abandonado", blurb: "Escena ambiental con iluminación volumétrica.", tools: ["blender", "substance"] },
            { title: "Prop Pack: Ciudad", blurb: "Set de props modulares para escenas urbanas.", tools: ["blender"] },
        ],
    },
    "web": {
        title: "Web",
        desc: "Se compila, se rompe, se arregla. Achicamos la distancia entre el Figma y el navegador de verdad: acá el pixel perfect se pelea con el deadline, y cada bug es una excusa para iterar más rápido.",
        anim: "typing",
        cutouts: [],
        proyectos: [
            { title: "Landing: Estudio X", blurb: "Sitio one-page con scroll-driven animation.", tools: ["figma", "html", "css", "js"] },
            { title: "Dashboard Interno", blurb: "Panel de datos con componentes reutilizables.", tools: ["figma", "html", "css", "js", "php"] },
            { title: "E-commerce Cápsula", blurb: "Tienda pequeña con carrito funcional.", tools: ["figma", "html", "css", "js", "php"] },
            { title: "Prototipo Interactivo", blurb: "Experimento de interacción con canvas/WebGL.", tools: ["html", "css", "js"] },
            { title: "Refactor: Sitio Viejo", blurb: "Migración de un sitio legacy a stack moderno.", tools: ["html", "css", "js", "php"] },
        ],
    },
    "grafico": {
        title: "Gráfico",
        desc: "Cortamos, pegamos, rompemos la grilla. Diseño que no pide permiso: tipografía que se superpone, capas que casi no calzan, orden que convive con el quilombo. Si entra en una grilla perfecta, no es nuestro.",
        anim: "misregistration",
        cutouts: [],
        proyectos: [
            { title: "Identidad: Estudio Ruido", blurb: "Sistema de marca completo, de logo a papelería.", tools: ["illustrator"] },
            { title: "Editorial: Revista Cero", blurb: "Diagramación de una revista independiente.", tools: ["illustrator", "photoshop"] },
            { title: "Serie de Afiches", blurb: "Colección de posters experimentales, técnica mixta.", tools: ["illustrator", "photoshop"] },
            { title: "Packaging: Línea Cruda", blurb: "Diseño de packaging para producto artesanal.", tools: ["illustrator", "photoshop"] },
            { title: "Tipografía Custom", blurb: "Fuente experimental diseñada desde cero.", tools: ["illustrator"] },
        ],
    },
    "campanas": {
        title: "Campañas",
        desc: "Hablamos fuerte porque nadie escucha bajito. Campañas pensadas para parar el scroll, no para acompañarlo: ideas con gancho, ejecutadas para que se note, en la calle, en la pantalla, donde sea.",
        anim: "marquee",
        cutouts: [],
        proyectos: [
            { title: "Campaña: Ruptura", blurb: "Campaña 360° para lanzamiento de producto.", tools: ["illustrator", "photoshop"] },
            { title: "Spot: 15 Segundos", blurb: "Guion y storyboard para spot de TV/redes.", tools: ["after-effects", "illustrator"] },
            { title: "Activación de Marca", blurb: "Concepto de activación experiencial en vía pública.", tools: ["illustrator", "photoshop"] },
            { title: "Serie Digital", blurb: "Set de piezas para pauta digital, formato cuadrado y vertical.", tools: ["photoshop", "illustrator"] },
            { title: "Rebranding: Antes/Después", blurb: "Caso de estudio de un reposicionamiento de marca.", tools: ["illustrator", "photoshop"] },
        ],
    },
    "motion": {
        title: "Motion",
        desc: "Acá nada se queda quieto. After Effects, Cinema 4D y litros de café para que todo se mueva como tiene que moverse… o como nunca te lo imaginaste. El movimiento es el mensaje.",
        anim: "kinetic",
        cutouts: [
            { src: "resources/megafono.webp", depth: 40, pos: "cutout-right" },
            { src: "resources/cerebro.webp",  depth: 24, pos: "cutout-left" },
        ],
        proyectos: [
            { title: "Loop: Pulso", blurb: "Animación en loop de 8 segundos, tipografía kinética.", tools: ["after-effects", "illustrator"] },
            { title: "Ident VAI VEN", blurb: "Cortina de marca de 5 segundos para redes.", tools: ["after-effects", "illustrator"] },
            { title: "Explainer: Cómo Funciona", blurb: "Motion explicativo con iconografía custom.", tools: ["after-effects", "illustrator"] },
            { title: "Transición Caótica", blurb: "Estudio de transiciones entre escenas.", tools: ["after-effects"] },
            { title: "Título Animado: Extremos", blurb: "Secuencia de títulos para un corto.", tools: ["after-effects"] },
        ],
    },
};
```

- [ ] **Step 2: Delete the `CATEGORIES` block from `portfolio.js`**

Remove lines 38–140 of `portfolio.js` (the `// --- Category config...` comment through the closing `};` of `CATEGORIES`). Leave the erratic-type helpers above (lines 1–36) and everything from the `// Pick the category from ?cat=` line onward completely untouched — they already reference `CATEGORIES` as a bare global, which now resolves to the one defined in `data.js`.

- [ ] **Step 3: Add the `data.js` script tag to `portfolio.html`**

In `portfolio.html`, change:

```html
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
    <script src="portfolio.js" defer></script>
```

to:

```html
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
    <!-- Shared project data (CATEGORIES + TOOLS) — must load before portfolio.js. -->
    <script src="data.js" defer></script>
    <script src="portfolio.js" defer></script>
```

- [ ] **Step 4: Verify no regression on the category pages**

Run: `python3 -m http.server 8080` from the project root, then open `http://localhost:8080/portfolio.html?cat=3d` (and repeat for `?cat=web`, `?cat=grafico`, `?cat=campanas`, `?cat=motion`).

Expected for each: the hero title/description and its own entrance animation still play exactly as before, the 5 Proyectos cards still show real titles/blurbs (not "01"–"05"), and the browser console (DevTools → Console) shows no errors. This confirms `data.js` loads before `portfolio.js` and nothing broke.

- [ ] **Step 5: Commit**

```bash
git add data.js portfolio.js portfolio.html
git commit -m "refactor: extract shared project data into data.js, add tool tags

Pulls CATEGORIES out of portfolio.js into a new side-effect-free data.js
so explora.js can read the same data without executing portfolio.js's
DOM-dependent code. Adds a tools array to all 25 proyectos entries and a
TOOLS lookup table, per specs/02-explora-todo-page.md."
```

---

### Task 2: Scaffold `explora.html` + `explora.css` page shell

**Files:**
- Create: `explora.html`
- Create: `explora.js`
- Create: `explora.css`

**Interfaces:**
- Consumes: `CATEGORIES`, `TOOLS` (from `data.js`, Task 1) — not used yet in this task, but the script tag order matters for later tasks.
- Produces: page shell with sections `#explora-hero`, `#contacto`, `#explora-browse`; nav linking to all 3; `PAGE_SECTIONS`, `setActiveSection(id)` (section-switching, same mechanism as `portfolio.js`); `reduceMotion` (module-level const, reused by Task 9).

- [ ] **Step 1: Create `explora.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Explorá todo · Vaiven</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Montserrat+Alternates:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="explora.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
    <!-- Shared project data (CATEGORIES + TOOLS) — must load before explora.js. -->
    <script src="data.js" defer></script>
    <script src="explora.js" defer></script>
</head>
<!-- .explora-page: like .portfolio-page, home/contacto behave like every
     other page (locked scroll, sidebar swaps sections). #explora-browse is
     the one exception — it scrolls INTERNALLY (see explora.css) because its
     filtered grid can hold up to 25 cards, too many to fit one viewport. -->
<body class="explora-page">
    <header>
        <a class="logo" href="index.html#hero" aria-label="Vai Ven — inicio">
            <img src="resources/logo_vaiven.webp" alt="Vai Ven" decoding="async">
        </a>
    </header>

    <main>
        <section class="explora-hero" id="explora-hero">
            <h1 class="explora-hero-title erratic" data-text="Explorá todo">Explorá todo</h1>
            <p class="explora-hero-desc">Los 25 proyectos, todas las categorías, en un solo lugar. Filtrá por categoría, por herramienta, o buscá directamente.</p>
        </section>

        <!-- Same #contacto as portfolio.html — reuses the home page's styles
             (lila bg, texture, hands, logos) for free, no CSS duplicated. -->
        <section id="contacto">
            <img class="contacto-hand contacto-hand-left" src="resources/mano.webp" alt="" aria-hidden="true" decoding="async">
            <img class="contacto-hand contacto-hand-right" src="resources/mano.webp" alt="" aria-hidden="true" decoding="async">
            <div class="contacto-content">
                <h2 class="contacto-title">
                    <span class="erratic line">NOS</span>
                    <span class="erratic line line-2">ENCONTRÁS</span>
                    <span class="erratic line line-3">ACÁ</span>
                </h2>
                <p class="contacto-subtitle">
                    <span class="erratic">Contactános… si te</span>
                    <span class="erratic">bancás la respuesta.</span>
                </p>
            </div>
            <div class="contacto-social">
                <a class="contacto-social-link contacto-ig" href="#" aria-label="Instagram">
                    <img src="resources/instagam_logo_grunge.webp" alt="Instagram" decoding="async">
                </a>
                <a class="contacto-social-link contacto-tiktok" href="#" aria-label="TikTok">
                    <img src="resources/tiktok_logo_grunge.webp" alt="TikTok" decoding="async">
                </a>
            </div>
        </section>

        <section class="explora-browse" id="explora-browse">
            <h2 class="explora-heading erratic" data-text="Todos los proyectos">Todos los proyectos</h2>

            <div class="explora-controls">
                <div class="explora-tabs" role="group" aria-label="Filtrar por categoría"></div>
                <div class="explora-chips" role="group" aria-label="Filtrar por herramienta"></div>
                <div class="explora-search-row">
                    <label for="explora-search" class="explora-search-label">Buscar proyectos</label>
                    <input type="search" id="explora-search" class="explora-search" placeholder="Buscar por título, categoría o herramienta...">
                </div>
                <div class="explora-status">
                    <span class="explora-count" aria-live="polite"></span>
                    <button type="button" class="explora-reset" hidden>Reiniciar filtros</button>
                </div>
            </div>

            <div class="explora-grid"></div>
            <p class="explora-empty" hidden>ACÁ NO HAY NADA. TODAVÍA.<span>Probá sacando algún filtro o cambiando la búsqueda.</span></p>
        </section>
    </main>

    <nav aria-label="Secciones">
        <ul>
            <li><a href="#explora-hero">home</a></li>
            <li><a href="#contacto">contacto</a></li>
            <li><a href="#explora-browse">explorar</a></li>
        </ul>
    </nav>

    <a href="index.html#portfolio" class="volver" aria-label="Volver al portfolio">
        <img src="resources/Volver.png" alt="" decoding="async">
    </a>
</body>
</html>
```

- [ ] **Step 2: Create `explora.js` (erratic type, section switching, hero fade-in)**

```js
// explora.js — behavior for the "Explorá todo" browsing page (explora.html).
// Self-contained, like portfolio.js — never touches the home page or the
// category-page script. Reads CATEGORIES + TOOLS from data.js (loaded
// before this file); never re-defines them.

// --- Erratic typography (same logic as portfolio.js / the home page) ------
const FAMILIES = ["mont", "malt"];
const WEIGHTS = ["w200", "w300", "w400", "w600", "w700", "w800"];

function jitter(letter) {
    letter.classList.add(FAMILIES[Math.random() < 0.5 ? 0 : 1]);
    letter.classList.add(WEIGHTS[Math.floor(Math.random() * WEIGHTS.length)]);
    if (Math.random() < 0.3) letter.classList.add("it");
    const y = (Math.random() * 6 - 3).toFixed(1);
    const r = (Math.random() * 2 - 1).toFixed(1);
    const s = (0.97 + Math.random() * 0.12).toFixed(2);
    letter.style.transform = `translateY(${y}px) rotate(${r}deg) scale(${s})`;
    letter.style.letterSpacing = (Math.random() * 1.1 - 0.2).toFixed(2) + "px";
}

function erraticize(el) {
    const text = el.dataset.text || el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    [...text].forEach((ch) => {
        const span = document.createElement("span");
        span.textContent = ch;
        span.setAttribute("aria-hidden", "true");
        jitter(span);
        el.appendChild(span);
    });
}

document.querySelectorAll(".erratic").forEach(erraticize);

// --- Section switching (same mechanism as portfolio.js / the home page) ---
const PAGE_SECTIONS = ["explora-hero", "contacto", "explora-browse"];

function setActiveSection(id) {
    if (!PAGE_SECTIONS.includes(id)) id = "explora-hero";
    document.querySelectorAll("main > section").forEach((s) => {
        if (s.id === id) s.setAttribute("data-active", "");
        else s.removeAttribute("data-active");
    });
    document.querySelectorAll("nav a").forEach((link) => {
        const href = link.getAttribute("href") || "";
        if (href === `#${id}`) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });
}

document.querySelectorAll('nav a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
        const id = (link.getAttribute("href") || "").slice(1);
        if (!PAGE_SECTIONS.includes(id)) return;
        e.preventDefault();
        history.replaceState(null, "", `#${id}`);
        setActiveSection(id);
    });
});

setActiveSection((location.hash || "#explora-hero").slice(1));
window.addEventListener("hashchange", () => {
    setActiveSection((location.hash || "#explora-hero").slice(1));
});

// --- Hero entrance: simple fade cascade (no bespoke signature needed here) -
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (typeof gsap !== "undefined" && !reduceMotion) {
    const heroLetters = gsap.utils.toArray(".explora-hero-title > span");
    const heroDesc = gsap.utils.toArray(".explora-hero-desc");
    gsap.set(heroDesc, { opacity: 0, y: 20 });
    gsap.set(heroLetters, { opacity: 0 });
    gsap.timeline({ defaults: { ease: "power2.out" } })
        .to(heroLetters, { opacity: 1, duration: 0.5, stagger: 0.015 })
        .to(heroDesc, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3");
}
```

- [ ] **Step 3: Create `explora.css` (page shell only — hero, browse section scaffold, nav-inherited)**

```css
/* ===================================================================
   EXPLORÁ TODO PAGE  (explora.html)
   -------------------------------------------------------------------
   Like portfolio.html, scroll is LOCKED site-wide (styles.css) and only
   the section with [data-active] shows, switched by the sidebar. The one
   exception is #explora-browse: it opts BACK into scrolling internally,
   because its filtered grid holds up to 25 cards — too many for one
   viewport. Scoped to .explora-page so it never touches other pages.
   =================================================================== */

.explora-page .explora-hero {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    overflow: hidden;
    background-color: var(--azul);
    color: var(--text-primary);
    font-family: "Montserrat Alternates", system-ui, sans-serif;
    padding: clamp(2rem, 6vh, 5rem) clamp(2rem, 6vw, 6rem);
}

.explora-hero-title {
    font-size: clamp(2.5rem, 9vw, 6rem);
    line-height: 0.95;
    text-transform: uppercase;
    color: var(--text-primary);
}

.explora-hero-desc {
    margin-top: 1.5rem;
    max-width: 40rem;
    font-size: clamp(1rem, 1.6vw, 1.3rem);
    color: var(--text-muted);
}

.explora-page .explora-browse {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    background-color: var(--azul);
    color: var(--text-primary);
    font-family: "Montserrat Alternates", system-ui, sans-serif;
    padding: clamp(2rem, 6vh, 4rem) clamp(1.5rem, 6vw, 4rem);
}

.explora-heading {
    font-size: clamp(2rem, 6vw, 4rem);
    text-transform: uppercase;
    margin-bottom: 1.5rem;
    flex-shrink: 0;
}

.explora-controls {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
    flex-shrink: 0;
}

.explora-tabs,
.explora-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
}
```

- [ ] **Step 4: Verify the shell loads and sections switch correctly**

Run: `python3 -m http.server 8080` (skip if still running from Task 1), open `http://localhost:8080/explora.html`.

Expected: the erratic "Explorá todo" headline plays its fade-in entrance; clicking "contacto" and "explorar" in the sidebar switches sections exactly like on `portfolio.html`; the "Volver" eye button link goes back to `index.html#portfolio`; DevTools console shows no errors (the empty `.explora-tabs`/`.explora-chips`/`.explora-grid` containers are expected — they're populated in later tasks).

- [ ] **Step 5: Commit**

```bash
git add explora.html explora.js explora.css
git commit -m "feat: scaffold the Explorá todo page shell

Adds explora.html/js/css with the hero, reused Contacto section, and an
empty browse section — following the same nav/section-switching pattern
as portfolio.html. Filtering and the project grid come in later commits."
```

---

### Task 3: Flatten `CATEGORIES` into a browsable list, render all 25 cards in a masonry grid

**Files:**
- Modify: `explora.js` (append)
- Modify: `explora.css` (append)

**Interfaces:**
- Consumes: `CATEGORIES`, `TOOLS` (from `data.js`).
- Produces: `ALL_PROJECTS` (array of `{ title, blurb, tools, slug, categoryTitle }`), `buildCard(project)`, `CARDS` (array of `{ project, el }`, in `ALL_PROJECTS` order) — every later task iterates `CARDS`.

- [ ] **Step 1: Append the data-flattening and card-building code to `explora.js`**

```js
// --- Flatten CATEGORIES into one browsable list ----------------------------
// Reads CATEGORIES from data.js. Order follows Object.entries insertion
// order — the same order CATEGORIES is declared in (3d, web, grafico,
// campanas, motion).
const ALL_PROJECTS = Object.entries(CATEGORIES).flatMap(([slug, cat]) =>
    (cat.proyectos || []).map((p) => ({ ...p, slug, categoryTitle: cat.title }))
);

function buildCard(project) {
    const el = document.createElement("article");
    el.className = "explora-card";

    const category = document.createElement("span");
    category.className = "explora-card-category";
    category.textContent = project.categoryTitle;

    const title = document.createElement("h3");
    title.className = "explora-card-title";
    title.textContent = project.title;

    const blurb = document.createElement("p");
    blurb.className = "explora-card-blurb";
    blurb.textContent = project.blurb;

    const toolRow = document.createElement("div");
    toolRow.className = "explora-card-tools";
    project.tools.forEach((key) => {
        const tool = TOOLS[key];
        if (!tool) return;
        const icon = document.createElement("img");
        icon.src = tool.logo;
        icon.alt = tool.label;
        icon.decoding = "async";
        icon.className = "explora-tool-icon";
        toolRow.appendChild(icon);
    });

    el.append(category, title, blurb, toolRow);
    return el;
}

const gridEl = document.querySelector(".explora-grid");
const CARDS = ALL_PROJECTS.map((project) => {
    const el = buildCard(project);
    gridEl.appendChild(el);
    return { project, el };
});
```

- [ ] **Step 2: Append the grid + card CSS to `explora.css`**

```css
.explora-grid {
    columns: 3 280px;
    column-gap: clamp(0.75rem, 1.5vw, 1.25rem);
}

@media (max-width: 767px) {
    .explora-grid { columns: 1 100%; }
}

.explora-card {
    break-inside: avoid;
    margin-bottom: clamp(0.75rem, 1.5vw, 1.25rem);
    padding: 1rem;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--azul), var(--negro));
    color: var(--text-primary);
    transition:
        transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
        box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.explora-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.4);
}

.explora-card-category {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--verde-agua-claro);
    margin-bottom: 0.4rem;
}

.explora-card-title {
    font-size: clamp(1rem, 1.6vw, 1.25rem);
    font-weight: 800;
    text-transform: uppercase;
    line-height: 1.1;
    margin-bottom: 0.4rem;
}

.explora-card-blurb {
    font-size: 0.85rem;
    line-height: 1.35;
    opacity: 0.85;
    margin-bottom: 0.6rem;
}

.explora-card-tools {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
}

.explora-tool-icon {
    width: 1.1rem;
    height: 1.1rem;
    object-fit: contain;
    opacity: 0.9;
}
```

- [ ] **Step 3: Verify all 25 cards render and the browse section scrolls**

Run: open `http://localhost:8080/explora.html`, go to the "explorar" section.

In the DevTools console, run:
```js
document.querySelectorAll('.explora-card').length
```
Expected: `25`.

Visually: cards appear in a 3-column masonry layout (1 column on narrow/mobile widths), each showing a category label, title, blurb, and its tool icons. Scroll with the mouse wheel/trackpad inside the "explorar" section — the grid scrolls while the header and sidebar nav stay fixed in place (confirms `overflow-y: auto` from Task 2 works now that there's enough content to overflow).

- [ ] **Step 4: Commit**

```bash
git add explora.js explora.css
git commit -m "feat: render all 25 projects in a masonry grid on Explorá todo"
```

---

### Task 4: Category filter (single-select tabs)

**Files:**
- Modify: `explora.js` (append)
- Modify: `explora.css` (append)

**Interfaces:**
- Consumes: `CATEGORIES`, `CARDS` (Task 3).
- Produces: `activeCategory` (state, default `"all"`), `matchesFilters(project)`, `toggleCard(el, show)`, `applyFilters()`, `tabsEl` — all extended/replaced by later tasks (Task 5 extends `matchesFilters`; Task 7 replaces `applyFilters`; Task 9 replaces `toggleCard`).

- [ ] **Step 1: Append filtering state + category tabs to `explora.js`**

```js
// --- Filtering state ---------------------------------------------------
let activeCategory = "all";

function matchesFilters(project) {
    if (activeCategory !== "all" && project.slug !== activeCategory) return false;
    return true;
}

function toggleCard(el, show) {
    el.hidden = !show;
}

function applyFilters() {
    CARDS.forEach(({ project, el }) => {
        toggleCard(el, matchesFilters(project));
    });
}

// --- Category tabs (single-select: "Todos" + the 5 categories) ------------
const CATEGORY_TABS = [
    { slug: "all", label: "Todos" },
    ...Object.entries(CATEGORIES).map(([slug, cat]) => ({ slug, label: cat.title })),
];

const tabsEl = document.querySelector(".explora-tabs");
CATEGORY_TABS.forEach(({ slug, label }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "explora-tab";
    btn.textContent = label;
    btn.dataset.slug = slug;
    btn.setAttribute("aria-pressed", String(slug === "all"));
    btn.addEventListener("click", () => {
        activeCategory = slug;
        tabsEl.querySelectorAll(".explora-tab").forEach((b) => {
            b.setAttribute("aria-pressed", String(b.dataset.slug === slug));
        });
        applyFilters();
    });
    tabsEl.appendChild(btn);
});
```

- [ ] **Step 2: Append tab styles to `explora.css`**

```css
.explora-tab {
    background: transparent;
    border: 1px solid var(--lila);
    color: var(--text-primary);
    padding: 0.5rem 1.25rem;
    border-radius: 8px;
    font-family: "Montserrat Alternates", system-ui, sans-serif;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease;
}

.explora-tab[aria-pressed="true"] {
    background-color: var(--naranja);
    border-color: var(--naranja);
    color: var(--negro);
}

.explora-tab:hover,
.explora-tab:focus-visible {
    transform: scale(1.04);
    outline: none;
}
```

- [ ] **Step 3: Verify category filtering**

Run: open `http://localhost:8080/explora.html`, go to "explorar".

Click each category tab in turn. In the DevTools console after each click, run:
```js
document.querySelectorAll('.explora-card:not([hidden])').length
```
Expected: `5` for each of the 5 real categories (3D, Web, Gráfico, Campañas, Motion), `25` for "Todos". Visually, only the matching category's cards remain in the grid, and the masonry reflows to fill the gaps.

- [ ] **Step 4: Commit**

```bash
git add explora.js explora.css
git commit -m "feat: add category filter tabs to Explorá todo"
```

---

### Task 5: Tool filter (multi-select chips, OR within tools / AND with category)

**Files:**
- Modify: `explora.js` (replace `matchesFilters`, append chips)
- Modify: `explora.css` (append)

**Interfaces:**
- Consumes: `TOOLS` (`data.js`), `applyFilters` (Task 4).
- Produces: `activeTools` (state, a `Set`), updated `matchesFilters(project)`, `chipsEl`.

- [ ] **Step 1: Replace `matchesFilters` in `explora.js` with the tools-aware version**

Replace the `matchesFilters` function from Task 4 with:

```js
const activeTools = new Set();

function matchesFilters(project) {
    if (activeCategory !== "all" && project.slug !== activeCategory) return false;
    if (activeTools.size > 0 && !project.tools.some((t) => activeTools.has(t))) return false;
    return true;
}
```

- [ ] **Step 2: Append tool chips to `explora.js`**

```js
// --- Tool chips (multi-select: OR among selected tools) -------------------
const chipsEl = document.querySelector(".explora-chips");
Object.entries(TOOLS).forEach(([key, tool]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "explora-chip";
    btn.dataset.tool = key;
    btn.setAttribute("aria-pressed", "false");

    const icon = document.createElement("img");
    icon.src = tool.logo;
    icon.alt = "";
    icon.decoding = "async";

    const label = document.createElement("span");
    label.textContent = tool.label;

    btn.append(icon, label);
    btn.addEventListener("click", () => {
        const nowActive = btn.getAttribute("aria-pressed") !== "true";
        btn.setAttribute("aria-pressed", String(nowActive));
        if (nowActive) activeTools.add(key); else activeTools.delete(key);
        applyFilters();
    });
    chipsEl.appendChild(btn);
});
```

- [ ] **Step 3: Append chip styles to `explora.css`**

```css
.explora-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(180, 180, 237, 0.18);
    border: 1px solid var(--lila);
    color: var(--text-primary);
    padding: 0.4rem 1rem 0.4rem 0.6rem;
    border-radius: 8px;
    font-family: "Montserrat Alternates", system-ui, sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease;
}

.explora-chip img {
    width: 1.1rem;
    height: 1.1rem;
    object-fit: contain;
}

.explora-chip[aria-pressed="true"] {
    background-color: var(--amarillo);
    border-color: var(--amarillo);
    color: var(--negro);
}

.explora-chip:hover,
.explora-chip:focus-visible {
    transform: scale(1.04);
    outline: none;
}
```

- [ ] **Step 4: Verify tool + category combination**

Run: open `http://localhost:8080/explora.html`, go to "explorar".

Click the "3D" category tab, then click the "Substance 3D Painter" chip. In the console:
```js
document.querySelectorAll('.explora-card:not([hidden])').length
```
Expected: `3` (Cráneo Roto, Objeto Cotidiano #04, Entorno Abandonado — the 3 of 5 "3D" projects tagged `substance`).

Now also click the "Blender" chip (2 tools active). Expected count: `5` (every 3D project has `blender`, `substance` still ANDed with category "3D" — but since tools combine with OR, any 3D project with either tag now matches, which is all 5). Click "Todos" to reset the category — the 2 active tool chips should now match projects from ANY category tagged `blender` OR `substance` (still just the 5 "3D" ones, since only 3D projects use those two keys).

- [ ] **Step 5: Commit**

```bash
git add explora.js explora.css
git commit -m "feat: add tool filter chips to Explorá todo (OR within, AND with category)"
```

---

### Task 6: Live search

**Files:**
- Modify: `explora.js` (replace `matchesFilters`, append search wiring)

**Interfaces:**
- Consumes: `TOOLS`, `applyFilters` (Task 4).
- Produces: `searchTerm` (state), updated `matchesFilters(project)`.

- [ ] **Step 1: Replace `matchesFilters` in `explora.js` with the search-aware version**

Replace the `matchesFilters` function from Task 5 with:

```js
let searchTerm = "";

function matchesFilters(project) {
    if (activeCategory !== "all" && project.slug !== activeCategory) return false;
    if (activeTools.size > 0 && !project.tools.some((t) => activeTools.has(t))) return false;
    if (searchTerm) {
        const haystack = [
            project.title,
            project.blurb,
            project.categoryTitle,
            ...project.tools.map((t) => (TOOLS[t] ? TOOLS[t].label : t)),
        ].join(" ").toLowerCase();
        if (!haystack.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
}
```

- [ ] **Step 2: Append search input wiring to `explora.js`**

```js
const searchInput = document.querySelector("#explora-search");
searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value.trim();
    applyFilters();
});
```

- [ ] **Step 3: Append search input styles to `explora.css`**

```css
.explora-search-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
}

.explora-search {
    width: 100%;
    max-width: 24rem;
    background-color: rgba(255, 255, 255, 0.12);
    border: 1px solid var(--lila);
    border-radius: 8px;
    padding: 0.6rem 1rem;
    color: var(--text-primary);
    font-family: "Montserrat Alternates", system-ui, sans-serif;
    font-size: 0.95rem;
}

.explora-search::placeholder {
    color: var(--text-muted);
}

.explora-search:focus-visible {
    outline: 2px solid var(--amarillo);
    outline-offset: 2px;
}
```

- [ ] **Step 4: Verify search narrows results**

Run: open `http://localhost:8080/explora.html`, go to "explorar", make sure "Todos" is active and no chips are pressed.

Type `figma` into the search box. In the console:
```js
document.querySelectorAll('.explora-card:not([hidden])').length
```
Expected: `3` (the 3 Web projects tagged `figma`). Clear the box — expected: back to `25`. Type `blender` — expected: `5` (Blender is tagged on all 5 3D projects, per Task 1's data).

- [ ] **Step 5: Commit**

```bash
git add explora.js explora.css
git commit -m "feat: add live search to Explorá todo (title/blurb/category/tool)"
```

---

### Task 7: Result counter + "Reiniciar filtros"

**Files:**
- Modify: `explora.js` (replace `applyFilters`, append counter/reset logic)
- Modify: `explora.css` (append)

**Interfaces:**
- Consumes: `activeCategory`, `activeTools`, `searchTerm`, `searchInput`, `tabsEl`, `chipsEl`, `CARDS`.
- Produces: `updateCounter(count)`, `hasActiveFilters()`, `updateResetVisibility()`, replaced `applyFilters()`.

- [ ] **Step 1: Append counter/reset elements and helpers, replace `applyFilters`, in `explora.js`**

```js
const counterEl = document.querySelector(".explora-count");
const resetBtn = document.querySelector(".explora-reset");

function updateCounter(count) {
    counterEl.textContent = `${count} proyecto${count === 1 ? "" : "s"}`;
}

function hasActiveFilters() {
    return activeCategory !== "all" || activeTools.size > 0 || searchTerm !== "";
}

function updateResetVisibility() {
    resetBtn.hidden = !hasActiveFilters();
}
```

Replace the `applyFilters` function (from Task 4) with:

```js
function applyFilters() {
    let visibleCount = 0;
    CARDS.forEach(({ project, el }) => {
        const match = matchesFilters(project);
        toggleCard(el, match);
        if (match) visibleCount++;
    });
    updateCounter(visibleCount);
    updateResetVisibility();
}
```

- [ ] **Step 2: Append the reset button handler and the initial paint call to `explora.js`**

```js
resetBtn.addEventListener("click", () => {
    activeCategory = "all";
    activeTools.clear();
    searchTerm = "";
    searchInput.value = "";
    tabsEl.querySelectorAll(".explora-tab").forEach((b) => {
        b.setAttribute("aria-pressed", String(b.dataset.slug === "all"));
    });
    chipsEl.querySelectorAll(".explora-chip").forEach((b) => b.setAttribute("aria-pressed", "false"));
    applyFilters();
});

applyFilters(); // initial paint: sets the counter + reset visibility on load
```

- [ ] **Step 3: Append status row styles to `explora.css`**

```css
.explora-status {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.9rem;
}

.explora-count {
    opacity: 0.85;
}

.explora-reset {
    background: transparent;
    border: none;
    color: var(--verde-agua-claro);
    text-decoration: underline;
    cursor: pointer;
    font-family: "Montserrat Alternates", system-ui, sans-serif;
    font-weight: 600;
}
```

- [ ] **Step 4: Verify the counter and reset control**

Run: open `http://localhost:8080/explora.html`, go to "explorar".

On load, the text next to the grid should read "25 proyectos" and "Reiniciar filtros" should be hidden (no filters active). Click any category tab or chip, or type in search — the counter updates to match the visible card count, and "Reiniciar filtros" appears. Click it — everything clears back to "25 proyectos", no active tab but "Todos", no pressed chips, empty search box.

- [ ] **Step 5: Commit**

```bash
git add explora.js explora.css
git commit -m "feat: add result counter and reset-filters control to Explorá todo"
```

---

### Task 8: Empty state

**Files:**
- Modify: `explora.js` (replace `applyFilters`, append empty-state helper)
- Modify: `explora.css` (append)

**Interfaces:**
- Consumes: `gridEl` (Task 3), `applyFilters` (Task 7).
- Produces: `toggleEmptyState(isEmpty)`, replaced `applyFilters()`.

- [ ] **Step 1: Append the empty-state element reference and helper, replace `applyFilters`, in `explora.js`**

```js
const emptyEl = document.querySelector(".explora-empty");

function toggleEmptyState(isEmpty) {
    emptyEl.hidden = !isEmpty;
    gridEl.hidden = isEmpty;
}
```

Replace the `applyFilters` function (from Task 7) with:

```js
function applyFilters() {
    let visibleCount = 0;
    CARDS.forEach(({ project, el }) => {
        const match = matchesFilters(project);
        toggleCard(el, match);
        if (match) visibleCount++;
    });
    updateCounter(visibleCount);
    updateResetVisibility();
    toggleEmptyState(visibleCount === 0);
}
```

- [ ] **Step 2: Append empty-state styles to `explora.css`**

```css
.explora-empty {
    text-align: center;
    padding: 3rem 1rem;
    font-size: clamp(1.3rem, 3vw, 2rem);
    font-weight: 800;
    text-transform: uppercase;
    color: var(--text-primary);
}

.explora-empty span {
    display: block;
    margin-top: 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    text-transform: none;
    color: var(--text-muted);
}
```

- [ ] **Step 3: Verify the empty state**

Run: open `http://localhost:8080/explora.html`, go to "explorar".

Click the "Web" category tab, then click the "Blender" chip (no Web project uses Blender). Expected: the grid disappears, replaced by "ACÁ NO HAY NADA. TODAVÍA." with its subtext, and the counter reads "0 proyectos". Click "Reiniciar filtros" — the grid reappears with all 25 cards and the message disappears.

- [ ] **Step 4: Commit**

```bash
git add explora.js explora.css
git commit -m "feat: add empty-state message to Explorá todo for zero-match filters"
```

---

### Task 9: Animate filter changes with GSAP, respect reduced motion

**Files:**
- Modify: `explora.js` (replace `toggleCard`)

**Interfaces:**
- Consumes: `reduceMotion` (declared in Task 2 — do not redeclare it here).
- Produces: replaced `toggleCard(el, show)`.

- [ ] **Step 1: Replace `toggleCard` in `explora.js` with the animated version**

Replace the `toggleCard` function (from Task 4) with:

```js
function toggleCard(el, show) {
    if (reduceMotion || typeof gsap === "undefined") {
        el.hidden = !show;
        return;
    }
    if (show && el.hidden) {
        el.hidden = false;
        gsap.fromTo(el, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" });
    } else if (!show && !el.hidden) {
        gsap.to(el, {
            opacity: 0,
            scale: 0.92,
            duration: 0.25,
            ease: "power2.in",
            onComplete: () => { el.hidden = true; },
        });
    }
}
```

- [ ] **Step 2: Verify animated filtering under normal motion settings**

Run: open `http://localhost:8080/explora.html`, go to "explorar". Click between category tabs a few times.

Expected: cards that no longer match fade and shrink out (not an instant snap) before disappearing from the masonry flow; cards that newly match fade and grow in. No layout jump or flicker.

- [ ] **Step 3: Verify instant behavior under reduced motion**

In Chrome DevTools: Cmd+Shift+P → "Show Rendering" → set "Emulate CSS media feature prefers-reduced-motion" to `reduce`. Reload `explora.html`, go to "explorar", click between category tabs again.

Expected: cards show/hide instantly, no fade/scale animation, no console errors.

- [ ] **Step 4: Commit**

```bash
git add explora.js
git commit -m "feat: animate Explorá todo filter changes with GSAP, respect reduced motion"
```

---

### Task 10: Wire the entry point

**Files:**
- Modify: `index.html:265`

**Interfaces:** none (leaf task).

- [ ] **Step 1: Update the Destacados CTA link**

In `index.html`, change:

```html
<a class="destacados-cta-ghost" href="#portfolio">Explorá todo</a>
```

to:

```html
<a class="destacados-cta-ghost" href="explora.html">Explorá todo</a>
```

- [ ] **Step 2: Verify the entry point**

Run: open `http://localhost:8080/index.html`, scroll/navigate to the Destacados section, click "Explorá todo".

Expected: navigates to `explora.html`, landing on its hero section.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: point the Destacados 'Explorá todo' CTA at the new page"
```

---

## Definition of Done (maps to `specs/02-explora-todo-page.md` §12)

- [ ] All 25 `proyectos` entries have a `tools` array (Task 1).
- [ ] `explora.html` + `explora.js` + `explora.css` exist and render hero + filter/search/grid + reused Contacto (Tasks 2–3).
- [ ] Category (single-select) and tool (multi-select) filters combine correctly (Tasks 4–5).
- [ ] Live search narrows across title/blurb/tool/category text (Task 6).
- [ ] Counter + reset control work (Task 7).
- [ ] Empty state appears for zero-match combinations (Task 8).
- [ ] Cards show category/title/blurb/tools, not clickable (Task 3).
- [ ] Masonry grid animates on filter change; instant under reduced motion (Task 9).
- [ ] Destacados CTA points to `explora.html` (Task 10).
- [ ] Filter controls are keyboard-accessible with correct ARIA state (baked into Tasks 4, 5, 6, 7).
