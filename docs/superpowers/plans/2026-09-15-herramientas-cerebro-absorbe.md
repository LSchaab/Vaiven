# Herramientas "el cerebro absorbe" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `#herramientas` section as a sticky "brain stage" where the cerebro absorbs raining tool logos + per-beat discipline words and changes color, delivering the site's B&N→color beat.

**Architecture:** A tall section (~5 viewports) with a `position: sticky` stage pinned to the viewport. One scroll handler writes a `0..1` progress (mirroring `hero.js`) that deterministically drives: (a) 15 logos flying from the edges into the brain center, (b) the current discipline word (of 5 beats) entering and being absorbed, and (c) the brain swapping color per beat. A separate rAF loop draws an ambient dust canvas, paused when the section is offscreen. Reduced-motion and touch users get a static, readable fallback via CSS — no JS animation.

**Tech Stack:** Vanilla HTML/CSS/JS. Reuses the existing `erratic.js` type effect and the scroll-progress pattern from `hero.js`. No new dependencies.

## Global Constraints

- **Colors:** only tokens from `Mode 1.tokens.json`, referenced as CSS custom properties (`--naranja`, `--azul`, `--amarillo`, `--verde-agua-claro`, `--lila`, `--azul-oscuro`, `--negro`, `--blanco`, etc.). Never hardcode a hex. No new colors without approval. (`CLAUDE.md`)
- **Language:** code comments in English; copy/content in Spanish (Argentine). (`CLAUDE.md`)
- **Naming:** kebab-case for files and CSS classes. (`CLAUDE.md`)
- **Motion guards:** every motion effect must no-op under `prefers-reduced-motion: reduce` and on touch (`hover: none`), matching `hero.js`.
- **Accessibility:** WCAG AA goal — the section's real content (services + tools) must be present for screen readers even when the animated stage is `aria-hidden`.
- **Mode:** Mode 1 only (theme switching is paused).
- **No build step.** Static site. There is **no test runner** — verification is manual/visual (see below).

## Verification (how to run — no test framework in this repo)

From the repo root, start a static server and open it in Chrome (per user's global instruction to use Chrome for the project page):

```bash
python -m http.server 8080
```
```bash
& "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:8080/#herramientas"
```

For reduced-motion checks, in Chrome DevTools: Rendering panel → "Emulate CSS prefers-reduced-motion: reduce". For the touch fallback, use DevTools device toolbar (a `hover: none` device).

---

## File Structure

- **`index.html`** — replace the `#herramientas` stub with the stage markup (dust canvas, cerebro `<img>`, word element, logo-rain container) + a screen-reader/reduced-motion static content block. Add `<script src="herramientas.js" defer>` in `<head>`.
- **`styles.css`** — add a `Herramientas` block: dark stage background (palette token), sticky stage layout, tall section height, logo/word base positioning, brain pulse animation, and the reduced-motion/touch fallback rules.
- **`erratic.js`** — expose `erraticize` on `window` so the section can re-apply the effect to the word when its text changes each beat (currently module-private).
- **`herramientas.js`** *(new)* — the section controller: config (disciplines, logo filenames), scroll→progress, logo rain math, per-beat word + brain-color logic, and the ambient dust canvas loop. Self-invoking IIFE like `hero.js`.

---

## Task 1: Markup + static layout + reduced-motion fallback (no motion yet)

Lay down the DOM and CSS so the brain is pinned in the center of a tall section, and the accessible static content shows for reduced-motion/touch. No animation logic yet.

**Files:**
- Modify: `index.html` (the `#herramientas` section, ~lines 84-86; add script tag in `<head>` near line 18)
- Modify: `styles.css` (append a new section block at end of file)

**Interfaces:**
- Produces (DOM contract consumed by Task 2-4): a `#herramientas.herramientas` section containing `.herr-stage` with children `canvas.herr-dust`, `img.herr-cerebro`, `p.herr-palabra.erratic`, `div.herr-lluvia`; plus a sibling `.herr-content` static block. A `<script src="herramientas.js" defer>` tag exists.

- [ ] **Step 1: Replace the `#herramientas` stub markup in `index.html`**

Replace the current stub:
```html
        <section id="herramientas" class="zona-color">
            <h2>herramientas y servicios</h2>
        </section>
```
with:
```html
        <!-- Sala #2: el cerebro absorbe herramientas (logos) y servicios
             (palabras). Escenario sticky; la animación vive en herramientas.js.
             Ref: docs/superpowers/specs/2026-09-15-herramientas-cerebro-absorbe-design.md -->
        <section id="herramientas" class="herramientas">
            <!-- Escenario animado: pineado al centro mientras se scrollea.
                 aria-hidden: el contenido accesible real vive en .herr-content. -->
            <div class="herr-stage" aria-hidden="true">
                <canvas class="herr-dust"></canvas>
                <img class="herr-cerebro" src="resources/cerebro.webp" alt="" decoding="async">
                <p class="herr-palabra erratic" data-text=""></p>
                <div class="herr-lluvia"></div>
            </div>

            <!-- Contenido real: leído por lectores de pantalla siempre, y
                 mostrado (en vez del escenario) bajo reduced-motion / touch. -->
            <div class="herr-content">
                <h2>herramientas y servicios</h2>
                <p class="herr-content-intro">Lo que sabemos hacer, y con qué.</p>
                <ul class="herr-servicios">
                    <li>Ilustración y Diseño Gráfico</li>
                    <li>Modelado 3D</li>
                    <li>Motion Graphics</li>
                    <li>Desarrollo web</li>
                    <li>Campañas publicitarias</li>
                </ul>
                <ul class="herr-tools">
                    <li>Photoshop</li><li>Illustrator</li><li>Blender</li>
                    <li>Substance 3D Painter</li><li>Unity</li><li>Unreal</li>
                    <li>After Effects</li><li>CapCut</li><li>Audition</li>
                    <li>HTML5</li><li>CSS</li><li>JavaScript</li>
                    <li>Visual Studio Code</li><li>ChatGPT</li><li>Claude</li>
                </ul>
            </div>
        </section>
```

- [ ] **Step 2: Add the script tag in `index.html` `<head>`**

After the `hero.js` script tag (line ~18), add:
```html
    <!-- Sala Herramientas: cerebro que absorbe logos + palabras al scrollear.
         Vanilla, auto-inicializado sobre #herramientas. -->
    <script src="herramientas.js" defer></script>
```

- [ ] **Step 3: Append the Herramientas CSS block to `styles.css`**

```css
/* === Sala Herramientas — "el cerebro absorbe" =============================
   Escenario sticky en una sección alta. La animación (logos + palabra +
   color del cerebro) la maneja herramientas.js. Fondo oscuro de marca para
   que el color del cerebro y los logos resalten (dentro de la mente).
   Ref: docs/superpowers/specs/2026-09-15-herramientas-cerebro-absorbe-design.md */
.herramientas {
    /* Anula el centrado flex de `section`: necesitamos flujo normal para el
       hijo sticky, y altura de ~5 pantallas (5 beats). */
    display: block;
    min-height: 0;
    height: 500vh;
    padding: 0;
    background: var(--azul-oscuro);   /* dentro de la mente: azul profundo, no negro (eso es B&N) */
    color: var(--blanco);
}

.herr-stage {
    position: sticky;
    top: 0;
    height: 100vh;
    display: grid;
    place-items: center;
    overflow: hidden;
}

.herr-dust {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
}

.herr-cerebro {
    position: relative;   /* por encima del polvo */
    width: clamp(220px, 34vmin, 460px);
    height: auto;
    z-index: 1;
    will-change: transform, filter;
    transition: filter 0.5s ease;   /* cross-fade de color al cambiar de beat */
}

/* Pulso breve al absorber la palabra de un beat (clase togglea en JS). */
.herr-cerebro.is-absorbing { animation: herr-pulse 0.45s ease-out; }
@keyframes herr-pulse {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.06); }
    100% { transform: scale(1); }
}

/* Palabra del beat (servicio). Centrada; JS la desplaza y la absorbe. */
.herr-palabra {
    position: absolute;
    left: 50%;
    top: 50%;
    margin: 0;
    z-index: 2;
    opacity: 0;
    font-size: clamp(1.4rem, 4vw, 2.6rem);
    color: var(--blanco);
    white-space: nowrap;
    pointer-events: none;
    will-change: transform, opacity;
}

/* Contenedor de la lluvia de logos. Cada logo se posiciona en el centro y
   JS lo traslada desde el borde hacia adentro. */
.herr-lluvia { position: absolute; inset: 0; z-index: 1; }
.herr-lluvia img {
    position: absolute;
    left: 50%;
    top: 50%;
    width: clamp(28px, 4.5vmin, 56px);
    height: auto;
    opacity: 0;
    will-change: transform, opacity;
}

/* Contenido accesible: oculto visualmente en full-motion (solo lectores de
   pantalla), visible como fallback estático bajo reduced-motion / touch. */
.herr-content {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
}

@media (prefers-reduced-motion: reduce), (hover: none) {
    .herramientas {
        height: auto;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6rem 1.5rem 3rem;
        text-align: center;
    }
    .herr-stage { display: none; }
    .herr-content {
        position: static;
        width: auto; height: auto;
        margin: 0; padding: 0;
        overflow: visible;
        clip: auto;
        white-space: normal;
    }
    .herr-content h2 {
        font-size: clamp(1.5rem, 5vw, 3rem);
        text-transform: lowercase;
        opacity: 1;   /* anula el opacity:0.4 del `section h2` stub global */
        margin: 0 0 0.5rem;
    }
    .herr-servicios, .herr-tools {
        list-style: none;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem 1rem;
        justify-content: center;
    }
    .herr-servicios { font-weight: 700; margin: 1rem 0; }
    .herr-tools { opacity: 0.75; font-size: 0.9rem; }
}
```

- [ ] **Step 4: Verify visually**

Start the server and open the section in Chrome (see Verification above). Confirm:
- The brain image sits centered and **stays pinned** in the viewport while you scroll through the section (which is now ~5 screens tall), against a deep blue background.
- In DevTools, enable "Emulate prefers-reduced-motion: reduce": the animated stage disappears and the **static content** (heading + services list + tools list) is shown and readable.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css
git commit -m "feat(herramientas): escenario sticky del cerebro + fallback estático

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Scroll progress, 5 word-beats, brain color per beat

Create `herramientas.js` with the scroll→progress engine and the beat logic: the 5 discipline words appear one-by-one and get absorbed, and the brain changes color each beat. Expose `erraticize` so the word restyles per beat. (Logo rain comes in Task 3; dust in Task 4.)

**Files:**
- Modify: `erratic.js` (expose `erraticize` on `window`)
- Create: `herramientas.js`

**Interfaces:**
- Consumes: the DOM contract from Task 1; `window.erraticize(el)` from `erratic.js`.
- Produces (consumed by Task 3-4, inside the same IIFE): `computeProgress() → number 0..1`; a `render(p)` function called from the scroll handler; module constants `LOGOS` (string[] of 15 filenames), `DISCIPLINES` (string[5]), `BEATS` (=5); helpers `clamp(v,a,b)` and `smooth01(t)`; and a resize-updated `R` (px, edge radius).

- [ ] **Step 1: Expose `erraticize` on `window` in `erratic.js`**

At the end of `erratic.js` (after the `window.reshuffleErratic` block), add:
```js
// Exposed so sections that swap text at runtime (e.g. Herramientas' per-beat
// word) can re-apply the effect to an element after changing its text.
window.erraticize = erraticize;
```

- [ ] **Step 2: Create `herramientas.js` with progress engine + beats**

```js
// Sala Herramientas — "el cerebro absorbe".
// El cerebro queda pineado al centro; al scrollear, 5 palabras de servicio
// (beats) entran y son absorbidas, y el cerebro cambia de color por beat.
// La lluvia de logos y el polvo ambiente se agregan en tareas siguientes.
// Guards: sin efecto en touch / reduced-motion (el fallback estático es CSS).
// Ref: docs/superpowers/specs/2026-09-15-herramientas-cerebro-absorbe-design.md
(() => {
    "use strict";
    const sec = document.querySelector("#herramientas");
    if (!sec) return;

    const reduce  = matchMedia("(prefers-reduced-motion: reduce)");
    const noHover = matchMedia("(hover: none)");
    if (reduce.matches || noHover.matches) return;   // CSS muestra el fallback

    const stage  = sec.querySelector(".herr-stage");
    const brain  = sec.querySelector(".herr-cerebro");
    const wordEl = sec.querySelector(".herr-palabra");
    const lluvia = sec.querySelector(".herr-lluvia");

    // ----- config -----
    const DISCIPLINES = [
        "Ilustración y Diseño Gráfico",
        "Modelado 3D",
        "Motion Graphics",
        "Desarrollo web",
        "Campañas publicitarias",
    ];
    const BEATS = DISCIPLINES.length;

    // Logos: lluvia libre, sin correlación con disciplinas (decisión 2026-09-15).
    const LOGOS = [
        "after-effects", "audition", "blender", "capcut", "chatgpt",
        "claude", "css", "html5", "illustrator", "js",
        "photoshop", "substance-3d-painter", "unity", "unreal",
        "visual-studio-code",
    ];

    // Placeholder de "cerebro de color por beat": hasta que lleguen los assets
    // reales, tintamos cerebro.webp con hue-rotate. Reemplazar por swap de src
    // (brain.src = BRAIN_SRCS[beat]) cuando existan las versiones de color.
    const BEAT_HUE = [0, 205, 45, 265, 140];   // deg, un tono por beat

    // Posiciones (vmin) desde donde entra la palabra de cada beat, eco de las
    // etiquetas dispersas de la referencia. Se absorbe hacia (0,0).
    const WORD_SPOTS = [
        { x: -24, y: -14 }, { x: 24, y: -16 }, { x: -26, y: 16 },
        { x: 26, y: 14 }, { x: 0, y: -22 },
    ];

    // ----- helpers -----
    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
    const smooth01 = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

    let R = 0;   // radio de borde para la lluvia (px) — lo usa la Tarea 3
    const onResize = () => { R = Math.min(innerWidth, innerHeight) * 0.44; };

    // ----- progreso 0..1 dentro de la sección (patrón de hero.js) -----
    const computeProgress = () => {
        const total = sec.offsetHeight - innerHeight;
        const scrolled = clamp(-sec.getBoundingClientRect().top, 0, total);
        return total > 0 ? scrolled / total : 0;
    };

    // ----- beat actual: palabra + color del cerebro -----
    let currentBeat = -1;
    const setBeat = (beat) => {
        if (beat === currentBeat) return;
        currentBeat = beat;
        wordEl.dataset.text = DISCIPLINES[beat];
        window.erraticize(wordEl);                       // re-aplica el efecto
        brain.style.filter = `hue-rotate(${BEAT_HUE[beat]}deg) saturate(1.4)`;
        brain.classList.remove("is-absorbing");
        void brain.offsetWidth;                          // reinicia la animación
        brain.classList.add("is-absorbing");
    };

    const renderWord = (beat, local) => {
        const spot = WORD_SPOTS[beat];
        const absorb = smooth01((local - 0.6) / 0.4);    // 0 hasta 0.6, →1 al final
        const wx = spot.x * (1 - absorb);
        const wy = spot.y * (1 - absorb);
        const scale = 1 - 0.8 * absorb;
        const op = clamp(Math.min(local / 0.2, 1) * (1 - absorb), 0, 1);
        wordEl.style.transform =
            `translate(-50%, -50%) translate(${wx}vmin, ${wy}vmin) scale(${scale})`;
        wordEl.style.opacity = op;
    };

    // ----- render principal (lo extiende la Tarea 3 con la lluvia de logos) -----
    const render = (p) => {
        const beatFloat = p * BEATS;
        const beat = clamp(Math.floor(beatFloat), 0, BEATS - 1);
        const local = beatFloat - beat;
        setBeat(beat);
        renderWord(beat, local);
    };

    // ----- scroll (rAF, patrón de hero.js) -----
    let ticking = false;
    const update = () => { render(computeProgress()); ticking = false; };
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    };

    onResize();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => { onResize(); onScroll(); });
})();
```

- [ ] **Step 3: Verify visually**

Reload `http://localhost:8080/#herramientas` in Chrome. Scrolling through the section should:
- Show the discipline words appear **one at a time** (Ilustración y Diseño Gráfico → Modelado 3D → … → Campañas publicitarias), each entering from an offset and shrinking into the brain center as that beat ends.
- Change the **brain's color** at each new beat, with a short pulse.
- The word is rendered with the `erratic` mixed-weight styling.
- With reduced-motion emulated, none of this runs and the static fallback shows.

- [ ] **Step 4: Commit**

```bash
git add erratic.js herramientas.js
git commit -m "feat(herramientas): scroll→beats, palabra por servicio y color de cerebro

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Logo rain + absorption

Inject the 15 logo images and animate them flying in from the edges and being absorbed into the brain center, deterministically driven by scroll progress (fully reversible/scrubbable), a few at a time.

**Files:**
- Modify: `herramientas.js` (inject logos at init; extend `render` to place them)

**Interfaces:**
- Consumes: `LOGOS`, `lluvia`, `R`, `clamp`, `smooth01`, `render` from Task 2.
- Produces: a module array `logoEls` (HTMLImageElement[]) and a `renderLogos(p)` function called inside `render`.

- [ ] **Step 1: Inject the logo `<img>` elements at init**

In `herramientas.js`, after the `const LOGOS = [...]` config, add a build step near the other init calls (before `onResize()`):
```js
    // Instancia un <img> por logo dentro de la lluvia. Cada uno vuela desde el
    // borde al centro en una franja del progreso; se reparten para que caigan
    // pocos a la vez (nunca todos juntos).
    const logoEls = LOGOS.map((name) => {
        const img = document.createElement("img");
        img.src = `resources/logos/${name}.svg`;
        img.alt = "";
        img.decoding = "async";
        img.setAttribute("aria-hidden", "true");
        lluvia.appendChild(img);
        return img;
    });
```

- [ ] **Step 2: Add `renderLogos` and call it from `render`**

Add the function (near `renderWord`):
```js
    // Lluvia de logos: cada logo i tiene una franja [t0, t0+WIN] del progreso.
    // Dentro de su franja viaja del borde (dist=R) al centro (dist=0), se
    // achica y se desvanece = "absorbido". Fuera de su franja, invisible.
    const LOGO_WIN = 0.16;                 // largo de la franja de cada logo
    const GOLDEN = 2.399963;               // ángulo áureo (rad) → reparto parejo
    const renderLogos = (p) => {
        const n = logoEls.length;
        const first = 0.02;
        const last = 0.98 - LOGO_WIN;
        for (let i = 0; i < n; i++) {
            const t0 = first + (last - first) * (i / (n - 1));
            const local = (p - t0) / LOGO_WIN;
            const el = logoEls[i];
            if (local <= 0 || local >= 1) { el.style.opacity = "0"; continue; }
            const ang = i * GOLDEN;
            const dist = (1 - local) * R;                 // borde → centro
            const x = Math.cos(ang) * dist;
            const y = Math.sin(ang) * dist;
            const s = 0.85 * (1 - local) + 0.12;          // se achica al absorberse
            const op = clamp(Math.min(local / 0.15, (1 - local) / 0.15), 0, 1);
            el.style.opacity = op.toFixed(3);
            el.style.transform =
                `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(3)})`;
        }
    };
```

Then extend `render` to call it:
```js
    const render = (p) => {
        const beatFloat = p * BEATS;
        const beat = clamp(Math.floor(beatFloat), 0, BEATS - 1);
        const local = beatFloat - beat;
        setBeat(beat);
        renderWord(beat, local);
        renderLogos(p);
    };
```
(Replace the Task 2 `render` with this version.)

- [ ] **Step 3: Verify visually**

Reload and scroll. Confirm:
- Tool logos **fly in from around the edges** and get pulled into the brain, shrinking and fading as they reach it.
- Only **a few are visible at once** (roughly 2 overlapping), spread across the whole scroll, not all at once.
- Scrolling **back up** reverses the motion cleanly (deterministic — no drift/pile-up).

- [ ] **Step 4: Commit**

```bash
git add herramientas.js
git commit -m "feat(herramientas): lluvia de logos absorbidos por el cerebro

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Ambient dust canvas

Add the subtle drifting dust/starfield behind the scene on the `.herr-dust` canvas, animated by its own rAF loop that pauses when the section is offscreen. Respects reduced-motion (never starts, since JS already bails).

**Files:**
- Modify: `herramientas.js` (dust init + loop + IntersectionObserver)

**Interfaces:**
- Consumes: `stage`, `sec` from Task 2; the `.herr-dust` canvas.
- Produces: `startDust()` / `stopDust()` controlling the dust rAF loop.

- [ ] **Step 1: Add the dust canvas loop to `herramientas.js`**

Add near the end of the IIFE, before the scroll wiring:
```js
    // ----- polvo ambiente (starfield tenue a la deriva) -----
    const canvas = sec.querySelector(".herr-dust");
    const ctx = canvas.getContext("2d");
    let motes = [];
    let dustRAF = 0;

    const sizeDust = () => {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        canvas.width = Math.floor(stage.clientWidth * dpr);
        canvas.height = Math.floor(stage.clientHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const seedDust = () => {
        const w = stage.clientWidth, h = stage.clientHeight;
        const count = Math.round((w * h) / 14000);   // densidad moderada
        motes = Array.from({ length: count }, (_, i) => ({
            x: (i * 97.3) % w,                       // determinista (sin Math.random en semilla)
            y: (i * 61.7) % h,
            r: 0.5 + (i % 5) * 0.35,
            vx: ((i % 7) - 3) * 0.03,
            vy: 0.05 + (i % 3) * 0.04,
        }));
    };
    const drawDust = () => {
        const w = stage.clientWidth, h = stage.clientHeight;
        ctx.clearRect(0, 0, w, h);
        for (const m of motes) {
            m.x += m.vx; m.y += m.vy;
            if (m.y > h) { m.y = 0; }
            if (m.x < 0) { m.x = w; } else if (m.x > w) { m.x = 0; }
            ctx.globalAlpha = 0.25 + (m.r / 2) * 0.4;
            ctx.fillStyle = "#FFFFFF";               // --blanco
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        dustRAF = requestAnimationFrame(drawDust);
    };
    const startDust = () => { if (!dustRAF) dustRAF = requestAnimationFrame(drawDust); };
    const stopDust = () => { cancelAnimationFrame(dustRAF); dustRAF = 0; };

    sizeDust();
    seedDust();

    // Solo anima mientras la sección está a la vista (perf).
    const io = new IntersectionObserver((entries) => {
        entries[0].isIntersecting ? startDust() : stopDust();
    }, { threshold: 0 });
    io.observe(sec);
```

And add dust resizing to the existing resize handler:
```js
    window.addEventListener("resize", () => {
        onResize();
        sizeDust();
        seedDust();
        onScroll();
    });
```
(Replace the Task 2 resize listener with this version.)

- [ ] **Step 2: Verify visually**

Reload and scroll to the section. Confirm:
- A subtle field of small white specks **drifts** behind the brain.
- It sits **behind** the brain and logos (the brain and logos remain clearly on top).
- Scrolling away from the section and back does not accumulate lag (loop pauses offscreen — check that CPU settles when the section is not visible).
- Under reduced-motion emulation, no dust animates (whole script bails) and the static fallback shows.

- [ ] **Step 3: Commit**

```bash
git add herramientas.js
git commit -m "feat(herramientas): polvo ambiente en canvas, pausado fuera de vista

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Post-implementation notes

- **Colored-brain assets:** when Luly delivers the ~5 colored brain images, replace the `BEAT_HUE` hue-rotate placeholder in `setBeat()` with a real image swap (`brain.src = BRAIN_SRCS[beat]`) or a two-layer cross-fade, and drop the `saturate` filter. The `data-text`/erratic and pulse logic stay as-is.
- **Color order:** the spec marks the per-beat color order as placeholder; finalize it against the real assets.
- **Not in scope (own sessions):** the hard Hero→Herramientas "umbral" transition (the color-explosion cut), and any persistent connector motif between rooms.
```
