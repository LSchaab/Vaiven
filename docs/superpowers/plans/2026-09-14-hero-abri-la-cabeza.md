# Hero "Abrí la cabeza" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruir el `#hero` como una experiencia sticky de "intriga/descubrir": dos puertas con grilla que se iluminan al hover y se abren con el scroll (sensación de entrar, con profundidad), revelando un collage tenue que se aleja y el cerebro como protagonista.

**Architecture:** Escenario `position: sticky` más alto que el viewport. Un módulo vanilla `hero.js` (rAF-throttled) traduce el scroll a una variable CSS `--hero-progress` (0→1) y el mouse a `--mx/--my` (glow) + `--mnx/--mny` (parallax). Todo el movimiento se resuelve en CSS con `transform`/`opacity` a partir de esas variables. Cero dependencias, cero CDN.

**Tech Stack:** HTML5, CSS3 (custom properties, `mask-composite`, `position: sticky`), vanilla JS (`requestAnimationFrame`, `matchMedia`). Sin build step.

## Global Constraints

- **Default to vanilla.** Sin librerías ni CDN. (Lenis queda diferido a "verlo vivo" — NO incluir en este plan.)
- **Colores solo por tokens CSS** ya definidos en `styles.css :root` (`--naranja #FF5B23`, `--azul #3A39FF`, `--negro`, `--blanco`, etc.). Nunca hardcodear un hex nuevo.
- **Tipografía**: Montserrat Alternates (`var(--font-alt)`) para la frase, **plana** (sin el efecto `erratic`). Jerarquía solo por peso/tamaño/mayúsculas.
- **Copy exacto de la frase** (español rioplatense): `Abrí la cabeza, empezá por la nuestra.` con "nuestra" en `<strong>` (peso 800).
- **Idioma**: comentarios de código en inglés; contenido en español.
- **Naming**: kebab-case en archivos y clases CSS.
- **Accesibilidad**: la frase es el único texto real (`<h1>`); todos los motivos son decorativos (`aria-hidden="true"`, `alt=""`). Contraste blanco sobre negro.
- **Fallbacks obligatorios**: `prefers-reduced-motion: reduce` (composición estática, sin pinning/parallax/glow), touch/`hover: none` (sin glow ni parallax), y sin-JS (frase legible en estado cerrado).
- **Rama**: `storytelling-redesign`. NO mergear a `main` (auto-deploya).

## Preview / verificación (setup común a todas las tareas)

Levantar el sitio y abrirlo **en Chrome** (regla del proyecto):

```bash
python -m http.server 8080
```
```bash
start chrome "http://localhost:8080"
```

Cada tarea define criterios de aceptación observables en `http://localhost:8080`. "Verificar" = abrir/recargar y confirmar esos criterios a ojo.

## Estructura de archivos

| Archivo | Responsabilidad | Acción |
|---|---|---|
| `index.html` | Markup del `#hero` en capas + montar `hero.js` | Modificar |
| `styles.css` | Estilos del hero: capas, grilla, glow, estados por `--hero-progress`, fallbacks | Modificar (append sección hero) |
| `hero.js` | Único módulo JS: scroll→`--hero-progress`, mouse→`--mx/--my/--mnx/--mny`, guards de `matchMedia` | Crear |
| `resources/lupa_BYN.png`, `resources/lupa_colores.png` | Assets mano+lupa (hoy untracked en la raíz) | Mover a `resources/` + commitear |
| `CLAUDE.md` | Documentar hero reconstruido + dependencia del "puente del cerebro" | Modificar (Task 6) |

Referencia de diseño: `docs/superpowers/specs/2026-09-14-hero-abri-la-cabeza-design.md`.

---

### Task 1: Assets + estructura HTML + estado cerrado estático

Deja el hero mostrando la **composición cerrada** (equivalente a la imagen de referencia 2): dos puertas negras con grilla tenue cubriendo la pantalla, la frase centrada, ojos a los costados y mano+lupa desde abajo. El cerebro y el collage existen en el DOM pero quedan ocultos detrás de las puertas. Sin JS todavía (todo estático).

**Files:**
- Move: `lupa_BYN.png` → `resources/lupa_BYN.png`; `lupa_colores.png` → `resources/lupa_colores.png`
- Modify: `index.html` (reemplazar el contenido de `<section id="hero">`)
- Modify: `styles.css` (append sección "HERO" con capas y estado cerrado)

**Interfaces:**
- Produces (clases/estructura que consumen las tareas siguientes):
  - `#hero.hero` (sección), `.hero-stage`, `.hero-scene`
  - `.hero-fondo`, `.hero-collage` (+ `img`), `.hero-cerebro`
  - `.puerta.puerta-izq`, `.puerta.puerta-der`
  - `.ojo.ojo-izq`, `.ojo.ojo-der`, `.mano-lupa`
  - `h1.hero-frase` (con `<strong>` en "nuestra")

- [ ] **Step 1: Mover los assets de la lupa a `resources/`**

```bash
git mv lupa_BYN.png resources/lupa_BYN.png
git mv lupa_colores.png resources/lupa_colores.png
```

- [ ] **Step 2: Reemplazar el markup del `#hero` en `index.html`**

Reemplazar el bloque actual `<section id="hero" class="zona-bn"> ... </section>` por:

```html
<section id="hero" class="hero zona-bn">
    <!-- Escenario sticky: en Task 4 la sección se vuelve más alta que el
         viewport y este stage se "clava". Por ahora ocupa una pantalla. -->
    <div class="hero-stage">
        <div class="hero-scene">
            <!-- capa 1: fondo grunge profundo -->
            <div class="hero-fondo" aria-hidden="true"></div>

            <!-- capa 2: collage de portfolio (tenue; se revela y se aleja
                 con el scroll en Task 4). Duotono por CSS filter. -->
            <div class="hero-collage" aria-hidden="true">
                <img src="diseno_grafico/Poster_Inari/13_titulo.png" alt="" decoding="async">
                <img src="diseno_grafico/Poster_Lightyear/poster_completox2.png" alt="" decoding="async">
                <img src="diseno_grafico/Poster_Perfume/6_FINAL.png" alt="" decoding="async">
                <img src="diseno_grafico/Poster_infinityWar/poster_infinityWarx2.png" alt="" decoding="async">
                <img src="diseno_grafico/Poster_interstellar/FINAL TDI2 AFICHE JPG.jpg" alt="" decoding="async">
                <img src="3d/caja_fantasia/RENDER1.png" alt="" decoding="async">
                <img src="3d/maquinaexp_laserenisima/RenderConPost1-01.png" alt="" decoding="async">
            </div>

            <!-- capa 3: cerebro protagonista (crece con el scroll en Task 4) -->
            <img class="hero-cerebro" src="resources/cerebro.webp" alt="" aria-hidden="true" decoding="async">

            <!-- capa 4: las dos puertas con grilla (se abren en Task 4) -->
            <div class="puerta puerta-izq" aria-hidden="true"></div>
            <div class="puerta puerta-der" aria-hidden="true"></div>

            <!-- capa 5: motivos collage (parallax en Task 3) -->
            <img class="ojo ojo-izq" src="resources/ojo_1.webp" alt="" aria-hidden="true" decoding="async">
            <img class="ojo ojo-der" src="resources/ojo_2.webp" alt="" aria-hidden="true" decoding="async">
            <img class="mano-lupa" src="resources/lupa_BYN.png" alt="" aria-hidden="true" decoding="async">

            <!-- capa 6: frase (único texto real) -->
            <h1 class="hero-frase">Abrí la cabeza, empezá por la <strong>nuestra</strong>.</h1>
        </div>
    </div>
</section>
```

- [ ] **Step 3: Agregar los estilos base del hero en `styles.css`**

Append al final de `styles.css`:

```css
/* ==========================================================================
   HERO "Abrí la cabeza" — dos puertas + cerebro
   Variables que setea hero.js:
     --hero-progress (0..1)  scroll dentro del escenario  (Task 4)
     --mx / --my             posición del cursor en px     (Task 2)
     --mnx / --mny           cursor normalizado -1..1       (Task 3)
   ========================================================================== */
.hero {
    position: relative;
    padding: 0;               /* override del section base */
    background: var(--negro);
    --hero-progress: 0;       /* fallback si aún no hay JS */
}

.hero-stage {
    position: relative;       /* Task 4 lo cambia a sticky */
    height: 100vh;
    overflow: hidden;
    display: grid;
    place-items: center;
}

.hero-scene { position: absolute; inset: 0; }

/* capa 1 — fondo grunge */
.hero-fondo {
    position: absolute; inset: 0;
    background: var(--negro) url("resources/textures/grunge_texture.webp") center / cover;
    opacity: 0.25;
    z-index: 0;
}

/* capa 2 — collage tenue (oculto en cerrado; Task 4 lo anima) */
.hero-collage {
    position: absolute; inset: 0;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 1fr;
    gap: 8px;
    padding: 10vh 8vw;
    filter: grayscale(1) contrast(1.4) brightness(0.7);
    opacity: 0;               /* Task 4: se revela tenue y se desvanece */
    transform: scale(0.6);
}
.hero-collage img { width: 100%; height: 100%; object-fit: cover; }

/* capa 3 — cerebro (oculto en cerrado; Task 4 lo hace crecer) */
.hero-cerebro {
    position: absolute; left: 50%; top: 50%;
    width: min(42vw, 460px);
    translate: -50% -50%;
    transform: scale(0.6);
    opacity: 0;
    filter: grayscale(1) contrast(1.25);
    z-index: 2;
}

/* capa 4 — puertas con grilla, cerradas cubren todo */
.puerta {
    position: absolute; top: 0;
    height: 100%; width: 50vw;
    background: var(--negro);
    z-index: 3;
}
.puerta-izq { left: 0; }
.puerta-der { right: 0; }

/* grilla base tenue sobre cada puerta */
.puerta::before {
    content: "";
    position: absolute; inset: 0;
    background: url("resources/textures/cuadricula_textura.svg");
    opacity: 0.10;
}

/* capa 5 — motivos */
.ojo {
    position: absolute;
    width: min(13vw, 140px);
    z-index: 4;
    filter: grayscale(1) contrast(1.2);
}
.ojo-izq { left: 5vw;  top: 20vh; }
.ojo-der { right: 5vw; top: 34vh; }

.mano-lupa {
    position: absolute;
    left: 50%; bottom: -2vh;
    width: min(34vw, 360px);
    translate: -50% 0;
    z-index: 4;
    filter: grayscale(1) contrast(1.2);
}

/* capa 6 — frase */
.hero-frase {
    position: relative;
    z-index: 5;
    margin: 0;
    max-width: 14ch;
    text-align: center;
    color: var(--blanco);
    font-family: var(--font-alt);
    font-weight: 400;
    font-size: clamp(2rem, 6vw, 4.5rem);
    line-height: 1.05;
    letter-spacing: 0.01em;
    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.6);
}
.hero-frase strong { font-weight: 800; }
```

- [ ] **Step 4: Verificar el estado cerrado en el navegador**

Levantar el server y abrir Chrome (comandos del setup). Recargar y confirmar:
- La pantalla está cubierta por dos puertas negras; se distingue una **grilla tenue** encima.
- La **frase** se lee centrada, en Montserrat Alternates, con "nuestra" más pesada. Sin jitter/erratic.
- Se ven **dos ojos** (arriba-izq y medio-der) y la **mano con lupa** subiendo desde abajo-centro, la lente detrás de "nuestra".
- El cerebro y el collage NO se ven (están detrás de las puertas). Esto es correcto.
- No hay errores en la consola (F12).

- [ ] **Step 5: Commit**

```bash
git add resources/lupa_BYN.png resources/lupa_colores.png index.html styles.css
git commit -m "feat(hero): estructura en capas + estado cerrado (puertas/frase/motivos)"
```

---

### Task 2: `hero.js` + glow de la grilla al hover

Crea el módulo JS y hace que, al mover el mouse sobre las puertas, la **grilla se ilumine en naranja→azul** cerca del cursor. Desactivado en touch.

**Files:**
- Create: `hero.js`
- Modify: `index.html` (montar `<script src="hero.js" defer>`)
- Modify: `styles.css` (`.puerta::after` con doble máscara grilla × cursor)

**Interfaces:**
- Consumes: estructura `.puerta` de Task 1.
- Produces: variables CSS `--mx`, `--my` (px, viewport) en `#hero`; patrón IIFE auto-inicializado en `hero.js` que las tareas 3 y 4 extienden.

- [ ] **Step 1: Crear `hero.js` con el tracking de mouse**

```js
// Hero "Abrí la cabeza" — interacción del hero.
// Setea variables CSS a partir del mouse (glow de grilla) — el movimiento
// se resuelve en CSS. Guards: sin efecto en touch / reduced-motion.
(() => {
    "use strict";
    const hero = document.querySelector("#hero");
    if (!hero) return;

    const reduce  = matchMedia("(prefers-reduced-motion: reduce)");
    const noHover = matchMedia("(hover: none)");

    // ----- glow de grilla: posición del cursor en px (viewport) -----
    if (!noHover.matches && !reduce.matches) {
        window.addEventListener("mousemove", (e) => {
            hero.style.setProperty("--mx", e.clientX + "px");
            hero.style.setProperty("--my", e.clientY + "px");
        }, { passive: true });
    }
})();
```

- [ ] **Step 2: Montar el script en `index.html`**

Después de la línea `<script src="erratic.js" defer></script>` en `<head>`, agregar:

```html
    <!-- Interacción del hero: glow de grilla, parallax y apertura por scroll.
         Vanilla, auto-inicializado sobre #hero. -->
    <script src="hero.js" defer></script>
```

- [ ] **Step 3: Agregar el glow de grilla en `styles.css`**

Append (después de `.puerta::before`):

```css
/* grilla iluminada cerca del cursor: gradiente naranja→azul enmascarado por
   la grilla Y por un halo radial que sigue al mouse (intersección de máscaras).
   Sólo aparecen las líneas de la grilla que caen bajo el halo del cursor. */
.puerta::after {
    content: "";
    position: absolute; inset: 0;
    background: linear-gradient(120deg, var(--naranja), var(--azul));
    -webkit-mask:
        url("resources/textures/cuadricula_textura.svg"),
        radial-gradient(circle 220px at var(--mx, -999px) var(--my, -999px),
                        #000 0%, transparent 70%);
    mask:
        url("resources/textures/cuadricula_textura.svg"),
        radial-gradient(circle 220px at var(--mx, -999px) var(--my, -999px),
                        #000 0%, transparent 70%);
    -webkit-mask-composite: source-in;   /* Chrome/Safari: intersección */
    mask-composite: intersect;           /* estándar */
    -webkit-mask-repeat: repeat, no-repeat;
    mask-repeat: repeat, no-repeat;
    pointer-events: none;
}
/* la puerta derecha empieza en la mitad del viewport: correr el centro del
   halo para que coincida con la posición real del cursor. */
.puerta-der::after {
    -webkit-mask:
        url("resources/textures/cuadricula_textura.svg"),
        radial-gradient(circle 220px at calc(var(--mx, -999px) - 50vw) var(--my, -999px),
                        #000 0%, transparent 70%);
    mask:
        url("resources/textures/cuadricula_textura.svg"),
        radial-gradient(circle 220px at calc(var(--mx, -999px) - 50vw) var(--my, -999px),
                        #000 0%, transparent 70%);
    -webkit-mask-composite: source-in;
    mask-composite: intersect;
    -webkit-mask-repeat: repeat, no-repeat;
    mask-repeat: repeat, no-repeat;
}
```

> **Nota de polaridad del SVG:** si al probar la grilla iluminada aparece como un bloque de color macizo (en vez de sólo las líneas), la SVG tiene las líneas transparentes y el fondo opaco. Solución: agregar `-webkit-mask-mode: luminance` no alcanza — en ese caso invertí usando la grilla como capa de color directa: cambiá el `background` por `url(cuadricula) ...` y el gradiente naranja→azul aplicado por `background-blend`. Verificar primero; ajustar sólo si hace falta.

- [ ] **Step 4: Verificar el glow en el navegador**

Recargar y mover el mouse sobre las puertas. Confirmar:
- Cerca del cursor, las **líneas de la grilla se tiñen** en un degradé naranja→azul; lejos del cursor la grilla vuelve a ser tenue/blanca.
- El efecto sigue al mouse suavemente y funciona en **ambas** puertas (izquierda y derecha), alineado con la posición real del cursor.
- Sin errores en consola.

- [ ] **Step 5: Commit**

```bash
git add hero.js index.html styles.css
git commit -m "feat(hero): grilla que se ilumina en naranja/azul al hover"
```

---

### Task 3: Parallax sutil de los motivos

El cursor desplaza ojos, mano/lupa, cerebro y collage a distintas profundidades. Desactivado en touch y reduced-motion.

**Files:**
- Modify: `hero.js` (agregar `--mnx/--mny` normalizados en el mismo `mousemove`)
- Modify: `styles.css` (translate por profundidad en cada motivo)

**Interfaces:**
- Consumes: `#hero`, motivos de Task 1, listener de Task 2.
- Produces: variables CSS `--mnx`, `--mny` (rango -1..1) en `#hero`.

- [ ] **Step 1: Extender el `mousemove` en `hero.js`**

Dentro del `if (!noHover.matches && !reduce.matches) { ... }`, agregar al final del handler `mousemove` (después de setear `--mx/--my`):

```js
            // parallax: cursor normalizado a -1..1 respecto del centro
            const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
            const ny = (e.clientY / window.innerHeight - 0.5) * 2;
            hero.style.setProperty("--mnx", nx.toFixed(3));
            hero.style.setProperty("--mny", ny.toFixed(3));
```

- [ ] **Step 2: Aplicar el parallax por profundidad en `styles.css`**

Agregar reglas de translate (los factores en px definen la "cercanía": más grande = más cerca). Reemplazar las reglas de posición de motivos por versiones con `translate`:

```css
/* parallax: cada motivo se mueve un poco con el cursor (--mnx/--mny).
   Distintos factores = distinta profundidad. Fallback 0 sin JS. */
.ojo-izq  { translate: calc(var(--mnx, 0) * -10px) calc(var(--mny, 0) * -10px); }
.ojo-der  { translate: calc(var(--mnx, 0) *  14px) calc(var(--mny, 0) *  10px); }
.mano-lupa{ translate: calc(-50% + var(--mnx, 0) * 18px) calc(var(--mny, 0) * 8px); }
.hero-cerebro { /* se combina con el centrado -50% -50% ya existente */
    translate: calc(-50% + var(--mnx, 0) * 6px) calc(-50% + var(--mny, 0) * 6px);
}
.hero-collage { will-change: transform; }
```

> **Nota:** `.mano-lupa` y `.hero-cerebro` ya usaban `translate` para centrarse; estas reglas lo reemplazan sumando el offset de parallax. No dupliques la propiedad `translate` (la última gana).

- [ ] **Step 3: Verificar el parallax en el navegador**

Recargar y mover el mouse por el hero (sin scrollear). Confirmar:
- Ojos, mano/lupa y el borde del cerebro (asomando en los bordes de las puertas si se ve) se **desplazan sutilmente** con el mouse, a distintas velocidades → sensación de profundidad.
- El movimiento es leve, no exagerado (no parece un jueguito).
- Sin errores en consola.

- [ ] **Step 4: Verificar que se apaga en reduced-motion**

En Chrome DevTools: `Cmd/Ctrl+Shift+P` → "Emulate CSS prefers-reduced-motion: reduce". Recargar. Confirmar que **no hay parallax** al mover el mouse. Volver a desactivar la emulación.

- [ ] **Step 5: Commit**

```bash
git add hero.js styles.css
git commit -m "feat(hero): parallax sutil de motivos con el cursor"
```

---

### Task 4: Escenario sticky + apertura por scroll con profundidad

El hero se clava y el scroll abre las puertas del centro hacia los costados; la frase se desvanece, el collage se insinúa tenue y se aleja, y el cerebro crece hasta dominar → sensación de **entrar**. Al completarse, libera hacia `#herramientas`.

**Files:**
- Modify: `styles.css` (`.hero` alto, `.hero-stage` sticky, transforms por `--hero-progress`)
- Modify: `hero.js` (rAF scroll → `--hero-progress`)

**Interfaces:**
- Consumes: `#hero`, todas las capas, `--hero-progress` (fallback 0 ya en CSS).
- Produces: `#hero` setea `--hero-progress` (0..1) durante el scroll del escenario.

- [ ] **Step 1: Convertir el hero en escenario alto + sticky (`styles.css`)**

Modificar las reglas existentes `.hero` y `.hero-stage`:

```css
.hero {
    position: relative;
    padding: 0;
    background: var(--negro);
    height: 250vh;            /* escenario: más alto que el viewport */
    --hero-progress: 0;
}

.hero-stage {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    display: grid;
    place-items: center;
}
```

- [ ] **Step 2: Atar las capas a `--hero-progress` (`styles.css`)**

Agregar (o ajustar) las reglas que dependen del progreso. Los valores son afinables:

```css
/* puertas: se abren del centro hacia afuera */
.puerta-izq { transform: translateX(calc(var(--hero-progress) * -100%)); }
.puerta-der { transform: translateX(calc(var(--hero-progress) *  100%)); }

/* frase: se desvanece y sube en el primer tercio (queda "afuera") */
.hero-frase {
    opacity: clamp(0, calc(1 - var(--hero-progress) * 3), 1);
    transform: translateY(calc(var(--hero-progress) * -6vh));
}

/* collage: se insinúa tenue y se aleja + desvanece (protagonismo al cerebro) */
.hero-collage {
    opacity: max(0, calc(0.18 - var(--hero-progress) * 0.3));
    transform: scale(calc(0.6 - var(--hero-progress) * 0.12));
}

/* cerebro: crece y aparece hasta dominar el cuadro */
.hero-cerebro {
    opacity: clamp(0, calc((var(--hero-progress) - 0.1) * 2.2), 1);
    /* nota: el centrado -50% -50% + parallax de Task 3 va en `translate`;
       el scale va acá en `transform` (propiedades separadas, no chocan). */
    transform: scale(calc(0.6 + var(--hero-progress) * 0.75));
}
```

> **Nota:** `translate` (centrado + parallax, Task 3) y `transform` (scale por scroll, acá) son **propiedades CSS distintas** y se aplican ambas — por eso el cerebro puede parallaxear y crecer a la vez sin pisarse.

- [ ] **Step 3: Calcular `--hero-progress` en `hero.js`**

Agregar dentro del IIFE (después del bloque de mouse), el tracking de scroll:

```js
    // ----- apertura por scroll: progreso 0..1 dentro del escenario -----
    if (!reduce.matches) {
        let ticking = false;
        const update = () => {
            const total = hero.offsetHeight - window.innerHeight;
            const scrolled = Math.min(Math.max(-hero.getBoundingClientRect().top, 0), total);
            const p = total > 0 ? scrolled / total : 0;
            hero.style.setProperty("--hero-progress", p.toFixed(4));
            ticking = false;
        };
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
    }
```

- [ ] **Step 4: Verificar la apertura por scroll en el navegador**

Recargar y scrollear lentamente desde arriba. Confirmar:
- El hero se **queda fijo** mientras scrolleás y las **puertas se separan** del centro hacia los costados.
- La **frase se desvanece** y sube apenas en el primer tramo.
- El **collage** se ve muy tenue al principio y **se aleja/desvanece**.
- El **cerebro crece** desde el centro hasta **dominar el cuadro** — sensación de entrar, no de bajar.
- Al terminar de abrirse, el hero **se libera** y el scroll continúa hacia `#herramientas`.
- Scrolleando hacia arriba, todo se **revierte** suavemente. Sin saltos ni errores en consola.

- [ ] **Step 5: Commit**

```bash
git add styles.css hero.js
git commit -m "feat(hero): escenario sticky + apertura por scroll con profundidad"
```

---

### Task 5: Fallbacks (reduced-motion, mobile, sin-JS) + pulido

Garantiza que el hero se vea digno y legible sin movimiento, en mobile y sin JS.

**Files:**
- Modify: `styles.css` (media query `prefers-reduced-motion`, media query mobile, `hover: none`)

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: composición estática accesible; no expone nada nuevo.

- [ ] **Step 1: Composición estática para reduced-motion (`styles.css`)**

```css
/* Sin movimiento: hero de una pantalla, ya "abierto", legible y compuesto.
   Anula el escenario alto, el sticky y todos los transforms por progreso. */
@media (prefers-reduced-motion: reduce) {
    .hero { height: 100vh; }
    .hero-stage { position: relative; }
    .puerta-izq { transform: translateX(-70%); }
    .puerta-der { transform: translateX(70%); }
    .hero-frase { opacity: 1; transform: none; }
    .hero-collage { opacity: 0.12; transform: scale(0.7); }
    .hero-cerebro { opacity: 1; transform: scale(1); }
}
```

- [ ] **Step 2: Ajustes de mobile / touch (`styles.css`)**

```css
/* Touch: sin glow de grilla (no hay hover real). */
@media (hover: none) {
    .puerta::after { display: none; }
}

/* Mobile: escenario más corto y frase reescalada. */
@media (max-width: 640px) {
    .hero { height: 150vh; }
    .hero-frase { font-size: clamp(1.75rem, 9vw, 3rem); max-width: 12ch; }
    .ojo { width: 22vw; }
    .mano-lupa { width: 60vw; }
    .hero-cerebro { width: 70vw; }
}
```

- [ ] **Step 3: Verificar los tres fallbacks**

- **Reduced-motion**: emular en DevTools (`prefers-reduced-motion: reduce`) → el hero se ve **ya abierto** (puertas a los costados, cerebro y frase visibles), sin pinning ni parallax al scrollear/mover el mouse.
- **Mobile**: DevTools device toolbar (ej. iPhone) → la frase entra bien, no hay glow, la apertura por scroll funciona en un tramo más corto.
- **Sin-JS**: DevTools → Command Menu → "Disable JavaScript", recargar → se ve el **estado cerrado con la frase perfectamente legible** (sin glow ni apertura, pero digno). Reactivar JS.

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "feat(hero): fallbacks de reduced-motion, mobile y sin-JS"
```

---

### Task 6: Documentar el hero reconstruido

Actualiza `CLAUDE.md` para reflejar que el hero ya no es un stub y anota la dependencia del "puente del cerebro" hacia `#herramientas`.

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Actualizar la tabla de secciones y los gaps en `CLAUDE.md`**

En la fila "Home / Hero" de la tabla de secciones, reemplazar la descripción por:

```
| Home / Hero | Hero "Abrí la cabeza": dos puertas con grilla (se iluminan al hover) que se abren con el scroll (sticky, sensación de profundidad) revelando un collage tenue que se aleja y el **cerebro** como protagonista. Vanilla (`hero.js`). Frase única, sin wordmark ni erratic. Emotion: TBD. |
```

Y agregar un bullet a la sección "Known gaps":

```
- **Puente del cerebro pendiente.** El hero termina con el cerebro dominando
  el cuadro como transición hacia `#herramientas`. Cuando se construya esa
  sección, tiene que **recibir/continuar** ese cerebro para cerrar el puente
  narrativo (ver `docs/superpowers/specs/2026-09-14-hero-abri-la-cabeza-design.md`).
```

- [ ] **Step 2: Agregar entrada al log de decisiones en `CLAUDE.md`**

En la tabla "Notas & Decisiones Log", agregar la fila:

```
| 2026-09-14 | Hero reconstruido como experiencia "Abrí la cabeza" (dos puertas + cerebro, sticky scrollytelling, vanilla). Frase única sin wordmark ni erratic. | Primera sala del esqueleto scrolleable; ver spec 2026-09-14-hero-abri-la-cabeza. |
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: registrar hero 'Abrí la cabeza' reconstruido + puente del cerebro"
```

---

## Self-Review (hecho al escribir el plan)

**Spec coverage** (cada sección del spec → tarea):
- §2 capas (fondo/collage/cerebro/puertas/motivos/frase) → Task 1 ✅
- §3 hover glow grilla → Task 2 ✅; parallax → Task 3 ✅; scroll con profundidad → Task 4 ✅
- §4 fallbacks (reduced-motion/touch/sin-JS/a11y) → Task 5 (+ `aria-hidden`/`<h1>` en Task 1) ✅
- §5 arquitectura (index.html/styles.css/hero.js, rAF, matchMedia) → Tasks 1-4 ✅
- §6 assets (mover lupa, usar existentes) → Task 1 ✅
- §7 gaps (puente del cerebro, docs) → Task 6 ✅

**Placeholder scan:** sin TBD/TODO en pasos de código; cada paso trae el código real. (El único "TBD" es el *contenido* "Emotion: TBD" del hero en la doc — es un dato real pendiente de diseño, no un placeholder del plan.) ✅

**Type/nombres consistency:** clases (`.hero-stage`, `.puerta-izq/-der`, `.hero-collage`, `.hero-cerebro`, `.ojo`, `.mano-lupa`, `.hero-frase`) y variables (`--hero-progress`, `--mx/--my`, `--mnx/--mny`) se usan idénticas entre tareas. `translate` (centrado+parallax) vs `transform` (open/scale) separados a propósito y documentado en Tasks 3 y 4. ✅
