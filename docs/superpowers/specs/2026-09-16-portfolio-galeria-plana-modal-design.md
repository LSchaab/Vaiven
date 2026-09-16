# Portfolio — galería plana + modal de proyecto (rediseño v2) · Design

> Fecha: 2026-09-16 · Rama: `storytelling-redesign`
> Reemplaza el enfoque de la spec `2026-09-15-portfolio-carrusel-3d-design.md`
> (carrusel 3D de dos niveles). Esa v1 llegó a implementarse (6 commits) pero en
> review con Luly no convenció: la transición generaba "dos pantallas" y el modelo
> de dos niveles (categorías → works) resultó innecesario. Esta v2 lo simplifica.

---

## 1. Por qué cambia (contexto)

Feedback de Luly sobre la v1:

- **La transición estaba mal:** quedaban dos momentos separados — el cerebro que se
  iba por la izquierda + una card "puente" falsa (`.salida-intro`), y aparte la
  sección `#portfolio` real. Se leía como dos pantallas distintas.
- **El carrusel de dos niveles sobraba.** No hace falta navegar categorías y después
  works. Referencias que trajo (estudios tipo Awwwards) muestran **todos los
  trabajos expuestos juntos**, sin categoría de por medio.
- **El drag no servía** y las flechas no recorrían bien todas las cards.
- **La sección violeta le gusta** (se mantiene `--violeta-claro`).

Decisión: rediseñar la sección como **una galería plana de todos los trabajos** con
**modal de detalle**, y una **transición de "portal"** desde el cerebro.

---

## 2. Objetivo

Al terminar la fase de herramientas (queda solo el cerebro), el cerebro **se
desvanece** y detrás aparece **un portal oscuro tipo cápsula** con una palabra
vertical adentro; el portal **se expande** hasta convertirse en la sección
portfolio: una **pared de todos los trabajos** con scroll vertical normal. Hover
sobre un trabajo lo oscurece y muestra la **tag de su categoría**. Click abre un
**modal** con herramientas, categoría, descripción y media (galería de imágenes a
proporción real **o** video).

## 3. No-objetivos (YAGNI)

- Sin navegación por niveles (categorías como pantalla). La categoría es solo un dato
  (tag en hover + tag en el modal).
- Sin drag, sin carrusel coverflow 3D, sin flechas de navegación lateral.
- Sin páginas aparte: todo vive en `index.html` / `#portfolio`.
- Sin librerías nuevas ni build step (vanilla, igual que el resto del repo).
- No se inventa contenido: autores, copy, descripciones y listas de imágenes las
  carga el equipo. El diseño degrada bien con lo que exista.

---

## 4. Arquitectura (archivos y responsabilidad)

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `portfolio-data.js` | **Modificar** | Datos. Extiende cada work con campos opcionales (`tools`, `descripcion`, `galeria`, `video`). Expone `window.PORTFOLIO` (por categoría) y un helper para aplanar a lista de works, cada uno cargando `catKey/catLabel/hue`. |
| `portfolio.js` | **Reescribir** | Render de la pared plana + hover tag + apertura/cierre del modal + galería masonry + lightbox + video. Sin coverflow/drill-in/drag. |
| `index.html` | **Modificar** | Nuevo markup de `#portfolio` (grid + `<template>`/contenedor de modal). **Quitar** `.salida-intro` del `.mente-stage`. Agregar el portal dentro del stage. |
| `styles.css` | **Modificar** | **Quitar** CSS de coverflow/drill-in/`salida-intro`. **Mantener** card 16:9 + fallback + sección violeta. **Agregar** pared grid, hover tag, portal + expansión, modal, masonry, lightbox. |
| `mente.js` | **Modificar** | Reemplazar la fase de salida "deslizar a la izquierda" por **fade del cerebro + revelado/expansión del portal**, derivado de `--salida-progress`. |

**Principio de aislamiento:** `portfolio-data.js` no toca el DOM. `portfolio.js`
consume datos y es dueño de todo el DOM de la sección/modal. `mente.js` sigue siendo
el único dueño del escenario sticky y del scroll-scrub. La transición se comunica por
**una sola variable CSS** (`--salida-progress`), como la v1.

---

## 5. Transición — "portal desde el cerebro"

Sustituye a la fase salida de la v1. Todo determinista y reversible (derivado de
`salidaP` 0..1, que ya calcula `mente.js` como fase 3 del recorrido).

Secuencia a medida que `salidaP` va 0 → 1:

1. **0.0–0.35 · el cerebro se desvanece** (fade + leve scale-down hacia el centro),
   dejando ver detrás un **portal**: una forma **cápsula/estadio** (`border-radius`
   grande) chica y centrada, interior oscuro con textura de puntos, con una
   **palabra vertical** adentro (ver §9 wording).
2. **0.35–0.85 · el portal se expande** (scale/clip) desde su tamaño chico hasta
   llenar el viewport. La palabra vertical se desvanece durante la expansión.
3. **0.85–1.0 · empalme:** cuando el portal llena la pantalla, su interior **es** el
   fondo de la sección portfolio. Al despinearse el escenario, aparece `#portfolio`
   real (mismo fondo) sin salto.

**Colores (por token, afinables):** campo de la transición = `--negro` (fondo de la
fase tools). Interior del portal y fondo de la sección = `--violeta-claro`. Borde de
la cápsula + palabra = `--naranja` o `--blanco` (a definir en vivo con Vicky). La
idea es "un agujero que se abre hacia la próxima sala".

**Reduced-motion:** `mente.js` ya hace `return` temprano; el portal no anima, se ve
directamente `#portfolio` (accesible). El portal es puramente decorativo
(`aria-hidden`).

---

## 6. La pared de trabajos (nivel único)

- **Todos** los works de todas las categorías, en **una grilla con scroll vertical
  normal** (la sección deja de ser full-viewport bloqueada; scrollea como contenido).
- Cada card: **portada 16:9 a sangre** (`object-fit: cover`); donde no hay portada,
  **fallback teñido en el brain-hue** de su categoría + título (igual que v1, se
  reusa el CSS de card/fallback).
- **Responsive:** columnas fluidas (`repeat(auto-fill, minmax(...))`), mobile-first.
- **Hover / focus:** la card se **oscurece un toque** (overlay) y aparece una **tag
  de categoría** (texto corto de la disciplina) teñida con el hue de esa categoría.
  En touch/teclado, la tag aparece con `:focus-within` / foco de la card.
- Cada card es un **botón accesible** (rol button, foco, Enter/Espacio abren el
  modal), no solo un div clickeable.

**Deformación sutil (decidido — Luly, 2026-09-16):** la grilla y el scroll son
normales, pero cada card tiene **tilt 3D hacia el mouse** en hover (se inclina
siguiendo el cursor) + una **sombra que la levanta**, y **entra al aparecer en
viewport** (IntersectionObserver, stagger natural por scroll). Conserva el aire
cinético de la marca sin romper la legibilidad. Sólo con hover real y sin
reduced-motion (en touch/reduced-motion las cards quedan estáticas). Los valores
(ángulo del tilt, distancia/tiempo de la entrada) son afinables.

---

## 7. Modal de proyecto (click en un trabajo)

Mismo componente para todos; el área de media se adapta al tipo de proyecto.

**Contenido:**
- **Título** del trabajo.
- **Tag de categoría** (con color de la disciplina).
- **Herramientas usadas:** chips con los logos de `resources/logos/*.svg` (existen:
  after-effects, audition, blender, capcut, chatgpt, claude, css, html5, illustrator,
  js, photoshop, substance-3d-painter, unity, unreal, visual-studio-code).
- **Descripción corta** (texto).
- **Media:**
  - **Proyectos de imagen** (Gráfico / 3D / Web) → **galería masonry**: todas las
    imágenes visibles a la vez, **cada una con su proporción real** (cuadrada,
    apaisada, vertical), fluidas en columnas vía CSS `columns` (sin JS de layout).
    Click en una imagen → **lightbox** (overlay a pantalla grande, con prev/next).
  - **Proyectos de video** (Motion / Campañas) → **player de video** protagonista;
    si hay stills/frames, van debajo en el mismo masonry.
- **Secciones vacías se ocultan** (si falta descripción, tools o galería, no se
  muestra el hueco).

**Comportamiento / accesibilidad:**
- Abrir: click / Enter / Espacio en la card.
- Cerrar: botón **X**, tecla **Esc**, **click afuera** (en el backdrop).
- **Focus trap** mientras está abierto; al cerrar, el foco vuelve a la card que lo
  abrió. `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (título).
- Bloquear el scroll del fondo mientras el modal está abierto.

**Lightbox (dentro del modal):** overlay sobre el modal; imagen a tamaño grande a
proporción real; prev/next con flechas del teclado y controles; Esc cierra el
lightbox (no el modal).

---

## 8. Modelo de datos (`portfolio-data.js`)

Se mantiene `window.PORTFOLIO` (array de categorías con `key/label/hue/portada/works`)
y se **extiende cada work** con campos **opcionales**:

```js
// Work extendido (todos los campos de media/detalle son opcionales):
{
  title: "The Sandman",
  portada: "resources/portadas/motion/sandman.png", // 16:9 para la pared (o null → fallback)
  media: "video",            // "image" | "video" — define el área de media del modal
  catKey: "motion",          // (derivado al aplanar) categoría a la que pertenece
  // --- detalle del modal (opcionales; se ocultan si faltan) ---
  tools: ["after-effects", "photoshop"], // keys de resources/logos/<key>.svg
  descripcion: "",           // texto corto
  galeria: [],               // rutas de imágenes (proporción real) para el masonry
  video: ""                  // ruta/URL del video (si media === "video")
}
```

`portfolio.js` deriva una **lista plana** de works al iniciar:
`WORKS = PORTFOLIO.flatMap(cat => cat.works.map(w => ({...w, catKey: cat.key, catLabel: cat.label, hue: cat.hue})))`.

**Estado de contenido hoy (aviso, no bloquea el diseño):** los works solo tienen
`title/portada/media`. `tools`, `descripcion`, `galeria`, `video` están **vacíos** y
los debe cargar el equipo. Motion (5) y Campañas (1) tienen portada real; Gráfico/3D
usan fallback teñido; Web no tiene works aún.

---

## 9. Wording del portal

La palabra dentro del portal es **"NOSOTROS RESOLVEMOS"** (decisión de Luly,
2026-09-16). Queda como variable de contenido fácil de cambiar. Nota de layout: son
dos palabras — decidir en implementación si van en dos líneas verticales apiladas o
como texto vertical en una sola columna (afinable con el tamaño del portal).

---

## 10. Qué se remueve / reusa de la v1

**Se remueve:** coverflow 3D (`layout/go/center`), drill-in (`openCategory/back`),
drag/flechas, `.salida-intro` (HTML+CSS+JS), fase salida "slide a la izquierda" en
`mente.js`, breadcrumb/botón volver.

**Se reusa:** `portfolio-data.js` (extendido), CSS de card 16:9 + fallback brain-hue,
sección violeta, el patrón de `--salida-progress` como puente cerebro→portfolio, el
render de fallback accesible (adaptado a la lista plana).

---

## 11. Accesibilidad (WCAG AA, objetivo)

- Cards = botones con foco visible; tag visible en `:hover` **y** `:focus-within`.
- Modal: `role="dialog"`, `aria-modal`, focus trap, restauración de foco, Esc/click-afuera.
- Lightbox: navegable por teclado.
- `prefers-reduced-motion`: sin transición de portal ni tilts; galería como grilla
  estática scrolleable; el fallback de texto (lista de trabajos) sigue disponible.
- Imágenes con `alt` = título del trabajo.

---

## 12. Riesgos / afinables (no bloqueantes)

- Ritmo y easing de la expansión del portal (tuning en vivo).
- Mapeo de colores exacto del portal (con Vicky).
- Cinético opcional de la pared (tilt/stagger) — se puede omitir si distrae.
- Contenido real del modal (tools/desc/galería/video) — depende del equipo.
