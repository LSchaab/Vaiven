# Herramientas → Portfolio — "el cerebro se va, entran los trabajos" (diseño)

Estado: 🟡 En revisión de Luly (2026-09-15).
Alcance: cubre **la transición Herramientas → Portfolio** (cómo desaparece el cerebro
y arranca el portfolio) **y la sala Portfolio completa**: un carrusel 3D de dos niveles
(categorías → trabajos) que funciona como punto focal interactivo de la página. Continúa
el recorrido definido en `2026-09-14-recorrido-mente-vaiven-pantallazo.md` (sala 3 del
arco) y engancha con el final de `2026-09-15-herramientas-cerebro-absorbe-design.md`
(el cerebro persistente, a todo color, tras absorber las 5 disciplinas).

---

## 1. Idea central

Durante Herramientas el cerebro **absorbió** ideas (logos + disciplinas) y se llenó de
color. En Portfolio esas ideas **salen hechas realidad**: los trabajos. La transición es
literal — el cerebro, lleno, **se va** y **deja lugar** a los trabajos.

Dos decisiones lo definen:

1. **El portfolio es un punto focal, no un catálogo.** La página venía scrolleando en modo
   cinemático (todo scrubbeado por scroll). Acá **se detiene y se vuelve táctil**: llegás,
   se ancla, y explorás con la mano (arrastrar / flechas / click). Ese cambio de ritmo es
   lo que lo convierte en foco. Una señal `seguí ↓` te devuelve al scroll hacia Nosotros.

2. **El filtro ES el carrusel.** Tenemos ~19 trabajos: demasiados para mostrar de una y
   perdería fuerza. En vez de una barra de filtros sobre una grilla, el carrusel tiene
   **dos niveles**. En reposo mostrás **5 tarjetas de categoría** (una statement, no 19
   miniaturas); al elegir una, el mismo carrusel **se re-arma en el lugar** con los trabajos
   de esa categoría. El filtro no es un control aparte: es la navegación misma.

---

## 2. La transición (Herramientas → Portfolio)

El cerebro a todo color (final de la fase 2) **no hace un corte**: hace un gesto.

- **Vibra** — una micro-sacudida breve (tensión, "está por soltar").
- **Se va a la izquierda** — sale del cuadro deslizándose hacia la izquierda (y se
  desvanece al salir).
- **Entran los trabajos por la derecha** — mientras el cerebro sale, aparecen el **título
  de la sala** (texto) y la **primera tarjeta del carrusel deslizándose desde la derecha**.
  Es un relevo lateral limpio: el cerebro sale por izquierda, el portfolio entra por
  derecha. Ese movimiento lateral es, además, el "movimiento lateral" que el pantallazo
  pide para el portfolio — la transición **es** la entrada del carrusel.

**Dónde vive técnicamente:** es una **fase final del escenario sticky** que ya existe
(`.mente-stage` en `.mente-journey`), no maquinaria nueva. Se agrega un tramo de scroll al
final (una "fase 3 / salida") atado a una variable nueva (`--salida-progress`, 0..1, misma
mecánica que `--hero-progress` / `--herr-progress`). En ese tramo: el cerebro vibra + sale
por izquierda, y el título + primera tarjeta entran por derecha. Al terminar el tramo, el
escenario se despinea y quedás en el portfolio interactivo.

> El cerebro **no reaparece** después de salir: cumplió su rol en el recorrido. Si en el
> futuro se decide un motivo conector persistente (ver pantallazo §6), se reconsidera.

---

## 3. El portfolio como isla interactiva

Al despinearse el escenario, el portfolio queda **anclado como foco** (una pantalla, no
scrollea por dentro). Acá el sitio **deja de scrubbear** y se vuelve interactivo:

- **Exploración:** arrastrar (drag) lateral, flechas `◂ ▸`, y click en una tarjeta.
- **Salida:** una señal `seguí ↓` (o simplemente seguir scrolleando) te lleva a Nosotros.
- El contraste con el resto del sitio (cinemático/scrubbeado ↔ acá táctil/manual) es lo
  que lo vuelve el punto focal.

**Guards:** en `touch` y `prefers-reduced-motion`, la isla no depende de drag ni de scrub;
las flechas y los chips de categoría siguen funcionando, y hay un fallback estático
accesible (ver §7).

---

## 4. El carrusel 3D — un componente, dos niveles

**Forma:** un **coverflow semi-3D**. La tarjeta central va grande y de frente; las de los
costados se **rotan hacia atrás en perspectiva** (`rotateY`) y se achican/atenúan hacia la
profundidad a ambos lados. Es 3D, se mueve de costado. CSS puro (`perspective` +
`rotateY`/`translateZ`/`translateX`/`scale`), vanilla, sin librerías.

**Clave de arquitectura:** los dos niveles **no son dos componentes**. Es **un carrusel
que renderiza el array que le pases**. Cambiar de nivel = cambiar el array + animar el
re-armado.

### Nivel 1 — las categorías (reposo)
5 tarjetas grandes, una por disciplina:

| Card | Color (brain-hue) |
|---|---|
| Ilustración y Diseño Gráfico | hue del beat 1 |
| Modelado 3D | hue del beat 2 |
| Motion Graphics | hue del beat 3 |
| Desarrollo web | hue del beat 4 |
| Campañas publicitarias | hue del beat 5 |

Cada tarjeta: una imagen hero a sangre + el nombre de la disciplina, teñida en su
brain-hue. Es la statement visual y **esconde el volumen** (ves 5, no 19).

### Nivel 2 — adentro de una categoría (drill-in)
Al elegir una categoría, el carrusel **se re-arma en el lugar**: la tarjeta de categoría se
"abre" y el ring se re-puebla con **solo los trabajos de esa categoría** (Diseño 5, 3D 3,
etc. — números cómodos). Un control **`← volver`** vuelve al Nivel 1. Es **el mismo
elemento** re-poblándose: nunca una página ni ruta aparte.

### Callback de color
Al entrar a una categoría, la escena **se re-ilumina en el brain-hue de esa disciplina**
(se reutiliza el array `BEAT_HUE` que ya existe en `mente.js`). Hilo narrativo: el mismo
color con que el cerebro se tiñó al absorber esa disciplina reaparece cuando ves sus
trabajos.

---

## 5. Datos y assets

Fuente de datos: un array de disciplinas, cada una con `{ label, hue, works[] }`. Cada
work: `{ title, media, thumb, ... }`. (Estructura fina a definir en el plan; el copy y los
autores siguen pendientes — ver CLAUDE.md, no inventar.)

Estado real de assets (2026-09-15):

| Categoría | Assets | Nivel 2 |
|---|---|---|
| Ilustración y Diseño Gráfico | 5 posters con imagen (`diseno_grafico/`) | trabajos reales |
| Modelado 3D | 3 proyectos con imagen (`3d/`) | trabajos reales |
| Motion Graphics | sin assets reales (video) | placeholder "VIDEO — próximamente" |
| Campañas publicitarias | sin assets reales (video) | placeholder "VIDEO — próximamente" |
| Desarrollo web | a confirmar | placeholder hasta tener assets |

Las **tarjetas de Nivel 1 funcionan siempre** (aunque la categoría no tenga trabajos
reales aún): muestran la disciplina. El placeholder solo aparece en Nivel 2.

---

## 6. Colores del arco

Portfolio es **zona de color** (estás adentro de la mente). El fondo de la sala usa la
paleta de marca vía tokens (a afinar en el plan; candidato: `--violeta-claro` o el azul de
marca, coherente con el resto del interior). Las tarjetas y el re-iluminado usan los
brain-hue por disciplina. Nada de hex hardcodeado — siempre tokens/variables.

---

## 7. Tecnología y accesibilidad

- **Vanilla-first.** El carrusel es un módulo propio (`portfolio.js` o similar; a decidir
  en el plan) — separado de `mente.js`, que sigue dueño del recorrido sticky. La transición
  (fase de salida del cerebro) sí vive en `mente.js` porque toca el escenario compartido.
- **CSS 3D** para el coverflow (`perspective`, `rotateY`, `translateZ`). Sin librerías.
- **Reduced-motion / touch:**
  - Transición: sin vibración ni scrub; el cerebro no anima su salida — se muestra el
    portfolio directamente debajo.
  - Carrusel: navegable por **flechas y chips de categoría** (no depende de drag ni de
    scrub). Sin coverflow 3D pesado si `reduced-motion` (se puede degradar a una fila
    plana con scroll horizontal nativo).
  - **Fallback estático accesible:** el contenido real (categorías + trabajos como lista
    con títulos y thumbs) legible por lectores de pantalla siempre, y visible como grilla
    simple bajo reduced-motion. Requerido por WCAG AA.
- **Sin página aparte:** todo Nivel 1 ↔ Nivel 2 es re-render del mismo componente en
  `index.html`. No hay ruteo.

---

## 8. Impacto y migración

- Reemplaza el stub actual `<section id="portfolio" class="zona-color"><h2>portfolio</h2></section>`.
- **Toca `mente.js` y su CSS** para agregar la fase de salida del cerebro (`--salida-progress`)
  y alargar `.mente-journey` el tramo correspondiente (afinable, en sync con el JS).
- **Agrega** el módulo del carrusel + su CSS + el array de datos del portfolio.
- No toca hero ni herramientas más allá de la fase de salida agregada al final.

---

## 9. Qué NO cubre este spec

- Copy final de títulos, descripciones y autores de los trabajos (pendiente; no inventar).
- Layout fino de las tarjetas y valores exactos del coverflow (ángulos, spacing, perspective) —
  se afinan en vivo durante la implementación.
- Assets reales de Motion / Campañas / Web (siguen pendientes).
- Salas posteriores (Nosotros, Contacto) y sus transiciones.
- Un motivo conector persistente entre salas más allá de lo ya definido (decisión futura
  del pantallazo).
