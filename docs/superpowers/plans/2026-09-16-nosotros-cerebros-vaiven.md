# Nosotros — "los cerebros detrás del vaivén" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la sección `#nosotros` (fila de 5 integrantes, cada uno un ojo que se da vuelta a retrato en hover, sobre fondo verde) y reemplazar la salida floja del portfolio por una transición "el iris se cierra".

**Architecture:** Sitio estático (HTML/CSS/JS vanilla, sin build ni test runner). La verificación de cada tarea es **visual en Chrome** (no hay framework de tests). La sección es markup en `index.html` + estilos en `styles.css`. La transición reutiliza la variable `--work-exit` que ya setea `work-carousel.js` (0→1 en la cola del coverflow); sólo se rehace el CSS de `.work__exit` (de cápsula a iris) y se apoya en que `#nosotros` es verde para que el despineo del stage no tenga costura.

**Tech Stack:** HTML5, CSS3 (custom properties, transform 3D, `@media (prefers-reduced-motion)`, `@media (hover)`), JS vanilla ya existente.

## Global Constraints

- **Colores sólo vía tokens de `Mode 1.tokens.json`** (CSS custom properties). Nunca hex hardcodeado en componentes. Fondo Nosotros = `var(--verde)` (#167A72). Texto = `var(--blanco)`. Acentos = `var(--amarillo)` / `var(--verde-agua-claro)`.
- **Tipografía:** Montserrat Alternates (ya cargada). Jerarquía por peso/tamaño/caja.
- **Idioma:** comentarios de código en inglés; copy en español (rioplatense).
- **Naming:** kebab-case para clases; convención BEM-ish `nosotros__*` como el resto del sitio (`work__*`, `herr-*`).
- **Mobile-first + accesibilidad AA:** nombre/rol/frase SIEMPRE en el DOM (no dependen de hover). Respetar `prefers-reduced-motion`.
- **Contenido final (no inventar, no cambiar):** orden y datos de la tabla de la Tarea 1.
- **No mergear `storytelling-redesign` a `main`** hasta terminar el rediseño (deploy automático).

---

### Task 1: Sección `#nosotros` — fila en vaivén + ojo flip (fondo verde)

Construye el markup real y los estilos de la sección. Es verificable sola: scrolleando hasta el final (o saltando por el ancla `#nosotros`) se ve la fila, el zig-zag, el flip en hover y la frase. Independiente de la transición (Tarea 2).

**Files:**
- Modify: `index.html:145-147` (reemplaza el stub `<section id="nosotros">`)
- Modify: `styles.css` (agrega bloque de estilos de Nosotros; ubicarlo después del bloque de `#work`/`.work__exit`, aprox. tras la línea 758)

**Interfaces:**
- Consumes: tokens CSS de `:root` ya existentes (`--verde`, `--blanco`, `--amarillo`, `--verde-agua-claro`), retratos `resources/nosotros/{Matias,Luly,Vicky,Agus,Bautista}.png`, ojos placeholder `resources/ojo_1.webp` / `resources/ojo_2.webp`.
- Produces: la sección `#nosotros.nosotros` con fondo `var(--verde)` (la Tarea 2 depende de que el fondo sea verde para el seam del iris). Clases: `.nosotros__fila`, `.nosotros__miembro`, `.nosotros__flip`.

Contenido final (orden exacto):

| # | Persona | Retrato | Rol | Frase | Ojo (placeholder) |
|---|---|---|---|---|---|
| 1 | Matías | `Matias.png` | Texturizador 3D | Te amo Messi | `ojo_1.webp` |
| 2 | Lourdes | `Luly.png` | Programadora | Me quiero jubilar | `ojo_2.webp` |
| 3 | Victoria | `Vicky.png` | Diseñadora Gráfica | Ya estoy grande pa' estos trotes | `ojo_1.webp` |
| 4 | Agustina | `Agus.png` | Directora Creativa | Una gota y a seguir | `ojo_2.webp` |
| 5 | Bautista | `Bautista.png` | Modelador 3D | Ke decirte | `ojo_1.webp` |

- [ ] **Step 1: Reemplazar el stub de `#nosotros` en `index.html`**

Reemplazar las líneas 145-147 (`<section id="nosotros" class="zona-color"><h2>nosotros</h2></section>`) por:

```html
        <!-- Nosotros — "los cerebros detrás del vaivén": fila de 5 integrantes.
             Cada uno entra como un OJO que en hover/focus se da vuelta (flip 3D)
             y revela el retrato; nombre/rol siempre visibles, frase en hover.
             OJOS: hoy placeholder de marca (ojo_1/ojo_2). Cuando Luly suba las
             fotos reales, cambiar cada src a resources/nosotros/ojo_<Nombre>.png.
             Fondo verde (lo usa también el iris de cierre, ver .work__exit). -->
        <section id="nosotros" class="nosotros" aria-label="Nosotros — el equipo">
            <h2 class="nosotros__titulo">Los <em>cerebros</em><br>detrás del vaivén.</h2>
            <ul class="nosotros__fila">
                <li class="nosotros__miembro">
                    <button class="nosotros__flip" type="button" aria-label="Ver a Matías">
                        <span class="nosotros__cara nosotros__cara--ojo"><img src="resources/ojo_1.webp" alt="" decoding="async"></span>
                        <span class="nosotros__cara nosotros__cara--persona"><img src="resources/nosotros/Matias.png" alt="Matías" decoding="async"></span>
                    </button>
                    <p class="nosotros__nombre">Matías</p>
                    <p class="nosotros__rol">Texturizador 3D</p>
                    <p class="nosotros__frase">"Te amo Messi"</p>
                </li>
                <li class="nosotros__miembro">
                    <button class="nosotros__flip" type="button" aria-label="Ver a Lourdes">
                        <span class="nosotros__cara nosotros__cara--ojo"><img src="resources/ojo_2.webp" alt="" decoding="async"></span>
                        <span class="nosotros__cara nosotros__cara--persona"><img src="resources/nosotros/Luly.png" alt="Lourdes" decoding="async"></span>
                    </button>
                    <p class="nosotros__nombre">Lourdes</p>
                    <p class="nosotros__rol">Programadora</p>
                    <p class="nosotros__frase">"Me quiero jubilar"</p>
                </li>
                <li class="nosotros__miembro">
                    <button class="nosotros__flip" type="button" aria-label="Ver a Victoria">
                        <span class="nosotros__cara nosotros__cara--ojo"><img src="resources/ojo_1.webp" alt="" decoding="async"></span>
                        <span class="nosotros__cara nosotros__cara--persona"><img src="resources/nosotros/Vicky.png" alt="Victoria" decoding="async"></span>
                    </button>
                    <p class="nosotros__nombre">Victoria</p>
                    <p class="nosotros__rol">Diseñadora Gráfica</p>
                    <p class="nosotros__frase">"Ya estoy grande pa' estos trotes"</p>
                </li>
                <li class="nosotros__miembro">
                    <button class="nosotros__flip" type="button" aria-label="Ver a Agustina">
                        <span class="nosotros__cara nosotros__cara--ojo"><img src="resources/ojo_2.webp" alt="" decoding="async"></span>
                        <span class="nosotros__cara nosotros__cara--persona"><img src="resources/nosotros/Agus.png" alt="Agustina" decoding="async"></span>
                    </button>
                    <p class="nosotros__nombre">Agustina</p>
                    <p class="nosotros__rol">Directora Creativa</p>
                    <p class="nosotros__frase">"Una gota y a seguir"</p>
                </li>
                <li class="nosotros__miembro">
                    <button class="nosotros__flip" type="button" aria-label="Ver a Bautista">
                        <span class="nosotros__cara nosotros__cara--ojo"><img src="resources/ojo_1.webp" alt="" decoding="async"></span>
                        <span class="nosotros__cara nosotros__cara--persona"><img src="resources/nosotros/Bautista.png" alt="Bautista" decoding="async"></span>
                    </button>
                    <p class="nosotros__nombre">Bautista</p>
                    <p class="nosotros__rol">Modelador 3D</p>
                    <p class="nosotros__frase">"Ke decirte"</p>
                </li>
            </ul>
        </section>
```

- [ ] **Step 2: Agregar los estilos de Nosotros en `styles.css`**

Insertar tras el bloque de `#work`/`.work__exit` (después de la línea ~758), antes de `/* ---- Modal de proyecto ---- */`:

```css
/* ==========================================================================
   NOSOTROS — "los cerebros detrás del vaivén"
   Fila de 5 con línea de base en zig-zag (el "vaivén"). Cada miembro entra
   como un ojo que en hover/focus hace flip 3D y revela el retrato.
   Ref: docs/superpowers/specs/2026-09-16-nosotros-cerebros-vaiven-design.md
   ========================================================================== */
.nosotros {
    display: block;              /* pisa el section{display:flex} global */
    text-align: left;
    padding: clamp(3rem, 8vh, 6rem) clamp(1.5rem, 5vw, 4rem) clamp(4rem, 10vh, 7rem);
    background: var(--verde);
    color: var(--blanco);
    position: relative;
    z-index: 0;
}
.nosotros__titulo {
    margin: 0 0 clamp(2.5rem, 7vh, 5rem);
    font-weight: 800;
    font-size: clamp(2rem, 6vw, 4.5rem);
    line-height: 0.95;
    letter-spacing: -0.02em;
    opacity: 1;                  /* NO es stub: pisa el section h2{opacity:.4} */
    text-transform: none;
}
.nosotros__titulo em { font-style: italic; color: var(--amarillo); }

.nosotros__fila {
    list-style: none; margin: 0; padding: 0;
    display: flex; justify-content: space-between; align-items: flex-start;
    gap: clamp(0.5rem, 2vw, 1.5rem);
}
.nosotros__miembro {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    perspective: 800px;          /* profundidad para el flip del hijo */
}
/* zig-zag = el "vaivén": impares abajo, pares arriba */
.nosotros__miembro:nth-child(odd)  { transform: translateY(clamp(20px, 5vh, 48px)); }
.nosotros__miembro:nth-child(even) { transform: translateY(0); }

/* --- flip ojo -> persona: gira el botón entero (perspective va en el padre
   .nosotros__miembro). Cada cara tiene backface-visibility:hidden; la persona
   arranca a 180° para quedar de frente cuando el botón gira. --- */
.nosotros__flip {
    all: unset;
    position: relative;
    width: clamp(78px, 11vw, 130px); aspect-ratio: 1;
    cursor: pointer; display: block;
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.6, 0.05, 0.2, 1);
}
.nosotros__flip:hover,
.nosotros__flip:focus-visible { transform: rotateY(180deg); }
.nosotros__cara {
    position: absolute; inset: 0; border-radius: 50%; overflow: hidden;
    backface-visibility: hidden;
    box-shadow: 0 8px 26px rgba(0,0,0,0.4);
}
.nosotros__cara img { width: 100%; height: 100%; object-fit: cover; }
.nosotros__cara--ojo { background: #0b0b3a; display: flex; align-items: center; justify-content: center; }
.nosotros__cara--ojo img { width: 78%; height: 78%; object-fit: contain; }
.nosotros__cara--persona { transform: rotateY(180deg); }

.nosotros__nombre { margin: 0.9rem 0 0; font-weight: 700; font-size: clamp(0.95rem, 1.6vw, 1.25rem); }
.nosotros__rol {
    margin: 0.2rem 0 0; font-size: clamp(0.62rem, 0.95vw, 0.78rem);
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--verde-agua-claro);
}
.nosotros__frase {
    margin: 0.6rem 0 0; font-style: italic; color: var(--amarillo);
    font-size: clamp(0.72rem, 1.15vw, 0.9rem); max-width: 20ch;
    opacity: 0; transform: translateY(6px);
    transition: opacity 0.4s 0.12s, transform 0.4s 0.12s;
}
.nosotros__miembro:hover .nosotros__frase,
.nosotros__miembro:focus-within .nosotros__frase { opacity: 1; transform: none; }

/* touch/mobile: la fila se apila; sin zig-zag ni depender de hover */
@media (max-width: 640px) {
    .nosotros__fila { flex-direction: column; align-items: center; gap: 2rem; }
    .nosotros__miembro:nth-child(odd),
    .nosotros__miembro:nth-child(even) { transform: none; }
}
/* reduced-motion: mostrar el retrato directo, sin flip ni frase-escondida */
@media (prefers-reduced-motion: reduce) {
    .nosotros__flip { transition: none; }
    .nosotros__cara--ojo { display: none; }
    .nosotros__cara--persona { transform: none; }
    .nosotros__frase { opacity: 1; transform: none; }
}
```

- [ ] **Step 3: Servir el sitio y abrir en Chrome**

```bash
cd "C:/Users/Luly/documents/vaiven/Vaiven" && python -m http.server 8080
```
Abrir en Chrome: `& "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:8080/#nosotros"`

- [ ] **Step 4: Verificar visualmente (criterios de aceptación)**

Mirar en Chrome (saltando al ancla `#nosotros`):
- Fondo verde `#167A72`; título "Los *cerebros* detrás del vaivén." grande, "cerebros" en itálica amarilla.
- 5 miembros en fila, orden Matías · Lourdes · Victoria · Agustina · Bautista, con línea de base en zig-zag (1,3,5 abajo; 2,4 arriba).
- Cada uno arranca como OJO; en hover se da vuelta y muestra el retrato; nombre + rol visibles siempre; la frase aparece en el hover.
- Con teclado (Tab): el foco en cada `.nosotros__flip` también da vuelta el ojo y muestra la frase.
- En viewport angosto (<640px): se apila en columna, sin zig-zag, retratos directos.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css
git commit -m "feat(nosotros): fila en vaiven + ojo flip a retrato, fondo verde"
```

---

### Task 2: Transición "el iris se cierra" (reemplaza la salida cápsula)

Rehace el CSS de `.work__exit` (hoy una cápsula violeta que crece y se contrae) por un **iris verde que se cierra** sobre la última card, reutilizando `--work-exit`. Como `#nosotros` ya es verde (Tarea 1), cuando el stage se despina no hay costura.

**Files:**
- Modify: `styles.css:723-758` (bloque `.work__exit` + `#nosotros` overlap actual)

**Interfaces:**
- Consumes: `--work-exit` en `:root` (0→1), que `work-carousel.js:167-168` ya setea a partir de `CONFIG.exitStart` (0.82). El `#nosotros` verde de la Tarea 1.
- Produces: `.work__exit` como iris. No cambia ninguna firma JS.

- [ ] **Step 1: Reemplazar el bloque `.work__exit` / `#nosotros` (líneas 723-758)**

```css
/* ---- Salida "el iris se cierra" (coverflow): un agujero circular se contrae
   sobre la última card mientras el verde entra desde los bordes; eco EN REVERSA
   del iris de entrada del portfolio. Al cerrarse del todo (verde pleno) el stage
   se despina y #nosotros —también verde— queda en su lugar sin costura.
   Todo manejado por --work-exit (work-carousel.js). ---- */
.work__exit {
    position: fixed;
    left: 50%; top: 50%;
    translate: -50% -50%;
    z-index: 4;
    pointer-events: none;
    border-radius: 50%;
    /* el "agujero": un círculo con un anillo verde gigante (box-shadow) que tapa
       todo. Su tamaño va de cubrir el viewport (hueco abierto) a 0 (hueco cerrado
       = verde pleno). --work-exit 0→~0.7 cierra; se mantiene cerrado hasta 1. */
    --iris-hole: clamp(0px, calc(160vmax * (1 - var(--work-exit, 0) / 0.7)), 160vmax);
    width: var(--iris-hole);
    height: var(--iris-hole);
    background: transparent;
    box-shadow: 0 0 0 200vmax var(--verde);
    /* aparece apenas arranca la salida y queda */
    opacity: clamp(0, calc(var(--work-exit, 0) * 20), 1);
}
/* #nosotros queda detrás del iris; sube con overlap para estar en su lugar cuando
   el iris cierra y el stage se despina (mismo truco que la entrada). Ambos verdes
   → el pase iris→sección es invisible. */
#nosotros {
    margin-top: calc(-1 * var(--work-exit-overlap, 90vh));
}
@media (prefers-reduced-motion: reduce) {
    .work__exit { display: none; }
    #nosotros { margin-top: 0; }
}
/* En galería (tablet/mobile) no hay salida animada: sin overlay, sin overlap. */
.work--gallery .work__exit { display: none; }
.work--gallery ~ #nosotros, #work.work--gallery + #nosotros { margin-top: 0; }
```

Nota: `#nosotros` ya trae `position: relative; z-index: 0` desde la Tarea 1, necesarios para el apilado del overlap — no re-declararlos acá.

- [ ] **Step 2: Servir y abrir en Chrome (desktop, coverflow activo)**

```bash
cd "C:/Users/Luly/documents/vaiven/Vaiven" && python -m http.server 8080
```
`& "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:8080/"`
Scrollear todo el recorrido: puertas → herramientas → portfolio (cards) → **salida**.

- [ ] **Step 3: Verificar y tunear en vivo (criterios de aceptación)**

- Al pasar la última card, un agujero circular se **contrae** y el verde entra de los bordes al centro hasta cerrar (verde pleno). Se siente como "algo que se cierra" (eco del iris de entrada).
- Al completarse, se ve la fila de Nosotros **sin salto ni franja muerta** (el seam verde-verde es invisible).
- Tunear en vivo si hace falta (valores aislados): el `0.7` de `--iris-hole` (qué tan tarde cierra), `--work-exit-overlap` (90vh; cuánto sube `#nosotros`), y `CONFIG.exitStart` en `work-carousel.js:24` (cuándo arranca la salida).
- **Decisión A vs B en vivo:** si preferís "el ojo se cierra" (párpados) en lugar del iris circular, es swap de este mismo bloque — ver Task 2b.

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "feat(nosotros): salida del portfolio como iris verde que se cierra (reemplaza capsula)"
```

---

### Task 2b (opcional / swap en vivo): variante "el ojo se cierra" (párpados)

Sólo si en la verificación de la Tarea 2 preferís párpados al iris circular. Reemplaza el `.work__exit` de la Tarea 2 por dos párpados que se juntan. Es un swap alternativo, no acumulativo.

**Files:**
- Modify: `styles.css` (el bloque `.work__exit` de la Tarea 2); requiere 2 pseudo-elementos.

- [ ] **Step 1: Reemplazar `.work__exit` por la variante párpados**

```css
.work__exit {
    position: fixed; inset: 0; z-index: 4; pointer-events: none;
    background: transparent;
    opacity: clamp(0, calc(var(--work-exit, 0) * 20), 1);
}
/* dos párpados verdes que bajan/suben hasta juntarse (parpadeo de la mente).
   --work-exit 0→~0.6 cierra; cada párpado llega al 55% de alto. */
.work__exit::before, .work__exit::after {
    content: ""; position: absolute; left: -5%; right: -5%;
    height: calc(55% * clamp(0, calc(var(--work-exit, 0) / 0.6), 1));
    background: var(--verde);
}
.work__exit::before { top: 0;    border-radius: 0 0 50% 50% / 0 0 100% 100%; }
.work__exit::after  { bottom: 0; border-radius: 50% 50% 0 0 / 100% 100% 0 0; }
```
(El `#nosotros { margin-top }` y los overrides de reduced-motion/galería de la Tarea 2 quedan igual.)

- [ ] **Step 2: Verificar en Chrome** (mismo recorrido). Los párpados verdes se juntan sobre las cards y abren en Nosotros. Elegí A (iris) o B (párpados) y descartá el otro bloque.

- [ ] **Step 3: Commit** (sólo si se adopta B)

```bash
git add styles.css
git commit -m "feat(nosotros): variante salida parpados (el ojo se cierra)"
```

---

## Self-Review

**Spec coverage:**
- §1 rol/guiño sutil → Tarea 1 (título + motivo del ojo). ✓
- §2 fondo verde → Tarea 1 (`.nosotros` background). ✓
- §3 fila en vaivén + orden/roles/frases → Tarea 1 (markup + zig-zag nth-child). ✓
- §4 ojo flip + placeholder de ojos + back retrato → Tarea 1 (flip + comentario de swap de src). ✓
- §5 iris de cierre reutilizando `--work-exit` + alternativa B → Tarea 2 + Tarea 2b. ✓
- §6 responsive/reduced-motion/touch (contenido siempre en DOM, tap/focus) → Tarea 1 (media queries + `:focus-within`, botón focusable) y Tarea 2 (reduced-motion/galería). ✓
- §7 archivos (index.html, styles.css, work-carousel.js) → index.html y styles.css cubiertos; **work-carousel.js NO se toca**: el análisis mostró que ya setea `--work-exit` y la transición es 100% CSS. Se corrige la suposición del spec §7 (menos cambios, mejor). ✓
- §8 dependencias de contenido (ojos a subir) → Tarea 1 usa placeholders con comentario de swap. ✓

**Placeholder scan:** sin TBD/TODO en pasos; todo el código está escrito. La Tarea 2b es explícitamente opcional (swap), no un placeholder. ✓

**Type/naming consistency:** clases `nosotros__*` consistentes entre HTML (Tarea 1) y CSS (Tarea 1); `.work__exit` y `--work-exit` consistentes con `work-carousel.js` existente; `#nosotros` overlap declarado una sola vez (Tarea 2), con `position/z-index` en Tarea 1. ✓
