# Herramientas y servicios — "el cerebro absorbe" (diseño)

Estado: 🟡 En revisión de Luly (2026-09-15).
Alcance: spec de detalle de **una sala** — la Sala #2 del recorrido. Se enmarca en
`2026-09-14-recorrido-mente-vaiven-pantallazo.md` (la brújula narrativa) y hereda el
esqueleto del `2026-09-14-desarme-esqueleto-design.md`.

---

## 1. Idea central

Sala #2, **primera sala adentro de la mente**. El **cerebro es el protagonista fijo
en el centro** — continuidad directa con el hero *"Abrí la cabeza, empezá por la
nuestra"*. Al scrollear, la mente **absorbe lo que VAI VEN sabe hacer y con qué**:
los logos de herramientas y las palabras de cada servicio **llueven, se acercan y son
succionados hacia el cerebro**. Cada absorción de una palabra hace que el cerebro
**cambie de color**.

Esto **entrega la explosión de color** del arco B&N → color → B&N: el color no se
explica, *sucede* a medida que el cerebro absorbe. Es el latido que sigue al "abrir
las puertas" del hero.

Referencia visual que trajo Luly: escena oscura con una pieza central luminosa y
logos + palabras que aparecen/desaparecen alrededor. **De la referencia tomamos solo
eso** — logos y palabras orbitando y entrando a la pieza central. La pieza central NO
es el cúmulo de partículas de la referencia: es **nuestro cerebro**.

---

## 2. Estructura y mecánica de scroll

- **Escenario sticky ("brain stage").** La sección mide varias pantallas de alto
  (~5). El cerebro queda **pineado en el centro del viewport** mientras se scrollea, y
  el progreso de scroll maneja la secuencia.
- **Progreso 0..1** calculado igual que en `hero.js`: `-getBoundingClientRect().top`
  sobre `offsetHeight - innerHeight`, escrito como variable CSS (p. ej.
  `--herr-progress`) vía un único handler de scroll con `requestAnimationFrame`.
- **5 word-beats.** Las 5 disciplinas aparecen **una por una** a medida que avanza el
  progreso. Cada beat = una palabra de servicio + un color de cerebro nuevo.

| Beat | Palabra (servicio) | Color de cerebro |
|---|---|---|
| 1 | Ilustración y Diseño Gráfico | color A |
| 2 | Modelado 3D | color B |
| 3 | Motion Graphics | color C |
| 4 | Desarrollo web | color D |
| 5 | Campañas publicitarias | color E |

Los colores concretos salen de la paleta de marca (`--naranja`, `--azul`,
`--amarillo`, `--verde-agua-claro`, `--lila`, etc.); el orden final se ajusta cuando
lleguen los assets de cerebro de color.

---

## 3. Los logos: lluvia libre, sin correlación

Decisión de Luly (2026-09-15): **los logos NO se emparejan con disciplinas.** Los 15
llueven de forma libre y continua a lo largo de toda la sección y son absorbidos por
el cerebro como pura textura/energía de "lluvia de ideas". No hay lógica de
"este logo pertenece a este servicio".

Logos disponibles en `resources/logos/` (15, SVG):

`after-effects`, `audition`, `blender`, `capcut`, `chatgpt`, `claude`, `css`,
`html5`, `illustrator`, `js`, `photoshop`, `substance-3d-painter`, `unity`,
`unreal`, `visual-studio-code`.

Reglas de la lluvia:
- **Nunca todos a la vez.** En pantalla hay pocos ítems por vez; los del beat anterior
  ya fueron absorbidos cuando entran los siguientes.
- Aparecen en **bordes / parte superior**, hacen un *drift* hacia adentro y luego son
  **acelerados/succionados al centro** (bajan de escala + se desvanecen al tocar el
  cerebro).
- El reparto de qué logo cae en qué momento es libre; se distribuyen a lo largo del
  progreso para que la lluvia se sienta constante, no por beat.

---

## 4. Animación de absorción

Por cada ítem (logo o palabra):
1. **Spawn** en un borde con una posición/rotación ligeramente aleatoria.
2. **Drift** hacia el interior (lento, orgánico).
3. **Succión**: al cruzar cierto umbral de progreso, se acelera hacia el centro del
   cerebro, escala → 0 y opacidad → 0.
4. **Reacción del cerebro**: al absorber la **palabra** de un beat, el cerebro hace
   *cross-fade* al asset del color siguiente + un pulso sutil (scale/glow breve).

Detrás de todo, un **campo de polvo ambiente** (starfield tenue) a la deriva, en un
`<canvas>` chico, para dar atmósfera (lo único que replicamos del fondo de la
referencia).

---

## 5. Tipografía (las palabras)

Las palabras de disciplina usan el sistema **`erratic`** ya existente (`erratic.js`,
"reutilizado por cada sección"), para la mezcla cruda de pesos/itálicas que hace eco
al contraste sans/itálica de la referencia. La palabra entra y se absorbe junto con la
lluvia de logos.

---

## 6. Tecnología y accesibilidad

- **Vanilla-first** (coherente con el proyecto y con `hero.js`):
  - Sección sticky + un handler de scroll → `--herr-progress` (0..1).
  - Rain/absorción resueltas con **transforms de CSS** a partir del progreso.
  - Cerebro como `<img>` con **swap** entre assets de color (o cross-fade de dos capas).
  - Polvo ambiente en un `<canvas>` pequeño.
  - Guards de `touch` / `prefers-reduced-motion` como en `hero.js`.
- **Escape hatch:** si el scrubbing vanilla se siente duro/janky, se evalúa GSAP
  ScrollTrigger. **No se adopta ahora** — se marca como decisión si aparece el
  problema (regla del proyecto: librería solo con razón clara).
- **Reduced-motion / mobile:** sin pin ni scrub. Los beats pasan a un **reveal
  estático apilado** (por disciplina: cerebro + palabra + algunos logos), 100 %
  legible. Requerido por el objetivo WCAG AA.

---

## 7. Assets

- **Logos** ✅ ya en `resources/logos/` (15, SVG, kebab-case).
- **Cerebros de color (~5)** ⏳ los prepara Luly (una versión del cerebro por color de
  beat). Hasta que lleguen se construye con **placeholders** recoloreando
  `resources/cerebro.webp` (p. ej. `filter: hue-rotate`) para poder ver la mecánica.

---

## 8. Qué NO cubre este spec

- Copy fino / nombres exactos si cambian las etiquetas de disciplina.
- La transición dura Hero → Herramientas (el "cruce del umbral"); se diseña en su
  propia sesión (es el momento clave según el pantallazo general).
- Orden final y valores exactos de los colores de cerebro (dependen de los assets).
- Assets reales de Motion/Campañas para el portfolio (otra sala).
