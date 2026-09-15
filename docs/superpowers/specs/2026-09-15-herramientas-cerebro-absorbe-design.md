# Hero → Herramientas — "un solo cerebro que absorbe" (diseño)

Estado: 🟡 En revisión de Luly (2026-09-15, **revisado tras decisión de cerebro
persistente**).
Alcance: cubre la **transición Hero → Herramientas como un solo recorrido continuo**
con **un único cerebro persistente**. Enmarca el "momento clave" del
`2026-09-14-recorrido-mente-vaiven-pantallazo.md` (el cruce del umbral donde explota
el color). Reestructura el hero actual (`2026-09-14-hero-abri-la-cabeza-design.md`)
para re-alojar sus capas en un escenario compartido — **sin perder ningún
comportamiento existente** (puertas, glow de grilla, parallax, crecimiento del
cerebro).

> **Cambio respecto de la 1ª versión de este spec (2026-09-15):** la sala Herramientas
> ya **no** es una sección con su propio cerebro independiente. Luly definió que el
> cerebro que ves cuando se abren las puertas del hero **es el mismo** que absorbe las
> herramientas: un solo elemento que persiste. Eso unifica hero + herramientas en un
> escenario sticky compartido.

---

## 1. Idea central

**Un solo cerebro atraviesa todo el recorrido.** En el hero, con las puertas cerradas,
estás en el umbral (B&N). Al scrollear, las puertas se abren y el **cerebro crece hasta
dominar el cuadro** — sigue en B&N: todavía estás cruzando. Cuando el cerebro empieza a
**absorber herramientas (logos) y servicios (palabras)**, **explota el color**: cada
absorción tiñe el cerebro. No hay corte ni "otra sección": es el mismo cerebro, el
mismo plano, que pasa de umbral (B&N) a mente-en-color.

Esto realiza el momento clave del pantallazo: *"La transición Hero → Herramientas es
cuando cruzás el umbral y explota el color."* El color **lo causa la absorción** (no el
umbral): el cerebro se mantiene B&N mientras las puertas se abren, y recién enciende
color con la primera herramienta absorbida.

---

## 2. Arquitectura: un escenario, un cerebro, dos fases

Un **único contenedor alto** (`.mente-journey`) con **un único escenario sticky**
(`.mente-stage`, `position: sticky; top:0; height:100vh`) que queda pineado durante todo
el recorrido. Las secciones dejan de contener el arte: pasan a ser **espaciadores +
anclas de nav** posicionados dentro del contenedor.

```
.mente-journey                      contenedor alto (relative) — da el largo de scroll
  └─ .mente-stage (sticky, 100vh)   UN escenario pineado toda la travesía
       ├─ .hero-fondo               capas del HERO (se conservan tal cual)
       ├─ .hero-collage
       ├─ .cerebro                  ← EL MISMO elemento en todo el recorrido
       ├─ .puerta-izq / .puerta-der
       ├─ .ojo / .mano-lupa / .hero-frase
       ├─ .herr-dust (canvas)       capas de HERRAMIENTAS (nuevas)
       ├─ .herr-palabra (erratic)
       └─ .herr-lluvia (logos)
  ├─ #hero  (ancla, arriba)         nav "home"
  └─ #herramientas (ancla, ~fin de la fase de puertas)   nav "herramientas"
```

**Un progreso global** `p` (0..1) sobre `.mente-journey` (mismo cálculo que hoy usa
`hero.js`: `-getBoundingClientRect().top` sobre `offsetHeight - innerHeight`). Se parte
en dos fases con un límite `B`:

- **Fase 1 — Umbral (puertas):** `p ∈ [0, B]`. Se expone como `--hero-progress = p/B`
  (0..1). **Toda la CSS del hero actual sigue funcionando sin cambios** (está atada a
  `--hero-progress`): puertas se abren, frase/ojos/lupa se desvanecen, collage se aleja,
  **cerebro crece** (scale 0.6→1.35) — todo en B&N.
- **Fase 2 — Absorción (herramientas):** `p ∈ [B, 1]`. Se expone como
  `--herr-progress = (p - B)/(1 - B)` (0..1). El cerebro queda a tamaño pleno y ahora
  absorbe logos + palabras y **enciende color**.

`B` es afinable (arranca ~`0.38`). El ancla `#herramientas` se ubica a la profundidad de
scroll de `B` para que el nav salte al inicio de la fase 2.

> Consecuencia clave: como `--hero-progress` y `--herr-progress` son variables locales
> por fase, **la CSS del hero y la de herramientas conviven sin pisarse**, y el cerebro
> —único elemento— hereda ambas (crece en fase 1, se tiñe/absorbe en fase 2).

---

## 3. El cerebro persistente (B&N → color)

Un solo `<img class="cerebro">` (hoy `cerebro.webp`).

- **Fase 1:** `filter: grayscale(1) contrast(1.25)` (B&N), crece con `--hero-progress`
  (se conserva la regla actual `.hero-cerebro`/`.cerebro`).
- **Fase 2 (encendido en la 1ª absorción):** al absorber la palabra de cada beat, el
  cerebro **cambia de color**. Placeholder hasta tener los assets: quitar el grayscale y
  aplicar un tinte por beat (`hue-rotate`/`saturate`). Real: swap de `src` a las ~5
  versiones de color que prepara Luly (`brain.src = BRAIN_SRCS[beat]`). Un pulso breve
  por absorción.

El cerebro **nunca reaparece ni salta de tamaño**: mantiene escala y centro entre fases.

---

## 4. Las 5 palabras-beat (servicios)

En la fase 2, las 5 disciplinas aparecen **una por una** a medida que avanza
`--herr-progress`. Cada beat = una palabra de servicio + un color de cerebro nuevo.

| Beat | Palabra (servicio) | Color de cerebro |
|---|---|---|
| 1 | Ilustración y Diseño Gráfico | color A (1ª absorción = 1ª explosión) |
| 2 | Modelado 3D | color B |
| 3 | Motion Graphics | color C |
| 4 | Desarrollo web | color D |
| 5 | Campañas publicitarias | color E |

Colores de la paleta de marca; orden final se ajusta con los assets reales. Las palabras
usan el sistema **`erratic`** (`erratic.js`) y se absorben hacia el centro del cerebro.

---

## 5. Los logos: lluvia libre, sin correlación (fase 2)

Los 15 logos de `resources/logos/` **no se emparejan con disciplinas** (decisión
2026-09-15): llueven libre y continuamente en la fase 2 y son absorbidos por el cerebro
como textura/energía de "lluvia de ideas". Nunca todos a la vez: cada logo tiene su
franja de `--herr-progress` en la que entra desde el borde, viaja al centro, se achica y
se desvanece (determinista y reversible con el scroll).

Logos: `after-effects`, `audition`, `blender`, `capcut`, `chatgpt`, `claude`, `css`,
`html5`, `illustrator`, `js`, `photoshop`, `substance-3d-painter`, `unity`, `unreal`,
`visual-studio-code`.

---

## 6. Atmósfera

Un **campo de polvo ambiente** (starfield tenue) a la deriva en un `<canvas>`
(`.herr-dust`) detrás del cerebro, visible sobre todo en la fase 2 (con las puertas ya
abiertas). Loop rAF propio, pausado cuando el recorrido está fuera de vista.

---

## 7. Tecnología y accesibilidad

- **Vanilla-first.** Un solo controlador `mente.js` (superconjunto del `hero.js` actual):
  - Un handler de scroll → progreso global `p`; escribe `--hero-progress` (fase 1) y
    `--herr-progress` (fase 2) en el escenario.
  - Cursor: `--mx/--my` (glow de grilla) y `--mnx/--mny` (parallax) — **se conserva** la
    lógica de `hero.js`.
  - Fase 2: beats (palabra + color de cerebro), lluvia de logos, y el canvas de polvo.
  - Guards de `touch` / `prefers-reduced-motion` como hoy.
  - `hero.js` queda **reemplazado** por `mente.js` (su lógica migra íntegra).
- **La CSS del hero se conserva** (atada a `--hero-progress`/`--mx`/`--mnx`); solo se
  re-aloja el DOM en el escenario compartido y cambia la fuente de las variables.
- **Reduced-motion / touch:** sin pin ni scrub. El hero queda estático en su estado de
  umbral (puertas cerradas + frase, `--hero-progress:0`) y debajo se muestra el
  **contenido estático accesible** de herramientas (encabezado + servicios + tools).
  Requerido por WCAG AA.

---

## 8. Impacto y migración

- **Reestructura el hero** (aprobado por Luly): re-aloja `.hero-*` dentro de
  `.mente-stage`; el cerebro pasa a ser `.cerebro` compartido. Se preserva todo
  comportamiento (puertas, glow, parallax, crecimiento).
- **Supersede** la Tarea 1 ya commiteada (`686d591`, escenario `herr` autónomo): el nuevo
  plan la reescribe hacia el escenario unificado.
- **Assets:** logos ✅ en `resources/logos/`. Cerebros de color (~5) ⏳ los prepara Luly;
  hasta entonces, placeholder con `hue-rotate`.

---

## 9. Qué NO cubre este spec

- Copy fino de las palabras si cambian las etiquetas de disciplina.
- Orden y valores exactos de los colores de cerebro (dependen de los assets).
- Salas posteriores (portfolio, nosotros, contacto) y sus transiciones.
- Un motivo conector persistente entre salas más allá del cerebro (decisión futura del
  pantallazo).
