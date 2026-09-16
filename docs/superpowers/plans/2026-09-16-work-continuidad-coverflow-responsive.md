# Portfolio `#work` — continuidad, coverflow multi-fila y modo responsive · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Coser el continuo cerebro→portal→cards→Nosotros del portfolio: cerebro que crece al absorber, entrada sin pantalla violeta muerta, coverflow de 2 carriles (máx. 2 cards) en desktop, galería vertical con "Ver más" en tablet/mobile/reduced-motion, y salida espejo hacia Nosotros.

**Architecture:** Sitio estático (HTML/CSS/JS vanilla, sin build). El recorrido del cerebro lo maneja `mente.js` sobre `.mente-journey`; el portfolio `#work` lo maneja `work-carousel.js` con GSAP ScrollTrigger sobre scroll nativo. El movimiento se resuelve en CSS a partir de custom properties que el JS escribe. La galería responsive es DOM estático sin ScrollTrigger.

**Tech Stack:** HTML5, CSS3 (custom properties, `@property`, `clip-path`/mask), JavaScript vanilla, GSAP + ScrollTrigger 3.12.5 (CDN, ya incluidos).

## Global Constraints

- **Sin test runner.** Verificación de cada tarea = `node --check <archivo.js>` (sintaxis) + **chequeo visual en Chrome** contra los criterios de la tarea. No inventar un runner.
- **pnpm** si hiciera falta instalar algo (no debería). Nunca `npm`/`yarn` sin permiso.
- **Colores sólo por token** (`var(--violeta-claro)`, `var(--blanco)`, etc.). Nunca hex hardcodeado. Ver `Mode 1.tokens.json`/CLAUDE.md.
- **Comentarios en inglés, copy en español (rioplatense).** Clases y archivos en kebab-case.
- **No inventar** títulos, autores ni assets. Usar `window.WORKS` tal cual está en `portfolio-data.js`.
- **Respetar `prefers-reduced-motion`**: sin animación scroll-linked; cae a la galería estática.
- Abrir el sitio en **Chrome** para QA: `& "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:8080"` tras `python -m http.server 8080` (o `npx serve .`).
- Cada tarea termina en **un commit** con el prefijo `fix(work):` / `feat(work):` y el `Co-Authored-By` del repo.

---

## File Structure

| Archivo | Responsabilidad tras el plan |
|---|---|
| `mente.js` | Escribe `--cerebro-grow` por beat absorbido (Task 1). Sin cambios en la salida (la continuidad se cose en CSS del lado de `#work`). |
| `styles.css` | `@property --cerebro-grow` + scale del cerebro (T1). 2 carriles + tamaño desktop del coverflow (T2). Galería vertical + grilla responsive + botón "Ver más" (T3). Empalme (overlap) portal↔`#work` (T4). Overlay de salida espejo (T5). |
| `work-carousel.js` | Detección de modo (breakpoint + reduced-motion) → monta coverflow **o** galería (T3). Carriles en el coverflow (T2). Fase de salida (T5). |
| `index.html` (`#work`) | Markup de la galería vertical + botón "Ver más"; se retira `.pf-fallback` (T3). Overlay de salida (T5). |
| `portfolio-data.js`, `portfolio-modal.js` | Sin cambios. |

---

### Task 1: Cerebro escalonado que crece al absorber (punto A)

Cada disciplina absorbida agranda el cerebro un paso, sincronizado con el pulso `is-absorbing` que ya dispara `setBrainColor`. Interpolación suave vía `@property`.

**Files:**
- Modify: `mente.js` (constante nueva + `setBrainColor` + reset en `renderPhase2`)
- Modify: `styles.css` (`@property` nuevo; `.cerebro` transición y scale)

**Interfaces:**
- Produces: custom property CSS `--cerebro-grow` (número, 0 → 0.4 aprox.) escrita sobre `.cerebro` por `mente.js`; consumida por el `transform: scale(...)` de `.cerebro` en `styles.css`.

- [ ] **Step 1: Agregar la constante del paso en `mente.js`**

En `mente.js`, justo después de la línea `const BEAT_HUE = [340, 200, 10, 140, 210];` (≈ línea 59), agregar:

```javascript
    // Paso de escala que suma el cerebro por cada disciplina absorbida (5 pasos).
    // Afinable en vivo; ~0.08 por beat ≈ +0.4 de scale al terminar la absorción,
    // lo suficiente para que el cerebro tape la boca del portal de salida.
    const GROW_PER_BEAT = 0.08;
```

- [ ] **Step 2: Escribir `--cerebro-grow` al absorber, en `setBrainColor`**

En `mente.js`, reemplazar el cuerpo de `setBrainColor` (≈ líneas 116-126) por:

```javascript
    const setBrainColor = (idx) => {
        if (idx === currentColor) return;
        currentColor = idx;
        // El color va por variable (--cerebro-tint) para que el pulso lo conserve
        // y no parpadee a B&N. Sin variable = B&N (fallback en CSS).
        if (idx < 0) {
            brain.style.removeProperty("--cerebro-tint");
            brain.style.setProperty("--cerebro-grow", "0");   // B&N: sin crecer
            return;
        }
        brain.style.setProperty("--cerebro-tint", `sepia(1) saturate(4) hue-rotate(${BEAT_HUE[idx]}deg)`);
        brain.style.setProperty("--cerebro-grow", (GROW_PER_BEAT * (idx + 1)).toFixed(3));
        brain.classList.remove("is-absorbing");
        void brain.offsetWidth;              // reinicia el pulso
        brain.classList.add("is-absorbing"); // pulso al absorber
    };
```

- [ ] **Step 3: Resetear el crecimiento en el umbral (fase 1)**

En `mente.js`, dentro de `renderPhase2`, en la rama `if (herrP <= 0)` (≈ línea 167), reemplazar:

```javascript
            if (currentColor !== -2) { currentColor = -2; brain.style.removeProperty("--cerebro-tint"); }
```

por:

```javascript
            if (currentColor !== -2) {
                currentColor = -2;
                brain.style.removeProperty("--cerebro-tint");
                brain.style.setProperty("--cerebro-grow", "0");   // sin absorción → sin crecer
            }
```

- [ ] **Step 4: Registrar `@property --cerebro-grow` en `styles.css`**

En `styles.css`, justo antes de la regla `.cerebro {` de la capa 3 (≈ línea 245, el bloque `/* capa 3 — cerebro ... */`), agregar:

```css
/* Registrada para poder INTERPOLAR el crecimiento del cerebro (var en calc()):
   sin @property un custom prop no transiciona. Chrome la soporta. */
@property --cerebro-grow {
    syntax: "<number>";
    inherits: false;
    initial-value: 0;
}
```

- [ ] **Step 5: Sumar `--cerebro-grow` al scale del cerebro**

En `styles.css`, en la regla de apertura del cerebro (≈ línea 381), reemplazar:

```css
    transform: scale(calc(0.6 + var(--hero-progress) * 0.75));
```

por:

```css
    transform: scale(calc(0.6 + var(--hero-progress) * 0.75 + var(--cerebro-grow, 0)));
```

- [ ] **Step 6: Transicionar sólo `--cerebro-grow` (no el transform entero)**

En `styles.css` (≈ línea 332), reemplazar:

```css
.cerebro { transition: translate 0.18s ease-out, filter 0.5s ease; }
```

por:

```css
/* Se transiciona --cerebro-grow (no `transform`: eso lagearía el scale por scroll
   de fase 1). Cada absorción interpola el paso de tamaño en ~0.4s. */
.cerebro { transition: translate 0.18s ease-out, filter 0.5s ease, --cerebro-grow 0.4s ease-out; }
```

- [ ] **Step 7: Verificar sintaxis**

Run: `node --check mente.js`
Expected: sin salida (OK).

- [ ] **Step 8: Verificar en Chrome**

Servir el sitio y abrir en Chrome. Scrollear la fase de absorción (después de que abren las puertas).
Expected: el cerebro da un "saltito" de tamaño suave con cada una de las 5 disciplinas; al terminar la absorción está claramente más grande que antes y tapa la boca del portal (no se ve el hueco violeta antes de tiempo). En fase 1 (puertas) el scale sigue el scroll sin lag.

- [ ] **Step 9: Commit**

```bash
git add mente.js styles.css
git commit -m "feat(work): cerebro crece un paso por disciplina absorbida (--cerebro-grow)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Coverflow de 2 carriles, máximo 2 cards (punto C)

El coverflow deja de mostrar una card centrada: cada card se asigna a un carril (arriba/abajo) rotando, y se ven hasta 2 a la vez cruzando en 3D. Sólo aplica en desktop (el gate de modo llega en Task 3; hasta entonces el coverflow se monta siempre).

**Files:**
- Modify: `work-carousel.js` (asignación de carril en `cardData`)
- Modify: `styles.css` (`.card` ancho, offset Y por carril, `--lane-gap`)

**Interfaces:**
- Consumes: `--progress` por card (ya existente).
- Produces: custom property `--lane` por card (−1 = arriba, +1 = abajo) escrita por `work-carousel.js`; consumida por el `translate3d` de `.card`.

- [ ] **Step 1: Asignar carril en vez de `--y` random**

En `work-carousel.js`, dentro de `WORKS.map(...)` (≈ líneas 47-48), reemplazar:

```javascript
        el.style.setProperty("--y", fromRange(CONFIG.yRange, seeded(i * 2)).toFixed(3));
        el.style.setProperty("--size", fromRange(CONFIG.sizeRange, seeded(i * 2 + 1)).toFixed(3));
```

por:

```javascript
        // Carril: pares arriba (−1), impares abajo (+1). Al alternar, las ~2 cards
        // que se solapan en el tránsito caen SIEMPRE en carriles distintos → no se
        // pisan verticalmente. El offset real (vmin) lo pone el CSS con --lane-gap.
        el.style.setProperty("--lane", i % 2 === 0 ? "-1" : "1");
        el.style.setProperty("--size", fromRange(CONFIG.sizeRange, seeded(i * 2 + 1)).toFixed(3));
```

- [ ] **Step 2: Agregar `--lane-gap` y achicar la card en `styles.css`**

En `styles.css`, en la regla `.card {` (≈ línea 597), reemplazar la línea:

```css
    width: min(50vw, 640px);
```

por:

```css
    width: min(46vw, 560px);
    --lane-gap: clamp(14vmin, 20vmin, 24vmin);   /* separación entre carriles */
```

- [ ] **Step 3: Offset vertical por carril en el transform**

En `styles.css`, dentro del `transform` de `.card` (≈ líneas 613-617), reemplazar la línea del eje Y:

```css
            calc(var(--y, 0) * 50% - 50%),
```

por:

```css
            calc(-50% + var(--lane, 0) * var(--lane-gap, 20vmin)),
```

(El `-50%` sigue centrando la card; `--lane * --lane-gap` la sube o baja a su carril.)

- [ ] **Step 4: Verificar sintaxis**

Run: `node --check work-carousel.js`
Expected: sin salida (OK).

- [ ] **Step 5: Verificar en Chrome (ventana ancha, ≥1025px)**

Scrollear la sección portfolio.
Expected: se ven hasta **2 cards a la vez** en carriles distintos (una arriba, otra abajo), desfasadas, cruzando D→I con giro 3D. Nunca 3+. No se salen de cuadro ni se solapan feo. Click en una card abre el modal.

- [ ] **Step 6: Commit**

```bash
git add work-carousel.js styles.css
git commit -m "feat(work): coverflow de 2 carriles (max 2 cards a la vez)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Galería vertical + "Ver más" + gate de modo (puntos E y F)

En **≤1024px** o bajo **reduced-motion** se monta una galería vertical estática (grilla 2/1 col, botón "Ver más") en vez del coverflow. Reemplaza la vieja lista de texto (`.pf-fallback`).

**Files:**
- Modify: `index.html` (markup de galería en `#work`; quitar `.pf-fallback`)
- Modify: `work-carousel.js` (envolver coverflow en `mountCoverflow()`, agregar `mountGallery()`, gate de modo, recarga al cruzar breakpoint)
- Modify: `styles.css` (estilos de galería; reemplazar bloque reduced-motion; limpiar reglas mobile del coverflow)

**Interfaces:**
- Consumes: `window.WORKS` (índice `i` para `PortfolioModal.open(i)`), `window.PortfolioModal.open`.
- Produces: clase `work--gallery` en `#work` cuando se monta la galería.

- [ ] **Step 1: Markup de la galería en `index.html`**

En `index.html`, reemplazar el bloque de `#work` (≈ líneas 135-148) por:

```html
        <section id="work" class="zona-work" aria-label="Portfolio">
            <!-- Coverflow 3D (desktop, sin reduced-motion). Lo puebla work-carousel.js. -->
            <div class="work__outer">
                <div class="work__inner">
                    <h2 class="work__title erratic" data-text="portfolio">portfolio</h2>
                    <canvas class="work__grid" aria-hidden="true"></canvas>
                    <div class="work__scene">
                        <!-- cards: las inyecta work-carousel.js -->
                    </div>
                </div>
            </div>
            <!-- Galería vertical (tablet/mobile/reduced-motion). Scroll normal +
                 "Ver más". Misma data y mismo modal que el coverflow. -->
            <div class="work__gallery" hidden>
                <h2 class="work__gallery-title">portfolio</h2>
                <ul class="work__cards"></ul>
                <button class="work__more" type="button" hidden>Ver más</button>
            </div>
        </section>
```

(Se retira `<div class="pf-fallback"></div>`: la galería es el nuevo fallback accesible.)

- [ ] **Step 2: Envolver el coverflow en `mountCoverflow()` en `work-carousel.js`**

En `work-carousel.js`, quitar la línea `const fallback = section.querySelector(".pf-fallback");` (≈ línea 12) y el bloque que puebla `fallback` (≈ líneas 93-104, el comentario "Fallback estático accesible" y su `if (fallback) {...}`).

Luego envolver todo el armado del coverflow (build de cards + starfield + scroll) en una función. Concretamente: reemplazar la línea de apertura del build (≈ línea 40, `const cardData = WORKS.map(...`) agregando **antes** la firma:

```javascript
    // Monta el coverflow 3D (desktop, sin reduced-motion). Todo lo que había
    // suelto en el IIFE (cards, starfield, scroll) vive ahora acá adentro.
    const mountCoverflow = () => {
```

y cerrar la función **después** del bloque de arranque de scroll. Es decir, reemplazar el bloque final actual (≈ líneas 219-224):

```javascript
    if (reduce.matches) {
        section.classList.add("work--static");   // Task 5 lo estiliza
    } else {
        initScroll();
    }
})();
```

por:

```javascript
        initScroll();
    };   // fin mountCoverflow
```

(Ojo: `const reduce = matchMedia(...)` que estaba antes del bloque de scroll queda dentro de `mountCoverflow`; está bien.)

- [ ] **Step 3: Agregar `mountGallery()` en `work-carousel.js`**

En `work-carousel.js`, a continuación del cierre de `mountCoverflow`, agregar:

```javascript
    // Monta la galería vertical estática (tablet/mobile/reduced-motion). Grilla
    // con scroll normal + "Ver más" que revela de a lotes. Mismo modal.
    const mountGallery = () => {
        const gallery = section.querySelector(".work__gallery");
        const list = gallery.querySelector(".work__cards");
        const moreBtn = gallery.querySelector(".work__more");
        const BATCH = 6;   // lote inicial y por click (afinable)
        let shown = 0;

        const cellFor = (work, i) => {
            const li = document.createElement("li");
            li.className = "work__cell";
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "work__cell-btn";
            btn.setAttribute("aria-label", `${work.title} — ${work.catLabel}`);

            const media = document.createElement("span");
            media.className = "work__cell-media";
            if (work.portada) {
                const img = document.createElement("img");
                img.src = work.portada;
                img.alt = work.title;
                img.loading = "lazy";
                img.decoding = "async";
                media.appendChild(img);
            } else {
                btn.classList.add("work__cell--fallback");
                btn.style.setProperty("--card-hue", String(work.hue));
            }
            btn.appendChild(media);

            const cap = document.createElement("span");
            cap.className = "work__cell-cap";
            cap.innerHTML =
                `<span class="work__cell-title">${work.title}</span>` +
                `<span class="work__cell-tag">${work.catLabel}</span>`;
            btn.appendChild(cap);

            btn.addEventListener("click", () => {
                if (window.PortfolioModal) window.PortfolioModal.open(i);
            });
            li.appendChild(btn);
            return li;
        };

        const reveal = () => {
            const next = Math.min(shown + BATCH, N);
            for (let i = shown; i < next; i++) list.appendChild(cellFor(WORKS[i], i));
            shown = next;
            moreBtn.hidden = shown >= N;   // sin más → se oculta el botón
        };

        if (!N) {
            const li = document.createElement("li");
            li.className = "work__cell work__cell--empty";
            li.textContent = "Próximamente.";
            list.appendChild(li);
        } else {
            reveal();
            moreBtn.addEventListener("click", reveal);
        }

        gallery.hidden = false;
        section.classList.add("work--gallery");   // el CSS oculta el coverflow
    };
```

- [ ] **Step 4: Gate de modo al final del IIFE**

En `work-carousel.js`, al final del archivo (antes del `})();` de cierre del IIFE), agregar:

```javascript
    // ---- Elegir modo: coverflow 3D (desktop, sin reduced-motion) o galería ----
    const coverflowMQ = matchMedia("(min-width: 1025px)");
    const reduceMQ = matchMedia("(prefers-reduced-motion: reduce)");
    const useCoverflow = () => coverflowMQ.matches && !reduceMQ.matches;

    if (useCoverflow()) mountCoverflow();
    else mountGallery();

    // Cruzar el breakpoint o togglear reduced-motion cambia de modo por completo;
    // recargar es la forma más robusta de re-montar sin restos del modo anterior.
    coverflowMQ.addEventListener("change", () => location.reload());
    reduceMQ.addEventListener("change", () => location.reload());
```

(Asegurarse de que el `})();` de cierre del IIFE quede después de este bloque.)

- [ ] **Step 5: Estilos de la galería en `styles.css`**

En `styles.css`, reemplazar la línea `.pf-fallback { display: none; }` (≈ línea 652) por el bloque de galería:

```css
/* ---- Galería vertical (tablet/mobile/reduced-motion) ---- */
.work--gallery .work__outer { display: none; }   /* apaga el coverflow */
.work__gallery {
    padding: clamp(4rem, 10vh, 8rem) 6vw;
    min-height: 100lvh;
}
.work__gallery-title {
    margin: 0 0 2rem;
    text-align: center;
    font-size: clamp(1.8rem, 7vw, 3rem);
    font-weight: 800;
    text-transform: lowercase;
}
.work__cards {
    list-style: none;
    margin: 0 auto;
    padding: 0;
    max-width: 1000px;
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(2, 1fr);   /* tablet: 2 columnas */
}
@media (max-width: 560px) {
    .work__cards { grid-template-columns: 1fr; }   /* mobile: 1 columna */
}
.work__cell { margin: 0; }
.work__cell-btn {
    display: block;
    width: 100%;
    margin: 0; padding: 0; border: 0;
    background: var(--negro);
    color: var(--blanco);
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    text-align: left;
}
.work__cell-media { display: block; aspect-ratio: 16 / 9; }
.work__cell-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.work__cell--fallback .work__cell-media {
    background:
        linear-gradient(135deg, rgba(255,255,255,0.12), rgba(0,0,0,0.35)),
        var(--negro);
    filter: sepia(1) saturate(4) hue-rotate(calc(var(--card-hue, 0) * 1deg));
}
.work__cell-cap {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
    padding: 0.7rem 0.9rem;
    font-family: var(--font-alt);
}
.work__cell-title { font-weight: 700; }
.work__cell-tag { font-size: 0.8rem; opacity: 0.85; }
.work__cell--empty { grid-column: 1 / -1; opacity: 0.8; }
.work__more {
    display: block;
    margin: 2.5rem auto 0;
    padding: 0.8rem 2rem;
    border: 0;
    border-radius: 8px;
    background: var(--blanco);
    color: var(--violeta-claro);
    font-family: var(--font-alt);
    font-weight: 700;
    cursor: pointer;
}
.work__more:hover { opacity: 0.9; }
```

- [ ] **Step 6: Reemplazar el bloque reduced-motion y limpiar reglas mobile del coverflow**

En `styles.css`, reemplazar el bloque mobile del coverflow (≈ líneas 811-819):

```css
/* ---- Mobile: sin parallax ni scale; caption oculto; card más grande ---- */
@media (max-width: 576px), (max-height: 767px) and (orientation: landscape) {
    .work__scene, .work__grid { transform: none; }   /* sin parallax */
    .card {
        width: min(80vw, 560px);                      /* video hasta ~80vw */
        --size: 1 !important;                         /* sin scale (pisa el inline) */
    }
    .card__caption { display: none; }                 /* sin caption */
}
```

por (se elimina: en ≤1024px el coverflow ni se monta):

```css
/* (El coverflow sólo se monta en ≥1025px; en pantallas chicas va la galería, así
   que ya no hacen falta reglas mobile para .card.) */
```

Y reemplazar el bloque reduced-motion (≈ líneas 821-842) por:

```css
/* ---- Reduced-motion: el cerebro no anima (mente.js hace return) y #work cae a
   la galería vertical (work-carousel.js monta mountGallery). Sólo apagamos el
   portal de salida, que tampoco anima. ---- */
@media (prefers-reduced-motion: reduce) {
    .salida-portal { display: none; }
}
```

- [ ] **Step 7: Verificar sintaxis**

Run: `node --check work-carousel.js`
Expected: sin salida (OK).

- [ ] **Step 8: Verificar en Chrome**

1. Ventana **ancha (≥1025px)**: sigue el coverflow 3D como en Task 2. La galería no se ve.
2. Achicar a **tablet (~800px)** y recargar: aparece la **galería vertical**, grilla de 2 columnas, botón "Ver más". Tocar "Ver más" agrega 6 cards más; al mostrar todas, el botón desaparece. Click en card abre el modal.
3. **Mobile (~380px)**: grilla de 1 columna.
4. DevTools → Rendering → "Emulate prefers-reduced-motion: reduce" en ventana ancha, recargar: cae a la galería (no a una lista de texto).

Expected: todo lo anterior se cumple; en `web` (0 works) igual no rompe.

- [ ] **Step 9: Commit**

```bash
git add index.html work-carousel.js styles.css
git commit -m "feat(work): galeria vertical + Ver mas en tablet/mobile/reduced-motion; gate de modo

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Continuidad — la frase se va y entran las cards (puntos B, 2, 3)

Eliminar la pantalla violeta muerta entre "NOSOTROS RESOLVEMOS" y la primera card: se solapa el arranque de `#work` con el tramo final del portal, de modo que la primera card entra apenas se va la frase. Sólo afecta desktop (coverflow); en galería la entrada es scroll normal.

**Files:**
- Modify: `styles.css` (`.zona-work` overlap negativo + z-index; nada de JS)

**Interfaces:**
- Consumes: el portal violeta (`.salida-portal`, `--violeta-claro`) del final de `.mente-journey`; el fondo `--violeta-claro` de `.zona-work` (mismo color → empalme invisible).

- [ ] **Step 1: Solapar `#work` con la cola del portal**

En `styles.css`, en la regla `.zona-work {` (≈ línea 545), agregar al final del bloque (antes del `}`):

```css
    /* Continuidad con la transición del cerebro: #work sube y se solapa con el
       tramo final del portal (violeta pleno + "NOSOTROS RESOLVEMOS"). Como el
       portal y esta sección comparten --violeta-claro, el empalme es invisible;
       la primera card entra encima del violeta apenas se va la frase, sin
       pantalla muerta. El overlap es afinable en vivo. */
    margin-top: calc(-1 * var(--work-overlap, 70vh));
    z-index: 1;   /* las cards se dibujan sobre el portal durante el solape */
```

- [ ] **Step 2: Refrescar ScrollTrigger tras el cambio de layout**

El `margin-top` negativo mueve el `start: "top top"` del trigger de `#work`; ScrollTrigger ya recalcula en su `onRefresh`/resize, pero conviene forzar un refresh tras cargar. En `work-carousel.js`, dentro de `initScroll`, después del `ScrollTrigger.create({...})` y antes de `render(0);` (≈ línea 216), agregar:

```javascript
        ScrollTrigger.refresh();
```

- [ ] **Step 3: Verificar sintaxis**

Run: `node --check work-carousel.js`
Expected: sin salida (OK).

- [ ] **Step 4: Verificar en Chrome (ventana ancha)**

Scrollear lento desde la absorción hasta el portfolio.
Expected: el cerebro se desvanece, el portal llena de violeta con "NOSOTROS RESOLVEMOS", y **apenas la frase empieza a irse, la primera card ya está entrando** por la derecha sobre el mismo violeta — sin un tramo de violeta vacío. No hay salto de color ni "brinco" de scroll. Ajustar `--work-overlap` (probar 50vh–90vh) hasta que el empalme se sienta continuo.

- [ ] **Step 5: Commit**

```bash
git add styles.css work-carousel.js
git commit -m "fix(work): continuidad portal->cards (overlap), sin pantalla violeta muerta

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Salida espejo → Nosotros (punto D)

Al terminar las cards, la entrada al revés: las cards se van y una cápsula violeta se contrae revelando `#nosotros`. Sólo en modo coverflow (desktop). Es la tarea más "afinable en vivo"; `#nosotros` es todavía un stub, así que la revelación es provisional.

**Files:**
- Modify: `work-carousel.js` (reservar tramo de salida en la pista; escribir `--work-exit`; acelerar salida de cards)
- Modify: `index.html` (overlay `.work__exit` dentro de `#work`)
- Modify: `styles.css` (overlay que se contrae con `--work-exit`; `#nosotros` sube para revelarse detrás)

**Interfaces:**
- Consumes: `S` (progreso 0..1 de la pista de `#work`, ya calculado por ScrollTrigger).
- Produces: custom property `--work-exit` (0..1) escrita sobre `#work` por `work-carousel.js`; consumida por `.work__exit` y `#nosotros` en CSS.

- [ ] **Step 1: Markup del overlay de salida en `index.html`**

En `index.html`, dentro de `#work`, inmediatamente después de `</div>` que cierra `.work__outer` y **antes** de `<div class="work__gallery" hidden>`, agregar:

```html
            <!-- Salida espejo (sólo coverflow): cápsula violeta que se contrae al
                 terminar las cards y revela #nosotros. La maneja --work-exit. -->
            <div class="work__exit" aria-hidden="true"></div>
```

- [ ] **Step 2: Reservar el tramo de salida y escribir `--work-exit` en `work-carousel.js`**

En `work-carousel.js`, agregar la constante de inicio de salida dentro de `CONFIG` (≈ línea 23, tras `yRange`):

```javascript
        exitStart: 0.82,       // S a partir del cual las cards ya pasaron y corre la salida
```

Luego, en `render(S)` (≈ línea 166), al principio del cuerpo (después de `const render = (S) => {`), agregar:

```javascript
        // Progreso de salida (0 hasta exitStart, →1 al final). Lo consume el CSS
        // del overlay .work__exit y el reveal de #nosotros.
        const exitP = clamp((S - CONFIG.exitStart) / (1 - CONFIG.exitStart), 0, 1);
        section.style.setProperty("--work-exit", exitP.toFixed(4));
```

y remapear el centro de las cards para que la última quede centrada en `exitStart` (no en 1), dejando `[exitStart,1]` para la salida. Reemplazar `centerOf` (≈ línea 164):

```javascript
    const centerOf = (i) => (N > 1 ? (i / (N - 1)) * CONFIG.exitStart : 0.5 * CONFIG.exitStart);
```

- [ ] **Step 3: Overlay que se contrae + reveal de #nosotros en `styles.css`**

En `styles.css`, después del bloque de la galería (el que agregaste en Task 3, tras `.work__more:hover {...}`), agregar:

```css
/* ---- Salida espejo (coverflow): la cápsula violeta llena el cuadro cuando las
   cards ya pasaron (--work-exit 0→~0.4) y se contrae a un punto (0.4→1),
   revelando #nosotros que sube detrás. Inverso del portal de entrada. ---- */
.work__exit {
    position: fixed;
    left: 50%; top: 50%;
    translate: -50% -50%;
    z-index: 4;
    pointer-events: none;
    border-radius: 9999px;
    background:
        radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1.6px) 0 0 / 14px 14px,
        var(--violeta-claro);
    /* Fase A (0→0.4): crece de nada a tapar todo (las cards desaparecen tras el
       violeta). Fase B (0.4→1): se contrae de vuelta a un punto. */
    --exit-grow: clamp(0, calc(var(--work-exit, 0) / 0.4), 1);
    --exit-shrink: clamp(0, calc((var(--work-exit, 0) - 0.4) / 0.6), 1);
    --exit-size: calc(300vmax * var(--exit-grow) * (1 - var(--exit-shrink)));
    width: var(--exit-size);
    height: var(--exit-size);
    opacity: clamp(0, calc(var(--work-exit, 0) * 8), 1);
}
/* #nosotros sube para quedar detrás del overlay y revelarse cuando éste se
   contrae (mismo truco de overlap que la entrada). */
#nosotros {
    position: relative;
    z-index: 0;
    margin-top: calc(-1 * var(--work-exit-overlap, 80vh));
}
@media (prefers-reduced-motion: reduce) {
    .work__exit { display: none; }
    #nosotros { margin-top: 0; }
}
/* En galería no hay salida animada: el overlay no se muestra. */
.work--gallery .work__exit { display: none; }
.work--gallery ~ #nosotros, #work.work--gallery + #nosotros { margin-top: 0; }
```

- [ ] **Step 4: Verificar sintaxis**

Run: `node --check work-carousel.js`
Expected: sin salida (OK).

- [ ] **Step 5: Verificar en Chrome (ventana ancha)**

Scrollear hasta pasar la última card.
Expected: cuando las cards terminan, una cápsula violeta llena el cuadro (las cards desaparecen tras ella) y luego **se contrae hasta un punto revelando la sección Nosotros** — espejo de la entrada. En galería (tablet) no aparece: se pasa a Nosotros con scroll normal. Bajo reduced-motion no aparece. Afinar `exitStart`, `--work-exit-overlap` (60vh–100vh) y los umbrales `0.4` hasta que el cierre se sienta como la entrada al revés.

- [ ] **Step 6: Commit**

```bash
git add index.html work-carousel.js styles.css
git commit -m "feat(work): salida espejo — capsula violeta se contrae y revela Nosotros

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Notas de integración y afinado en vivo

Estos valores quedaron como custom properties / constantes justo para que Luly los pruebe en Chrome sin tocar la lógica:

- `GROW_PER_BEAT` (mente.js) — cuánto crece el cerebro por absorción (~0.08).
- `--lane-gap` (styles.css `.card`) — separación de carriles (14–24vmin).
- `CONFIG.transitWindow` (work-carousel.js) — ya existente; subir un poco si se quiere ver 2 cards co-visibles más tiempo (sin pasar a 3).
- `BATCH` (work-carousel.js `mountGallery`) — tamaño del lote de "Ver más" (6).
- Breakpoint `min-width: 1025px` (work-carousel.js) y `max-width: 560px` (styles.css galería) — el corte coverflow↔galería y 2col↔1col.
- `--work-overlap` (styles.css `.zona-work`) — solape de entrada (Task 4).
- `CONFIG.exitStart`, `--work-exit-overlap`, umbral `0.4` (Task 5) — la salida espejo.

## Self-review (cobertura del spec)

- Punto A (cerebro escalonado) → Task 1. ✓
- Punto B (continuidad frase→cards) → Task 4. ✓
- Punto C (coverflow 2 carriles, máx 2) → Task 2. ✓
- Punto D (salida espejo → Nosotros) → Task 5. ✓
- Punto E (galería vertical + Ver más, 2/1 col, mismo modal) → Task 3. ✓
- Punto F (reduced-motion → galería) → Task 3 (Steps 4, 6). ✓
- Criterio "node --check + sin refs muertas": cada task corre `node --check`; se retira `.pf-fallback` y el modo `work--static` en Task 3. ✓
