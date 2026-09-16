# Portfolio `#work` — carrusel 3D scroll-driven (mecánica wodniack) · Design

> **Estado:** aprobado por Luly (2026-09-16). Próximo paso: plan de implementación.
> Reemplaza el coverflow v2 (`portfolio.js`) por la mecánica de la sección "WORK"
> de https://wodniack.dev: las cards cruzan la pantalla de derecha a izquierda
> girando en 3D, controladas por scroll.

## Goal

Replicar la mecánica "WORK" de wodniack.dev en la sección portfolio de VAI VEN:
un carrusel 3D **controlado por scroll** donde cada card (= un trabajo) entra
girada desde la derecha, se endereza en el centro y sale por la izquierda girando
al revés. Todo el movimiento de las cards lo resuelve el **CSS** a partir de
custom properties; el JS sólo mapea el scroll y escribe esas variables.

**Diferencia clave vs. wodniack:** cada card es **un trabajo del portfolio** (no
un proyecto con URL externa). El click abre el **modal de detalle** que ya existe
(título + herramientas + galería/lightbox), no navega afuera.

## Contexto e integración (sitio actual)

- Sitio **estático vanilla** (HTML/CSS/JS, sin bundler), deploy en GitHub Pages.
- La sección portfolio hoy es un coverflow (`portfolio.js`) + modal de detalle +
  la transición **cerebro→portal** (`mente.js` / `.salida-portal`). Ese coverflow
  **se reemplaza** por `#work`.
- **La transición cerebro→portal se mantiene y hace de entrada de `#work`.** Al
  terminar de abrirse el portal (pantalla en `--violeta-claro`), arranca la pista
  de scroll de `#work` y la card 0 entra desde la derecha en el mismo scroll
  continuo. Ambos fondos son `--violeta-claro` → empalme sin costura. Esto resuelve
  el pedido previo de "no querer scrollear hacia violeta en blanco": ahora
  **scrollear ES el carrusel**.
- **NO se usa la máscara SVG** de wodniack (sería una segunda transición redundante
  con el portal). Descartada.

## Stack

- Vanilla HTML/CSS/JS + **GSAP + ScrollTrigger + Lenis** vía **CDN** (`<script>`),
  sin build step. Lenis con lerp ~0.1 para el scroll suave; ScrollTrigger para
  mapear el progreso de scroll de la sección; un solo ticker de GSAP para el loop.
- **Desviación documentada de "default vanilla" (CLAUDE.md):** se agregan estas
  librerías por pedido explícito de Luly; son la vía limpia para el scroll suave y
  el mapeo scroll→progress. Se cargan por CDN (sin tocar el modelo estático).
- Cards en **CSS 3D** (perspective + transforms). **NO** WebGL/Three.js para las cards.

## Arquitectura / estructura de archivos

- **`index.html`** — reemplazar el markup de `#portfolio` por la estructura `#work`
  (ver abajo). Agregar los `<script>` de GSAP/ScrollTrigger/Lenis por CDN antes de
  los scripts del sitio. Mantener el esqueleto del modal (`#pf-modal`).
- **`work-carousel.js` (nuevo)** — motor de la escena: construye cards/letras/canvas
  desde los datos; configura Lenis + ScrollTrigger; corre **un** loop de update que
  calcula el `--progress` de cada card, maneja play/pause de videos + `content-
  visibility`, la dispersión de letras del título, el parallax y el canvas de fondo.
- **`portfolio-modal.js` (nuevo)** — el modal de detalle (título, tag, herramientas,
  descripción, media masonry/video, lightbox, focus trap, Esc/restauración de foco)
  **extraído tal cual** del `portfolio.js` de hoy. Expone `window.PortfolioModal =
  { open(index), close() }`. La escena llama `PortfolioModal.open(i)` al click.
- **`portfolio.js`** — **eliminado** (su lógica se reparte entre los dos de arriba).
- **`portfolio-data.js`** — se reutiliza. Cada work ya tiene `title`/`portada`/`media`
  (+ opcionales `tools`/`descripcion`/`galeria`/`video`). Se agrega el mapeo `poster`
  = `portada` y `url` opcional (no usado hoy). Sin cambiar la forma existente.
- **`styles.css`** — reemplazar el bloque del coverflow por el CSS de `.card` /
  `.scene` / `.scene__letter` / canvas / parallax. Mantener el CSS del modal y el
  del portal. La matemática de transform vive **en CSS** (custom properties).

Unidades con un propósito claro: `work-carousel.js` (escena + scroll), `portfolio-
modal.js` (detalle), `portfolio-data.js` (datos). Interfaz entre escena y modal:
`PortfolioModal.open(index)`.

## Estructura de la escena (markup)

```
section#work                         → "pista" de scroll alta (configurable)
 └ .outer
    └ .inner  (sticky/fixed, 100lvh)
       ├ h2.work__title              → rótulo (ej. "portfolio")
       ├ canvas.work__grid           → grilla 2D de fondo (z-index 1)
       └ .scene  (perspective: 40rem)
          ├ .scene__letter × M       → letras sueltas del título (dispersión)
          └ .card × N                → poster/video + caption + botón (z-index 2)
```

- La `.mask` SVG del spec original **se omite** (entrada = portal).
- `.inner` es sticky y ocupa 100lvh; el alto de `.outer` (la pista) define cuánto
  scroll hay para recorrer todas las cards.

## Mecánica principal (card)

Cada card es absoluta y centrada (`top/left: 50%`). Tres custom properties que setea JS:

- `--progress`: de **1** (fuera, a la derecha) a **0** (centro) a **-1** (fuera, izquierda).
- `--y`: aleatorio (sembrado, estable entre reloads) en `yRange` (def. -1..1).
- `--size`: aleatorio (sembrado) en `sizeRange` (def. 0.6..0.95).

Todo el movimiento lo resuelve el CSS:

```css
.card {
    position: absolute; top: 50%; left: 50%;
    transform-style: preserve-3d;
    will-change: transform;
    transform:
        rotateY(calc(var(--progress) * -20deg))
        translate3d(
            calc(var(--progress) * (50vw + 100%) - 50%),
            calc(var(--y) * 50% - 50%),
            calc(var(--progress) * var(--progress) * -5rem)
        )
        scale(var(--size));
}
```

La card entra girada desde la derecha, se endereza en el centro y sale por la
izquierda girando al revés. El término `progress²` en Z la aleja en los extremos.
Los `-20deg` y `-5rem` salen del config (`maxRotateY`, `depthZ`).

## Scroll → progress (el cálculo)

`ScrollTrigger` da un escalar `S ∈ [0,1]` = cuánto scrolleó la pista de la sección.
Se reparte entre las N cards con solapamiento (1–2 en tránsito a la vez):

```
// config
W = transitWindow            // ancho en unidades de S del pase completo +1→-1 de una card
                             // solapamiento ≈ W · (N-1) / (1 - W)

// por card i (0..N-1), una vez por frame:
center_i   = W/2 + i * (1 - W) / (N - 1)      // el S donde la card i queda centrada
progress_i = clamp( (center_i - S) / (W/2), -1, 1 )
//   S < center_i → progress > 0 (card a la DERECHA, entrando)
//   S = center_i → progress 0    (centrada, derecha)
//   S > center_i → progress < 0  (salió por la IZQUIERDA)

if (progress_i !== last_i) card.style.setProperty('--progress', progress_i)  // escribir sólo si cambió
```

`center_i` recorre `[W/2, 1−W/2]` → la card 0 entra completa en `S=0` y la última
sale completa en `S=1` (ninguna queda a medias en los extremos). `--y`/`--size` se
siembran una vez al construir. Se lee `S` una vez y se escriben sólo variables CSS
(sin layout thrashing), en un único ticker de GSAP.

## Capas secundarias

- **Letras del título dispersas:** variable `--state` en `.scene` (0→1 al entrar la
  sección) y, por letra, `--progress` (posición horizontal) + `--iy`. Transform y
  `::before` de eco exactamente como el spec de wodniack (rotateY·head, translate3d
  con `ahead = head²`, `opacity: min(state·2, 1)`).
- **Parallax:** variable `--scroll-progress` en la sección; el contenedor se mueve
  `translateY(calc(var(--scroll-progress) * -15%))` y el canvas `-5%`. Desactivado
  en mobile.
- **Fondo:** canvas 2D con grilla sutil detrás de las cards (z-index 1; cards z-index 2).
  Estático bajo `prefers-reduced-motion`.

## Datos

Se cargan de `portfolio-data.js` (`window.PORTFOLIO`, aplanado a una lista única de
works, como hoy). Por card: `{ titulo: title, poster: portada, video?, url?,
media, catLabel, hue, tools?, descripcion?, galeria? }`.

- **Cara de la card = `poster`** (la `portada` del work). Los works sin portada real
  (hoy la mayoría de Gráfico/3D/Web) usan el **fallback teñido en brain-hue + título**
  (igual que hoy) — nada de media rota.
- **Video** (`muted loop playsinline`, `data-src` lazy) sólo en los works que tengan
  mp4 (hoy ninguno cargado → posters/fallbacks). `max-width: 50vw; max-height: 50vh`.
- **Caption:** título del work + contador `#01/14` (N = 14 works reales, no 34).
- **Click/Enter → `PortfolioModal.open(index)`** (el modal de detalle de hoy). La card
  es un `<button>` enfocable con `aria-label` del título.

## Objeto de configuración (entregable)

```js
const CONFIG = {
    trackScreens: 14 * 1.2,   // alto de la pista en "pantallas" (configurable; N≈14)
    transitWindow: 0.14,      // W: solapamiento (1–2 cards en tránsito)
    maxRotateY: 20,           // deg de giro en los extremos
    depthZ: 5,                // rem de alejamiento en Z (progress² · -depthZ)
    sizeRange: [0.6, 0.95],   // rango de --size
    yRange: [-1, 1],          // rango de --y
    lerp: 0.1,                // suavizado de Lenis
};
```

## Responsive / performance / accesibilidad

- **Mobile** (<576px, o landscape <767px): sin parallax ni scale; `--y` al 100%;
  video hasta 80vw/80vh; sin caption.
- **`prefers-reduced-motion`:** grilla estática; sin scroll-scrub del carrusel;
  se muestra el **fallback estático accesible** (lista de todos los trabajos con su
  categoría) que ya existe.
- **Un solo loop** de update (ticker de GSAP / raf de Lenis). Leer una vez, escribir
  sólo variables CSS. `content-visibility: hidden` en cards fuera de rango (clase
  `.is-inview` para mostrarlas). Videos pausados fuera de rango.
- Cards navegables por teclado; videos con `poster`.

## Entregables (del pedido)

1. La sección funcionando con las **14 cards reales** (posters reales donde existen,
   fallback teñido en el resto; sin videos hasta que haya mp4).
2. Código comentado explicando el mapeo scroll → progress.
3. El objeto `CONFIG` de arriba.

## Fuera de alcance / pendientes (no bloquean)

- **mp4 reales** de Motion/Campañas: los agrega el equipo; hasta entonces esas cards
  muestran su poster.
- **Portadas 16:9** de Gráfico/3D/Web: las diseña Vicky; hasta entonces, fallback teñido.
- **Ajuste fino en vivo** (afinable): valores de `CONFIG`, empalme portal→pista de
  `#work`, densidad/opacidad de la grilla del canvas.
- El modal de detalle, sus datos y `resources/logos/` no cambian (se reusan tal cual).
```
