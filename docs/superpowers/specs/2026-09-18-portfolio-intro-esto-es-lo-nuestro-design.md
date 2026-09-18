# Portfolio intro — "ESTO ES LO NUESTRO" (violeta + amarillo)

**Fecha:** 2026-09-18
**Pantalla:** intro del portfolio dentro del stage pineado (`.portfolio-stage` / `.work__intro`)
**Estado:** Diseño aprobado — pendiente plan de implementación

---

## Concepto

La pantalla que presenta el portfolio (hoy "NOSOTROS RESOLVEMOS") pasa a decir
**"ESTO ES LO NUESTRO"** y se viste con la identidad gráfica de la marca: grilla
estructural + recursos gráficos (miras, cruces, flechas, barras, marcos, cruz),
en paleta **violeta + amarillo**. Hace eco del hero ("Abrí la cabeza, empezá por
la **nuestra**") → el trabajo se presenta como identidad, no como servicio.

Reutiliza patrones que ya existen en el sitio:
- la grilla de líneas de `hero-fondo`/`.puerta` (misma receta, **sin** el glow que
  sigue al cursor),
- el sistema de misceláneas gráficas de la sala herramientas (`.herr-miscelaneas`
  / `.hm2`: SVG de `resources/hero/` posicionados en absoluto).

**Sólo aplica en desktop/coverflow** (`body.coverflow .portfolio-stage`), donde vive
esta pantalla. En galería/mobile el portfolio es la lista vertical de `#work` — no
se toca.

## Contenido

- **Texto:** `ESTO` (arriba) / `ES LO NUESTRO` (abajo), reemplaza
  `NOSOTROS`/`RESOLVEMOS` en `.work__intro-word`. Mismo efecto `erratic` por palabra.
- La línea de abajo ("ES LO NUESTRO") es más larga → bajar un poco el `font-size`
  del bloque para que no desborde en pantallas medianas (el `clamp` actual es
  `clamp(2.2rem, 10vmin, 6rem)`; ajustar el vmin/máx durante el maquetado).

## Paleta

Violeta (fondo `--violeta-claro`, ya existente) + **amarillo** (`--amarillo`) como
acento, con apoyos en `--lila`, `--gris-claro` y `--blanco`. **No** usar `--naranja`
(la versión de herramientas sí lo usa; acá la paleta es violeta/amarillo/gris).
Sólo tokens — nada hardcodeado.

## Grilla estática (persistente, tenue)

- Trama de líneas blancas tenues, **misma receta que `hero-fondo`/`.puerta`**:
  `repeating-linear-gradient` en X e Y, paso `44px`, blanco a baja opacidad.
- **Sin** el `::after` de glow que sigue al mouse (esta grilla es estática).
- Persistente: se queda **detrás de las cards** también, muy tenue (~`0.05`), como
  textura de marca constante (decisión Lourdes 2026-09-18).
- **Implementación:** `::before` de `.portfolio-stage` (`inset:0`, `z-index:0`, por
  debajo de las capas de cards/intro). Al vivir dentro de `.portfolio-stage`, el
  `clip-path` del iris (`--portal-open`) la revela junto con el violeta al abrir el
  portal — consistente con el resto de la entrada.

## Recursos gráficos (capa `.work-deco`)

Nueva capa `.work-deco` dentro de `.portfolio-stage`, `aria-hidden="true"`,
`pointer-events:none`, con los SVG de `resources/hero/` posicionados en absoluto
(mismo enfoque que `.herr-miscelaneas`). Posiciones aproximadas según el sketch de
Lourdes — **afinables en el maquetado/QA**.

| # | Recurso | Asset | Posición aprox. | Tinte |
|---|---|---|---|---|
| 1 | Marco (esquina) | brackets L / `marco.svg` | esquina **sup-derecha** | amarillo |
| 2 | Marco (esquina) | brackets L / `marco.svg` | esquina **inf-izquierda** | amarillo |
| 3 | Barras | `barras_derecha.svg` | arriba, centro-derecha (~62%, 10%) | amarillo |
| 4 | Cruces (3 ×) | `cruces_abajo.svg` | izquierda (~16%, 22%) | blanco/lila |
| 5 | Mira (detrás del texto) | `mira.svg` | centrada tras el título | blanco tenue |
| 6 | Flechas | `flechas.svg` | al lado de "ES LO NUESTRO" (~58%, 56%) | blanco/lila |
| 7 | Ejes + línea + cuadrado | `linea_cuadrado.svg` | derecha, grande (~80%, 45%) | blanco tenue |
| 8 | Cruz | `suma.svg` (bold) | inf-derecha (~72%, 76%) | amarillo |
| 9 | Cuadrado rayado | hatch (CSS o SVG) | inf-izquierda (~14%, 82%) | lila/gris |
| 10 | Línea + cuadraditos | mini barra + 3 `span` | abajo centro (~45%, 90%) | lila · amarillo · gris |
| 11 | Cuadraditos/dots sueltos | `span` | dispersos (ver sketch) | blanco/amarillo/gris |

- **Tinte de SVG:** los assets de `resources/hero/` son monocromos; se colorean con
  `filter` (como en `.hm2`, p. ej. `hue-rotate`/`saturate`/`brightness`) o, para el
  amarillo puro, evaluar recolor por filtro contra `--amarillo`. Los cuadraditos/dots
  son `span` con `background: var(--token)`, no SVG.
- **Mira detrás del texto:** la capa `.work-deco` va en `z-index:3` (sobre las cards
  z2, **debajo** del texto de `.work__intro` z4) → la mira queda detrás del título,
  como en el sketch.

## Comportamiento (fade)

- Los **recursos gráficos** (`.work-deco`) aparecen **con la frase intro** y se van
  cuando entran las cards: comparten la curva de opacity de `.work__intro`
  (entra con `--portal-open` 0.3→0.7, sale con `--scroll-progress` 0→0.12). Así la
  pantalla de cards queda limpia de misceláneas.
- La **grilla** NO comparte ese fade: es persistente (se queda tenue detrás de las
  cards). Sólo la revela el iris del portal.

## Estructura y archivos

- `index.html`:
  - cambiar el texto de `.work__intro-word` a `ESTO` / `ES LO NUESTRO`.
  - agregar la capa `.work-deco` (con sus `<img>`/`<span>`) dentro de
    `.portfolio-stage`, hermana de `.work__intro`.
- `styles.css`:
  - `.portfolio-stage::before` — grilla estática persistente (tenue).
  - bloque nuevo `.work-deco` + posiciones/tintes de cada recurso.
  - ajuste de `font-size` de `.work__intro-word` para la línea larga.
- **Sin JS nuevo.** `work-carousel.js`/`mente.js` no se tocan: `.work-deco` sólo
  usa las vars que ya publican (`--portal-open`, `--scroll-progress`) vía CSS.

## Accesibilidad

- Todos los recursos gráficos son decorativos → `aria-hidden="true"`, `alt=""`.
- El texto real "ESTO ES LO NUESTRO" queda en el DOM (lo lee el lector de pantalla);
  el contenido accesible del portfolio sigue siendo la galería `#work` / los
  proyectos, sin cambios.

## Fuera de alcance (YAGNI)

- Animar los recursos gráficos (quedan estáticos, sólo fade con la intro).
- Assets nuevos: se reutilizan los SVG existentes de `resources/hero/`. Si algún
  recurso (p. ej. la cruz amarilla o el cuadrado rayado) no calza con un asset
  actual, se resuelve con CSS o tinte, no con archivos nuevos.
- Tocar la pantalla de cards, la galería mobile, o el copy de los proyectos.
- Paleta/segunda variante de color (seguimos en Mode 1).
