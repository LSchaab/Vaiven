# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## VAI VEN · Degree Portfolio Project

> This file gives Claude context about this project so every conversation starts informed.
> Keep it updated as the project evolves.

---

## What is this project?

**VAI VEN** — a frontend portfolio / showcase website built as part of a university degree project.
The site presents the team's work across five portfolio disciplines — Ilustración y Diseño Gráfico,
Modelado 3D, Motion Graphics, Desarrollo web, and Campañas publicitarias — with a strong editorial,
high-energy visual identity.

**Status**: In progress  
**Language**: Spanish (Argentine)  
**Audience**: Academic jury + potential public / recruiters

---

## Team

| Role | Person | Uses Claude? |
|---|---|---|
| Programadora | Luly | ✅ Yes |
| Diseñadora gráfica | Victoria Bettaglio | ❌ No |
| Fotografía y video | Matías Schifano | ❌ No |
| Directora creativa | Agustina Martínez | ❌ No |
| Experto en Unity | Bautista Goitia | ❌ No |

> Note: Claude outputs may be shared with teammates as written specs or notes.
> Keep explanations clear and self-contained when handing things off.

---

## Development

No build step — this is a static site. To preview locally:

```bash
# Option A — Python (built into macOS)
python3 -m http.server 8080
# then open http://localhost:8080

# Option B — Node
npx serve .
```

Deployed via GitHub Pages at `vaiven.lourdesschaab.com` (CNAME file in repo root).
Push to `main` → site updates automatically.

---

## Tech Stack

| Layer | Technology | Status |
|---|---|---|
| Markup | HTML5 | ✅ Confirmed |
| Styling | CSS3 (custom properties, mobile-first) | ✅ Confirmed |
| Interactivity | Vanilla JavaScript | ✅ Confirmed |
| Theme switching | CSS custom properties (single mode) | ⏸ Paused — Mode 1 only |
| Additional tools | TBD per feature | 🔄 As needed |

**Rule**: Default to vanilla. Only add a library when there's a clear reason — document why.

---

## Visual Identity

### Keywords
**Cinético · Extremos · Intensidad · Movimiento · Tensión**

The design language lives in the tension between **order and chaos** — structured grids
coexisting with distortion, noise, and raw energy.

---

### Color Palette (exact values)

> **SINGLE SOURCE OF TRUTH:** `Mode 1.tokens.json` (Figma export). These are the **only**
> colors allowed on the site. Do not introduce any other color without explicit approval.
> In code they live as CSS custom properties named after each token (e.g. `var(--azul)`).

| Token | CSS variable | HEX | RGB | Group |
|---|---|---|---|---|
| Naranja | `--naranja` | `#FF5B23` | 255, 91, 35 | Primary |
| Verde agua claro | `--verde-agua-claro` | `#ADE6ED` | 173, 230, 237 | Primary |
| Azul | `--azul` | `#3A39FF` | 58, 57, 255 | Primary |
| Lila | `--lila` | `#B4B4ED` | 180, 180, 237 | Primary |
| Amarillo | `--amarillo` | `#FFCC00` | 255, 204, 0 | Primary |
| Verde | `--verde` | `#167A72` | 22, 122, 114 | Secondary |
| Azul oscuro | `--azul-oscuro` | `#1A237E` | 26, 35, 126 | Secondary |
| Violeta claro | `--violeta-claro` | `#511F99` | 81, 31, 153 | Secondary |
| Gris claro | `--gris-claro` | `#D9D2CC` | 217, 210, 204 | Secondary |
| Negro | `--negro` | `#000000` | 0, 0, 0 | Neutral |
| Blanco | `--blanco` | `#FFFFFF` | 255, 255, 255 | Neutral |

---

### Color usage

**Always reference a token.** Never hardcode a hex in a component. Semantic role variables
(`--bg-primary`, `--accent-primary`, `--text-primary`, etc.) map UI meaning onto the tokens
above — defined in `styles.css :root`.

```css
:root {
  --bg-primary:       var(--azul-oscuro);
  --bg-section-alt:   var(--violeta-claro);
  --bg-section-2:     var(--verde);
  --bg-contacto:      var(--lila);
  --accent-primary:   var(--naranja);
  --accent-secondary: var(--amarillo);
  --text-primary:     var(--blanco);
  --text-muted:       var(--lila);
  --highlight:        var(--verde-agua-claro);
}
```

> **Mode switching is PAUSED for now.** We're working in **Mode 1** only. The
> `[data-theme="light"]` block still exists in `styles.css` (mapped to tokens) for a possible
> future second mode, but don't invest in it unless asked.
>
> **Note on blues:** there are two — **Azul `#3A39FF`** (electric blue, Primary) is the
> background of Hero, Portfolio & Nosotros. **Azul oscuro `#1A237E`** (Secondary) is the
> Contacto subtitle (and the default `--bg-primary`).

---

### Typography

- **Display / Headlines**: Large, bold, condensed — mixed serif and sans-serif in the same composition
- **Style**: Letters can be cropped, overlapping, or broken across lines for tension
- **Weight contrast**: Heavy display + light/small body text
- **Mixing styles**: Combining italic script + bold sans in the same headline is intentional
- **Case**: Mix of ALL CAPS and sentence case for hierarchy
- Typography is used as a **graphic element** — headlines can collide with images, overflow containers, or be partially hidden

> **Font**: Montserrat Alternates (all weights as needed). Single typeface — hierarchy is achieved through weight, size, and case — not font switching.

---

### Photography & Imagery

- Partially blurred or distorted photos
- B&W or duotone collage-style cutouts (full color also used)
- Photos integrated with typography — text overlapping or wrapping images
- Goal: convey intensity and the coexistence of extremes

---

### Graphic Resources

**Structural / order elements:**
- Lines, grids, geometric shapes, measurement marks, barcodes, crosshairs, coordinate markers
- Create order that contrasts with visual chaos

**Textures:**
- Grunge, noise, grain, wear — layered to reinforce the "extremes" concept

---

### Layout & Interaction

- **Navigation**: Vertical sidebar nav on the right side (persistent across scroll)
- **Logo**: Top center, bold condensed wordmark "VAI VEN"
- **Hero**: Full-bleed gradient background with large typographic headline + collage elements
- **Sections**: Full-width, each with its own palette background — Hero / Portfolio /
  Nosotros = Azul `#3A39FF`, Contacto = Lila `#B4B4ED`, Destacados = Violeta claro `#511F99`
- **Portfolio cards**: Overlapping / masonry-style with hover effects
- **CTA buttons**: 8px border-radius (soft corners), high contrast
- **Eye motif**: Recurring graphic element top-right — visual brand mark
- **Theme toggle**: ⏸ Paused — working in Mode 1 only for now
- **Tone of voice**: Bold, irreverent, direct — Argentine Spanish informal register

---

## Pages / Sections (from wireframe)

| Section | Notes |
|---|---|
| Home / Hero | Large headline + collage imagery. Gradient background. |
| Portfolio | Grid of categories: (1) Ilustración y Diseño Gráfico, (2) Modelado 3D, (3) Motion Graphics, (4) Desarrollo web, (5) Campañas publicitarias |
| Contacto | Social links (Instagram, TikTok) + contact CTA |
| Nosotros | "Dream Team" with member cards + roles |
| Destacados | "Highlights para vagos" — featured highlights reel |

---

## Working Agreements

- **Language**: Code comments in English. Copy/content in Spanish.
- **Naming**: kebab-case for files and CSS classes
- **Accessibility**: WCAG AA as a goal — color contrast, alt text, keyboard nav
- **Responsive**: Mobile-first breakpoints
- **Colors**: Always via CSS custom properties — never hardcoded

---

## How Claude Should Help on This Project

1. **Code**: Clean, readable HTML/CSS/JS with brief inline comments. Work in Mode 1 only (mode switching is paused).
2. **Design decisions**: Offer options with trade-offs. Reference the "order vs chaos" tension.
3. **Team handoffs**: Add a short plain-English summary when producing something teammates will implement.
4. **Tech choices**: Problem → options → simplest solution that works.
5. **Visual direction**: Suggestions should feel editorial and intense — not clean or minimal.

---

## Open Questions / Decisions Pending

- [x] Hero parallax → **pointer-driven** (page doesn't scroll); respects reduced-motion. Other entrance animations TBD.
- [ ] Print/PDF export requirement for jury?
- [ ] More pages beyond the 5 listed?

---

## Notes & Decisions Log

| Date | Decision | Reason |
|---|---|---|
| 2026-04-27 | Stack: HTML + CSS + Vanilla JS | Lean and learnable for the whole team |
| 2026-04-27 | Two color modes via CSS custom properties | Design requirement from brief |
| 2026-04-27 | Visual direction: Cinético · Extremos · Intensidad · Movimiento · Tensión | Defined in moodboard |
| 2026-04-27 | Full color palette locked (9 colors) | Defined in brand guidelines |
| 2026-05-30 | Palette locked to `Mode 1.tokens.json` (Figma) — 11 tokens, single source of truth | Strict brand fidelity |
| 2026-05-30 | Azul eléctrico `#3A39FF` = fondo de Hero / Portfolio / Nosotros; Azul oscuro `#1A237E` = subtítulo de Contacto + `--bg-primary` | Decisión de diseño de Luly |
| 2026-04-27 | Font: Montserrat Alternates only | Single typeface — hierarchy via weight, size, case |
| 2026-04-27 | Hosting: GitHub Pages | Simple, free, fits the stack |
