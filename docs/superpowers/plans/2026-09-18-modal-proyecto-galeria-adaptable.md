# Modal de proyecto — galería adaptable + cruz afuera · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rehacer el modal de detalle de un trabajo para que muestre título + categoría + herramientas (sin descripción), una galería adaptable de fotos y videos como protagonista, y la cruz de cerrar flotando afuera del recuadro.

**Architecture:** Un único modal (`#pf-modal`) que arma una lista ordenada de media por work (imágenes de `galeria` + videos de `video`/`proceso`). Con galería → grilla de tiles (foto = `<img>`, video = botón con poster + ▶) que abren un lightbox; solo-video → reproductor grande inline. No se toca el carrusel/coverflow.

**Tech Stack:** HTML5 + CSS3 (custom properties/tokens) + vanilla JS. Sin build ni framework de tests: la verificación es manual en Chrome vía `window.PortfolioModal.open(i)` desde la consola.

## Global Constraints

- Colores **solo** vía tokens CSS existentes (`var(--violeta-claro)`, `var(--blanco)`, `var(--naranja)`, etc.). Nunca hex hardcodeado.
- Copy en español; comentarios de código en inglés.
- Clases y archivos en kebab-case.
- Accesibilidad: mantener focus trap, restauración de foco, Esc y bloqueo de scroll de fondo (ya existen en `portfolio-modal.js`).
- No tocar `work-carousel.js` ni las cards; el carrusel sigue usando `portada`/`media`/`video`.
- Modelo de datos: opción A — se agrega el campo opcional `proceso`; `galeria` y `video` quedan como están.
- Fuente única de datos: `portfolio-data.js`. Índices de prueba (WORKS interleaved): `open(0)`=Inari (gráfico), `open(1)`=Caja Reloj (3D), `open(2)`=Sandman (motion), `open(3)`=Hocicos (campañas).
- **Verificación:** servir con `npx serve .` y abrir en Chrome `http://localhost:3000` (o el puerto que reporte). El modal se fuerza desde la consola con `PortfolioModal.open(i)` — no hace falta scrollear la journey.

---

### Task 1: Cargar los videos de proceso en los datos

Los `proceso.mp4` de gráfico existen en disco pero no están en `data.js`. Se agregan como campo `proceso` a cada work de gráfico. Interstellar usa `animado.mp4` (no tiene `proceso.mp4`). Los 3D ya tienen `video` — no se tocan.

**Files:**
- Modify: `portfolio-data.js` (works de la categoría `grafico`, ~líneas 13-73)

**Interfaces:**
- Consumes: nada.
- Produces: cada work de gráfico gana `proceso: "<ruta mp4>"` (string, opcional). El resto del código lo lee en Task 3.

- [ ] **Step 1: Agregar `proceso` a cada work de gráfico**

En `portfolio-data.js`, dentro de la categoría `grafico`, agregar la línea `proceso` a cada work (después de su `galeria`, antes de `tools`). Rutas exactas:

```js
// Inari
proceso: "resources/portfolio/grafico/inari/proceso.mp4",
// Lightyear
proceso: "resources/portfolio/grafico/lightyear/proceso.mp4",
// Perfume
proceso: "resources/portfolio/grafico/perfume/proceso.mp4",
// Infinity War
proceso: "resources/portfolio/grafico/infinityWar/proceso.mp4",
// Interstellar (no tiene "proceso": usa el animado)
proceso: "resources/portfolio/grafico/interstellar/animado.mp4",
// Harley
proceso: "resources/portfolio/grafico/harley/proceso.mp4",
```

- [ ] **Step 2: Verificar en Chrome que los datos cargan**

Servir (`npx serve .`), abrir en Chrome, y en la consola:

```js
WORKS.filter(w => w.proceso).map(w => [w.title, w.proceso])
```

Expected: un array con los 6 works de gráfico y sus rutas `proceso`. Sin errores de parseo (la página carga normal).

- [ ] **Step 3: Commit**

```bash
git add portfolio-data.js
git commit -m "feat(data): cargar videos de proceso de grafico en el portfolio"
```

---

### Task 2: Estructura del modal — header minimal, sin descripción, una columna, cruz afuera

Reestructura el HTML/CSS/JS del modal: herramientas suben al header (sin subhead), se elimina la descripción, el body pasa a una sola columna, y la ✕ flota afuera del recuadro sin que la recorte el scroll. La media sigue renderizándose como hoy (grilla de imágenes / video inline) — la grilla unificada llega en Task 3.

**Files:**
- Modify: `index.html:320-343` (bloque `#pf-modal`)
- Modify: `styles.css:1256-1357` (bloque `.pf-modal*`)
- Modify: `portfolio-modal.js` (quitar `mDesc`; quitar subhead en `renderTools`)

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nueva estructura DOM `.pf-modal-dialog > .pf-modal-close + .pf-modal-scroll`; `.pf-modal-tools` vive dentro de `.pf-modal-head`. El `.pf-modal-media` sigue existiendo para Task 3.

- [ ] **Step 1: Reestructurar el HTML del modal**

Reemplazar `index.html:320-343` por:

```html
        <div class="pf-modal" id="pf-modal" hidden role="dialog" aria-modal="true"
             aria-labelledby="pf-modal-title">
            <div class="pf-modal-backdrop" data-close></div>
            <div class="pf-modal-dialog" role="document">
                <button class="pf-modal-close" type="button" aria-label="Cerrar" data-close>✕</button>
                <div class="pf-modal-scroll">
                    <header class="pf-modal-head">
                        <h3 class="pf-modal-title" id="pf-modal-title"></h3>
                        <span class="pf-modal-tag"></span>
                        <div class="pf-modal-tools"></div>
                    </header>
                    <div class="pf-modal-body">
                        <div class="pf-modal-media"></div>
                    </div>
                </div>
                <div class="pf-lightbox" hidden aria-hidden="true">
                    <button class="pf-lb-close" type="button" aria-label="Cerrar imagen" data-lb-close>✕</button>
                    <button class="pf-lb-nav pf-lb-prev" type="button" aria-label="Anterior">◂</button>
                    <img class="pf-lb-img" src="" alt="">
                    <button class="pf-lb-nav pf-lb-next" type="button" aria-label="Siguiente">▸</button>
                </div>
            </div>
        </div>
```

(Se eliminaron `<aside class="pf-modal-meta">` y `<p class="pf-modal-desc">`; `.pf-modal-tools` quedó en el header; se agregó `.pf-modal-scroll`; el lightbox pasó a ser hijo del dialog.)

- [ ] **Step 2: Quitar la descripción y el subhead en el JS**

En `portfolio-modal.js`:

Borrar la línea del selector de descripción:
```js
    const mDesc = modal.querySelector(".pf-modal-desc");
```

En `open()`, borrar estas tres líneas:
```js
        const desc = (work.descripcion || "").trim();
        mDesc.textContent = desc;
        mDesc.hidden = !desc;
```

En `renderTools()`, borrar el subhead (ya no va título "Herramientas" en el header):
```js
        const h = document.createElement("h4");
        h.className = "pf-modal-subhead";
        h.textContent = "Herramientas";
        mTools.appendChild(h);
```

- [ ] **Step 3: CSS — cruz afuera, scroll interno, header con chips, una columna**

En `styles.css`, reemplazar la regla `.pf-modal-dialog` (1274-1285) por el dialog sin overflow + el nuevo contenedor de scroll:

```css
.pf-modal-dialog {
    position: relative;
    z-index: 1;
    width: min(1000px, 100%);
    background: var(--violeta-claro);
    color: var(--blanco);
    border-radius: 12px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
}
.pf-modal-scroll {
    max-height: 88vh;
    overflow: auto;
    border-radius: 12px;
    padding: clamp(1.2rem, 3vw, 2.2rem);
}
```

Reemplazar `.pf-modal-close` (1286-1298) por la variante “afuera”, mismo look que `.demoreel-close`:

```css
.pf-modal-close {
    position: absolute;
    top: -2.8rem;
    right: 0;
    background: none;
    border: none;
    color: var(--blanco);
    font-size: 1.6rem;
    line-height: 1;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    transition: color 0.15s;
}
.pf-modal-close:hover,
.pf-modal-close:focus-visible { color: var(--naranja); outline: none; }
```

Reemplazar el body de 2 columnas (1321-1328) por una sola columna:

```css
.pf-modal-body { display: block; }
```

Ajustar el header para que las herramientas convivan en la fila (reemplazar `.pf-modal-head`, 1299-1306):

```css
.pf-modal-head {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    flex-wrap: wrap;
    padding-right: 1rem;
    margin-bottom: 1.2rem;
}
.pf-modal-tools { display: flex; }
.pf-tools-list { margin: 0; }        /* sin el margen inferior de cuando era sidebar */
```

- [ ] **Step 4: Verificar en Chrome**

Con el server corriendo, en la consola: `PortfolioModal.open(0)` (Inari).
Expected:
- La ✕ aparece **arriba, afuera** del recuadro violeta (no en su esquina interna), y al hover se pone naranja.
- El header muestra **título + tag de categoría + logos de herramientas** en una fila. **No hay texto de descripción.**
- La galería de imágenes ocupa el ancho completo debajo.
- El modal scrollea internamente si el contenido es alto, sin recortar la ✕.
- `Esc` cierra; el foco vuelve a la card.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css portfolio-modal.js
git commit -m "feat(modal): header minimal con herramientas, sin descripcion, cruz afuera"
```

---

### Task 3: Grilla de media unificada (foto + video) + lightbox con video

`renderMedia` arma una lista ordenada de items (imágenes primero, videos al final) y decide: con galería → grilla de tiles (video = botón con poster + ▶); solo-video sin galería → reproductor grande inline. El lightbox se extiende para reproducir video además de mostrar imágenes; las flechas/teclas navegan toda la lista.

**Files:**
- Modify: `portfolio-modal.js` (`renderMedia`, `openLightbox`/`showLb`/`closeLightbox`/`stepLb`, refs del lightbox)
- Modify: `index.html` (agregar `<video class="pf-lb-vid">` dentro de `.pf-lightbox`)
- Modify: `styles.css` (tile de video `.pf-vtile` + `.pf-lb-vid`)

**Interfaces:**
- Consumes: `work.galeria` (array de rutas), `work.video`, `work.proceso`, `work.portada` de `portfolio-data.js`.
- Produces: lightbox operando sobre una lista de items `{ type: "image"|"video", src, poster? }`; tiles de video con clase `.pf-vtile`.

- [ ] **Step 1: Agregar el `<video>` del lightbox en el HTML**

En `index.html`, dentro de `.pf-lightbox`, agregar el video justo después del `<img class="pf-lb-img">`:

```html
                    <img class="pf-lb-img" src="" alt="">
                    <video class="pf-lb-vid" controls playsinline hidden></video>
```

- [ ] **Step 2: Reescribir `renderMedia` en `portfolio-modal.js`**

Reemplazar toda la función `renderMedia` (52-86) por:

```js
    // Media del modal: lista unificada (imágenes + videos). Con galería → grilla de
    // tiles (video = botón con poster + ▶). Solo-video sin galería → player inline.
    const renderMedia = (work) => {
        mMedia.innerHTML = "";
        const images = (work.galeria || []).map((src) => ({ type: "image", src }));
        const poster = work.portada || (work.galeria && work.galeria[0]) || "";
        const videos = [];
        if (work.video)   videos.push({ type: "video", src: work.video,   poster });
        if (work.proceso) videos.push({ type: "video", src: work.proceso, poster });
        const items = [...images, ...videos];

        // Solo-video (sin galería, un único video): reproductor grande inline.
        if (!images.length && videos.length === 1) {
            const v = document.createElement("video");
            v.className = "pf-video";
            v.src = videos[0].src;
            v.controls = true;
            v.playsInline = true;
            mMedia.appendChild(v);
            return;
        }
        // Sin ninguna media: placeholder.
        if (!items.length) {
            const ph = document.createElement("p");
            ph.className = "pf-media-soon";
            ph.textContent = work.media === "video"
                ? "Video próximamente."
                : "Imágenes próximamente.";
            mMedia.appendChild(ph);
            return;
        }
        // Grilla de tiles.
        const grid = document.createElement("div");
        grid.className = "pf-gallery";
        items.forEach((item, i) => {
            if (item.type === "image") {
                const img = document.createElement("img");
                img.src = item.src;
                img.alt = `${work.title} — imagen ${i + 1}`;
                img.loading = "lazy";
                img.decoding = "async";
                img.addEventListener("click", () => openLightbox(items, i));
                grid.appendChild(img);
            } else {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "pf-vtile";
                btn.setAttribute("aria-label", `${work.title} — video`);
                if (item.poster) btn.style.backgroundImage = `url("${item.poster}")`;
                const play = document.createElement("span");
                play.className = "pf-vtile-play";
                play.setAttribute("aria-hidden", "true");
                play.textContent = "▶";
                btn.appendChild(play);
                btn.addEventListener("click", () => openLightbox(items, i));
                grid.appendChild(btn);
            }
        });
        mMedia.appendChild(grid);
    };
```

- [ ] **Step 3: Extender el lightbox para video**

En `portfolio-modal.js`, agregar la referencia al video del lightbox junto a `lbImg` (~línea 19):

```js
    const lbVid = lb.querySelector(".pf-lb-vid");
```

Reemplazar `showLb` (88) por una versión que distingue imagen/video (`lbList` ahora contiene items `{type, src}`):

```js
    const showLb = () => {
        const item = lbList[lbIndex];
        const isVideo = item.type === "video";
        lbImg.hidden = isVideo;
        lbVid.hidden = !isVideo;
        if (isVideo) {
            lbVid.src = item.src;
            lbVid.currentTime = 0;
            lbVid.play().catch(() => {});   // arranca; si el browser lo bloquea, queda con controles
        } else {
            lbVid.pause();
            lbImg.src = item.src;
            lbImg.alt = `Imagen ${lbIndex + 1}`;
        }
    };
```

Reemplazar `closeLightbox` (96-99) para pausar el video al cerrar:

```js
    const closeLightbox = () => {
        lbVid.pause();
        lb.hidden = true;
        lb.setAttribute("aria-hidden", "true");
    };
```

Reemplazar `stepLb` (100-103) para pausar antes de cambiar de item:

```js
    const stepLb = (d) => {
        lbVid.pause();
        lbIndex = (lbIndex + d + lbList.length) % lbList.length;
        showLb();
    };
```

(`openLightbox` no cambia: sigue recibiendo `(list, i)`, ahora una lista de items.)

- [ ] **Step 4: CSS del tile de video y del video en lightbox**

En `styles.css`, después de `.pf-video` (~1369) agregar:

```css
/* Tile de video en la grilla: poster de fondo + ▶ al centro. */
.pf-vtile {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    margin: 0 0 0.8rem;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.5) center / cover no-repeat;
    cursor: pointer;
    break-inside: avoid;
}
.pf-vtile-play {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.4rem;
    color: var(--blanco);
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.7);
}
.pf-vtile:hover .pf-vtile-play,
.pf-vtile:focus-visible .pf-vtile-play { color: var(--naranja); }
```

Y junto a `.pf-lb-img` (~1393) agregar el video del lightbox:

```css
.pf-lb-vid {
    max-width: 90vw;
    max-height: 85vh;
    border-radius: 6px;
}
.pf-lb-vid[hidden] { display: none; }
```

- [ ] **Step 5: Verificar en Chrome los tres casos**

Con el server corriendo:
- `PortfolioModal.open(0)` (Inari, gráfico): grilla con las imágenes **y** un tile de video con ▶ al final. Click en el tile → lightbox reproduce `proceso.mp4`. Flechas ◂▸ y teclas ← → navegan entre fotos y video. Click en una foto → se ve la imagen (el video se pausa).
- `PortfolioModal.open(1)` (Caja Reloj, 3D): grilla con imágenes + tile del `video.mp4` (turntable).
- `PortfolioModal.open(2)` (Sandman, motion): **reproductor grande inline**, sin grilla.
- `Esc` en el lightbox lo cierra y pausa el video; `Esc` de nuevo cierra el modal.

- [ ] **Step 6: Commit**

```bash
git add portfolio-data.js index.html styles.css portfolio-modal.js
git commit -m "feat(modal): grilla de media unificada foto+video y lightbox con video"
```

---

## Notas de verificación visual (post-implementación)

Como anticipó Lourdes, varias cosas se terminan de ajustar viéndolas en vivo:
- Tamaño/columnas de la grilla (`.pf-gallery { columns: 3 200px }`) y proporción de los tiles de video.
- Posición/estilo final de la ✕ afuera (el `-2.8rem` puede querer más aire).
- Densidad del header cuando hay muchas herramientas.
- Si algún work necesita el video **primero** en vez de al final (se reordena moviendo el push en `renderMedia` o por-work si se cambia el modelo).

Estas quedan para una pasada de tuning en Chrome, no bloquean la implementación.
