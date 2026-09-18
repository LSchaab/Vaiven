# Modal de proyecto — galería adaptable + cruz afuera

**Fecha:** 2026-09-18
**Rama:** storytelling-redesign
**Estado:** diseño aprobado (brainstorming) — pendiente plan de implementación

## Objetivo

Rehacer el modal que se abre al clickear un trabajo del portfolio para que:

1. Muestre **solo** título, categoría y herramientas — **sin descripción**.
2. Tenga siempre visible una **galería de media** (fotos + videos) que es la protagonista.
3. Sea **un único modal adaptable** (no dos) que cubra los 4 casos de contenido reales.
4. Tenga la **cruz de cerrar afuera** del recuadro, flotando sobre su esquina (patrón del modal demoreel).

No es un rediseño desde cero: hoy ya existen `portfolio-modal.js`, el HTML `#pf-modal` en
`index.html` y el bloque `.pf-modal*` en `styles.css`. Esto los ajusta.

## Contexto de datos (lo que hay hoy)

`portfolio-data.js` es la fuente única. Cada categoría tiene `works[]`; cada work hoy tiene
`title`, `portada`, `media` (`"image"|"video"`), `video` (opcional), `galeria` (opcional),
`tools` (opcional). La media real es **mixta**:

| Categoría | Media por work |
|---|---|
| Gráfico (6) | imágenes (`galeria`) + un video de proceso (`resources/portfolio/grafico/<work>/proceso.mp4`; interstellar usa `animado.mp4`) |
| 3D (5) | 4 tienen `video.mp4` (turntable) + `galeria`; "Personaje Toon" es solo imágenes |
| Motion (5) | solo video (el video **es** la pieza), sin galería |
| Campañas (1) | solo video (`video.mp4`), sin galería |
| Web (0) | vacío |

**Los `proceso.mp4` de gráfico existen en disco pero NO están cargados en `data.js`** — por eso
hoy no se ven. Este trabajo los incorpora.

Semántica de los videos: hay dos roles (`video` = pieza/render final; `proceso` = detrás de
escena), pero **visualmente se tratan igual** — cada video es un tile más en la grilla. La
distinción de rol no cambia el layout.

## Decisiones tomadas (brainstorming)

- **El video es una pieza más en la grilla**: tile con poster + ▶, se abre en el lightbox y ahí
  se reproduce. No va en una zona separada ni destacada.
- **Modelo de datos: opción A (mínima).** Se mantiene `galeria` tal cual y se agrega un campo
  opcional `proceso` (ruta al mp4). Se sigue usando el `video` existente de los 3D. **No se toca
  el carrusel/coverflow** (`work-carousel.js` sigue usando `portada`/`media`/`video`). Bajo riesgo.
- **Orden en la grilla:** imágenes primero, videos al final (resultado primero, proceso de cierre).
  Reordenable por work si algún caso lo pide, porque son arrays explícitos.
- **Sin descripción:** se elimina `descripcion` del render y el `<p class="pf-modal-desc">` del HTML.

## Diseño

### Modelo de datos

Cada work puede declarar, de forma opcional:

- `galeria: [rutas de imagen]` — como hoy.
- `video: ruta mp4` — como hoy (3D, motion, campañas).
- `proceso: ruta mp4` — **nuevo**, opcional (gráfico; interstellar apunta a `animado.mp4`).

El modal construye una lista ordenada de media a partir del work:

```
mediaItems = [
  ...galeria.map(src => ({ type: "image", src })),
  ...(video   ? [{ type: "video", src: video,   poster }] : []),
  ...(proceso ? [{ type: "video", src: proceso, poster }] : []),
]
```

`poster` de un tile de video = `work.portada` || primera imagen de `galeria` || ninguno
(tile con fondo oscuro + ▶).

### Comportamiento adaptable

- **Sin galería y con exactamente un video** (motion, campañas, y 3D-solo-video si lo hubiera):
  se muestra el **reproductor grande inline** con controles, a lo ancho — como hoy. No se arma
  grilla de un solo tile.
- **Con galería (con o sin video)** (gráfico, 3D): se arma la **grilla de tiles**. Imágenes como
  `<img>`; videos como tile con poster + ▶. Click en cualquier tile → lightbox.
- **Sin ninguna media:** placeholder "Imágenes/Video próximamente" (como hoy).

### Layout del modal

- **Header compacto (una fila, wrap):** título + tag de categoría + herramientas (los logos como
  chips, sin el subhead "Herramientas"). Sin descripción.
- **Body en una sola columna** (se elimina la grilla `2fr 1fr`): header arriba, galería a lo ancho
  abajo. La galería es la protagonista y queda siempre visible.
- **Cruz afuera:** para que la ✕ flote sobre la esquina sin que la recorte el scroll del modal,
  se separa el contenedor de posicionamiento del contenedor con scroll:
  - `.pf-modal-dialog` → wrapper `position: relative`, **sin** `overflow`.
  - contenido scrolleable → nuevo hijo `.pf-modal-scroll` con `max-height` + `overflow: auto`.
  - `.pf-modal-close` → hijo directo de `.pf-modal-dialog`, `position: absolute; top: -2.8rem;
    right: 0`, fuera del área scrolleable (no se clippea). Mismo look que `.demoreel-close`.

### Lightbox con video

El lightbox (`.pf-lightbox`) hoy solo pinta `<img class="pf-lb-img">`. Se extiende para que el
item actual pueda ser imagen **o** video:

- Si el item es imagen → `<img>` como hoy.
- Si el item es video → `<video controls playsinline>` con el mp4; al abrirse arranca (o queda
  listo para play). Al cerrar/cambiar de item se pausa y descarga la fuente.
- Las flechas ◂▸ y las teclas ← → siguen navegando **toda** la lista de media (fotos + videos).
- Esc cierra el lightbox (y luego el modal), como hoy.

## Componentes afectados

| Archivo | Cambio |
|---|---|
| `portfolio-data.js` | Agregar `proceso` (o `video` donde corresponda) a los works de gráfico; `interstellar` → `animado.mp4`. Verificar los `video` de 3D. |
| `portfolio-modal.js` | `renderMedia` arma `mediaItems` unificado y decide grilla vs player inline; tiles de video con ▶/poster; `renderTools` sin subhead; quitar `descripcion`; lightbox soporta video. |
| `index.html` | Quitar `<p class="pf-modal-desc">`; mover herramientas al header; reestructurar `.pf-modal-dialog` → `.pf-modal-dialog > .pf-modal-scroll` con la ✕ afuera. |
| `styles.css` | Body a una columna; header compacto con chips de herramientas; `.pf-modal-close` afuera (`top:-2.8rem`); `.pf-modal-scroll` con overflow; estilo del tile de video (poster + ▶); `.pf-lb` para `<video>`. |

## Accesibilidad

- Mantener focus trap, restauración de foco, Esc y bloqueo de scroll de fondo (ya existen).
- Tile de video: `<button>` o elemento con `role="button"`, `aria-label` con el título, foco visible.
- El ▶ es decorativo (`aria-hidden`); el label lo da el botón.
- Video en lightbox: no autoplay con sonido sin interacción — arranca por el click del usuario.

## Fuera de alcance

- No se refactoriza a un array `media` unificado (esa era la opción B).
- No se toca el carrusel/coverflow ni las cards.
- No se generan posters dedicados por video (se reusa `portada`/primera imagen).
- Copys y `autor` de los works siguen como estén (no es parte de esto).
