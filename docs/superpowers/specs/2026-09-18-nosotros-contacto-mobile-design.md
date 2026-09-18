# Nosotros + Contacto adornos, trabajos web, y trabajo-en-pantalla (mobile)

**Fecha:** 2026-09-18
**Branch:** storytelling-redesign
**Autor:** Luly (con Claude como orquestador)

## Contexto

Seis tareas sobre el sitio VAI VEN (estático, HTML/CSS/JS vanilla, single-page
`index.html` con recorrido pineado en desktop y secciones normales en mobile).
Data del portfolio en `portfolio-data.js` (`window.PORTFOLIO` → `window.WORKS`
intercalado). Modal de proyecto en `portfolio-modal.js` (`#pf-modal`), grilla en
`work-carousel.js` (coverflow ≥1025px / galería vertical debajo).

Palette (única fuente de verdad, `Mode 1.tokens.json`): azul `#2222A0`,
naranja `#FF5B23`, verde `#167A72`, amarillo `#FFCC00`, lila `#B4B4ED`,
violeta-claro `#511F99`, negro `#000`, blanco `#fff`. **Nunca hardcodear hex** en
componentes: usar `var(--token)`.

Patrón establecido para adornos dispersos: contenedor `aria-hidden` con `<span>`
en `position:absolute`, coloreados con `background: var(--token)` +
`mask-image: url("…svg")` (ver `.wd-*` y `.hm2-*` en `styles.css`). Los assets
grunge (`.webp`) van como `<img>`.

## Tareas y diseño

### 1 · Adornos en Nosotros (ref. imagen 1)

Fondo actual: `var(--verde)` `#167A72` (coincide con la ref). Nosotros hoy no
tiene adornos.

- Nuevo contenedor `.nos-deco` (aria-hidden) **dentro de `.nosotros__stage`**
  (para que viaje con `.nos-reveal` en desktop). Spans `position:absolute` con
  posiciones en % según la ref.
- Elementos (assets ya en repo):
  - **corazón** `resources/imagenes_grunge/corazon.webp` — arriba-derecha
  - **fuego** `resources/imagenes_grunge/fuego.webp` — abajo-izquierda
  - **mariposa** `resources/imagenes_grunge/mariposa.webp` — sup-derecha (cerca del corazón) + inf-izquierda (cerca del fuego)
  - **marco** amarillo+violeta (`resources/hero/marco.svg`, recolor a `--amarillo`/`--violeta-claro`) — esquina sup-izq
  - **cruces** (`resources/hero/cruces_abajo.svg`) — sup-izq
  - **barras** (`resources/hero/barras_*.svg`) — sup-centro + barra vertical izquierda
  - **mira** (`resources/hero/mira.svg`) — centro
  - **flechas** (`resources/hero/flechas.svg`) — centro
  - **líneas** (`resources/hero/lineas_izq.svg` / `lineas_der.svg`) — izq/der
  - **miscelánea cuadrado** (`resources/hero/miscelanea_cuadrado.svg`) — der
  - **cruz** naranja (`.wd-cruz` estilo `::before/::after` o `resources/hero/cruz_cyan.svg` recolor a `--naranja`) — centro-bajo
- Tipografía-textura de fondo: `resources/textures/nosotros_text.webp` y/o
  `resources/textures/cerebro_text.webp` como capa detrás del título (baja opacidad,
  `mix-blend` a gusto), sin tapar el contenido.
- Respetar `prefers-reduced-motion` (los adornos son estáticos; sin animación
  problemática).

### 2 · Adornos en Contacto (ref. imagen 2)

Fondo actual: negro + grilla blanca (CSS grid). Los SVG con color **deben ser
azul `#2222A0` y naranja `#FF5B23`**.

- Nuevo contenedor `.contacto-deco` (aria-hidden), mismo patrón. Recolor de cada
  SVG alternando `--azul` / `--naranja`:
  - **cruces** (sup-izq, alternadas azul/naranja)
  - **flechas** (der, azul) — `resources/hero/flechas.svg`
  - **mira** sobre la "v" del email — `resources/hero/mira.svg`
  - **líneas** izq/der
  - **barras** abajo-centro (alternadas azul/naranja)
- **flecha grunge** `resources/imagenes_grunge/flecha.webp` como `<img>` apuntando
  al email (rotada, estilo sticker).
- **Email multicolor:** `vaivendv@gmail.com` con segmentos/letras alternando
  `--naranja` / `--azul` (como la ref). Envolver letras/segmentos en `<span>` con
  clases de color; mantener `href="mailto:"` y accesible (aria-label con el email
  completo).

### 3 · Trabajo en pantalla propia (mobile) + QA mobile

- **`trabajo.html`** nuevo: página standalone que lee `?id=<slug>` del URL, importa
  `portfolio-data.js`, busca el work por `slug` en `window.WORKS`, y renderiza el
  trabajo completo: header VAI VEN + botón "← Volver" (history.back / link a
  `index.html#work`), título (con flechita ↗ si tiene `url`), categoría, tools,
  galería de media + lightbox, teñido por `--card-hue`. Reutiliza estilos del modal
  (`.pf-modal-*`) extrayendo/compartiendo lo necesario, o CSS propio equivalente.
- **Grilla mobile** (`work-carousel.js`, `mountGallery`): el click de cada celda
  cambia de `window.PortfolioModal.open(i)` a `location.href =
  "trabajo.html?id=" + work.slug`. **Desktop (coverflow) sigue usando el modal.**
- **Slug estable:** agregar `slug` a cada work en `portfolio-data.js` (derivado del
  título, kebab-case, único). No usar el índice (la data se intercala).
- **QA mobile del portfolio:** revisar en Chrome tap targets, spacing, y el
  placeholder "VIDEO — próximamente"; ajustar lo que se vea mal.

### 4 · Pestaña de Spotify (revivir)

Revivir `.nosotros-spotify` (versión código QR, la última del historial, commit
`50a54f6`). Pestaña verde arriba-derecha **dentro de `.nosotros__stage`**: en reposo
cuadrado 52px con logo; hover/focus expande a 268px mostrando el código escaneable
(`resources/qr_spotify 1.svg`); click → `https://open.spotify.com/playlist/6MfBqWD94YirQi7OtnOFrC`
(target=_blank, rel=noopener). Reutilizar HTML/CSS del historial. Verificar que no
choque con la nav lateral ni con los adornos nuevos (`.nos-deco`).

### 5 · Palabra-link al manifiesto (video en modal)

- Revivir el **modal de video de YouTube** (`#manifiesto-modal` + JS del commit
  `682cd15`): abre un iframe de YouTube encima del sitio; cerrar borra el iframe
  (detiene el video); Escape y backdrop cierran.
- Convertir la palabra **"vaivén"** del título de Nosotros ("Los *cerebros* detrás
  del *vaivén*") en un `<button>`/link accesible que abre el modal.
- Video ID: **TODO** — usar placeholder `frULM6go0Tg` hasta que Luly pase el real.

### 6 · Trabajos web + flechita de hyperlink en el modal

- Cargar **Dormie** y **VolKno** en la categoría `web` de `portfolio-data.js`:
  - Dormie: portada `resources/portfolio/web/Dormie/00-mockup.webp`, galería
    `01.webp`…`09.webp`, `media:"image"`, tools web, `slug:"dormie"`, `url: <TODO>`.
  - VolKno: portada `resources/portfolio/web/VolKno/00-mockup.webp`, galería
    `01.webp`…`05.webp`, `media:"image"`, tools web, `slug:"volkno"`, `url: <TODO>`.
- **Nuevo campo `url`** (link al sitio en vivo). URLs reales: **TODO** (Luly las pasa).
- **Flechita ↗ en el título:** en `portfolio-modal.js` (hoy
  `mTitle.textContent = work.title`) y en `trabajo.html`, si `work.url` existe,
  renderizar el título como `<a href={url} target="_blank" rel="noopener">` con un
  ícono ↗ inline (SVG), señalizando que redirige. Sin `url`, título plano como hoy.

## Datos pendientes (TODO de Luly)

- URL/ID del video del manifiesto (tarea 5).
- URLs en vivo de Dormie y VolKno (tarea 6).

Todos implementados con placeholder/TODO visible para no bloquear.

## Orquestación (workstreams paralelos)

1. **Data + web + flechita modal** (tarea 6): `portfolio-data.js` (web works, `slug`,
   `url`), `portfolio-modal.js` (título como link).
2. **trabajo.html + mobile** (tarea 3): página nueva, cambio de click en galería,
   `slug`. Depende de que exista `slug` (coordinar con #1).
3. **Adornos Nosotros** (tarea 1) + **Spotify** (tarea 4) + **manifiesto** (tarea 5):
   todo dentro de la sección Nosotros / `.nosotros__stage`.
4. **Adornos Contacto** (tarea 2): sección Contacto, recolor azul/naranja + email.

QA visual final en Chrome (desktop + mobile emulado) para 1, 2, 3, 4.

## Restricciones

- Colores solo vía `var(--token)`; nada hardcodeado.
- Comentarios en inglés; copy en español (argentino).
- kebab-case para archivos/clases.
- Adornos `aria-hidden="true"`; respetar `prefers-reduced-motion`.
- No romper el recorrido pineado desktop (`.nos-reveal`, `.contacto-reveal`,
  cierre de puertas). Verificar en Chrome.
