# Portfolio — Carrusel 3D + transición desde el cerebro · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el stub `#portfolio` por una isla interactiva: un carrusel 3D coverflow de dos niveles (5 categorías → trabajos de cada categoría), y una transición en la que el cerebro vibra y sale por la izquierda mientras el portfolio entra por la derecha.

**Architecture:** Sitio estático vanilla (HTML/CSS/JS, sin build ni framework). Datos en un módulo propio (`portfolio-data.js`, expone `window.PORTFOLIO`). Render e interacción en otro módulo (`portfolio.js`, expone `window.Portfolio`). El coverflow es CSS 3D (`perspective` + `rotateY`/`translateZ`). La transición de salida del cerebro se agrega a `mente.js` (dueño del escenario sticky) como una fase nueva (`--salida-progress`).

**Tech Stack:** HTML5, CSS3 (custom properties, transforms 3D), JavaScript vanilla (ES2015+, IIFE como el resto del repo). Sin librerías. Sin test runner.

## Global Constraints

- **Vanilla-first.** Sin librerías nuevas ni build step. Módulos como IIFE con `"use strict"`, igual que `mente.js`/`erratic.js`.
- **Colores solo por tokens.** Nunca hex hardcodeado. Tokens en `styles.css :root` (`--azul #2222A0`, `--violeta-claro #511F99`, `--negro`, `--blanco`, `--naranja`, etc.).
- **Cards 16:9 a sangre** con `object-fit: cover`. Sin letterbox. Fallback donde falte portada: fondo en brain-hue + título (nunca recorte feo).
- **Brain-hue por disciplina** = array `BEAT_HUE = [340, 200, 10, 140, 210]` (ya existe en `mente.js`, en el orden de `DISCIPLINES`). Se reusa como fuente de verdad; se duplica el array en `portfolio-data.js` con un comentario que apunta a `mente.js`.
- **Idioma:** comentarios de código en inglés; copy/contenido en español (argentino).
- **Naming:** kebab-case para archivos y clases CSS.
- **Accesibilidad:** WCAG AA — navegación por teclado, `prefers-reduced-motion` y `touch` con fallback estático legible.
- **Copy provisional:** títulos de trabajos derivados de nombres de archivo son placeholders; NO inventar autores (van `autor` omitido). Ver CLAUDE.md.
- **No test runner.** Cada tarea cierra con **verificación visual en Chrome**. Servir con `python -m http.server 8080` (o `npx serve .`) y abrir en Chrome:
  `& "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:8080"`

---

## File Structure

- **Create** `portfolio-data.js` — datos puros: `window.PORTFOLIO` (array de disciplinas con works y portadas). Sin lógica de DOM.
- **Create** `portfolio.js` — render + interacción del carrusel: `window.Portfolio`. Consume `window.PORTFOLIO`.
- **Modify** `index.html` — reemplazar el stub `#portfolio`; agregar `<script>` de los dos módulos; agregar capa `.salida-intro` dentro de `.mente-stage`.
- **Modify** `styles.css` — CSS del carrusel/cards/chips (bloque nuevo al final) + reglas de la fase salida del cerebro y de `.salida-intro`.
- **Modify** `mente.js` — agregar la fase `--salida-progress` (vibración + salida a la izquierda del cerebro; empuje de `.salida-intro`).

Referencia viva del diseño: `docs/superpowers/specs/2026-09-15-portfolio-carrusel-3d-design.md`.

---

### Task 1: Módulo de datos del portfolio

**Files:**
- Create: `portfolio-data.js`
- Modify: `index.html` (agregar `<script src="portfolio-data.js" defer></script>` en `<head>`, antes de `portfolio.js`)

**Interfaces:**
- Produces: `window.PORTFOLIO` — `Array<Category>` donde
  `Category = { key: string, label: string, hue: number, portada: string|null, works: Work[] }`
  y `Work = { title: string, portada: string|null, media: "image"|"video" }`.
  `hue` en grados (para `filter: sepia(1) saturate(4) hue-rotate(<hue>deg)` o `hsl`).
  `portada` = ruta a imagen 16:9, o `null` (dispara fallback brain-hue).

- [ ] **Step 1: Crear `portfolio-data.js` con los datos reales**

```javascript
// Portfolio data — single source for the 3D carousel (portfolio.js consumes it).
// Categories are in the same order/hue as DISCIPLINES/BEAT_HUE in mente.js so the
// portfolio re-uses the brain's per-discipline color. Keep the two in sync.
// Copy note: work titles derived from filenames are PROVISIONAL placeholders;
// authors are intentionally omitted (do not invent — see CLAUDE.md).
(() => {
    "use strict";
    // hue per discipline — mirror of BEAT_HUE in mente.js (deg).
    window.PORTFOLIO = [
        {
            key: "grafico",
            label: "Ilustración y Diseño Gráfico",
            hue: 340,
            portada: null, // 16:9 cover pending (design team) → brain-hue fallback
            works: [
                { title: "Inari",        portada: null, media: "image" },
                { title: "Lightyear",    portada: null, media: "image" },
                { title: "Perfume",      portada: null, media: "image" },
                { title: "Infinity War", portada: null, media: "image" },
                { title: "Interstellar", portada: null, media: "image" },
            ],
        },
        {
            key: "modelado3d",
            label: "Modelado 3D",
            hue: 200,
            portada: null,
            works: [
                { title: "Caja de fantasía",        portada: null, media: "image" },
                { title: "Máquina expendedora",     portada: null, media: "image" },
                { title: "Personaje toon",          portada: null, media: "image" },
            ],
        },
        {
            key: "motion",
            label: "Motion Graphics",
            hue: 10,
            portada: "resources/portadas/motion/sandman.png", // category cover
            works: [
                { title: "The Sandman",      portada: "resources/portadas/motion/sandman.png",          media: "video" },
                { title: "Club Ruido",       portada: "resources/portadas/motion/clubRuido.png",        media: "video" },
                { title: "Ctrl Lost",        portada: "resources/portadas/motion/ctrlLostt.png",        media: "video" },
                { title: "Tiger Woods",      portada: "resources/portadas/motion/tiger_woods.png",      media: "video" },
                { title: "Beautiful",        portada: "resources/portadas/motion/beautiful_webinar.png", media: "video" },
            ],
        },
        {
            key: "web",
            label: "Desarrollo web",
            hue: 140,
            portada: null,
            works: [], // assets pending
        },
        {
            key: "campanas",
            label: "Campañas publicitarias",
            hue: 210,
            portada: "resources/portadas/campanas/portadas.webp",
            works: [
                { title: "Proyecto Hocicos Contentos", portada: "resources/portadas/campanas/portadas.webp", media: "video" },
            ],
        },
    ];
})();
```

- [ ] **Step 2: Enganchar el script en `index.html`**

En `<head>`, después de la línea de `mente.js` (línea ~19), agregar:

```html
    <!-- Portfolio: datos (array de disciplinas) + carrusel 3D de dos niveles.
         Ref: docs/superpowers/specs/2026-09-15-portfolio-carrusel-3d-design.md -->
    <script src="portfolio-data.js" defer></script>
    <script src="portfolio.js" defer></script>
```

(`portfolio.js` todavía no existe; se crea en la Task 2. El `defer` evita error de carga bloqueante; la consola puede mostrar 404 de `portfolio.js` hasta la Task 2 — esperado.)

- [ ] **Step 3: Verificar en el navegador**

Servir y abrir Chrome. En DevTools → Console, ejecutar:
```js
console.log(window.PORTFOLIO.length, window.PORTFOLIO.map(c => c.key));
```
Esperado: `5 (5) ['grafico','modelado3d','motion','web','campanas']`. Sin errores de sintaxis del módulo de datos (el 404 de `portfolio.js` es esperado en este punto).

- [ ] **Step 4: Commit**

```bash
git add portfolio-data.js index.html
git commit -m "feat(portfolio): módulo de datos (disciplinas + works + portadas)"
```

---

### Task 2: Sección portfolio + render de Nivel 1 (categorías, layout plano)

Reemplaza el stub y renderiza las 5 tarjetas de categoría en una fila plana (sin 3D todavía). Deja el carrusel visible y correcto en cuanto a cards 16:9, brain-hue y fallback.

**Files:**
- Create: `portfolio.js`
- Modify: `index.html` (reemplazar `<section id="portfolio">…</section>`)
- Modify: `styles.css` (bloque nuevo al final: sección + cards)

**Interfaces:**
- Consumes: `window.PORTFOLIO` (Task 1).
- Produces: `window.Portfolio = { init(), state, go(delta), openCategory(key), back(), render() }`.
  `render()` puebla `#portfolio .pf-track` con `.pf-card` según `state.level` (0=categorías, 1=works) y `state.activeCat`.
  Helper `hueFilter(hue) → string` (el filtro CSS del brain-hue), reutilizado por cards y por el re-iluminado (Task 4).

- [ ] **Step 1: Reemplazar el stub en `index.html`**

Reemplazar exactamente:
```html
        <section id="portfolio" class="zona-color">
            <h2>portfolio</h2>
        </section>
```
por:
```html
        <!-- Portfolio: isla interactiva. Carrusel 3D de dos niveles (categorías →
             trabajos). Render e interacción: portfolio.js. Fallback estático
             accesible dentro de .pf-fallback (visible bajo reduced-motion). -->
        <section id="portfolio" class="zona-portfolio" aria-label="Portfolio">
            <div class="pf-head">
                <h2 class="pf-title erratic" data-text="portfolio">portfolio</h2>
                <p class="pf-crumb" aria-live="polite"></p>
            </div>

            <div class="pf-stage">
                <button class="pf-nav pf-prev" type="button" aria-label="Anterior">◂</button>
                <div class="pf-viewport">
                    <ul class="pf-track" role="list"></ul>
                </div>
                <button class="pf-nav pf-next" type="button" aria-label="Siguiente">▸</button>
            </div>

            <button class="pf-back" type="button" hidden>← volver</button>
            <p class="pf-cue" aria-hidden="true">seguí ↓</p>

            <!-- Fallback estático accesible (lectores de pantalla siempre; visible
                 como lista bajo reduced-motion). Lo puebla portfolio.js. -->
            <div class="pf-fallback"></div>
        </section>
```

- [ ] **Step 2: Crear `portfolio.js` con el render de Nivel 1 (plano)**

```javascript
// Portfolio — carrusel 3D de dos niveles (categorías → trabajos).
// Task 2: render plano de Nivel 1. El coverflow 3D (Task 3), el drill-in
// (Task 4) y la accesibilidad (Task 6) se agregan encima.
// Ref: docs/superpowers/specs/2026-09-15-portfolio-carrusel-3d-design.md
(() => {
    "use strict";
    const section = document.querySelector("#portfolio");
    if (!section || !window.PORTFOLIO) return;

    const track = section.querySelector(".pf-track");
    const crumb = section.querySelector(".pf-crumb");
    const backBtn = section.querySelector(".pf-back");

    // Brain-hue → filtro CSS. Igual que el placeholder de mente.js: sepia+saturate
    // aportan saturación para que el hue-rotate SÍ tiña una imagen/fondo neutro.
    const hueFilter = (hue) => `sepia(1) saturate(4) hue-rotate(${hue}deg)`;

    const state = { level: 0, activeCat: null, center: 0 };

    // Construye una card (categoría o work). `item` tiene {label|title, portada, hue}.
    const makeCard = (item, hue) => {
        const li = document.createElement("li");
        li.className = "pf-card";
        const name = item.label || item.title;
        if (item.portada) {
            const img = document.createElement("img");
            img.className = "pf-card-img";
            img.src = item.portada;
            img.alt = name;
            img.decoding = "async";
            li.appendChild(img);
        } else {
            // Fallback: fondo en brain-hue (sin imagen recortada).
            li.classList.add("pf-card--fallback");
            li.style.setProperty("--card-hue", String(hue));
        }
        const cap = document.createElement("span");
        cap.className = "pf-card-cap";
        cap.textContent = name;
        li.appendChild(cap);
        return li;
    };

    const render = () => {
        track.innerHTML = "";
        if (state.level === 0) {
            crumb.textContent = "";
            backBtn.hidden = true;
            window.PORTFOLIO.forEach((cat) => {
                const card = makeCard(cat, cat.hue);
                card.dataset.cat = cat.key;
                track.appendChild(card);
            });
        } else {
            const cat = window.PORTFOLIO.find((c) => c.key === state.activeCat);
            crumb.textContent = cat.label;
            backBtn.hidden = false;
            if (!cat.works.length) {
                const li = document.createElement("li");
                li.className = "pf-card pf-card--soon";
                li.style.setProperty("--card-hue", String(cat.hue));
                li.innerHTML = '<span class="pf-card-cap">próximamente</span>';
                track.appendChild(li);
            } else {
                cat.works.forEach((w) => track.appendChild(makeCard(w, cat.hue)));
            }
        }
    };

    const init = () => { render(); };

    window.Portfolio = { init, state, render, hueFilter };
    init();
})();
```

- [ ] **Step 3: CSS de la sección + cards (bloque nuevo al FINAL de `styles.css`)**

```css
/* ==========================================================================
   PORTFOLIO — isla interactiva, carrusel de dos niveles
   Task 2: sección + cards 16:9. El coverflow 3D lo agrega la Task 3.
   Ref: docs/superpowers/specs/2026-09-15-portfolio-carrusel-3d-design.md
   ========================================================================== */
.zona-portfolio {
    position: relative;
    min-height: 100vh;
    flex-direction: column;
    gap: 2rem;
    background: var(--violeta-claro);   /* nueva sala del interior (tunable) */
    color: var(--blanco);
    overflow: hidden;
}

.pf-head { text-align: center; }
.pf-title {
    margin: 0;
    font-size: clamp(2rem, 7vw, 4.5rem);
    font-weight: 800;
    text-transform: lowercase;
    opacity: 1;                 /* no es un stub: rótulo real */
}
.pf-crumb {
    margin: 0.25rem 0 0;
    min-height: 1.2em;
    font-family: var(--font-alt);
    letter-spacing: 0.04em;
    opacity: 0.85;
}

.pf-stage {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
}
.pf-viewport { width: min(88vw, 1100px); }

/* Task 2: fila plana. La Task 3 la convierte en coverflow 3D. */
.pf-track {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

/* Card: marco fijo 16:9 a sangre. */
.pf-card {
    position: relative;
    width: min(46vw, 420px);
    aspect-ratio: 16 / 9;
    border-radius: 8px;
    overflow: hidden;
    background: var(--negro);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
}
.pf-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;          /* 16:9 a sangre, sin letterbox */
    display: block;
}
/* Fallback sin portada: fondo teñido en el brain-hue de la disciplina. */
.pf-card--fallback,
.pf-card--soon {
    background:
        linear-gradient(135deg, rgba(255,255,255,0.12), rgba(0,0,0,0.35)),
        var(--negro);
    filter: sepia(1) saturate(4) hue-rotate(calc(var(--card-hue, 0) * 1deg));
}
.pf-card-cap {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    padding: 0.6rem 0.8rem;
    font-family: var(--font-alt);
    font-weight: 700;
    text-align: left;
    color: var(--blanco);
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
}

.pf-nav {
    flex: none;
    width: 44px; height: 44px;
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 50%;
    background: transparent;
    color: var(--blanco);
    font-size: 1.2rem;
    cursor: pointer;
}
.pf-nav:hover,
.pf-nav:focus-visible { background: rgba(255,255,255,0.15); }

.pf-back {
    align-self: center;
    border: none;
    background: transparent;
    color: var(--blanco);
    font-family: var(--font-alt);
    font-size: 1rem;
    cursor: pointer;
    opacity: 0.85;
}
.pf-back:hover { opacity: 1; }

.pf-cue {
    position: absolute;
    left: 50%; bottom: 1.2rem;
    translate: -50% 0;
    margin: 0;
    font-family: var(--font-alt);
    opacity: 0.7;
    animation: pf-cue-bob 1.8s ease-in-out infinite;
}
@keyframes pf-cue-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

.pf-fallback { display: none; }   /* solo visible bajo reduced-motion (Task 6) */
```

- [ ] **Step 4: Verificar en el navegador**

Servir y abrir Chrome en `#portfolio` (scrollear hasta el final o `location.hash="#portfolio"`). Esperado:
- 5 tarjetas 16:9. Motion y Campañas muestran su portada real; Gráfico, 3D y Web muestran fondo teñido (fallback) con el título.
- Cada fallback tiene un tinte distinto (hues 340/200/140).
- Los botones `◂ ▸`, `← volver` (oculto) y `seguí ↓` se ven. Sin errores en consola.

- [ ] **Step 5: Commit**

```bash
git add portfolio.js index.html styles.css
git commit -m "feat(portfolio): sección + render Nivel 1 (cards 16:9, fallback brain-hue)"
```

---

### Task 3: Coverflow 3D + navegación lateral (flechas, drag, teclado)

Convierte la fila plana en un coverflow: card central grande y de frente, laterales rotadas en perspectiva y hundidas en Z. Navegación por flechas, arrastre y teclado.

**Files:**
- Modify: `portfolio.js` (posicionamiento 3D + control de `center` + eventos)
- Modify: `styles.css` (perspective en viewport, transición de cards, quitar wrap)

**Interfaces:**
- Consumes: `window.Portfolio` (Task 2), `state.center`.
- Produces: `layout()` (posiciona cada `.pf-card` según su offset al `center`), `go(delta)` (mueve el centro con clamp), enganchados a flechas/teclado/drag.

- [ ] **Step 1: CSS — perspective + transición 3D**

Reemplazar la regla `.pf-track` (fila plana) por la versión 3D y sumar el estilo de cards posicionadas:
```css
.pf-viewport {
    width: min(92vw, 1100px);
    perspective: 1400px;         /* profundidad del coverflow */
    perspective-origin: 50% 50%;
}
.pf-track {
    list-style: none;
    margin: 0; padding: 0;
    position: relative;
    height: clamp(160px, 26vw, 236px);  /* ≈ alto de una card 16:9 */
    transform-style: preserve-3d;
}
.pf-card {
    position: absolute;
    left: 50%; top: 50%;
    width: min(46vw, 420px);
    aspect-ratio: 16 / 9;
    /* JS setea --x (px), --rot (deg), --z (px), --s (scale), --op, z-index */
    transform:
        translate(-50%, -50%)
        translateX(var(--x, 0))
        translateZ(var(--z, 0))
        rotateY(var(--rot, 0))
        scale(var(--s, 1));
    opacity: var(--op, 1);
    transition: transform 0.45s cubic-bezier(.22,.61,.36,1), opacity 0.45s ease;
    cursor: pointer;
    /* (mantener border-radius/overflow/background/box-shadow de la Task 2) */
}
.pf-card--center { cursor: default; }
```

- [ ] **Step 2: `portfolio.js` — función `layout()` y estado de centro**

Agregar dentro del IIFE (antes de `init`), y llamar `layout()` al final de `render()`:
```javascript
    // Coverflow tunables (afinables en vivo).
    const GAP = 300;    // px de separación lateral entre cards vecinas
    const ANGLE = 38;   // deg de rotación por paso
    const DEPTH = 140;  // px de hundimiento en Z por paso
    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

    const cards = () => Array.from(track.children);

    const layout = () => {
        const list = cards();
        state.center = clamp(state.center, 0, Math.max(0, list.length - 1));
        list.forEach((card, i) => {
            const k = i - state.center;            // offset con signo al centro
            const ak = Math.abs(k);
            card.style.setProperty("--x", (k * GAP) + "px");
            card.style.setProperty("--rot", (-k * ANGLE) + "deg");
            card.style.setProperty("--z", (-ak * DEPTH) + "px");
            card.style.setProperty("--s", (1 - Math.min(ak, 3) * 0.06).toFixed(3));
            card.style.setProperty("--op", ak > 3 ? "0" : (1 - ak * 0.18).toFixed(2));
            card.style.zIndex = String(100 - ak);
            card.classList.toggle("pf-card--center", k === 0);
        });
    };

    const go = (delta) => { state.center += delta; layout(); };
```
En `render()`, al final agregar: si es Nivel 0, `state.center` arranca centrado (índice del medio, `Math.floor(list.length/2)`); llamar `layout()`. Reescribir el final de `render()`:
```javascript
        // centrar el carrusel y posicionar en 3D
        state.center = Math.floor(track.children.length / 2);
        layout();
```

- [ ] **Step 3: `portfolio.js` — eventos (flechas, teclado, drag, click-para-centrar)**

Agregar en `init()`:
```javascript
    const init = () => {
        render();
        section.querySelector(".pf-prev").addEventListener("click", () => go(-1));
        section.querySelector(".pf-next").addEventListener("click", () => go(1));

        // teclado: ← → mueven el centro cuando el foco está en la sección
        section.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") { go(-1); e.preventDefault(); }
            if (e.key === "ArrowRight") { go(1); e.preventDefault(); }
        });

        // click en una card lateral → la trae al centro
        track.addEventListener("click", (e) => {
            const card = e.target.closest(".pf-card");
            if (!card) return;
            const i = cards().indexOf(card);
            if (i !== state.center) { state.center = i; layout(); }
        });

        // drag lateral (pointer): cada ~90px de arrastre = un paso
        let dragX = null, moved = 0;
        track.addEventListener("pointerdown", (e) => { dragX = e.clientX; moved = 0; });
        window.addEventListener("pointermove", (e) => {
            if (dragX === null) return;
            const dx = e.clientX - dragX;
            if (Math.abs(dx) > 90) { go(dx < 0 ? 1 : -1); dragX = e.clientX; moved++; }
        });
        window.addEventListener("pointerup", () => { dragX = null; });
    };
```
Hacer la sección enfocable: en `index.html`, agregar `tabindex="0"` al `<section id="portfolio" …>` (para que reciba `keydown`).

- [ ] **Step 4: Verificar en el navegador**

En `#portfolio`, esperado:
- Las 5 cards forman un arco 3D: la central grande y de frente, las de los lados rotadas hacia atrás y más chicas/tenues.
- `◂ ▸` mueven el centro con animación suave; clic en una card lateral la trae al centro; arrastrar de costado avanza; con foco en la sección, `←/→` funcionan.
- El centro no se pasa de los extremos (clamp).

- [ ] **Step 5: Commit**

```bash
git add portfolio.js styles.css index.html
git commit -m "feat(portfolio): coverflow 3D + navegación lateral (flechas/drag/teclado)"
```

---

### Task 4: Drill-in de dos niveles + re-iluminado por brain-hue

Clic en una card de categoría → el mismo carrusel se re-arma con los trabajos de esa categoría (Nivel 2). `← volver` vuelve a Nivel 1. Al entrar, la escena se re-ilumina en el brain-hue de la disciplina.

**Files:**
- Modify: `portfolio.js` (`openCategory`, `back`, re-render animado, re-light)
- Modify: `styles.css` (variable de tinte de escena + transición del fondo)

**Interfaces:**
- Consumes: `render()`, `layout()`, `state`, `hueFilter()` (Tasks 2-3).
- Produces: `openCategory(key)`, `back()`. Setea `--pf-hue` en `.zona-portfolio` para el re-iluminado.

- [ ] **Step 1: CSS — variable de tinte de escena**

En `.zona-portfolio` agregar la transición del acento y una capa de luz teñida:
```css
.zona-portfolio { --pf-hue: none; transition: background 0.6s ease; }
/* halo de color de la disciplina activa (Nivel 2); en Nivel 1 queda neutro */
.zona-portfolio::before {
    content: "";
    position: absolute; inset: 0;
    background: radial-gradient(60% 50% at 50% 45%,
                hsl(var(--pf-hue, 0) 80% 55% / 0.28), transparent 70%);
    opacity: var(--pf-lit, 0);
    transition: opacity 0.6s ease;
    pointer-events: none;
}
```

- [ ] **Step 2: `portfolio.js` — `openCategory` / `back` con re-light**

Agregar y exponer:
```javascript
    const zona = section;   // .zona-portfolio
    const setLight = (hue) => {
        if (hue == null) {
            zona.style.setProperty("--pf-lit", "0");
        } else {
            zona.style.setProperty("--pf-hue", String(hue));
            zona.style.setProperty("--pf-lit", "1");
        }
    };

    const openCategory = (key) => {
        const cat = window.PORTFOLIO.find((c) => c.key === key);
        if (!cat) return;
        state.level = 1;
        state.activeCat = key;
        render();          // repuebla con works + re-centra + layout
        setLight(cat.hue); // re-ilumina la escena en el hue de la disciplina
    };

    const back = () => {
        state.level = 0;
        state.activeCat = null;
        render();
        setLight(null);
    };
```
Enganchar en el click handler (Task 3 Step 3): si estamos en Nivel 0 y la card clickeada YA está centrada, abrir su categoría; si es lateral, primero centrarla. Reemplazar el handler de click por:
```javascript
        track.addEventListener("click", (e) => {
            const card = e.target.closest(".pf-card");
            if (!card) return;
            const i = cards().indexOf(card);
            if (i !== state.center) { state.center = i; layout(); return; }
            if (state.level === 0 && card.dataset.cat) openCategory(card.dataset.cat);
        });
```
Y en `init()` enganchar `volver`:
```javascript
        backBtn.addEventListener("click", back);
```
Exponer en el objeto público: `window.Portfolio = { init, state, render, layout, go, openCategory, back, hueFilter };`

- [ ] **Step 3: Verificar en el navegador**

Esperado:
- Nivel 1: clic en la card central de "Motion Graphics" → el carrusel se re-arma con las 5 portadas de motion (Nivel 2); aparece `← volver` y el breadcrumb "Motion Graphics"; la escena se tiñe con un halo naranja-rojizo (hue 10).
- Clic en "Modelado 3D" (desde volver → centrar → clic): muestra sus works (fallback teñido) y el halo cambia de color (hue 200).
- "Desarrollo web": Nivel 2 muestra una card "próximamente".
- `← volver` vuelve a las 5 categorías y apaga el halo.

- [ ] **Step 4: Commit**

```bash
git add portfolio.js styles.css
git commit -m "feat(portfolio): drill-in de dos niveles + re-iluminado por brain-hue"
```

---

### Task 5: Transición — el cerebro vibra y sale por la izquierda; el portfolio entra por la derecha

Agrega la fase de salida al final del recorrido sticky: el cerebro vibra brevemente y se desliza fuera por la izquierda desvaneciéndose, mientras una capa de intro del portfolio (título + primera card) entra desde la derecha. Al terminar, el escenario se despinea sobre la sección `#portfolio` real.

**Files:**
- Modify: `mente.js` (calcular `--salida-progress`; empujar cerebro y `.salida-intro`)
- Modify: `styles.css` (fase salida del cerebro; `.salida-intro`; alargar `.mente-journey`)
- Modify: `index.html` (agregar `.salida-intro` dentro de `.mente-stage`)

**Interfaces:**
- Consumes: el escenario sticky y el progreso global `p` de `mente.js` (Tasks previas del recorrido).
- Produces: variable `--salida-progress` (0..1) en `.mente-stage`; variable `--cerebro-exit-x` (vw) en el cerebro.

- [ ] **Step 1: `index.html` — capa de intro dentro del escenario**

Después de `<div class="herr-lluvia" aria-hidden="true"></div>` (dentro de `.mente-stage`), agregar:
```html
                <!-- Intro de salida: entra desde la derecha mientras el cerebro se
                     va por la izquierda. Hace de puente hacia la sección #portfolio. -->
                <div class="salida-intro" aria-hidden="true">
                    <p class="salida-titulo">portfolio</p>
                    <div class="salida-card"></div>
                </div>
```

- [ ] **Step 2: `mente.js` — agregar la fase salida**

En el bloque de fases (donde están `DOOR_VH`/`TOOLS_VH`/`B`), agregar `SALIDA_VH` y recomputar dos límites:
```javascript
    const DOOR_VH   = 150;   // apertura de puertas
    const TOOLS_VH  = 500;   // absorción
    const SALIDA_VH = 120;   // salida del cerebro → entrada del portfolio
    const TOTAL = DOOR_VH + TOOLS_VH + SALIDA_VH;
    const B1 = DOOR_VH / TOTAL;                    // fin fase 1 (umbral)
    const B2 = (DOOR_VH + TOOLS_VH) / TOTAL;       // fin fase 2 (absorción)
```
Actualizar el uso de `B` en `render()` por `B1`/`B2` y agregar la salida. Reemplazar la función `render`:
```javascript
    const render = (p) => {
        const heroP   = clamp(p / B1, 0, 1);
        const herrP   = clamp((p - B1) / (B2 - B1), 0, 1);
        const salidaP = clamp((p - B2) / (1 - B2), 0, 1);
        stage.style.setProperty("--hero-progress", heroP.toFixed(4));
        stage.style.setProperty("--herr-progress", herrP.toFixed(4));
        stage.style.setProperty("--salida-progress", salidaP.toFixed(4));
        renderPhase2(herrP);
        renderSalida(salidaP);
    };
```
Agregar `renderSalida` (antes de `render`):
```javascript
    // Fase 3 (salida): vibración decreciente al inicio + deslizamiento a la
    // izquierda. Determinista y reversible (todo derivado de salidaP).
    const renderSalida = (salidaP) => {
        const shake = salidaP > 0 && salidaP < 0.15
            ? Math.sin(salidaP * 70) * (1 - salidaP / 0.15) * 1.4   // vw
            : 0;
        const slide = smooth01((salidaP - 0.12) / 0.88) * -135;      // vw a la izquierda
        brain.style.setProperty("--cerebro-exit-x", (shake + slide).toFixed(2));
    };
```

- [ ] **Step 3: `styles.css` — fase salida del cerebro + intro**

Modificar la regla de scale del cerebro (línea ~376-379) para componer el desplazamiento de salida en el MISMO `transform` (no duplicar la regla):
```css
.cerebro {
    opacity: clamp(0, calc((var(--hero-progress) - 0.1) * 2.2), 1);
    /* scale por scroll + salida a la izquierda (--cerebro-exit-x en vw, lo setea
       mente.js en la fase salida; 0 en el resto). */
    transform:
        translateX(calc(var(--cerebro-exit-x, 0) * 1vw))
        scale(calc(0.6 + var(--hero-progress) * 0.75));
}
/* fade final del cerebro al irse (después del 60% de la salida) */
.cerebro {
    opacity: calc(
        clamp(0, calc((var(--hero-progress) - 0.1) * 2.2), 1) *
        clamp(0, calc(1 - (var(--salida-progress, 0) - 0.6) * 2.5), 1)
    );
}
```
(La segunda regla `.cerebro` pisa la `opacity` de la primera por orden de cascada — es intencional; el `transform` queda en la primera.)

Agregar la capa de intro (entra desde la derecha con `--salida-progress`):
```css
.salida-intro {
    position: absolute;
    inset: 0;
    z-index: 7;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.2rem;
    /* empieza afuera a la derecha; entra a medida que avanza la salida */
    transform: translateX(calc((1 - var(--salida-progress, 0)) * 60vw));
    opacity: clamp(0, calc((var(--salida-progress, 0) - 0.25) * 2), 1);
    pointer-events: none;
}
.salida-titulo {
    margin: 0;
    font-family: var(--font-alt);
    font-weight: 800;
    text-transform: lowercase;
    font-size: clamp(2rem, 8vw, 5rem);
    color: var(--blanco);
}
.salida-card {
    width: min(46vw, 420px);
    aspect-ratio: 16 / 9;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--violeta-claro), var(--azul));
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
}
```
Alargar el contenedor del recorrido para el nuevo tramo (línea ~181): `height: 750vh;` → `height: 870vh;` (DOOR 150 + TOOLS 500 + SALIDA 120 + buffer existente). Actualizar el comentario para reflejar los tres tramos.

- [ ] **Step 4: Verificar en el navegador**

Scrollear despacio pasando el final de herramientas. Esperado:
- Al terminar la absorción, el cerebro **vibra** un instante y luego se **desliza hacia la izquierda** desvaneciéndose.
- En simultáneo, el título "portfolio" + una card entran **desde la derecha**.
- Al seguir scrolleando, el escenario se despinea y queda la sección `#portfolio` real (carrusel interactivo) — sin salto brusco de título.
- Scrolleando hacia arriba, todo se revierte (el cerebro vuelve).

- [ ] **Step 5: Commit**

```bash
git add index.html mente.js styles.css
git commit -m "feat(portfolio): transición cerebro sale por izquierda / portfolio entra por derecha"
```

---

### Task 6: Accesibilidad — fallback estático, reduced-motion y touch

Contenido accesible siempre legible; bajo `prefers-reduced-motion` (y como red de seguridad en touch), degradar el coverflow a una grilla/fila simple navegable sin drag ni scrub, y mostrar el fallback estático.

**Files:**
- Modify: `portfolio.js` (poblar `.pf-fallback` con la lista completa)
- Modify: `styles.css` (bloque `@media (prefers-reduced-motion: reduce)` para el portfolio)

**Interfaces:**
- Consumes: `window.PORTFOLIO`, `render()`.
- Produces: `renderFallback()` que llena `.pf-fallback` con todas las categorías y sus works (texto + thumbs), legible por lectores de pantalla siempre.

- [ ] **Step 1: `portfolio.js` — poblar el fallback estático**

Agregar `renderFallback()` y llamarlo en `init()`:
```javascript
    const fallback = section.querySelector(".pf-fallback");
    const renderFallback = () => {
        fallback.innerHTML = "";
        window.PORTFOLIO.forEach((cat) => {
            const h = document.createElement("h3");
            h.textContent = cat.label;
            fallback.appendChild(h);
            const ul = document.createElement("ul");
            if (!cat.works.length) {
                const li = document.createElement("li");
                li.textContent = "Próximamente.";
                ul.appendChild(li);
            } else {
                cat.works.forEach((w) => {
                    const li = document.createElement("li");
                    li.textContent = w.title;
                    ul.appendChild(li);
                });
            }
            fallback.appendChild(ul);
        });
    };
```
En `init()`, después de `render();`, agregar `renderFallback();`.

- [ ] **Step 2: `styles.css` — degradado accesible**

Agregar al final:
```css
@media (prefers-reduced-motion: reduce) {
    /* Sin coverflow 3D: fila plana con scroll horizontal nativo. */
    .pf-viewport { perspective: none; overflow-x: auto; }
    .pf-track {
        transform-style: flat;
        height: auto;
        display: flex;
        gap: 1rem;
    }
    .pf-card {
        position: static;
        transform: none !important;
        opacity: 1 !important;
        flex: 0 0 auto;
        transition: none;
    }
    /* Mostrar el contenido estático accesible bajo la fila. */
    .pf-fallback {
        display: block;
        width: min(88vw, 900px);
        margin: 2rem auto 0;
        color: var(--blanco);
        text-align: left;
    }
    .pf-fallback h3 { margin: 1rem 0 0.25rem; font-family: var(--font-alt); }
    .pf-fallback ul { margin: 0; padding-left: 1.2rem; opacity: 0.85; }
    .pf-cue { display: none; }
}
```

- [ ] **Step 3: Verificar en el navegador**

En DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce". Esperado en `#portfolio`:
- El carrusel se ve como fila plana (sin rotaciones 3D), scrolleable de costado; el drill-in por clic sigue funcionando (o al menos las cards se ven todas).
- Debajo aparece la lista de texto con las 5 disciplinas y sus trabajos (fallback), legible.
- Con reduced-motion, la transición del cerebro no bloquea (mente.js ya hace `return` temprano bajo reduced-motion): el portfolio queda accesible directamente.
- Verificar navegación por teclado (Tab a la sección, `←/→`, Enter en `◂ ▸` y en cards).

- [ ] **Step 4: Commit**

```bash
git add portfolio.js styles.css
git commit -m "feat(portfolio): fallback accesible + degradado reduced-motion/touch"
```

---

## Self-Review

**Spec coverage:**
- §2 transición (vibra → izquierda; título+card desde la derecha) → **Task 5**. ✅
- §3 isla interactiva (drag/flechas/click; `seguí ↓`) → **Tasks 2-3** (cue en Task 2, controles en Task 3). ✅
- §4 coverflow 3D, dos niveles, marco 16:9 a sangre, fallback brain-hue, callback de color → **Tasks 2 (cards/fallback), 3 (coverflow), 4 (dos niveles + re-light)**. ✅
- §5 datos + portadas + convención de assets → **Task 1**. ✅
- §6 zona de color por token → **Task 2** (`--violeta-claro`, tunable). ✅
- §7 vanilla, CSS 3D, reduced-motion/touch, fallback accesible, sin página aparte → **Tasks 1-6** (accesibilidad en **Task 6**). ✅

**Placeholder scan:** Sin "TBD/TODO" en los pasos; todo el código está escrito. Los `portada: null` y `works: []` son estados de datos reales (assets pendientes), no placeholders del plan — disparan fallback/"próximamente" definidos. Títulos de works marcados como provisionales por constraint (correcto, no inventa autores).

**Type consistency:** `window.PORTFOLIO` con `{key,label,hue,portada,works}` y `Work {title,portada,media}` usados igual en Tasks 1/2/4/6. `hueFilter(hue)`, `layout()`, `go(delta)`, `openCategory(key)`, `back()`, `render()`, `renderFallback()` definidos y referenciados con los mismos nombres. Variables CSS consistentes: `--x/--rot/--z/--s/--op` (cards), `--card-hue` (fallback), `--pf-hue/--pf-lit` (escena), `--salida-progress` (stage), `--cerebro-exit-x` (cerebro). ✅

Nota de riesgo (tuning, no bloqueante): los valores del coverflow (`GAP/ANGLE/DEPTH`) y los tiempos de la salida (`SALIDA_VH`, umbral de shake) se afinan en vivo — están aislados como constantes al tope de sus funciones.
