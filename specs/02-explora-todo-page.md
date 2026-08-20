# Spec #2 — "Explorá todo" Full-Portfolio Browsing Page

**Status:** 🟡 Design approved (2026-08-01) — not yet implemented
**Audience:** Internal working doc (Luly + Claude only)
**Files this touches once approved:** new `explora.html`, new `explora.js`, new `explora.css`, `portfolio.js` (add a `tools` field to each existing `proyectos` entry), `index.html` (CTA link only)
**Depends on:** Spec #1 — Finishing the Portfolio Category Pages (provides the `CATEGORIES.proyectos` data this page reads from)
**Blocks:** none currently

---

## 1. Goal

Give visitors (jury + recruiters) a way to browse all 25 portfolio projects at once, filtered by category and by tool/software used, plus free-text search — instead of only being able to see 5 projects at a time on a single category page. This is the page Spec #1 explicitly deferred ("Explora todo... does not exist yet and is not part of this spec").

## 2. Background / current state

- Only 2 HTML files exist today: `index.html` (home) and `portfolio.html` — one shared template for all 5 categories, driven by `?cat=` and the `CATEGORIES` config in `portfolio.js`. There is no per-category HTML file, and this spec does not change that.
- `portfolio.js`'s `CATEGORIES` config already has 5 `proyectos` arrays (25 placeholder projects total, from Spec #1), each item shaped `{ title, blurb }`.
- `index.html:265` already has a ghost CTA reading "Explorá todo" inside the Destacados section — today it just links to `href="#portfolio"` (scrolls to the homepage bento grid). This spec repoints it.
- No project detail pages exist. Project cards today (`.bento-item` in `portfolio.html`) are plain, non-interactive `<article>`s — not links.
- `resources/logos/` was recently added with 12 tool/software logos (Blender, Substance 3D Painter, Adobe After Effects/Illustrator/Photoshop, Figma, HTML5, CSS3, JS, PHP, VS Code, Vercel) — added ahead of this spec, unused until now.
- GSAP 3.12.5 is already loaded on `portfolio.html`; the same CDN script tag will be added to `explora.html`.

## 3. Architecture decision

**New files: `explora.html` + `explora.js` + `explora.css`** — not a new mode bolted onto `portfolio.html`.

Category pages differ from each other only in a "variant" sense: same shell (nav, hero container, Proyectos grid, Contacto section, footer), different entrance animation + copy + a couple of CSS custom properties per category — genuinely one shared template, many variants (see decision log below). "Explorá todo" is structurally a different job: a filterable, searchable grid of *all* projects across categories, with its own interaction model (filter chips, live search, empty state). Forcing that into `portfolio.js`'s per-category branch would tangle two things that don't share structure. A third page, following the same precedent as `portfolio.html` being separate from `index.html`, keeps each file doing one job.

`explora.html` follows the same page rhythm as `portfolio.html`: (1) a short hero section with an erratic headline ("EXPLORÁ TODO" or similar) + one-line subtitle, (2) the filter bar + search + results grid, (3) the same reused `#contacto` section `portfolio.html` already borrows from `index.html` (same id, inherits all its styling for free). Same header/logo and the same "Volver" eye button back to `index.html#portfolio`.

## 4. Requirement: Data model — tool tags

Extend each project object inside `CATEGORIES[x].proyectos` (in `portfolio.js`) with a `tools` array:

```js
{ title: "Cráneo Roto", blurb: "Estudio de anatomía low-poly...", tools: ["blender", "substance"] }
```

**10 filterable tool keys** (2 of the 12 logos are excluded — see below):

| Key | Logo file | Why filterable |
|---|---|---|
| `blender` | `Blender-Logo.png` | 3D modeling — core craft tool |
| `substance` | `substance-3d-painter.png` | 3D texturing — differentiates texture-heavy pieces |
| `after-effects` | `adobe-after-effects.png` | Motion/animation craft |
| `illustrator` | `adobe-illustrator.png` | Vector/illustration craft |
| `photoshop` | `adobe-photoshop.png` | Raster/photo-compositing craft |
| `figma` | `figma.png` | UI/product design + prototyping |
| `html` | `html-5.png` | Web markup |
| `css` | `css-3.png` | Web styling |
| `js` | `js.png` | Web interactivity |
| `php` | `php.png` | Web backend — differentiates static vs. dynamic pieces |

**Excluded from filters:** `vs-code.png` and `vercel-com-logo.png`. Both are infrastructure (the editor you typed in, the host you deployed to) rather than a visible craft or technique — nearly every Web project would carry both, so as filter chips they'd either match everything or nothing meaningfully. They stay unused for now; a "built with" credit treatment elsewhere is a possible future idea, explicitly out of scope here.

<details>
<summary>Draft tool tags for all 25 placeholder projects (click to expand)</summary>

**Modelado 3D**
1. Cráneo Roto — `blender`, `substance`
2. Objeto Cotidiano #04 — `blender`, `substance`
3. Personaje: Estática — `blender`
4. Entorno Abandonado — `blender`, `substance`
5. Prop Pack: Ciudad — `blender`

**Motion Graphics**
1. Loop: Pulso — `after-effects`, `illustrator`
2. Ident VAI VEN — `after-effects`, `illustrator`
3. Explainer: Cómo Funciona — `after-effects`, `illustrator`
4. Transición Caótica — `after-effects`
5. Título Animado: Extremos — `after-effects`

**Desarrollo Web**
1. Landing: Estudio X — `figma`, `html`, `css`, `js`
2. Dashboard Interno — `figma`, `html`, `css`, `js`, `php`
3. E-commerce Cápsula — `figma`, `html`, `css`, `js`, `php`
4. Prototipo Interactivo — `html`, `css`, `js`
5. Refactor: Sitio Viejo — `html`, `css`, `js`, `php`

**Diseño Gráfico**
1. Identidad: Estudio Ruido — `illustrator`
2. Editorial: Revista Cero — `illustrator`, `photoshop`
3. Serie de Afiches — `illustrator`, `photoshop`
4. Packaging: Línea Cruda — `illustrator`, `photoshop`
5. Tipografía Custom — `illustrator`

**Campañas Publicitarias**
1. Campaña: Ruptura — `illustrator`, `photoshop`
2. Spot: 15 Segundos — `after-effects`, `illustrator`
3. Activación de Marca — `illustrator`, `photoshop`
4. Serie Digital — `photoshop`, `illustrator`
5. Rebranding: Antes/Después — `illustrator`, `photoshop`

</details>

**Acceptance criteria:** every one of the 25 `proyectos` entries in `portfolio.js` has a non-empty `tools` array using only the 10 keys above (or Luly's edited version — these are Claude-drafted placeholders, same status as Spec #1's copy drafts).

## 5. Requirement: Filters, search, and combination logic

- **Category filter** — single-select tab row: "Todos" (default, active on load) + the 5 category names. Selecting one narrows results to that category; selecting "Todos" clears it.
- **Tool filter** — multi-select icon chips, one per the 10 keys in §4, rendered from `resources/logos/`. Toggling a chip on/off; multiple selected tools combine with **OR** (a project matches if it has *any* selected tool).
- **Category + tools combine with AND** (e.g. category=`3d` AND tools=[`substance`] shows only 3D projects tagged `substance`).
- **Search box** — live filter (updates on every keystroke, no submit button), case-insensitive, matches against a project's title, blurb, tool names, and category name. Combines with AND against the active category/tool filters (i.e. search narrows further, it doesn't replace the other filters).
- A small counter above the grid shows the current match count (e.g. "12 proyectos"). A "Reiniciar filtros" ghost link appears once any filter or search term is active, and clears all of them back to the default (Todos, no tools, empty search) when clicked.

**Acceptance criteria:**
- Loading `explora.html` fresh shows all 25 cards, "Todos" active, no tool filters, empty search.
- Selecting a category shows only that category's matching projects (respecting any active tool filters/search); "Todos" clears the category filter.
- Toggling one tool chip narrows to projects carrying that tool; toggling a second tool chip *widens* the tool match (OR), while still narrowing against any active category/search (AND).
- Typing in the search box narrows further on every keystroke; clearing the box removes that narrowing.
- The result counter always reflects the currently visible card count.
- "Reiniciar filtros" is hidden/disabled with zero active filters and search, and resets everything to default when clicked.

## 6. Requirement: Empty state

If a filter + search combination matches zero projects, the grid is replaced by a single message block (not just left blank) in VAI VEN tone — e.g. **"ACÁ NO HAY NADA. TODAVÍA."** with a one-line subtext and the same "Reiniciar filtros" control to recover. Exact copy is Claude-drafted, Luly edits/replaces same as prior spec's copy.

**Acceptance criteria:** any filter/search combination that matches 0 projects shows the empty-state block instead of an empty grid; clicking its reset control returns to the full 25-card view.

## 7. Requirement: Cards

Each result card shows: category label (small), title, blurb, and a small row of icons for its tagged tools (reusing the same logo assets as the filter chips, at a smaller size). Cards are **not clickable links** — matching the existing `.bento-item` cards on category pages, since no project detail page exists yet. Adding one is explicitly out of scope for this spec.

## 8. Requirement: Layout and motion

- Results render in a **masonry/overlapping grid**, matching the homepage bento grid's aesthetic (per Luly's direction) rather than a uniform grid — chosen despite the extra care needed to keep filter-triggered reflows from looking broken (see below).
- On any filter/search change, cards that leave animate out and cards that enter animate in via GSAP (fade + scale, staggered) rather than an instant snap, so the masonry reflow reads as intentional rather than janky.
- `prefers-reduced-motion` disables the enter/exit stagger — cards show/hide instantly instead, following the same `reduceMotion` matchMedia guard already used in `portfolio.js`.

**Acceptance criteria:** filter/search changes animate the grid in/out under normal motion settings; with `prefers-reduced-motion: reduce`, the same changes apply instantly with no animation.

## 9. Requirement: Entry point

`index.html:265`'s existing "Explorá todo" ghost CTA changes from `href="#portfolio"` to `href="explora.html"`. No other new entry points are added in this spec (e.g. the homepage bento grid itself is untouched) — kept out of scope to stay focused.

**Acceptance criteria:** clicking the Destacados "Explorá todo" CTA navigates to `explora.html`.

## 10. Accessibility

- Category tabs and tool chips are real `<button>` elements (keyboard operable), using `aria-pressed` to reflect active/inactive state.
- The search input has an associated `<label>` (visually hidden if needed).
- The result counter updates in an `aria-live="polite"` region so screen reader users hear the count change.

## 11. Explicitly out of scope

- Project detail pages / clickable cards.
- A "built with" credit treatment for VS Code / Vercel logos.
- Any additional entry point beyond the existing Destacados CTA (e.g. a link from the homepage bento grid itself).
- Real project content — all 25 projects and their tool tags remain placeholders until Luly (or teammates) supply real work.

## 12. Definition of done

- [ ] All 25 `proyectos` entries in `portfolio.js` have a `tools` array (§4).
- [ ] `explora.html` + `explora.js` + `explora.css` exist and render the hero + filter/search/grid + reused Contacto section.
- [ ] Category (single-select) and tool (multi-select) filters both work and combine with AND; multiple tools combine with OR (§5).
- [ ] Live search narrows across title/blurb/tool/category text (§5).
- [ ] Empty-state block appears for zero-match combinations, with working reset (§6).
- [ ] Cards show category, title, blurb, tool icons; not clickable (§7).
- [ ] Masonry grid animates in/out on filter change via GSAP; instant under `prefers-reduced-motion` (§8).
- [ ] Destacados CTA points to `explora.html` (§9).
- [ ] Filter/search controls are keyboard-accessible with correct ARIA state (§10).

---

## Sign-off

- [ ] **Luly approves this spec's content** — pending review of this written document.
