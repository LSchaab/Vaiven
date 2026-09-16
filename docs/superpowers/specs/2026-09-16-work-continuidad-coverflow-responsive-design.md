# Portfolio `#work` — continuidad cerebro→cards, coverflow multi-fila y modo responsive

**Fecha:** 2026-09-16
**Branch:** `storytelling-redesign`
**Estado:** Diseño aprobado por Luly — pendiente escribir plan de implementación.

> Refina la sección portfolio (`#work`) ya existente (carrusel 3D coverflow +
> modal, ver `2026-09-16-work-carrusel-scroll-3d-design.md`) y su empalme con la
> transición del cerebro (`mente.js`, ver
> `2026-09-15-herramientas-cerebro-absorbe-design.md`). No reemplaza esos specs;
> corrige 4 problemas concretos detectados al probar en vivo.

---

## Problema

Al recorrer el sitio hoy:

1. **El cerebro deja de crecer** cuando terminan de abrir las puertas (fase 1) y
   queda congelado en `scale ≈1.35` durante toda la absorción. No "domina" el
   cuadro, y no tapa bien la boca del portal de salida → se llega a ver el hueco.
2. **Pantalla violeta muerta** entre la transición y las cards. El portal
   (`.salida-portal`, en `.mente-journey`) se expande hasta llenar de violeta, y
   las cards viven en **otra sección** (`#work`). Resultado: en el momento de
   "NOSOTROS RESOLVEMOS" ves violeta vacío y tenés que seguir scrolleando hasta
   otra sección para ver la primera card. Se pierde la continuidad.
3. **El coverflow muestra una card por vez.** Se pidió que se vean **hasta 2**
   cards a la vez, desfasadas en distintas líneas de la pantalla.
4. **No hay transición de salida.** Al terminar de scrollear las cards no pasa
   nada; se pidió el **efecto inverso** al de entrada (la misma transición al
   revés).
5. **El coverflow 3D no está pensado para pantallas chicas.** En tablet/mobile
   dos cards apretadas o el cruce 3D no funcionan bien.

## Objetivo

Un solo flujo continuo **cerebro → absorción → portal → cards → salida →
Nosotros**, sin pantalla muerta, con el efecto cinético como *enhancement* de
desktop y una experiencia simple y probada en pantallas chicas.

---

## Diseño

### A. Cerebro escalonado que tapa el portal (punto 1)

El cerebro suma un **paso de tamaño por cada disciplina absorbida** (5 pasos),
sincronizado con el pulso `is-absorbing` que ya dispara `setBrainColor()` en el
punto `ABSORB_AT` de cada beat.

- Nueva custom property `--cerebro-grow` (rem o factor de escala) que arranca en
  0 y se incrementa un paso fijo cada vez que se absorbe un beat.
- `mente.js`: en el mismo lugar donde hoy se agrega la clase `is-absorbing`
  (dentro de `setBrainColor`, `idx >= 0`), setear
  `brain.style.setProperty("--cerebro-grow", pasoPorBeat * (idx + 1))`.
  Resetear a 0 cuando `herrP <= 0` (junto al reset de color existente).
- CSS `.cerebro`: el `transform: scale(...)` pasa de
  `scale(0.6 + hero·0.75)` a `scale(0.6 + hero·0.75 + var(--cerebro-grow, 0))`.
- El paso total (5 beats) debe dejar el cerebro **lo bastante grande como para
  cubrir la boca del portal** durante toda la salida temprana (el portal chico
  base es `20vmin × 30vmin`). Valor concreto afinable en vivo; punto de partida:
  ~`0.08` por beat (≈ +0.4 de scale al final).
- El crecimiento debe verse suave: reutilizar/permitir una transición de
  `transform` corta (hoy `.cerebro` sólo transiciona `translate`/`filter`; se
  agrega `transform` a la transición o se anima vía el `scale` interpolado por
  el pulso).

### B. Continuidad: la frase se va y entran las cards (puntos 2 y 3)

Eliminar el buffer de scroll violeta vacío entre el final del portal y la
primera card. Decisión de UX: **encadenado** (la frase "NOSOTROS RESOLVEMOS" se
va y enseguida entran las cards), **sin pantalla muerta** en el medio.

- El arranque de la pista del carrusel se **pega** al final de
  `.mente-journey`: apenas el portal termina de llenar de violeta y la frase se
  desvanece, la(s) primera(s) card(s) ya están **entrando en cuadro**.
- Concretamente hay que coser el límite entre `.mente-journey` (sticky
  `.mente-stage`, termina en portal violeta pleno) y `#work` (sticky
  `.work__inner`, fondo `--violeta-claro`, card 0 centrada en `S=0`):
  - El violeta del portal y el `--violeta-claro` de `#work` deben ser el mismo
    color para que el empalme sea invisible (ya lo son: el portal usa
    `--violeta-claro`).
  - Ajustar los instantes finales de la salida (`SALIDA_VH` / umbrales de
    `--salida-progress`) y/o el comienzo de la pista de `#work` para que **no
    quede scroll donde se vea violeta sin cards**. La primera card debe estar
    entrando justo cuando el portal llenó y la frase salió.
- No hace falta un solapamiento pixel-perfect de portal + cards; sí que la
  transición de una cosa a la otra sea **inmediata y en el mismo hilo de
  scroll**, sin tener que "bajar de sección" percibido.

### C. Coverflow multi-fila — máximo 2 cards (puntos 2 y 3), sólo desktop

Sólo en **desktop (≥ ~1025px)**. En tablet y abajo aplica la sección E.

- El carrusel pasa de *una card centrada* a **2 carriles verticales**
  (arriba / abajo).
- Cada card se asigna a un carril **rotando** (índice par → carril 0, impar →
  carril 1), reemplazando el `--y` random actual (`fromRange(CONFIG.yRange,…)`)
  por el offset del carril.
- Se **ensancha la ventana de tránsito** (`CONFIG.transitWindow`) y/o se ajusta
  `centerOf(i)` para que haya **hasta 2 cards visibles a la vez**, desfasadas,
  cruzando D→I con el mismo giro 3D (`--progress` → rotateY/translate/scale que
  ya existe). Máximo 2 en cuadro, no más.
- Offsets de carril en **`vmin` clampeados** para que las cards nunca se
  solapen ni se salgan de cuadro.
- Tamaño de card desktop: ~`min(46vw, 560px)` (hoy `min(50vw, 640px)`).
- Se mantiene intacto: click→`PortfolioModal.open(i)`, lazy video, caption,
  `content-visibility` fuera de rango, starfield de fondo (`.work__grid`),
  parallax `--scroll-progress`.

### D. Salida espejo → Nosotros (punto 4), sólo desktop

Al terminar de scrollear las cards, la **entrada al revés**:

- Fase de salida al final de la pista de `#work`: las cards **se van** (se
  aceleran hacia la izquierda / se desvanecen) y una **cápsula violeta se
  contrae** desde pantalla llena hasta un **portal chico** — espejo de la
  apertura de entrada.
- Al cerrarse el portal, **revela la sección `#nosotros`** (lo que sigue).
- Reutiliza la mecánica/estética del portal de entrada (`.salida-portal` y sus
  umbrales de `--salida-progress`), invertida. Se puede implementar como una
  nueva fase de progreso al final del track de `#work` (una var tipo
  `--work-exit`), análoga a `--salida-progress` pero al revés, que dibuja la
  cápsula contrayéndose y hace el handoff a `#nosotros`.
- Sólo aplica en modo desktop/coverflow; en la galería vertical (E) la salida
  es scroll normal hacia `#nosotros`.

### E. Modo responsive: galería vertical + "Ver más" (tablet y abajo)

En **≤ ~1024px** (tablet y mobile) el coverflow 3D se reemplaza por una galería
vertical con scroll normal. **Mismo dato** (`window.WORKS`), **mismo modal**.

- **Grilla de cards** con scroll vertical normal: **2 columnas en tablet, 1 en
  mobile**. Cada card = portada (o fallback teñido brain-hue) 16:9 + título +
  tag de categoría. Click → `PortfolioModal.open(i)` (el modal ya existe).
- **Botón "Ver más":** muestra un **lote inicial de 6** cards; al tocarlo revela
  el resto (o de a 6). Cuando no queda nada por revelar, el botón **desaparece**.
- **Sin** giro 3D, sin ScrollTrigger, sin starfield obligatorio, sin fases de
  entrada/salida: entrás y salís de la sección con scroll normal.
- La entrada desde el portal en mobile: el portal igual se abre a violeta (la
  transición del cerebro se mantiene en todos los tamaños salvo reduced-motion),
  y debajo está la galería. La salida es scroll normal a `#nosotros` (sin portal
  de cierre).

**Breakpoint** exacto (~1024px) afinable en vivo. Una media query controla el
switch: arriba del breakpoint = coverflow (C+D); abajo = galería (E).

### F. Unificación con reduced-motion

Hoy `reduced-motion` cae a una **lista de texto pelada** (`.pf-fallback ul`).
Se cambia para que caiga a **la misma galería vertical de E** (sin animación) →
más lindo y una sola implementación cubre tablet + mobile + reduced-motion.

- La galería vertical (E) es el fallback también bajo `prefers-reduced-motion:
  reduce`, **en cualquier ancho**.
- El coverflow 3D (C+D) sólo se monta cuando: ancho ≥ breakpoint **Y** no
  reduced-motion.

---

## Componentes tocados

| Archivo | Cambio |
|---|---|
| `mente.js` | `--cerebro-grow` por beat en `setBrainColor` (A); reset en `herrP<=0`. Coser final del portal con la entrada de `#work` (B). |
| `styles.css` | `.cerebro` scale con `--cerebro-grow` (A). Empalme portal↔`#work` (B). 2 carriles + tamaño desktop (C). Fase de salida/cápsula que se contrae (D). Media query galería vertical + grilla 2/1 col (E). Fallback reduced-motion → galería (F). |
| `work-carousel.js` | Carriles rotativos en vez de `--y` random + ventana de tránsito para 2 visibles (C). Fase de salida (D). Detección de modo (breakpoint + reduced-motion) para montar coverflow **o** galería (E/F). |
| `index.html` (`#work`) | Markup para la galería vertical (contenedor grilla + botón "Ver más") además del `.work__scene` del coverflow (E). El handoff del portal a `#nosotros` en la salida (D). |
| `portfolio-modal.js` | Sin cambios de fondo (se sigue abriendo con `open(i)` desde ambos modos). |
| `portfolio-data.js` | Sin cambios (misma `window.WORKS`). |

## Fuera de alcance

- Reescribir el modal, el lightbox o los datos (`portfolio-data.js`).
- Portadas 16:9 reales de Diseño Gráfico / 3D / Web (las hace el equipo; siguen
  en fallback teñido).
- Fuentes de video reales de Motion / Campañas (assets del equipo).
- Copy/títulos definitivos (Lourdes los reescribe).
- Cualquier refactor no relacionado con estos 5 problemas.

## Criterios de aceptación (verificación visual en Chrome)

1. **Cerebro (A):** durante la absorción, el cerebro da un saltito de tamaño con
   cada disciplina y al final tapa la boca del portal (no se ve el hueco antes de
   tiempo).
2. **Continuidad (B):** al scrollear desde "NOSOTROS RESOLVEMOS" no hay pantalla
   violeta vacía; la primera card entra encadenada apenas se va la frase.
3. **Multi-fila (C):** en desktop se ven **hasta 2 cards a la vez** en carriles
   distintos, cruzando 3D; nunca 3+, nunca se salen de cuadro ni se solapan feo.
4. **Salida (D):** al terminar las cards, la cápsula violeta se contrae a un
   portal chico y revela `#nosotros` (entrada al revés).
5. **Responsive (E):** en tablet/mobile hay galería vertical con scroll normal,
   2/1 columnas, botón "Ver más" que revela lotes y desaparece al final; click en
   card abre el modal.
6. **reduced-motion (F):** cae a la galería vertical (no a la lista de texto).
7. `node --check` OK en `mente.js` y `work-carousel.js`; sin refs muertas.

## Pendientes de afinar en vivo (no bloquean el plan)

- `--cerebro-grow` paso por beat (arranque ~0.08).
- Breakpoint coverflow↔galería (~1024px).
- `transitWindow` / offsets de carril / tamaño de card desktop.
- Umbrales de la salida espejo (D) y del empalme portal↔cards (B).
- Lote inicial y tamaño de lote del "Ver más" (arranque 6).
