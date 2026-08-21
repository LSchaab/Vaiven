# Finish-the-Page — Design Spec

**Date:** 2026-08-20
**Project:** VAI VEN (degree portfolio)
**Author:** Luly + Claude (brainstorming)

Three independent features to close out the site. Each can be built by its own
agent; they touch mostly disjoint files. This spec is the single source of truth
for the build.

---

## Constraints (inherited, non-negotiable)

- **Colors only from the 11 brand tokens** in `styles.css :root`. Never a raw hex
  in a component. Reference tokens / semantic role vars.
- **No build step.** Vanilla HTML/CSS/JS. Libraries via CDN only (matches GSAP).
- **`prefers-reduced-motion`** must be respected by every animation.
- **Mode 1 only** for the base look. The paused `[data-theme="light"]` block is
  untouched by this work.
- Copy in Spanish (Argentine, informal). Code comments in English. kebab-case.

---

## Feature A — Per-category heroes (3D · Motion · Web)

### Context

`portfolio.html` is a **single template** filled from `CATEGORIES[slug]` in
`portfolio.js`, chosen by `?cat=`. Today every category shares one hero shell and
picks an entrance via `cat.anim` (`"orbit"` or `"default"`). We extend this
config pattern — we do **not** fork the page.

### Design

Add a **`hero` field** to each category config selecting a hero renderer:

| `cat.hero` | Category | Renderer |
|---|---|---|
| `"three"` | 3D | Three.js extruded wordmark |
| `"typewriter"` | Web | GSAP typewriter |
| `"motion-kinetic"` | Motion | GSAP kinetic signature |
| *(unset)* | Gráfico, Campañas | existing `default` cascade (unchanged) |

`portfolio.js` dispatches on `cat.hero` after building the shell. Each renderer
is an **isolated module** exposing a single entry function
`mountHero(container, cat)`; `portfolio.js` calls the right one. This keeps
`portfolio.js` from bloating and lets each hero be understood/tested alone.

Only the 3D category loads Three.js (script added to `portfolio.html`, guarded so
it's a no-op for other categories). GSAP is already loaded.

#### A1 — 3D hero (Three.js)

- Extruded **"3D"** wordmark (`TextGeometry` via `FontLoader`, or `ExtrudeGeometry`
  from an SVG path if font loading is fussy — builder's call, document which).
- Material + lighting use **brand tokens** (read the resolved CSS var values in JS
  so it also works after a palette toggle; re-read on palette change is a nice-to-have,
  not required).
- **Interaction:** drag-to-orbit (pointer + touch) with a gentle idle auto-spin
  that resumes after the user lets go. Clamp vertical orbit so it never flips.
- **Reduced motion:** render a single static framed shot, no auto-spin, drag
  optional-off.
- **Fallbacks:** if WebGL is unavailable or Three.js fails to load, fall back to
  the current erratic `.cat-title` text (the existing shell stays in the DOM,
  hidden only once the canvas is confirmed working).
- Lives in `hero-3d.js`. Canvas mounts into `.cat-hero-collage` (or a dedicated
  `.cat-hero-canvas` container the module creates).
- Clean up on teardown is not required (page is a full load per category).

#### A2 — Web hero (GSAP typewriter)

- **Dark surface** for this hero only: `--negro` (or `--azul-oscuro`) background
  behind the `cat-hero` content, applied via a `[data-cat="web"]` scope so it
  doesn't leak to other categories.
- Typewriter types the title **`Programación Web`** with a blinking caret, then a
  second line types a short description.
- **Description copy (draft, Luly to tweak):**
  > "Sitios que cargan rápido, se ven bien en cualquier pantalla y hacen lo que
  > tienen que hacer. HTML, CSS y JavaScript hasta que funcione."
- Reduced motion: show full title + description instantly (no typing).
- Lives in `hero-web.js` (or a `category-heroes.js` shared file — builder's call;
  if shared, keep each renderer a separate exported function).

#### A3 — Motion hero (GSAP kinetic)

- Uses Motion's existing real copy (title `Motion`, existing `desc`).
- Per-letter entrance with **distinct eases** + a subtle continuous loop
  (e.g. gentle y-bob / skew oscillation on the wordmark) that reads as "nothing
  stays still". Keep it tasteful, not seizure-inducing.
- Reduced motion: static title + fade-in desc (reuse default cascade).
- Same module pattern as A2.

### Files touched

- `portfolio.html` — add Three.js CDN `<script>` (deferred), maybe a canvas
  container in the hero shell.
- `portfolio.js` — add `hero` field to `3d`/`web`/`motion` configs; dispatch to
  the right `mountHero`.
- New: `hero-3d.js`, and `hero-web.js` + `hero-motion-cat.js` (or one
  `category-heroes.js`).
- `portfolio.css` — `[data-cat="web"]` dark surface, canvas sizing, caret styles.

### Out of scope

Gráfico and Campañas heroes (no real copy yet — stay on the `default` cascade).

---

## Feature B — Eye = palette toggle

### Behavior

- The `.volver` eye **stops navigating**. It becomes a **toggle** between two
  palettes: **live (base)** and **"alt"** (the Figma "changed" look). Click /
  Enter / Space flips. Home is reachable via the logo (already links `#hero`).
- **Persists in `localStorage`** (`vaiven-palette` = `"base"` | `"alt"`) and
  applies on **both** `index.html` and `portfolio.html`.
- Applied **pre-paint** (small inline/early script sets `data-palette` on `<html>`
  before first paint) to avoid a flash.
- A short CSS color transition on toggle; **instant** under reduced motion.
- The eye is **always active**, including during the first-visit gate.

### Palette mapping (alt = the Figma mockups)

Implemented as override blocks scoped to `<html data-palette="alt">`. Base = no
attribute (current CSS unchanged). Sections already drive background through
`--section-bg`, so the alt block mostly reassigns that var per section.

| Surface | Base | Alt (`data-palette="alt"`) |
|---|---|---|
| Hero `#hero` | `--section-bg: --azul` | `--naranja → --violeta-claro` vertical gradient |
| Portfolio `#portfolio` | `--azul` | `--azul` (unchanged) |
| Contacto `#contacto` | `--lila` | `--violeta-claro` |
| Nosotros `#nosotros` | `--azul` | `--azul-oscuro` |
| Destacados `#destacados` | `--violeta-claro` | `--verde` |
| Nav sidebar | gradient | solid `--negro`, links `--blanco`, active `--amarillo`/`--naranja` |

On `portfolio.html`, apply the alt palette to its sections analogously
(`#cat-hero`, `#contacto`, `#cat-projects`) so the toggle looks consistent
cross-page. Match the mockups; verify text contrast stays legible in both states
(builder adjusts `--text-*`/accents within the alt block as needed — brand tokens
only).

### Files touched

- New: `palette.js` (shared) — read `localStorage`, set `data-palette`, wire the
  eye toggle, write back. Loaded on both pages. Include a tiny pre-paint snippet
  so there's no flash.
- `styles.css` — `[data-palette="alt"] …` override blocks (hero gradient, nav
  black, section bgs, contrast tweaks).
- `index.html` + `portfolio.html` — load `palette.js`; the eye's role changes
  (remove/````neutralize```` its navigation; keep it a `<button>`-like control
  with proper `aria-label` e.g. "Cambiar colores"). Ensure it's keyboard operable.

### Interaction with existing nav code

`.volver` currently is an `<a href>`. Repurpose: either make it a `<button>` or
keep the anchor but `preventDefault` and stop it from routing. Its click must not
trigger section switching. Confirm `script.js` / `portfolio.js` anchor handlers
don't double-handle it.

---

## Feature C — First-visit sequential gate (home page only)

### Behavior

- On a **first visit** (no completion flag), the home sections must be walked in
  the order **home → destacados → portfolio → nosotros → contacto**.
- **Only-next-unlocks:** nav links for not-yet-reached sections are visually
  dimmed + `aria-disabled="true"`; their clicks are intercepted (no navigation).
  Reaching a section **unlocks it permanently** for the visit. The single "next"
  allowed section is always clickable.
- Completing the full sequence sets `localStorage` `vaiven-tour-done = "1"` →
  every future visit on that browser is **free-nav** (gate never runs again).
- **Logo (home) and eye (palette) are always active**, even mid-gate.
- Gate is **home-only**. `portfolio.html` is always free-nav.
- **Dev reset:** `?tour=reset` (and/or a documented `localStorage.removeItem`)
  clears the flag so it can be re-tested.

### Order vs. visual nav order

The nav is listed home, portfolio, contacto, nosotros, destacados — but the gate
sequence is home, destacados, portfolio, nosotros, contacto. The gate enforces
the **sequence**, independent of list position. Locked state is by *reached-set*,
not by list index.

### Implementation

- New module `tour.js` (loaded on `index.html` only), integrates with the
  existing `setActiveSection` in `script.js`:
  - Maintain `reached` set + the ordered `TOUR = ["hero","destacados","portfolio","nosotros","contacto"]`.
  - A section is **unlocked** if it's in `reached` OR it's the immediate next
    unreached item in `TOUR`.
  - Wrap/guard the nav click handler: if target is locked, block it.
  - On `setActiveSection(id)`, add `id` to `reached`; if `reached` covers all of
    `TOUR`, set the done flag and remove all locks.
  - Reflect lock state in the DOM (`aria-disabled`, a `.is-locked` class for the
    dimmed style).
- `styles.css` — `.is-locked` nav style (reduced opacity, `cursor: not-allowed`).

### Files touched

- New: `tour.js`.
- `index.html` — load `tour.js`.
- `script.js` — expose a hook or refactor so `tour.js` can observe/guard section
  changes cleanly (avoid two handlers fighting). Prefer: `script.js` calls a
  `window`-level guard the tour installs, or the tour wraps `setActiveSection`.
- `styles.css` — locked-nav styling.

---

## Ordering / dependencies for the build

- **A, B, C are largely independent** and can be built in parallel.
- Shared-file contention: **B and C both touch `styles.css`, `index.html`,
  `script.js`**. Serialize the merges of B and C (or have one agent own the
  home-page wiring for both) to avoid conflicts. A touches `portfolio.*` + new
  hero files — safe in parallel.

## Testing (manual — static site)

- Serve locally (`python3 -m http.server` / `npx serve .`).
- **A:** load `portfolio.html?cat=3d` (drag orbit, reduced-motion static,
  WebGL-off fallback), `?cat=web` (typewriter), `?cat=motion` (kinetic).
- **B:** click eye on both pages → alt palette matches mockups; reload → persists;
  toggle back → base restores; no flash on load; reduced-motion instant.
- **C:** clear `localStorage`; verify only next section unlocks in order; logo +
  eye stay usable; finishing sets free-nav; `?tour=reset` re-arms.

## Success criteria

- 3D/Web/Motion each have a distinct, on-brand hero; other categories unaffected.
- Eye toggles the full palette to match the Figma mockups, persists, cross-page,
  no flash, respects reduced motion, no longer navigates.
- First visit enforces the sequential order; completion unlocks free-nav forever;
  logo + eye always available; dev reset works.
- No raw hex added; all color via brand tokens. No console errors.
