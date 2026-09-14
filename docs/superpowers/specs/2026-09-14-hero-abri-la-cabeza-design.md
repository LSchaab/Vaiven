# Hero "Abrí la cabeza" — spec de diseño

Estado: 🟡 Validado en brainstorming con Luly (2026-09-14). Pendiente: revisión del spec + plan de implementación.
Rama: `storytelling-redesign`. No mergear a `main` hasta terminar (auto-deploya).
Contexto: primera sala reconstruida sobre el esqueleto scrolleable (ver `2026-09-14-desarme-esqueleto-design.md`). El hero actual es un stub: `<h1 class="hero-headline erratic">VAI VEN</h1>` sobre negro.

## 1. Concepto

Un hero de **"intriga / descubrir"**: la persona entra y siente que puede *entrar* a algo, no solo mirarlo. La metáfora es literal y de marca: **abrir la cabeza**. Dos puertas negras con trama de grilla cubren la pantalla; al scrollear se abren del centro hacia los costados y, con sensación de **profundidad (entrar, no bajar)**, revelan **el cerebro** como protagonista absoluto — el contenido de la mente de VAI VEN.

Frase única, sin wordmark (el wordmark ya vive en el logo del header):

> **Abrí la cabeza, empezá por la NUESTRA.**

Montserrat Alternates, **plana** (sin el efecto `erratic`), "NUESTRA" en peso 800. Español rioplatense, tono cómplice.

## 2. Estructura de capas (de atrás hacia adelante)

1. **Fondo profundo** — negro (`--negro`) + textura grunge sutil (`resources/textures/grunge_texture.webp`). Lo más lejano.
2. **Collage de portfolio** — grid irregular de recortes reales de proyectos, en **duotono/B&N vía CSS filter** (no hace falta editar los archivos). **Muy tenue** (opacidad baja): es textura de contexto, no protagonista. Se insinúa apenas cuando las puertas empiezan a abrir y **se aleja + desvanece** (escala hacia atrás + `opacity → 0`) a medida que se entra, cediendo todo el protagonismo al cerebro.
   - Imágenes reales disponibles (finales de cada proyecto):
     - `diseno_grafico/Poster_Inari/13_titulo.png`
     - `diseno_grafico/Poster_Lightyear/poster_completox2.png`
     - `diseno_grafico/Poster_Perfume/6_FINAL.png`
     - `diseno_grafico/Poster_infinityWar/poster_infinityWarx2.png`
     - `diseno_grafico/Poster_interstellar/FINAL TDI2 AFICHE JPG.jpg`
     - `3d/caja_fantasia/RENDER1.png`
     - `3d/maquinaexp_laserenisima/RenderConPost1-01.png`
   - Motion Graphics y Campañas **no tienen assets** → no entran en el teaser (coherente con gaps ya documentados).
3. **Cerebro** (`resources/cerebro.webp`) — **protagonista absoluto**. En la juntura central. Aparece al abrirse las puertas y **crece hacia la persona** hasta dominar el cuadro. Es el puente narrativo hacia la sección `#herramientas` (ver §7).
4. **Las dos puertas** — dos paneles negros con **trama de grilla** (`resources/textures/cuadricula_textura.svg`). Cerradas cubren todo el viewport. Se separan del centro hacia los costados con el scroll (`translateX: 0 → ±55%` aprox).
5. **Motivos collage** (capa media, sobre las puertas) — flotan con **parallax sutil** de mouse:
   - 2 **ojos** a los costados (`resources/ojo_1.webp`, `resources/ojo_2.webp`), recortes B&N tipo revista.
   - **Mano + lupa** (`lupa_BYN.png`) subiendo desde abajo-centro, la lente justo detrás de "nuestra".
6. **Frase** (capa más cercana en estado cerrado) — `<h1>` real, centrado, Montserrat Alternates plana. Se desvanece y sube levemente al scrollear (queda "afuera" mientras entrás).

## 3. Interacción

- **Hover sobre las puertas → grilla que se ilumina.** En estado cerrado la grilla es apenas visible; un halo radial que sigue al cursor (posición vía variables CSS `--mx`/`--my`) **recolorea el trazo de la grilla en naranja→azul** (`--naranja` / `--azul`) cerca del mouse. Barato, alto impacto, "prende la cabeza".
- **Parallax de mouse.** Ojos, mano/lupa, cerebro y collage se desplazan a distintas profundidades (los más "cercanos" se mueven más). Volumen sin parecer jueguito.
- **Scroll = entrar con profundidad.** El hero es un **escenario clavado** (`position: sticky`, ~250vh de alto). El scroll dentro de ese rango produce un progreso `0 → 1` (variable CSS `--hero-progress`) que mapea **en simultáneo**:
  - puertas: `translateX 0 → ±55%` (se abren del centro),
  - frase: `opacity 1 → 0` + `translateY` leve hacia arriba (se queda afuera),
  - collage: se insinúa tenue y luego `scale`↓ + `opacity → 0` (se aleja),
  - cerebro: `scale ~0.6 → ~1.3` + `opacity 0 → 1` (se acerca y domina),
  - al llegar a `1` se libera el sticky y el scroll continúa natural hacia `#herramientas`.
  - La sensación buscada es **atravesar la puerta hacia adentro** (eje Z), no bajar.

## 4. Fallbacks (no negociables — demo de jurado)

- **`prefers-reduced-motion: reduce`**: sin pinning ni scrub ni parallax. Se muestra una **composición estática ya "abierta"**: puertas a los costados, frase arriba, cerebro visible y centrado. Legible y digna sin movimiento.
- **Touch / mobile (sin hover)**: sin glow de grilla ni parallax de mouse. La apertura por scroll se conserva pero con escenario más corto (~150vh) y transforms más simples. Frase reescalada a mobile.
- **Sin JS**: se ve el estado cerrado con la **frase perfectamente legible** — es un `<h1>` semántico real. La grilla y los motivos son decorativos.
- **Accesibilidad**: la frase es el único texto real (los motivos son `aria-hidden` decorativos). Contraste blanco sobre negro. Foco de teclado no queda atrapado en el escenario sticky.

## 5. Arquitectura técnica (Opción A — vanilla, elegida)

Consistente con la regla del proyecto "default to vanilla". Cero dependencias, cero CDN (sin riesgo offline). Solo `transform`/`opacity` → performante. Si al verlo vivo le falta suavidad, se evalúa sumar **solo Lenis** para smoothing, sin reescribir la lógica.

- **`index.html`** — reestructurar `#hero`:
  ```
  #hero.hero
    .hero-stage            (sticky, contiene todo)
      .hero-fondo          (grunge)
      .hero-collage        (recortes duotono, tenue)
      .hero-cerebro        (protagonista)
      .puerta.puerta-izq   (grilla)
      .puerta.puerta-der   (grilla)
      .ojo.ojo-izq / .ojo.ojo-der
      .mano-lupa
      h1.hero-frase        ("Abrí la cabeza, empezá por la <strong>nuestra</strong>.")
  ```
- **`styles.css`** — capas, grilla, glow radial (máscara/gradiente recoloreado con `--mx/--my`), estados por `--hero-progress`, media queries de reduced-motion y mobile. Tratamiento duotono/B&N del collage por `filter`.
- **`hero.js` (nuevo módulo)** — un solo archivo:
  - `rAF`-throttled scroll → calcula y setea `--hero-progress` en el rango del escenario.
  - `mousemove` → setea `--mx`/`--my` (glow + parallax).
  - `matchMedia('(prefers-reduced-motion: reduce)')` y `(hover: none)` → desactiva pinning/parallax/glow según corresponda.
  - Se auto-inicializa con `defer`, igual que `erratic.js`.

## 6. Assets

Todos ya en el repo (algunos untracked, hay que commitearlos): `cerebro.webp`, `ojo_1.webp`, `ojo_2.webp`, `lupa_BYN.png`, `textures/cuadricula_textura.svg`, `textures/grunge_texture.webp`, y las 7 imágenes de collage listadas en §2. **No se requiere crear ni editar imágenes** — el look B&N/duotono se logra por CSS.

## 7. Gaps honestos / pendientes

- **Puente del cerebro**: hoy el cerebro solo vive en el hero. Cuando se construya `#herramientas` hay que hacer que esa sección **reciba/continúe** ese cerebro para que el puente narrativo cierre. Anotar como dependencia de la próxima sala.
- **Collage sin Motion/Campañas**: el teaser cubre gráfico + 3D; las 2 categorías de video no tienen assets (ya documentado). No bloquea.
- **`erratic.js`**: el hero deja de usar `erratic` (la frase va plana). El sistema `erratic` sigue disponible para otras salas; no se toca.
- **Suavidad del scroll**: si la nativa no convence, evaluar Lenis (decisión diferida a "verlo vivo", per acuerdo con Luly).

## 8. Decisiones tomadas en el brainstorming (2026-09-14)

| Decisión | Valor |
|---|---|
| Sensación del hero | Intriga / descubrir |
| Texto | Solo la frase "Abrí la cabeza, empezá por la nuestra" (sin wordmark, sin erratic) |
| Mecánica | Dos puertas con grilla que se abren del centro a los costados |
| Grilla | Blanca tenue; se ilumina naranja/azul con el hover |
| Detrás de las puertas | Collage de portfolio **tenue que se aleja** + cerebro protagonista |
| Scroll | Hero fijo (sticky); el scroll abre las puertas con sensación de profundidad (entrar, no bajar) |
| Motivos | Parallax sutil (ojos, mano/lupa); el cerebro puentea hacia `#herramientas` |
| Implementación | Opción A — vanilla JS + CSS. Lenis solo si hace falta suavidad. |
