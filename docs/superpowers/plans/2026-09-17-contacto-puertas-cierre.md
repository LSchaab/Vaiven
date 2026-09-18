# Contacto — puertas cerrándose (Nosotros → Contacto) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the vaivén by having the hero's own grid doors slide shut over the (already centered, still) Nosotros team at the end of the pinned recorrido, then fade in the Contacto content on the closed grid — literally returning to the opening's black-grid threshold.

**Architecture:** Extend the single `mente.js`-owned pinned journey with a QUIET buffer (team held centered & still) followed by a CIERRE stretch. A new `--cierre-progress` (0→1) drives the **same** `.puerta` elements from open back to closed by combining with `--hero-progress` in the existing transform. Contacto content mirrors the proven Nosotros pattern: on desktop coverflow its content is moved into a `.contacto-reveal` layer inside the stage (opacity driven by `--cierre-progress`); on mobile/reduced-motion it stays the normal `#contacto` section already built.

**Tech Stack:** Vanilla JS, CSS custom properties. No new libraries. Static site — no build, no test framework; verification is manual in Chrome + devtools.

## Global Constraints

- **Colors only via tokens** — never hardcode hex. Grid lines reuse the existing `rgba(255,255,255,0.14)` recipe already used by `.puerta`.
- **`mente.js` is the single scroll owner.** No other file may add scroll-driven layout. Other files read the CSS vars it publishes.
- **Scroll-scrubbed** — every motion is controlled by the user's scroll position, consistent with the rest of the recorrido. No autonomous timelines.
- **Reduced-motion:** `mente.js` already `return`s early (no scrub). Under reduced-motion the closing must NOT run and `#contacto` must remain a normal accessible section with a working `mailto:`.
- **Coverflow only ≥1025px.** `window.WorkCarousel.coverflow` is the switch. Mobile/tablet uses the gallery and the normal `#contacto` section — untouched.
- **No collision with in-progress visual work:** the only edit to *existing* shared CSS is the two `.puerta` transform lines (styles.css:409-410). Everything else is additive (new CSS blocks, new file, JS-only changes).

---

### Task 1: Driver + phases in `mente.js`

Add the QUIET + CIERRE tail to the journey, compute `--cierre-progress`, publish it, toggle an `is-cerrando` state class, and point the `#contacto` nav at the end. No visual change yet (the door transform still ignores `--cierre-progress` until Task 2) — verified via devtools.

**Files:**
- Modify: `mente.js` (phase constants ~L37-39; `layout()` height ~L56; `render()` ~L213-230; nav block near end ~L302-311)

**Interfaces:**
- Produces: CSS var `--cierre-progress` (0→1) set on `.mente-stage`; class `is-cerrando` on `.mente-stage` while `cierreP > 0`. Consumed by Task 2 (door transform) and Task 3 (`.contacto-reveal` opacity + `contacto.js`).

- [ ] **Step 1: Add phase constants**

In `mente.js`, next to the existing phase constants (after `PORTAL_VH`):

```js
    const PORTAL_VH = 180;   // el cerebro se encoge y el iris (portal) se abre desde él
    const QUIET_VH  = 60;    // pausa: el equipo queda centrado y quieto (iris verde pleno)
    const CIERRE_VH = 150;   // las puertas del inicio vuelven a cerrarse sobre el equipo → Contacto
```

- [ ] **Step 2: Add px thresholds + journey height**

Replace the `layout()` body so the tail is QUIET + CIERRE instead of the old `+100vh` cola. Add `QUIET_PX`/`CIERRE_PX` to the `let` line:

```js
    // Thresholds de scroll en px (se recalculan por resize) + alto del recorrido.
    let DOOR_PX = 0, TOOLS_PX = 0, PORTAL_PX = 0, CARDS_PX = 0, QUIET_PX = 0, CIERRE_PX = 0;
    const layout = () => {
        const vh = innerHeight / 100;
        DOOR_PX = DOOR_VH * vh;
        TOOLS_PX = TOOLS_VH * vh;
        PORTAL_PX = PORTAL_VH * vh;
        CARDS_PX = cardsVH() * vh;
        QUIET_PX = QUIET_VH * vh;
        CIERRE_PX = CIERRE_VH * vh;
        // Tail = QUIET (equipo quieto) + CIERRE (puertas cierran + Contacto aparece).
        // Reemplaza la vieja cola de +100vh: el stage sigue pineado hasta el final.
        journey.style.height =
            (DOOR_VH + TOOLS_VH + PORTAL_VH + cardsVH() + QUIET_VH + CIERRE_VH) + "vh";
    };
```

- [ ] **Step 3: Compute + publish `--cierre-progress` and toggle `is-cerrando`**

In `render(scrolled)`, after the `--portal-open` line and before `renderPhase2(herrP)`, add:

```js
        // Cierre: al final del recorrido, después de la pista de cards + una pausa
        // (QUIET) con el equipo quieto, las puertas del inicio vuelven a cerrarse.
        const cierreStart = DOOR_PX + TOOLS_PX + PORTAL_PX + CARDS_PX + QUIET_PX;
        const cierreP = CIERRE_PX > 0
            ? clamp((scrolled - cierreStart) / CIERRE_PX, 0, 1)
            : 0;
        stage.style.setProperty("--cierre-progress", cierreP.toFixed(4));
        stage.classList.toggle("is-cerrando", cierreP > 0);
```

- [ ] **Step 4: Add the `#contacto` nav → scroll to the closed end**

At the end of the IIFE, after the existing `workLink` block, add:

```js
    // Nav "contacto": el contenido de Contacto vive al final del recorrido pineado
    // (sobre las puertas ya cerradas). En coverflow llevamos el scroll al final; en
    // mobile/galería dejamos el ancla nativa a #contacto (sección normal).
    const contactoLink = document.querySelector('nav a[href="#contacto"]');
    if (contactoLink) {
        contactoLink.addEventListener("click", (e) => {
            if (!coverflowOn()) return;
            e.preventDefault();
            scrollTo({ top: journey.offsetHeight - innerHeight, behavior: "smooth" });
        });
    }
```

- [ ] **Step 5: Verify in Chrome (devtools)**

Serve the site (`python -m http.server 8080`) and open in Chrome ≥1025px width. Scroll fully to the bottom. In devtools console:

```js
getComputedStyle(document.querySelector('.mente-stage')).getPropertyValue('--cierre-progress')
```
Expected: `1` (or close) at the very bottom, `0` before the CIERRE region. `.mente-stage` has class `is-cerrando` at the bottom. No visual change to the doors yet (that's Task 2). The team (`.nos-reveal`) is still centered and visible in the QUIET region just above the bottom.

- [ ] **Step 6: Commit**

```bash
git add mente.js
git commit -m "feat(contacto): fase de cierre — driver --cierre-progress + tail QUIET/CIERRE"
```

---

### Task 2: Doors close via `--cierre-progress` (CSS)

Make the **same** hero doors slide from open back to closed as `--cierre-progress` goes 0→1, lift them above the team while closing, and drop the cursor-follow glow so the closed face is the static grid threshold.

**Files:**
- Modify: `styles.css` (the two `.puerta` transform lines ~L409-410; add `is-cerrando` rules nearby)

**Interfaces:**
- Consumes: `--cierre-progress` and `.mente-stage.is-cerrando` from Task 1.
- Produces: doors visually closed at journey end (z above `.nos-reveal` z6).

- [ ] **Step 1: Combine the drivers in the door transforms**

Replace styles.css lines 409-410:

```css
.puerta-izq { transform: translateX(calc(var(--hero-progress) * -100%)); }
.puerta-der { transform: translateX(calc(var(--hero-progress) *  100%)); }
```

with (net offset = hero opening minus cierre closing; `--cierre-progress` defaults to 0 so hero behavior is unchanged everywhere else):

```css
/* Apertura del hero (--hero-progress 0→1 abre) y cierre final (--cierre-progress
   0→1 vuelve a cerrar): las MISMAS puertas. Net = hero - cierre. */
.puerta-izq { transform: translateX(calc((var(--hero-progress) - var(--cierre-progress, 0)) * -100%)); }
.puerta-der { transform: translateX(calc((var(--hero-progress) - var(--cierre-progress, 0)) *  100%)); }
```

- [ ] **Step 2: Lift the doors above the team + drop the glow while closing**

Immediately after the `.puerta-der::after` rule (styles.css ~L307), add:

```css
/* Fase de cierre: las puertas pasan POR ENCIMA del equipo (.nos-reveal z6) para
   taparlo, y se apaga el glow que sigue al cursor → queda la grilla estática,
   idéntica al umbral negro del inicio. */
.mente-stage.is-cerrando .puerta { z-index: 7; }
.mente-stage.is-cerrando .puerta::after { opacity: 0; }
```

- [ ] **Step 3: Verify in Chrome**

Reload ≥1025px. Scroll into the CIERRE region at the bottom: the two grid doors should slide in from the sides and meet in the center, covering the team, ending as a full black-grid threshold. Scroll back up — they reopen (scrubbed). The hero opening at the top still works unchanged.

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "feat(contacto): las puertas del inicio se cierran al final (--cierre-progress)"
```

---

### Task 3: Contacto content over the closed doors

Fade the Contacto content in on the closed grid, mirroring the Nosotros `.nos-reveal` pattern: on coverflow, move `#contacto`'s content into a `.contacto-reveal` layer inside the stage; collapse the real `#contacto`. Opacity is scrubbed by `--cierre-progress`; pointer-events open only once revealed.

**Files:**
- Create: `contacto.js`
- Modify: `index.html` (add `<script src="contacto.js" defer></script>` after `nosotros.js`)
- Modify: `styles.css` (add `.contacto-reveal` block + `body.contacto-in-stage #contacto { display:none }`)

**Interfaces:**
- Consumes: `--cierre-progress` + `.mente-stage.is-cerrando` (Task 1); `.contacto__inner` markup (already in `index.html`); `window.WorkCarousel.coverflow`.
- Produces: `body.contacto-in-stage` class; `.contacto-reveal` layer with `.is-open` toggle.

- [ ] **Step 1: Add the `.contacto-reveal` CSS**

Append to styles.css (after the `.contacto` block added earlier). Note the opacity fades in over the last 40% of the cierre, so it appears as the doors finish closing:

```css
/* Capa de salida final: el contenido de Contacto sobre las puertas ya cerradas,
   dentro del stage pineado (igual que .nos-reveal para el equipo). Opacity atada
   a --cierre-progress: aparece cuando las puertas terminan de cerrarse. La grilla
   de las puertas ES el fondo (una sola capa). */
.contacto-reveal {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 8;                 /* sobre las puertas de cierre (z7) */
    pointer-events: none;
    opacity: clamp(0, calc((var(--cierre-progress, 0) - 0.6) * 2.5), 1);
}
.contacto-reveal.is-open { pointer-events: auto; }

/* Desktop (coverflow): contacto.js MUEVE el contenido real a .contacto-reveal, así
   que la sección real queda vacía → la colapsamos. Marcada por clase para no
   romper reduced-motion (donde #contacto sigue siendo sección normal). */
body.contacto-in-stage #contacto { display: none; }
```

- [ ] **Step 2: Create `contacto.js`**

```js
// contacto.js — Contacto es el CIERRE del recorrido. En desktop (coverflow) su
// contenido REAL se mueve DENTRO del stage pineado como capa final
// (.contacto-reveal): cuando las puertas del inicio vuelven a cerrarse sobre el
// equipo, el contenido de Contacto aparece sobre la grilla ya cerrada. UNA sola
// copia — se MUEVE, no se clona. En galería/mobile/reduced-motion queda como
// sección normal (no se toca). Ref: spec 2026-09-17-contacto-puertas-cierre.
(() => {
    "use strict";
    if (!window.WorkCarousel || !window.WorkCarousel.coverflow) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const journey = document.querySelector(".mente-journey");
    const stage   = journey && journey.querySelector(".mente-stage");
    const section = document.querySelector("#contacto");
    const content = section && section.querySelector(".contacto__inner");
    if (!journey || !stage || !content) return;

    // Mover (no clonar) el contenido real al stage como capa final.
    const layer = document.createElement("div");
    layer.className = "contacto-reveal";
    layer.appendChild(content);          // MOVE — la sección real queda vacía
    stage.appendChild(layer);
    document.body.classList.add("contacto-in-stage");   // CSS colapsa #contacto

    // pointer-events: sólo con la capa revelada (puertas ya cerradas), si no taparía
    // clicks. La opacidad la maneja CSS con --cierre-progress; acá sólo leemos ese
    // valor (inline style que setea mente.js) para abrir/cerrar los eventos.
    let ticking = false;
    const sync = () => {
        const c = parseFloat(stage.style.getPropertyValue("--cierre-progress")) || 0;
        layer.classList.toggle("is-open", c >= 0.85);
        ticking = false;
    };
    addEventListener("scroll", () => {
        if (!ticking) { ticking = true; requestAnimationFrame(sync); }
    }, { passive: true });
    sync();
})();
```

- [ ] **Step 3: Load the script**

In `index.html`, after the `nosotros.js` script tag, add:

```html
    <!-- Contacto: cierre del recorrido. Mueve su contenido al stage como capa final
         (.contacto-reveal) que aparece con las puertas ya cerradas. -->
    <script src="contacto.js" defer></script>
```

- [ ] **Step 4: Verify in Chrome**

Reload ≥1025px. Scroll to the bottom: after the doors close, the Contacto block (título, email gigante, redes) fades in on the black grid. The email link is clickable (opens mail client); Instagram/X open in new tabs. Scroll up — it fades back out and the doors reopen. Then narrow the window to <1025px and reload: `#contacto` renders as the normal section (no doors), email still works.

- [ ] **Step 5: Commit**

```bash
git add contacto.js index.html styles.css
git commit -m "feat(contacto): contenido aparece sobre las puertas cerradas (.contacto-reveal)"
```

---

### Task 4: Retarget the `#nosotros` nav to the QUIET region

The very end of the recorrido is now Contacto, not Nosotros. Point the `#nosotros` nav at the QUIET region where the team is centered and still (before the doors close), instead of the old `maxScroll - 0.4*innerHeight`.

**Files:**
- Modify: `nosotros.js` (nav click handler ~L44-48)

**Interfaces:**
- Consumes: journey layout (QUIET region sits just before the CIERRE tail defined in Task 1).

- [ ] **Step 1: Update the nav target**

Replace the `nosLink` click handler body in `nosotros.js`:

```js
            nosLink.addEventListener("click", (e) => {
                e.preventDefault();
                const maxScroll = journey.offsetHeight - innerHeight;
                scrollTo({ top: maxScroll - innerHeight * 0.4, behavior: "smooth" });
            });
```

with (land in the QUIET region: past the cards' green-iris close, before the doors start closing — CIERRE=150vh + half of QUIET=60vh back from the end ≈ 1.8 viewports):

```js
            nosLink.addEventListener("click", (e) => {
                e.preventDefault();
                // El final es ahora Contacto (puertas cerradas). Nosotros vive en la
                // pausa QUIET justo antes del cierre: retrocedemos CIERRE_VH(150) +
                // ~½ QUIET_VH(60) ≈ 1.8 viewports desde el fondo → equipo centrado y quieto.
                const maxScroll = journey.offsetHeight - innerHeight;
                scrollTo({ top: maxScroll - innerHeight * 1.8, behavior: "smooth" });
            });
```

- [ ] **Step 2: Verify in Chrome**

Reload ≥1025px. Click **nosotros** in the nav: the page should settle with the team centered and still, doors open (no closing). Click **contacto**: the page should settle at the very bottom with the doors closed and the Contacto content visible. Both scrubbed smoothly.

- [ ] **Step 3: Commit**

```bash
git add nosotros.js
git commit -m "fix(nosotros): nav apunta a la pausa QUIET (el final ahora es Contacto)"
```

---

## Self-Review notes

- **Spec coverage:** doors-close-over-still-team (Task 1+2), content fades on closed grid as single layer / option A (Task 3), scroll-scrubbed (Task 1), nav for contacto + nosotros (Task 1 + Task 4), mobile/reduced-motion fallback to normal section (Task 3 guards + `body.contacto-in-stage` scoping), colors via tokens / static grid (Task 2 glow-off). The email `mailto:`, arrow-sticker, and socials already shipped in the prior isolated-content pass.
- **Reduced-motion trap avoided:** `#contacto` is collapsed via `body.contacto-in-stage` (added only by `contacto.js`, which bails under reduced-motion) — NOT via `body.coverflow`, so a reduced-motion desktop user keeps the real section.
- **Var scoping:** `--cierre-progress` is set on `.mente-stage`; `.puerta` and `.contacto-reveal` are descendants, so they inherit it. Default `0` in the transform keeps hero opening unaffected.
- **Tunables:** `QUIET_VH`, `CIERRE_VH` (feel of the pause + close speed), the `0.6`/`2.5` opacity ramp, the `0.85` pointer-events threshold, and the `1.8` nav offset. All noted inline.
