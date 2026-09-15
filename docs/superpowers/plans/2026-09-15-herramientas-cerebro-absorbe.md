# Hero → Herramientas "un solo cerebro" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the hero and herramientas into one continuous sticky stage with a single persistent brain that grows (B&N) as the doors open, then absorbs raining tool logos + per-beat discipline words while igniting color.

**Architecture:** One tall wrapper `.mente-journey` holds one sticky `.mente-stage` pinned across the whole journey. A single global scroll progress `0..1` is split into two phases at boundary `B`: phase 1 exposes `--hero-progress` (doors/brain-grow — all existing hero CSS reused unchanged), phase 2 exposes `--herr-progress` (word beats, logo rain, brain color, dust). The `#hero`/`#herramientas` sections become absolute anchor markers for nav. One controller `mente.js` (superset of the old `hero.js`) drives everything.

**Tech Stack:** Vanilla HTML/CSS/JS. Reuses `erratic.js`. Replaces `hero.js` with `mente.js`. No new dependencies.

## Global Constraints

- **Colors:** only Mode 1 tokens via CSS custom properties (`--azul`, `--naranja`, `--blanco`, `--negro`, etc.). Never hardcode a hex. No new colors. (`CLAUDE.md`)
- **Language:** code comments English; copy/content Spanish (Argentine).
- **Naming:** kebab-case for files and CSS classes.
- **Preserve hero behavior:** doors opening, cursor grid-glow (`--mx/--my`), parallax (`--mnx/--mny`), brain growth — all must keep working after the restructure. The only permitted hero change is re-homing its layers into `.mente-stage` and renaming `.hero-cerebro` → `.cerebro`.
- **Motion guards:** cursor effects gated on `!touch && !reduced-motion`; scroll-scrub gated on `!reduced-motion` (mobile/touch still scrubs, exactly like the current `hero.js`).
- **Accessibility (WCAG AA):** the hero `<h1>` frase stays readable (not aria-hidden); decorative layers are `aria-hidden`; the real services+tools content lives in `.herr-content` for screen readers, and is shown as the static fallback under `prefers-reduced-motion: reduce`.
- **No build step, NO test runner** — verification is manual/visual.

## Verification (no test framework — manual/visual)

`python` is the Windows Store stub here; use Node's `serve`:
```bash
npx --yes serve -l 8080 .
```
```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" "http://localhost:8080/" >/dev/null 2>&1 &
```
Reduced-motion: DevTools → Rendering → "Emulate prefers-reduced-motion: reduce".

---

## File Structure

- **`index.html`** — replace the two consecutive `<section id="hero">` and `<section id="herramientas">` blocks with one `.mente-journey` (sticky `.mente-stage` holding all hero + herramientas layers, plus `#hero`/`#herramientas` anchor sections and the `.herr-content` fallback). In `<head>`: remove the `hero.js` and `herramientas.js` tags, add one `mente.js` tag.
- **`styles.css`** — replace the hero container rules (`.hero`, `.hero-stage`, `.hero-scene`) with `.mente-journey`/`.mente-stage`/`.mente-anchor`; rename `.hero-cerebro` → `.cerebro` (4 rules); remove the standalone herramientas container rules from commit 686d591 (`.herramientas`, `.herr-stage`, `.herr-cerebro`, its pulse + reduced-motion media query); keep `.herr-dust`/`.herr-palabra`/`.herr-lluvia`/`.herr-content`; add the new reduced-motion fallback. All preserved hero rules (puertas, grid glow, parallax, apertura) stay byte-for-byte except the cerebro rename.
- **`mente.js`** *(new)* — the single journey controller.
- **`hero.js`** — delete (logic migrates to `mente.js`).

---

## Task 1: Unified stage + persistent brain (restructure; no beats/logos/dust yet)

Restructure hero + herramientas into one sticky stage with one shared brain, driven by a global progress split into two phases. Preserve ALL hero behavior. Phase-2 mechanics (beats/logos/dust) are stubbed for later tasks — but the brain must visibly persist (pinned, grown, B&N) into the phase-2 scroll range.

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Create: `mente.js`
- Delete: `hero.js`

**Interfaces:**
- Produces (consumed by Tasks 2-4, inside `mente.js`'s IIFE): `stage` (the `.mente-stage` element), `clamp(v,a,b)`, `B` (phase boundary), and a `renderPhase2(herrP)` hook called every frame with phase-2 progress `0..1`. CSS vars on `.mente-stage`: `--hero-progress`, `--herr-progress`, `--mx/--my`, `--mnx/--mny`.
- Produces (DOM): `.mente-stage` containing `img.cerebro`, `canvas.herr-dust`, `p.herr-palabra.erratic`, `div.herr-lluvia` (empty), plus the hero layers; and a sibling `.herr-content` static block.

- [ ] **Step 1: Replace the two sections in `index.html` with the unified journey**

Find the current `<section id="hero" …>…</section>` block and the immediately-following `<section id="herramientas" …>…</section>` block (the one from commit 686d591) and replace BOTH with:

```html
        <!-- Recorrido "la mente de VAI VEN": un solo escenario sticky con UN
             cerebro persistente. Fase 1 (umbral/puertas, --hero-progress) y
             fase 2 (absorción/herramientas, --herr-progress) las maneja mente.js.
             Ref: docs/superpowers/specs/2026-09-15-herramientas-cerebro-absorbe-design.md -->
        <div class="mente-journey">
            <div class="mente-stage">
                <!-- capa 1: fondo azul (se revela al abrir las puertas) -->
                <div class="hero-fondo" aria-hidden="true"></div>

                <!-- capa 2: collage tenue (se aleja en fase 1) -->
                <div class="hero-collage" aria-hidden="true">
                    <img src="diseno_grafico/Poster_Inari/13_titulo.png" alt="" decoding="async">
                    <img src="diseno_grafico/Poster_Lightyear/poster_completox2.png" alt="" decoding="async">
                    <img src="diseno_grafico/Poster_Perfume/6_FINAL.png" alt="" decoding="async">
                    <img src="diseno_grafico/Poster_infinityWar/poster_infinityWarx2.png" alt="" decoding="async">
                    <img src="diseno_grafico/Poster_interstellar/FINAL TDI2 AFICHE JPG.jpg" alt="" decoding="async">
                    <img src="3d/caja_fantasia/RENDER1.png" alt="" decoding="async">
                    <img src="3d/maquinaexp_laserenisima/RenderConPost1-01.png" alt="" decoding="async">
                </div>

                <!-- EL cerebro: único, persiste toda la travesía. Crece en fase 1
                     (B&N), absorbe y se tiñe en fase 2. -->
                <img class="cerebro" src="resources/cerebro.webp" alt="" aria-hidden="true" decoding="async">

                <!-- capa 4: puertas con grilla (se abren en fase 1) -->
                <div class="puerta puerta-izq" aria-hidden="true"></div>
                <div class="puerta puerta-der" aria-hidden="true"></div>

                <!-- capa 5: motivos (parallax; se desvanecen en fase 1) -->
                <img class="ojo ojo-izq" src="resources/ojo_1.webp" alt="" aria-hidden="true" decoding="async">
                <img class="ojo ojo-der" src="resources/ojo_2.webp" alt="" aria-hidden="true" decoding="async">
                <img class="mano-lupa" src="resources/lupa_BYN.png" alt="" aria-hidden="true" decoding="async">

                <!-- capa 6: frase (único texto real del hero) -->
                <h1 class="hero-frase">Abrí la cabeza,<br>empezá por la<br><strong class="frase-nuestra">nuestra</strong>.</h1>

                <!-- capas de fase 2 (herramientas): polvo, palabra, lluvia de logos -->
                <canvas class="herr-dust" aria-hidden="true"></canvas>
                <p class="herr-palabra erratic" data-text="" aria-hidden="true"></p>
                <div class="herr-lluvia" aria-hidden="true"></div>
            </div>

            <!-- Anclas de nav (marcadores de scroll, sin arte). #herramientas se
                 ubica al inicio de la fase 2 (ver --herr-anchor en CSS). -->
            <section id="hero" class="mente-anchor"></section>
            <section id="herramientas" class="mente-anchor"></section>

            <!-- Contenido real: leído por lectores de pantalla siempre; mostrado
                 como fallback estático bajo reduced-motion. -->
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
        </div>
```

- [ ] **Step 2: Swap the scripts in `index.html` `<head>`**

Remove the `<script src="hero.js" defer></script>` tag (and its comment) and the `<script src="herramientas.js" defer></script>` tag (and its comment). Add, after the `erratic.js` tag:
```html
    <!-- Recorrido "la mente de VAI VEN": un escenario sticky, un cerebro que
         persiste. Progreso global partido en fase umbral / fase absorción.
         Vanilla, auto-inicializado sobre .mente-journey. -->
    <script src="mente.js" defer></script>
```

- [ ] **Step 3: Restructure the container CSS in `styles.css`**

**(a) Replace** the `.hero { … }`, `.hero-stage { … }`, and `.hero-scene { … }` rules (the three hero container rules) with:
```css
/* Recorrido unificado: un contenedor alto da el largo de scroll; un escenario
   sticky queda pineado toda la travesía. Ref: spec 2026-09-15. */
.mente-journey {
    position: relative;
    /* 150vh de apertura (puertas) + 500vh de absorción. Afinable; debe quedar
       en sync con DOOR_VH/TOOLS_VH de mente.js. */
    height: 750vh;
    background: var(--negro);
}

.mente-stage {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    display: grid;
    place-items: center;     /* centra la frase (único hijo en flujo) */
    background: var(--negro); /* umbral B&N detrás de todo */
    --hero-progress: 0;       /* fallbacks si aún no hay JS */
    --herr-progress: 0;
}

/* Anclas de nav: marcadores absolutos de 0px, sin arte ni interacción.
   #herramientas al inicio de la fase 2 (150vh = DOOR_VH). */
.mente-anchor {
    position: absolute;
    left: 0;
    width: 100%;
    height: 0;
    min-height: 0;
    padding: 0;
    margin: 0;
    display: block;
    pointer-events: none;
}
#hero.mente-anchor { top: 0; }
#herramientas.mente-anchor { top: 150vh; }
```

**(b) Rename** every `.hero-cerebro` selector to `.cerebro` — there are exactly four rules: the base rule (`position:absolute; left:50%; top:50%; width:min(42vw,460px); …; filter:grayscale(1) contrast(1.25); z-index:2;`), the `transition: translate …` rule (shared with `.ojo`/`.mano-lupa`), the parallax `translate:` rule, and the apertura `transform: scale(…)` rule. Change ONLY the selector text `.hero-cerebro` → `.cerebro`; leave each rule body untouched.

**(c) Remove** these rules that came from commit 686d591 (the standalone herramientas stage — now superseded): `.herramientas { … }`, `.herr-stage { … }`, `.herr-cerebro { … }`, `.herr-cerebro.is-absorbing { … }`, the `@keyframes herr-pulse { … }`, and the old `@media (prefers-reduced-motion: reduce), (hover: none) { … }` block that referenced `.herramientas`/`.herr-stage`. (Keep `.herr-palabra`, `.herr-lluvia`, `.herr-lluvia img`, and `.herr-content`.)

Also **update** the kept `.herr-dust` rule so it sits behind the brain and only appears in phase 2 (it must not clutter the closed-door umbral of phase 1):
```css
.herr-dust {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    z-index: 0;                       /* detrás del cerebro y capas del hero */
    opacity: var(--herr-progress, 0); /* invisible en el umbral; aparece al absorber */
}
```

**(d) Add** the new reduced-motion fallback at the end of the herramientas CSS region:
```css
/* Reduced-motion: sin pin ni scrub. Queda el umbral estático (puertas
   cerradas + frase, --hero-progress:0) y debajo el contenido accesible. */
@media (prefers-reduced-motion: reduce) {
    .mente-journey { height: auto; }
    .mente-stage { position: static; height: 100vh; }
    .herr-dust, .herr-palabra, .herr-lluvia { display: none; }
    .herr-content {
        position: static;
        width: auto; height: auto;
        margin: 0; padding: 3rem 1.5rem;
        overflow: visible; clip: auto; white-space: normal;
        color: var(--blanco); background: var(--azul); text-align: center;
    }
    .herr-content h2 {
        font-size: clamp(1.5rem, 5vw, 3rem);
        text-transform: lowercase; opacity: 1; margin: 0 0 0.5rem;
    }
    .herr-servicios, .herr-tools {
        list-style: none; padding: 0;
        display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; justify-content: center;
    }
    .herr-servicios { font-weight: 700; margin: 1rem 0; }
    .herr-tools { opacity: 0.75; font-size: 0.9rem; }
}
```

- [ ] **Step 4: Create `mente.js`**

```js
// Recorrido "la mente de VAI VEN" — controlador único.
// Un escenario sticky (.mente-stage) pineado toda la travesía. Un progreso
// global 0..1 sobre .mente-journey se parte en dos fases: umbral/puertas
// (--hero-progress) y absorción/herramientas (--herr-progress). Conserva el
// glow de grilla y el parallax del hero. Las tareas 2-4 completan renderPhase2.
// Guards: cursor sin efecto en touch/reduced-motion; scrub sin efecto en
// reduced-motion (mobile/touch sí scrollea, igual que el hero actual).
// Ref: docs/superpowers/specs/2026-09-15-herramientas-cerebro-absorbe-design.md
(() => {
    "use strict";
    const journey = document.querySelector(".mente-journey");
    if (!journey) return;
    const stage = journey.querySelector(".mente-stage");

    const reduce  = matchMedia("(prefers-reduced-motion: reduce)");
    const noHover = matchMedia("(hover: none)");

    // ----- glow de grilla + parallax (migrado de hero.js) -----
    if (!noHover.matches && !reduce.matches) {
        window.addEventListener("mousemove", (e) => {
            stage.style.setProperty("--mx", e.clientX + "px");
            stage.style.setProperty("--my", e.clientY + "px");
            const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
            const ny = (e.clientY / window.innerHeight - 0.5) * 2;
            stage.style.setProperty("--mnx", nx.toFixed(3));
            stage.style.setProperty("--mny", ny.toFixed(3));
        }, { passive: true });
    }

    if (reduce.matches) return;   // sin scrub; CSS deja umbral estático + fallback

    // ----- fases (afinables; en sync con .mente-journey height y #herramientas top) -----
    const DOOR_VH  = 150;   // largo de scroll de la apertura de puertas
    const TOOLS_VH = 500;   // largo de scroll de la absorción
    const B = DOOR_VH / (DOOR_VH + TOOLS_VH);   // límite de fase en progreso global

    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

    const computeProgress = () => {
        const total = journey.offsetHeight - innerHeight;
        const scrolled = clamp(-journey.getBoundingClientRect().top, 0, total);
        return total > 0 ? scrolled / total : 0;
    };

    // Fase 2 (herramientas): la completan las tareas 2 (palabra + color),
    // 3 (lluvia de logos) y 4 (polvo). Recibe el progreso local 0..1.
    const renderPhase2 = (herrP) => { /* Task 2-4 */ };

    const render = (p) => {
        const heroP = clamp(p / B, 0, 1);
        const herrP = clamp((p - B) / (1 - B), 0, 1);
        stage.style.setProperty("--hero-progress", heroP.toFixed(4));
        stage.style.setProperty("--herr-progress", herrP.toFixed(4));
        renderPhase2(herrP);
    };

    // ----- scroll (rAF) -----
    let ticking = false;
    const update = () => { render(computeProgress()); ticking = false; };
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
})();
```

- [ ] **Step 5: Delete `hero.js`**

```bash
git rm hero.js
```

- [ ] **Step 6: Verify visually**

Serve and open `http://localhost:8080/`. Confirm:
- **Hero preserved:** at top, doors closed + frase visible; moving the cursor lights the grid glow and parallaxes the motifs; scrolling opens the doors, fades frase/ojos/lupa, and the **brain grows** (B&N) — exactly as before.
- **Brain persists:** continuing to scroll past the door phase, the brain stays **pinned and grown** (still B&N, no jump/reset) across the phase-2 range (the tools room is empty of logos/words for now — that's Tasks 2-4).
- **Nav:** clicking "herramientas" jumps to the start of the phase-2 range (brain pinned, doors open); "home" returns to the umbral.
- **Reduced-motion:** emulate it → the journey collapses to the static umbral (closed doors + frase) followed by the readable services/tools content on an `--azul` background.
- Console: no errors; no `hero.js`/`herramientas.js` 404s (only `mente.js` loads).

- [ ] **Step 7: Commit**

```bash
git add index.html styles.css mente.js
git rm --cached hero.js 2>/dev/null; git add -A hero.js 2>/dev/null
git commit -m "feat(mente): hero+herramientas en un escenario sticky con cerebro persistente

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```
(If `hero.js` was already staged for deletion by `git rm` in Step 5, a plain `git add index.html styles.css mente.js && git commit` suffices — ensure `git status` shows `hero.js` as deleted in the commit.)

---

## Task 2: 5 word-beats + brain B&N→color on first absorption

Fill in the phase-2 word beats: the 5 discipline words appear one-by-one and get absorbed, and the brain goes from B&N to color — igniting on the first absorption, then a new color per beat. Expose `erraticize` so the changing word restyles.

**Files:**
- Modify: `erratic.js` (expose `erraticize` on `window`)
- Modify: `mente.js` (implement the word/brain part of `renderPhase2`)
- Modify: `styles.css` (brain color transition + a non-transform absorb pulse)

**Interfaces:**
- Consumes: `stage`, `clamp`, `renderPhase2` from Task 1; `window.erraticize(el)`.
- Produces: constants `DISCIPLINES` (string[5]), `BEATS` (=5), `BEAT_HUE` (number[5]); helper `smooth01(t)`; functions `setBeat(beat)` and `renderWord(beat, local)`; the `.cerebro` gains `filter`/`is-absorbing` state driven by JS.

- [ ] **Step 1: Expose `erraticize` on `window` in `erratic.js`**

At the end of `erratic.js` add:
```js
// Exposed so sections that swap text at runtime (e.g. the per-beat service
// word) can re-apply the effect after changing an element's text.
window.erraticize = erraticize;
```

- [ ] **Step 2: Implement the word + brain logic in `mente.js`**

Add config near the top of the IIFE (after the phase constants):
```js
    const brain = stage.querySelector(".cerebro");
    const wordEl = stage.querySelector(".herr-palabra");

    const DISCIPLINES = [
        "Ilustración y Diseño Gráfico",
        "Modelado 3D",
        "Motion Graphics",
        "Desarrollo web",
        "Campañas publicitarias",
    ];
    const BEATS = DISCIPLINES.length;

    // Placeholder de "cerebro de color por beat": hasta tener los assets reales,
    // se quita el B&N y se tinta con hue-rotate. Reemplazar por swap de src
    // (brain.src = BRAIN_SRCS[beat]) cuando existan las versiones de color.
    const BEAT_HUE = [0, 205, 45, 265, 140];   // deg, un tono por beat

    // Desde dónde entra la palabra de cada beat (vmin); se absorbe hacia (0,0).
    const WORD_SPOTS = [
        { x: -24, y: -14 }, { x: 24, y: -16 }, { x: -26, y: 16 },
        { x: 26, y: 14 }, { x: 0, y: -22 },
    ];

    const smooth01 = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
```

Add the beat/word functions (before `renderPhase2`):
```js
    let currentBeat = -1;
    const setBeat = (beat) => {
        if (beat === currentBeat) return;
        currentBeat = beat;
        wordEl.dataset.text = DISCIPLINES[beat];
        window.erraticize(wordEl);
        // Enciende color en la 1ª absorción y cambia por beat (placeholder).
        brain.style.filter = `hue-rotate(${BEAT_HUE[beat]}deg) saturate(1.5)`;
        brain.classList.remove("is-absorbing");
        void brain.offsetWidth;              // reinicia la animación de pulso
        brain.classList.add("is-absorbing");
    };

    const renderWord = (beat, local) => {
        const spot = WORD_SPOTS[beat];
        const absorb = smooth01((local - 0.6) / 0.4);   // 0 hasta 0.6, →1 al final
        const wx = spot.x * (1 - absorb);
        const wy = spot.y * (1 - absorb);
        const scale = 1 - 0.8 * absorb;
        const op = clamp(Math.min(local / 0.2, 1) * (1 - absorb), 0, 1);
        wordEl.style.transform =
            `translate(-50%, -50%) translate(${wx}vmin, ${wy}vmin) scale(${scale})`;
        wordEl.style.opacity = op;
    };
```

Replace the `renderPhase2` stub with:
```js
    const renderPhase2 = (herrP) => {
        const beatFloat = herrP * BEATS;
        const beat = clamp(Math.floor(beatFloat), 0, BEATS - 1);
        const local = beatFloat - beat;
        setBeat(beat);
        renderWord(beat, local);
    };
```

- [ ] **Step 3: Add brain color transition + non-transform pulse to `styles.css`**

The `.cerebro` already uses `transform` (scale/apertura) and `translate` (parallax), so the absorb pulse must NOT use those. Use a drop-shadow glow + a smooth filter transition. Add near the `.cerebro` rules:
```css
/* Transición de color del cerebro entre beats (el filter lo setea mente.js:
   grayscale en fase 1 → hue-rotate por beat en fase 2). */
.cerebro { transition: translate 0.18s ease-out, filter 0.5s ease; }

/* Pulso de absorción: glow breve por drop-shadow (no toca transform/scale,
   ocupados por la apertura y el parallax). */
.cerebro.is-absorbing { animation: cerebro-pulse 0.5s ease-out; }
@keyframes cerebro-pulse {
    0%   { filter: var(--cerebro-filter, none) drop-shadow(0 0 0 rgba(255,255,255,0)); }
    40%  { filter: var(--cerebro-filter, none) drop-shadow(0 0 26px rgba(255,255,255,0.55)); }
    100% { filter: var(--cerebro-filter, none) drop-shadow(0 0 0 rgba(255,255,255,0)); }
}
```
Note: the existing `.cerebro` base rule already has `transition: translate 0.18s` merged from the shared `.ojo,.mano-lupa,.cerebro` rule — if adding the standalone `.cerebro { transition: … }` above conflicts, instead APPEND `, filter 0.5s ease` to the existing shared transition and skip the duplicate. The pulse `drop-shadow` intentionally layers on top; `--cerebro-filter` is optional (falls back to `none`) — the hue-rotate set inline by JS still applies during non-pulse frames.

- [ ] **Step 4: Verify visually**

Serve and scroll into phase 2. Confirm:
- The 5 discipline words appear **one at a time** (Ilustración y Diseño Gráfico → … → Campañas publicitarias), each entering from an offset and shrinking into the brain as its beat ends, styled with `erratic`.
- The brain is **B&N through the doors**, then **ignites color on the first word absorbed**, and **changes color each subsequent beat**, with a brief glow pulse — and it does NOT shrink/jump (scale stays from the hero grow).
- Reduced-motion still shows the static fallback.

- [ ] **Step 5: Commit**

```bash
git add erratic.js mente.js styles.css
git commit -m "feat(mente): beats de servicio + cerebro que enciende color al absorber

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Logo rain + absorption (phase 2)

Inject the 15 logos and animate them flying from the edges into the brain, deterministically driven by phase-2 progress, a few at a time.

**Files:**
- Modify: `mente.js` (inject logos; add `renderLogos`; call it from `renderPhase2`)

**Interfaces:**
- Consumes: `stage`, `clamp`, `renderPhase2` from Tasks 1-2.
- Produces: `LOGOS` (string[15]), `logoEls` (HTMLImageElement[]), `R` (px edge radius, resize-updated), `renderLogos(herrP)`.

- [ ] **Step 1: Add logo config + injection + radius in `mente.js`**

Add config near `DISCIPLINES`:
```js
    const lluvia = stage.querySelector(".herr-lluvia");
    // Logos: lluvia libre, sin correlación con disciplinas (decisión 2026-09-15).
    const LOGOS = [
        "after-effects", "audition", "blender", "capcut", "chatgpt",
        "claude", "css", "html5", "illustrator", "js",
        "photoshop", "substance-3d-painter", "unity", "unreal",
        "visual-studio-code",
    ];
    const logoEls = LOGOS.map((name) => {
        const img = document.createElement("img");
        img.src = `resources/logos/${name}.svg`;
        img.alt = "";
        img.decoding = "async";
        img.setAttribute("aria-hidden", "true");
        lluvia.appendChild(img);
        return img;
    });

    let R = 0;   // radio de borde para la lluvia (px)
    const onResize = () => { R = Math.min(innerWidth, innerHeight) * 0.44; };
```

- [ ] **Step 2: Add `renderLogos` and call it from `renderPhase2`**

```js
    const LOGO_WIN = 0.16;      // franja de progreso visible de cada logo
    const GOLDEN = 2.399963;    // ángulo áureo (rad)
    const renderLogos = (herrP) => {
        const n = logoEls.length;
        const first = 0.02;
        const last = 0.98 - LOGO_WIN;
        for (let i = 0; i < n; i++) {
            const t0 = first + (last - first) * (i / (n - 1));
            const local = (herrP - t0) / LOGO_WIN;
            const el = logoEls[i];
            if (local <= 0 || local >= 1) { el.style.opacity = "0"; continue; }
            const ang = i * GOLDEN;
            const dist = (1 - local) * R;                 // borde → centro
            const x = Math.cos(ang) * dist;
            const y = Math.sin(ang) * dist;
            const s = 0.85 * (1 - local) + 0.12;
            const op = clamp(Math.min(local / 0.15, (1 - local) / 0.15), 0, 1);
            el.style.opacity = op.toFixed(3);
            el.style.transform =
                `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(3)})`;
        }
    };
```
Extend `renderPhase2` (add the logos call at the end — it must run in BOTH the phase-1 and phase-2 branches so logos hide when `herrP` is 0; keep the existing phase-1 B&N guard intact):
```js
    const renderPhase2 = (herrP) => {
        if (herrP <= 0) {
            // fase 1 / umbral: cerebro vuelve a B&N (quita el tinte inline) y sin palabra.
            if (currentBeat !== -1) { currentBeat = -1; brain.style.filter = ""; }
            wordEl.style.opacity = 0;
        } else {
            const beatFloat = herrP * BEATS;
            const beat = clamp(Math.floor(beatFloat), 0, BEATS - 1);
            const local = beatFloat - beat;
            setBeat(beat);
            renderWord(beat, local);
        }
        renderLogos(herrP);
    };
```
Wire the radius: call `onResize()` right before the first `update()`, and add it to the resize listener:
```js
    onResize();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => { onResize(); onScroll(); });
```
(Replace the Task 1 init/resize lines with this version.)

- [ ] **Step 3: Verify visually**

Scroll through phase 2. Confirm logos **fly in from the edges** and get pulled into the brain (shrink + fade), only **a few visible at once**, spread across the whole phase, and scrolling back up **reverses cleanly** (no pile-up).

- [ ] **Step 4: Commit**

```bash
git add mente.js
git commit -m "feat(mente): lluvia de logos absorbidos por el cerebro

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Ambient dust canvas

Add the drifting dust starfield on `.herr-dust`, animated by its own rAF loop, paused when the journey is offscreen.

**Files:**
- Modify: `mente.js` (dust init + loop + IntersectionObserver)

**Interfaces:**
- Consumes: `stage`, `journey` from Task 1.
- Produces: `startDust()` / `stopDust()`.

- [ ] **Step 1: Add the dust loop to `mente.js`**

Add before the scroll wiring:
```js
    // ----- polvo ambiente (starfield tenue a la deriva) -----
    const canvas = stage.querySelector(".herr-dust");
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
        const count = Math.round((w * h) / 14000);
        motes = Array.from({ length: count }, (_, i) => ({
            x: (i * 97.3) % w,
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
            if (m.y > h) m.y = 0;
            if (m.x < 0) m.x = w; else if (m.x > w) m.x = 0;
            ctx.globalAlpha = 0.25 + (m.r / 2) * 0.4;
            ctx.fillStyle = "#FFFFFF";   // --blanco
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
    const io = new IntersectionObserver((entries) => {
        entries[0].isIntersecting ? startDust() : stopDust();
    }, { threshold: 0 });
    io.observe(journey);
```
Also add dust resizing to the resize listener (replace the Task 3 resize listener):
```js
    window.addEventListener("resize", () => {
        onResize(); sizeDust(); seedDust(); onScroll();
    });
```

- [ ] **Step 2: Verify visually**

Scroll into the journey: a subtle white dust field **drifts** behind the brain (over the `--azul` backdrop once the doors open), sits **behind** the brain/logos, and the loop **pauses** when the journey is scrolled fully out of view. Reduced-motion: no dust (script bails; `.herr-dust` also hidden by CSS).

- [ ] **Step 3: Commit**

```bash
git add mente.js
git commit -m "feat(mente): polvo ambiente en canvas, pausado fuera de vista

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Post-implementation notes

- **Colored-brain assets:** when Luly delivers the ~5 colored brains, replace the `BEAT_HUE` hue-rotate placeholder in `setBeat()` with `brain.src = BRAIN_SRCS[beat]` (and drop `grayscale`/`saturate`). B&N in phase 1 is the base `filter: grayscale(1) contrast(1.25)`; keep that until the first beat sets a color.
- **Phase tuning:** `DOOR_VH`/`TOOLS_VH` in `mente.js`, `.mente-journey { height }`, and `#herramientas { top }` in CSS must stay in sync (150vh door / 500vh tools / 750vh total). Tune together.
- **Not in scope (own sessions):** portfolio/nosotros/contacto rooms and their transitions; any persistent connector motif beyond the brain.
```
