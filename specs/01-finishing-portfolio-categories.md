# Spec #1 — Finishing the Portfolio Category Pages

**Status:** 🟢 Implemented (2026-07-26) — all 5 categories built in one pass, per Luly's instruction to stop pausing for per-category review
**Audience:** Internal working doc (Luly + Claude only)
**Files this touches once approved:** `portfolio.js`, `portfolio.css`, `index.html` (social links only)
**Depends on:** none
**Blocks:** Spec #2 — "Explora todo" full-portfolio page (filter + search)

---

## 1. Goal

All 5 portfolio category pages (`portfolio.html?cat=...`) should feel finished and equally intentional — right now 3 of 5 have placeholder copy, all 5 share a generic "Proyectos" placeholder, and only one (3D) has a real hero animation. This spec defines exactly what "done" looks like for each gap so implementation can happen without new decisions mid-code.

## 2. Background / current state

- `index.html` → `portfolio.html?cat=X` links already work correctly for all 5 categories. **No changes needed here.**
- `portfolio.js`'s `CATEGORIES` config has real copy for `3d` and `motion` only. `web`, `grafico`, and `campanas` show literal placeholder text.
- Every category page's "Proyectos" section shows 5 cards numbered 01–05 with no real content — shared/generic across all categories.
- Only `3d` has a bespoke GSAP hero animation ("orbit" — pointer-driven tilt/parallax). The other 4 share one generic fade-in ("default").
- GSAP 3.12.5 is already loaded in `portfolio.html` — no new dependency needed for anything in this spec.

## 3. Requirement: Copy for the 3 missing categories

Draft copy below (Claude-written, VAI VEN tone: bold, irreverent, informal Argentine Spanish, ALL CAPS mixed with sentence case for hierarchy — per CLAUDE.md typography rules). **Luly edits/replaces before or during implementation** — this is a starting point, not final.

### Desarrollo Web (`web`)
> **SE COMPILA, SE ROMPE, SE ARREGLA.**
> Achicamos la distancia entre el Figma y el navegador de verdad. Acá el pixel perfect se pelea con el deadline, y cada bug es una excusa para iterar más rápido.

### Diseño Gráfico (`grafico`)
> **CORTAMOS, PEGAMOS, ROMPEMOS LA GRILLA.**
> Diseño que no pide permiso: tipografía que se superpone, capas que casi no calzan, orden que convive con el quilombo. Si entra en una grilla perfecta, no es nuestro.

### Campañas Publicitarias (`campanas`)
> **HABLAMOS FUERTE PORQUE NADIE ESCUCHA BAJITO.**
> Campañas pensadas para parar el scroll, no para acompañarlo. Ideas con gancho, ejecutadas para que se note — en la calle, en la pantalla, donde sea.

**Acceptance criteria:** each category's hero title + subtitle in `CATEGORIES` reflects the copy above (or Luly's edited version) instead of "reemplazar con la copy de...".

## 4. Requirement: Hero animation per category

Each category gets its own GSAP-driven entrance — no category shares another's animation. `3d`'s existing pointer-tilt effect is kept and formalized (not rebuilt); `web`, `grafico`, `campanas` are new; `motion`'s current placeholder entrance is replaced.

| Category | Signature | Mechanic (implementation direction) |
|---|---|---|
| `3d` | **Parallax** | Keep existing pointer-driven tilt/depth effect as-is; just remove any "special case" framing in code comments/naming — this is now *the* intentional signature, not an exception. |
| `motion` | **Kinetic type** | Each letter of the title animates in individually, staggered, along varied curved paths/timing (GSAP stagger + custom ease per letter) — echoes the "letters can be cropped/overlapping" typography language already in the brand. |
| `web` | **Typing code** | Title reveals character-by-character like it's being typed/compiled live — could pair with a blinking cursor or monospace flash before settling into Montserrat Alternates. |
| `grafico` | **Print misregistration** | Title starts as 2–3 offset color layers (CMYK-style misalignment) that snap into perfect register on entrance — visualizes the brand's "chaos resolving into order" tension directly. |
| `campanas` | **Marquee flicker** | Title flickers on like neon/bulb signage — optionally preceded by a brief static/noise burst using the existing `resources/textures/` grunge assets. |

**Acceptance criteria:** loading each `?cat=` page plays its own distinct animation; no two categories share an entrance effect; `prefers-reduced-motion` still disables/simplifies all 5 (matching the existing hero parallax convention noted in CLAUDE.md's decisions log).

## 5. Requirement: "Proyectos" grid — per-category placeholders

Each category gets **its own** 5 placeholder project cards (25 total), written to fit that category's discipline — not one shared generic set. Each card: `title`, one-line `blurb`, `image` (slot only — real assets come later, from Luly or teammates).

This data should live as one array per category inside `portfolio.js`'s existing `CATEGORIES` config (same shape across all 5, so Spec #2's "Explora todo" page can later read from the same structure without reshaping it).

<details>
<summary>Draft placeholder cards (click to expand — 25 total)</summary>

**Modelado 3D**
1. *Cráneo Roto* — Estudio de anatomía low-poly con textura procedural.
2. *Objeto Cotidiano #04* — Render fotorrealista de un objeto que no debería existir.
3. *Personaje: Estática* — Rigging y pose de un personaje original para animación.
4. *Entorno Abandonado* — Escena ambiental con iluminación volumétrica.
5. *Prop Pack: Ciudad* — Set de props modulares para escenas urbanas.

**Motion Graphics**
1. *Loop: Pulso* — Animación en loop de 8 segundos, tipografía kinética.
2. *Ident VAI VEN* — Cortina de marca de 5 segundos para redes.
3. *Explainer: Cómo Funciona* — Motion explicativo con iconografía custom.
4. *Transición Caótica* — Estudio de transiciones entre escenas.
5. *Título Animado: Extremos* — Secuencia de títulos para un corto.

**Desarrollo Web**
1. *Landing: Estudio X* — Sitio one-page con scroll-driven animation.
2. *Dashboard Interno* — Panel de datos con componentes reutilizables.
3. *E-commerce Cápsula* — Tienda pequeña con carrito funcional.
4. *Prototipo Interactivo* — Experimento de interacción con canvas/WebGL.
5. *Refactor: Sitio Viejo* — Migración de un sitio legacy a stack moderno.

**Diseño Gráfico**
1. *Identidad: Estudio Ruido* — Sistema de marca completo, de logo a papelería.
2. *Editorial: Revista Cero* — Diagramación de una revista independiente.
3. *Serie de Afiches* — Colección de posters experimentales, técnica mixta.
4. *Packaging: Línea Cruda* — Diseño de packaging para producto artesanal.
5. *Tipografía Custom* — Fuente experimental diseñada desde cero.

**Campañas Publicitarias**
1. *Campaña: Ruptura* — Campaña 360° para lanzamiento de producto.
2. *Spot: 15 Segundos* — Guion y storyboard para spot de TV/redes.
3. *Activación de Marca* — Concepto de activación experiencial en vía pública.
4. *Serie Digital* — Set de piezas para pauta digital, formato cuadrado y vertical.
5. *Rebranding: Antes/Después* — Caso de estudio de un reposicionamiento de marca.

</details>

**Acceptance criteria:** each category page's Proyectos grid shows 5 cards with real-looking (if placeholder) titles and blurbs instead of bare "01"–"05"; data is structured consistently across all 5 categories in `portfolio.js`.

## 6. Requirement: Social links

Contacto section's Instagram/TikTok buttons currently point to `href="#"`. **Decision (2026-07-26): leave as placeholder for now** — not blocking this spec. Revisit once real URLs exist.

**Acceptance criteria:** none for this spec — explicitly deferred, not part of this spec's definition of done.

## 7. Explicitly out of scope (→ Spec #2)

The "Explora todo" CTA and a new full-portfolio browsing page (filter by category + one more TBD facet, search across titles/descriptions/tags) does not exist yet and is **not part of this spec**. It gets its own spec immediately after this one ships, reusing the per-category project data shape defined in §5.

## 8. Definition of done

- [x] `web`, `grafico`, `campanas` show draft copy (§3) — still Luly's to edit/replace, not final.
- [x] All 5 categories play their own distinct hero animation (`orbit`, `kinetic`, `typing`, `misregistration`, `marquee`).
- [x] All 5 categories show 5 category-appropriate Proyectos placeholder cards (25 total), consistently structured.
- [ ] Reduced-motion users still get a sensible (simplified/disabled) experience on all 5 animations — inherited from the existing `reduceMotion` guard around the whole GSAP block; not re-verified per new signature.
- [x] ~~Social links point to real URLs~~ — deferred by decision, not part of this spec's scope.

## 9. Implementation order (decided 2026-07-26)

**One category at a time**, each with a review checkpoint before moving to the next:

1. `3d` — lowest risk: copy already exists, animation mostly exists (formalize only)
2. `motion` — copy exists, needs new kinetic-type animation
3. `web` — needs new copy + new "typing code" animation
4. `grafico` — needs new copy + new "print misregistration" animation
5. `campanas` — needs new copy + new "marquee flicker" animation

---

## Sign-off

- [x] **Luly approves this spec's content** (2026-07-26) — copy drafts, animation concepts, and Proyectos placeholders are good enough to build from. Implementation begins now, one category at a time per §9.
