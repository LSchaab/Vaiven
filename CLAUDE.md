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
| Theme switching | CSS custom properties + JS class toggle | ✅ Confirmed (two color modes) |
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

| Name | HEX | RGB | Role |
|---|---|---|---|
| Naranja | `#ff5b23` | 255, 91, 35 | Primary accent — headlines, CTAs |
| Cyan | `#ade6ed` | 173, 230, 237 | Secondary accent / highlight |
| Azul | `#3a39ff` | 58, 57, 255 | Strong accent / interactive |
| Violeta Claro | `#b4b4ed` | 180, 180, 237 | Backgrounds, subtle sections |
| Amarillo | `#ffcc00` | 255, 204, 0 | Highlight / energy accent |
| Verde | `#167a72` | 22, 122, 114 | Section background / contrast |
| Azul Oscuro | `#1a237e` | 26, 35, 126 | Dark backgrounds / text on light |
| Violeta | `#511f99` | 81, 31, 153 | Section backgrounds / dark mode |
| Gris Claro | `#d9d2cc` | 217, 210, 204 | Light mode backgrounds / neutral |

---

### Color Modes

The site has **two switchable color themes** triggered by a button.
Both share the same typographic and layout system — only colors change.
Always implement via CSS custom properties. Never hardcode hex values in components.
Theme switching: toggle `data-theme="light"` on `<html>`.

#### Mode 1 — Dark / Electric
```css
:root {
  --bg-primary:      #1a237e;  /* Azul Oscuro */
  --bg-section-alt:  #511f99;  /* Violeta */
  --bg-section-2:    #167a72;  /* Verde */
  --accent-primary:  #ff5b23;  /* Naranja */
  --accent-secondary:#ffcc00;  /* Amarillo */
  --accent-tertiary: #3a39ff;  /* Azul */
  --text-primary:    #ffffff;
  --text-muted:      #b4b4ed;  /* Violeta Claro */
  --highlight:       #ade6ed;  /* Cyan */
}
```

#### Mode 2 — Light / Washed
```css
[data-theme="light"] {
  --bg-primary:      #d9d2cc;  /* Gris Claro */
  --bg-section-alt:  #b4b4ed;  /* Violeta Claro */
  --bg-section-2:    #ade6ed;  /* Cyan */
  --accent-primary:  #ff5b23;  /* Naranja — stays the same */
  --accent-secondary:#ffcc00;  /* Amarillo — stays the same */
  --accent-tertiary: #3a39ff;  /* Azul — stays the same */
  --text-primary:    #1a237e;  /* Azul Oscuro */
  --text-muted:      #511f99;  /* Violeta */
  --highlight:       #167a72;  /* Verde */
}
```

> Naranja, Amarillo, and Azul are **consistent across both modes** — they're the brand's energy.
> The warm/cool backgrounds and text values are what flip.

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
- **Sections**: Full-width, each with its own background from the palette
- **Portfolio cards**: Overlapping / masonry-style with hover effects
- **CTA buttons**: Rounded pill style, high contrast
- **Eye motif**: Recurring graphic element top-right — visual brand mark
- **Theme toggle**: Single button switching Dark ↔ Light mode
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

1. **Code**: Clean, readable HTML/CSS/JS with brief inline comments. Always consider both color modes.
2. **Design decisions**: Offer options with trade-offs. Reference the "order vs chaos" tension.
3. **Team handoffs**: Add a short plain-English summary when producing something teammates will implement.
4. **Tech choices**: Problem → options → simplest solution that works.
5. **Visual direction**: Suggestions should feel editorial and intense — not clean or minimal.

---

## Open Questions / Decisions Pending

- [ ] Scroll / entrance animations? (parallax, fade-ins, etc.)
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
| 2026-04-27 | Font: Montserrat Alternates only | Single typeface — hierarchy via weight, size, case |
| 2026-04-27 | Hosting: GitHub Pages | Simple, free, fits the stack |
