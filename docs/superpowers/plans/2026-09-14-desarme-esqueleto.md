# Desarme del sitio → esqueleto — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Demoler el sitio actual hasta un esqueleto limpio (hero + 5 secciones scrolleables rotuladas + nav centro-arriba), borrando todo el JS de features y dejando `styles.css` reducido a tokens + base.

**Architecture:** Sitio estático (HTML/CSS/JS vanilla, sin build). El desarme reescribe `index.html` y `styles.css`, extrae el efecto `erratic` a su propio archivo `erratic.js`, y borra 8 archivos JS de features. No hay framework de tests: la verificación de cada tarea es manual, abriendo el sitio en Chrome y observando el comportamiento esperado.

**Tech Stack:** HTML5, CSS3 (custom properties), JavaScript vanilla, fuentes Montserrat / Montserrat Alternates (Google Fonts). Sin librerías. Node solo para `--check` de sintaxis.

## Global Constraints

- **Colores:** solo los 11 tokens de `Mode 1.tokens.json`, vía CSS custom properties. Nunca hardcodear un hex en un componente (los tokens se definen una vez en `:root`).
- **Idioma:** comentarios de código en inglés; copy/contenido en español (rioplatense).
- **Naming:** kebab-case para archivos y clases CSS.
- **Sin build step:** todo carga directo en el browser; `<script defer>`.
- **Fuente:** Montserrat + Montserrat Alternates únicamente. `erratic.js` depende de ambas familias.
- **Alcance:** esto es SOLO el desarme. No se reconstruye contenido, ni el arco de color real, ni animaciones. El esqueleto muestra estructura, no diseño.
- **Referencia:** spec en `docs/superpowers/specs/2026-09-14-desarme-esqueleto-design.md`.

---

## File Structure

Al terminar, el árbol relevante queda:

- `index.html` — reescrito: esqueleto (header con logo + nav centro-arriba, `<main>` con 5 secciones).
- `styles.css` — reescrito: tokens + base + nav + secciones + bloque `erratic`.
- `erratic.js` — **nuevo**: efecto de tipografía de Mateo, extraído de `script.js`.
- `resources/` — intacto (assets en disco, sin referenciar salvo el logo).
- **Borrados:** `script.js`, `hero-motion.js`, `palette.js`, `portfolio-grid.js`, `tour.js`, `hero-3d.js`, `category-heroes.js`, `data.js`.

---

## Task 0: Preservar cambios sin commitear (pre-flight)

Al inicio de esta sesión hay cambios sin commitear que el desarme sobrescribiría/borraría en silencio:
- `styles.css` — restyling del nav lateral viejo (`aria-current` → amarillo, panel transparente, links blancos + text-shadow). Queda obsoleto con el nav nuevo, pero se preserva en historia antes de reescribir el archivo.
- `data.js` — un fix de ruta de thumbnail (`RENDER2.png` → `RenderConPost1-01.png`). `data.js` se borra en la Task 3, pero el fix se preserva en historia primero.

**Files:**
- Modify (commit as-is): `styles.css`, `data.js`

- [ ] **Step 1: Verificar qué hay sin commitear**

Run: `git status --short && git diff --stat styles.css data.js`
Expected: `styles.css` y `data.js` aparecen como modificados (`M`).

- [ ] **Step 2: Commitear los cambios WIP tal cual (checkpoint previo al desarme)**

```bash
git add styles.css data.js
git commit -m "wip: nav restyling + thumbnail path fix (checkpoint pre-desarme)"
```

- [ ] **Step 3: Confirmar árbol limpio**

Run: `git status --short`
Expected: sin cambios en `styles.css`/`data.js` (pueden quedar los `??` de `lupa_*.png` / `.aep` sin trackear — se ignoran, no son parte del desarme).

---

## Task 1: Extraer `erratic` a `erratic.js`

El efecto `erratic` es infraestructura de marca reusable. Vive en `script.js:1-51`. Se copia **verbatim** a `erratic.js` ANTES de borrar `script.js` (Task 3).

**Files:**
- Create: `erratic.js`

**Interfaces:**
- Produces: `erratic.js` se autoinvoca sobre todo `.erratic` al cargar (con `defer`, el DOM ya existe). Expone `window.reshuffleErratic()` para remixar desde devtools. Agrega a cada letra las clases `mont`/`malt`, `w200..w800`, `it` (definidas en `styles.css`, ver Task 2).

- [ ] **Step 1: Crear `erratic.js` con el bloque erratic verbatim**

Contenido completo de `erratic.js` (idéntico a `script.js:1-51`):

```javascript
// Erratic typography effect — based on a code Mateo wrote for Luly.
// Wraps each character of an `.erratic` element in its own span and
// randomly assigns: font family, weight, italic, outline-vs-fill, plus
// micro-jitter (translation, rotation, scale, letter-spacing).
// Apply: <span class="erratic">Texto</span>  → letters get scrambled in style.

const FAMILIES = ["mont", "malt"];
const WEIGHTS = ["w200", "w300", "w400", "w600", "w700", "w800"];

const P = {
    italic: 0.3,
};

function jitter(letter) {
    letter.classList.add(FAMILIES[Math.random() < 0.5 ? 0 : 1]);
    letter.classList.add(WEIGHTS[Math.floor(Math.random() * WEIGHTS.length)]);
    if (Math.random() < P.italic) letter.classList.add("it");

    const y = (Math.random() * 6 - 3).toFixed(1);
    const r = (Math.random() * 2 - 1).toFixed(1);
    const s = (0.97 + Math.random() * 0.12).toFixed(2);
    letter.style.transform = `translateY(${y}px) rotate(${r}deg) scale(${s})`;
    letter.style.letterSpacing = (Math.random() * 1.1 - 0.2).toFixed(2) + "px";
}

function erraticize(el) {
    const text = el.dataset.text || el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    [...text].forEach((ch) => {
        const span = document.createElement("span");
        span.textContent = ch;
        span.setAttribute("aria-hidden", "true");
        jitter(span);
        el.appendChild(span);
    });
}

document.querySelectorAll(".erratic").forEach(erraticize);

// Exposed for design iteration — call window.reshuffleErratic() from devtools
// to remix without reloading.
window.reshuffleErratic = () => {
    document.querySelectorAll(".erratic").forEach((el) => {
        el.querySelectorAll("span").forEach((s) => {
            s.className = "";
            s.removeAttribute("style");
            jitter(s);
        });
    });
};
```

- [ ] **Step 2: Verificar sintaxis**

Run: `node --check erratic.js`
Expected: sin salida, exit 0. (`node --check` solo parsea; que `document` no exista fuera del browser no importa.)

- [ ] **Step 3: Commit**

```bash
git add erratic.js
git commit -m "refactor: extract erratic typography effect into erratic.js"
```

---

## Task 2: Reescribir `index.html` + `styles.css` al esqueleto

`index.html` y `styles.css` están acoplados (el CSS viejo bloquea el scroll y esconde secciones sin `[data-active]`; el HTML nuevo necesita el CSS nuevo para verse). Se reescriben juntos: un revisor no puede aceptar uno con el otro viejo.

**Files:**
- Modify (overwrite): `index.html`
- Modify (overwrite): `styles.css`

**Interfaces:**
- Consumes: `erratic.js` (Task 1) — el `<script defer>` en el `<head>` y la clase `.erratic` en el hero.
- Produces: 5 secciones con ids `hero` / `herramientas` / `portfolio` / `nosotros` / `contacto`, cada una scrolleable; nav con anclas a esos ids; clases de zona `.zona-bn` / `.zona-color` para el arco de color futuro; clases erratic (`.mont`/`.malt`/`.w200..w800`/`.it`) que consume `erratic.js`.

- [ ] **Step 1: Reescribir `index.html` (contenido completo)**

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Vai Ven</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <!-- Montserrat is a VARIABLE font (100..900). Montserrat Alternates is
         STATIC — it must list explicit weights or Google Fonts drops it. -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Montserrat+Alternates:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <!-- erratic typography effect (Mateo). Infrastructure — reused by every
         section as it gets rebuilt. Self-invokes over `.erratic` on load. -->
    <script src="erratic.js" defer></script>
</head>
<body>
    <!-- Header fijo: logo + nav centro-arriba. Las anclas hacen scroll suave
         (styles.css: scroll-behavior). Sin JS de navegación. -->
    <header>
        <a class="logo" href="#hero" aria-label="Vai Ven — inicio">
            <img src="resources/logo_vaiven.webp" alt="Vai Ven" decoding="async">
        </a>
        <nav aria-label="Principal">
            <ul>
                <li><a href="#hero">home</a></li>
                <li><a href="#herramientas">herramientas</a></li>
                <li><a href="#portfolio">portfolio</a></li>
                <li><a href="#nosotros">nosotros</a></li>
                <li><a href="#contacto">contacto</a></li>
            </ul>
        </nav>
    </header>

    <!-- ESQUELETO: 5 salas del recorrido "la mente de VAI VEN". Cada una es un
         stub rotulado; el contenido, el arco de color real y las animaciones se
         reconstruyen por sesión de sección. Extremos (hero/contacto) en B&N;
         salas del medio en neutro. -->
    <main>
        <section id="hero" class="zona-bn">
            <h1 class="hero-headline erratic">VAI VEN</h1>
        </section>
        <section id="herramientas" class="zona-color">
            <h2>herramientas y servicios</h2>
        </section>
        <section id="portfolio" class="zona-color">
            <h2>portfolio</h2>
        </section>
        <section id="nosotros" class="zona-color">
            <h2>nosotros</h2>
        </section>
        <section id="contacto" class="zona-bn">
            <h2>contacto</h2>
        </section>
    </main>
</body>
</html>
```

- [ ] **Step 2: Reescribir `styles.css` (contenido completo)**

```css
/* ==========================================================================
   VAI VEN — esqueleto (desarme 2026-09-14)
   Solo tokens + base. El diseño de cada sala se reconstruye por sesión.
   Ref: docs/superpowers/specs/2026-09-14-desarme-esqueleto-design.md
   ========================================================================== */

/* --- Tokens de color (Mode 1.tokens.json — única fuente de verdad) --------- */
:root {
    --naranja:            #FF5B23;
    --verde-agua-claro:   #ADE6ED;
    --azul:               #3A39FF;
    --lila:               #B4B4ED;
    --amarillo:           #FFCC00;
    --verde:              #167A72;
    --azul-oscuro:        #1A237E;
    --violeta-claro:      #511F99;
    --gris-claro:         #D9D2CC;
    --negro:              #000000;
    --blanco:             #FFFFFF;

    /* Variables semánticas. Se re-mapean al construir el arco de color real. */
    --bg-bn:     var(--blanco);
    --text-bn:   var(--negro);
    --bg-neutro: var(--gris-claro);
    --accent:    var(--naranja);

    --font-base: "Montserrat", system-ui, sans-serif;
    --font-alt:  "Montserrat Alternates", system-ui, sans-serif;
}

/* --- Reset mínimo ---------------------------------------------------------- */
*, *::before, *::after { box-sizing: border-box; }

html {
    /* Scroll continuo + salto suave por ancla. scroll-padding compensa el
       header fijo para que el título de la sección no quede tapado. */
    scroll-behavior: smooth;
    scroll-padding-top: 6rem;
}

body {
    margin: 0;
    font-family: var(--font-base);
    color: var(--text-bn);
    background: var(--blanco);
    -webkit-font-smoothing: antialiased;
}

@media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
}

/* --- Header: logo + nav centro-arriba -------------------------------------- */
header {
    position: fixed;
    inset: 0 0 auto 0;      /* top:0; left:0; right:0 */
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    pointer-events: none;   /* deja pasar clicks salvo en los links */
}

.logo,
nav { pointer-events: auto; }

.logo img {
    display: block;
    height: 2.25rem;
    width: auto;
}

nav ul {
    display: flex;
    gap: 1.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
}

nav a {
    color: inherit;
    text-decoration: none;
    text-transform: lowercase;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.02em;
}

nav a:hover,
nav a:focus-visible { color: var(--accent); }

/* --- Secciones: scroll continuo, cada una a viewport completo -------------- */
section {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6rem 1.5rem 3rem;
    text-align: center;
}

/* Zonas del arco de color. En el esqueleto son planas; el color real se
   trabaja por sesión de sección. */
.zona-bn {
    background: var(--bg-bn);
    color: var(--text-bn);
}

.zona-color {
    background: var(--bg-neutro);
    color: var(--text-bn);
}

section h2 {
    margin: 0;
    font-size: clamp(1.5rem, 5vw, 3rem);
    font-weight: 700;
    text-transform: lowercase;
    opacity: 0.4;   /* rótulo de stub: se lee como placeholder, no diseño */
}

.hero-headline {
    margin: 0;
    font-size: clamp(3rem, 12vw, 8rem);
}

/* === Erratic typography system ===
   erratic.js envuelve cada carácter de un .erratic en un span y le asigna al
   azar familia / peso / itálica + jitter por letra (transform inline). Estas
   clases son las que agrega el script. */
.erratic {
    display: inline-block;
    font-family: var(--font-alt);
    line-height: 0.95;
    letter-spacing: 0.5px;
}

.erratic > span {
    display: inline-block;
    white-space: pre;
    will-change: transform;
}

.erratic .mont { font-family: var(--font-base); }
.erratic .malt { font-family: var(--font-alt); }

.erratic .w200 { font-weight: 200; }
.erratic .w300 { font-weight: 300; }
.erratic .w400 { font-weight: 400; }
.erratic .w600 { font-weight: 600; }
.erratic .w700 { font-weight: 700; }
.erratic .w800 { font-weight: 800; }

.erratic .it { font-style: italic; }
```

- [ ] **Step 3: Servir el sitio y abrir en Chrome**

Run (deja el server corriendo en background):
`python -m http.server 8080`
Luego abrir en Chrome:
`& "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:8080"`

- [ ] **Step 4: Verificar el esqueleto en el browser**

Comprobar, en este orden:
1. **Scroll continuo:** la rueda/trackpad scrollea la página de arriba a abajo por las 5 secciones (ya NO está bloqueado).
2. **5 salas a viewport completo:** hero, herramientas y servicios, portfolio, nosotros, contacto — cada una ocupa ~100vh.
3. **Extremos B&N:** hero y contacto con fondo blanco; las 3 del medio en gris (`--gris-claro`).
4. **Nav centro-arriba:** logo + 5 links centrados arriba, fijos al scrollear. Click en cada link salta (con scroll suave) a su sección.
5. **erratic funciona:** el "VAI VEN" del hero tiene las letras con estilos mezclados (familias/pesos/itálicas distintos, micro-jitter).
6. **Consola limpia:** DevTools → Console sin errores (en especial, sin `VaivenNav`/`VaivenData` undefined ni 404 de scripts). Los 8 archivos viejos siguen en disco pero ya NO están referenciados, así que no deberían dar 404.

Expected: los 6 puntos se cumplen.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css
git commit -m "feat: demolish site to scrollable 5-section skeleton (top-center nav, B&N ends)"
```

---

## Task 3: Borrar los 8 archivos JS huérfanos

Con `erratic.js` ya extraído (Task 1) e `index.html` sin referenciarlos (Task 2), estos archivos quedan muertos. Se borran (recuperables desde git).

**Files:**
- Delete: `script.js`, `hero-motion.js`, `palette.js`, `portfolio-grid.js`, `tour.js`, `hero-3d.js`, `category-heroes.js`, `data.js`

- [ ] **Step 1: Confirmar que ninguno está referenciado en `index.html`**

Run: `grep -nE "script\.js|hero-motion|palette|portfolio-grid|tour\.js|hero-3d|category-heroes|data\.js" index.html`
Expected: sin coincidencias (exit 1). Si aparece alguna, PARAR: `index.html` (Task 2) todavía referencia un archivo a borrar.

- [ ] **Step 2: Borrar los 8 archivos**

```bash
git rm script.js hero-motion.js palette.js portfolio-grid.js tour.js hero-3d.js category-heroes.js data.js
```

- [ ] **Step 3: Verificar que el sitio sigue limpio**

Con el server aún corriendo, recargar `http://localhost:8080` en Chrome (hard reload: Ctrl+Shift+R).
Comprobar:
1. El esqueleto se ve igual que al final de la Task 2 (scroll, 5 salas, nav, erratic).
2. DevTools → Console y Network: sin errores, sin 404.

Expected: ambos puntos se cumplen.

- [ ] **Step 4: Confirmar el árbol de archivos final**

Run: `ls *.js`
Expected: solo `erratic.js`.

- [ ] **Step 5: Commit**

```bash
git commit -m "chore: remove orphaned feature JS after demolition"
```

- [ ] **Step 6: Detener el server**

Detener el proceso `python -m http.server 8080` que quedó en background.

---

## Self-Review

**Spec coverage** (contra `2026-09-14-desarme-esqueleto-design.md`):
- §2 borrar 8 archivos → Task 3 (y `data.js` preservado antes en Task 0). ✅
- §2 `erratic.js` nuevo, extraído verbatim → Task 1. ✅
- §3 `<head>`: fuera pre-paint/GSAP/scripts viejos; dentro fuentes + styles + erratic → Task 2, Step 1. ✅
- §3 `<body>`: fuera cursor/vaiven-line/volver/modal; nav centro-arriba; 5 secciones scroll continuo min-height 100vh; extremos B&N → Task 2, Steps 1-2. ✅
- §3 etiquetas nav `home/herramientas/portfolio/nosotros/contacto` → Task 2, Step 1. ✅
- §4 `styles.css`: tokens + semánticas + reset + scroll-behavior + nav + base section + erratic; sin locked-scroll ni CSS de secciones viejas ni `[data-palette]` → Task 2, Step 2. ✅
- §4 `resources/` intacto → ningún task lo toca (logo sigue referenciado). ✅
- §5 resultado: scroll por 5 salas, nav arriba, extremos B&N, erratic activo, sin JS de features → verificado en Task 2 Step 4 y Task 3 Step 3. ✅

**Placeholder scan:** el archivo contiene código completo real para `erratic.js`, `index.html` y `styles.css`. Los "stubs" del esqueleto (rótulos de sección) son el deliverable intencional, no placeholders del plan. Sin TBD/TODO en el plan. ✅

**Type/consistency:** clases erratic (`mont`/`malt`/`w200..w800`/`it`) coinciden entre `erratic.js` (Task 1), el HTML `.erratic` (Task 2) y el CSS (Task 2). Ids de sección (`hero`/`herramientas`/`portfolio`/`nosotros`/`contacto`) coinciden entre las anclas del nav y las secciones. ✅
