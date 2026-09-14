# Desarme del sitio → esqueleto

Estado: 🟢 Aprobado por Luly (2026-09-14).
Tipo: trabajo de implementación (demolición), no de narrativa.

Implementa el **punto 8** de `2026-09-14-recorrido-mente-vaiven-pantallazo.md`:
antes de reconstruir con la narrativa nueva (scroll continuo, arco de color
B&N → color → B&N), se desarma el sitio actual hasta un esqueleto limpio.

Alcance elegido: **demolición total a stubs.** El esqueleto queda con el hero +
5 secciones vacías rotuladas + nav centro-arriba. Todo el JS de features se
borra. Cada sala se reconstruye 100 % desde cero en su propia sesión.

---

## 1. Objetivo

Una sola página que:
- **scrollea de forma continua** por 5 salas (hoy el sitio no scrollea: son
  secciones fijas conmutadas por el nav lateral — eso se elimina),
- tiene el **nav centro-arriba** con 5 anclas (hoy es lista lateral derecha),
- abre con un **hero en blanco / B&N** (hoy es azul eléctrico) y cierra en
  **B&N** (contacto),
- no tiene JS de features (solo el efecto `erratic` como infraestructura),
- deja una base CSS limpia (tokens + base) para reconstruir sala por sala.

El arco de color real y el contenido de cada sala **no** son parte de este
desarme: se trabajan por sesión de sección. El esqueleto solo muestra la
estructura y los dos extremos B&N ya legibles.

---

## 2. Estructura final de archivos

### Se borran (recuperables desde git)
- `script.js` — motor de secciones fijas (`VaivenNav`), cursor-follower,
  línea de vaivén, carrusel de destacados, modal de video, parallax. El efecto
  `erratic` que vive acá se rescata a `erratic.js` (ver abajo) antes de borrar.
- `hero-motion.js` — animación de entrada del hero (GSAP).
- `palette.js` — toggle de paleta (en pausa; ahora el color es el concepto,
  no un botón).
- `portfolio-grid.js` — grilla filtrable (el portfolio pasa a carrusel semi-3D).
- `tour.js` — gate de primera visita (el scroll *es* el recorrido ahora).
- `hero-3d.js` — hero 3D por categoría (ya desmontado).
- `category-heroes.js` — heroes GSAP por categoría (ya desmontados).
- `data.js` — data de los 25 proyectos. Queda en git; la sesión de Portfolio
  la recupera y reescribe como base del carrusel semi-3D.

### Nuevo
- `erratic.js` — el efecto de tipografía de Mateo, **extraído tal cual** de
  `script.js` (solo la parte del erratic: `FAMILIES`, `WEIGHTS`, wrapping de
  caracteres y jitter). Sin dependencias, se autoinvoca sobre `.erratic` al
  cargar. Es infraestructura de marca reusable por todas las salas.

### Se reescriben
- `index.html` — esqueleto (ver §3).
- `styles.css` — base + tokens (ver §4).

### Intactos
- Carpeta `resources/` — las imágenes quedan en disco, sin referenciar. No se
  borra ningún asset.
- `.aep` / `lupa_*.png` sin trackear — no se tocan.
- `CNAME`, config del repo, `docs/` — sin cambios (este spec se agrega a `docs/`).

---

## 3. `index.html` (esqueleto)

### `<head>`
- **Se elimina:** el script pre-paint de paleta (`data-palette`), el `<script>`
  de GSAP, y todos los `<script>` viejos (`script.js`, `palette.js`, `data.js`,
  `portfolio-grid.js`, `tour.js`, `hero-motion.js`).
- **Se conserva:** fuentes Montserrat + Montserrat Alternates (las necesita
  `erratic`), `<link>` a `styles.css`.
- **Se agrega:** `<script src="erratic.js" defer>`.

### `<body>`
- **Se elimina:** filtro SVG del cursor (`#cursor-distort`), `.cursor-follower`,
  `.vaiven-line`, `.volver` (ojo esquina), modal de video (`#manifiesto-modal`),
  y todo el contenido interno de las secciones.
- **Nav centro-arriba** (`<nav>`) con 5 anclas: los links usan `href="#..."` y
  el scroll suave lo da el CSS (`scroll-behavior:smooth`). **Sin JS de
  navegación.** Sin resaltado de link activo por ahora (se puede sumar con
  IntersectionObserver en una sesión futura).
- **5 secciones en orden, scroll continuo**, cada una `min-height:100vh`, con
  solo su nombre como rótulo visible:

  | # | id | rótulo | fondo en el esqueleto |
  |---|---|---|---|
  | 1 | `hero` | headline mínima (`.erratic`) | **blanco / B&N** |
  | 2 | `herramientas` | Herramientas y servicios | neutro (gris claro) |
  | 3 | `portfolio` | Portfolio | neutro |
  | 4 | `nosotros` | Nosotros | neutro |
  | 5 | `contacto` | Contacto | **blanco / B&N** |

- Etiquetas del nav (español, minúsculas, coherente con el estilo previo):
  `home` · `herramientas` · `portfolio` · `nosotros` · `contacto`.

---

## 4. `styles.css` (base + tokens)

### Se conserva / define
- Los **11 tokens** de color (`Mode 1.tokens.json`) + variables semánticas en
  `:root`.
- Reset mínimo, `box-sizing`, tipografía base (Montserrat), color de texto.
- `html { scroll-behavior: smooth; }` y scroll de página desbloqueado.
- Base de `section`: `min-height:100vh`, centrado del rótulo, flujo vertical
  normal (nada de `position:absolute` apilado).
- Nav centro-arriba (fijo arriba, centrado horizontalmente).
- Hero y contacto en blanco / B&N; secciones del medio en neutro.

### Se elimina
Todo lo específico de sección y de features desmontadas:
- Locked-scroll (`overflow:hidden` en html/body, apilado con `position:absolute`,
  `section[data-active]`, sistema de transición entre secciones).
- Bento grid, motivo del ojo, manos, social logos, spotify, Dream Team,
  destacados / carrusel, línea de vaivén, cursor-follower, modal de video,
  botón "volver".
- Bloque `html[data-palette="alt"]` completo (Mode 2, en pausa).

---

## 5. Resultado esperado

Al terminar el desarme:
- La página **scrollea** de arriba a abajo por 5 salas rotuladas.
- El nav está **arriba al centro** y sus anclas llevan (con scroll suave) a cada
  sala.
- Hero y contacto se ven en **blanco / B&N**; las tres del medio en neutro.
- `erratic` funciona sobre cualquier `.erratic`.
- No queda JS de features ni CSS de secciones viejas.

Base limpia y honesta (estructura, no diseño) sobre la cual reconstruir cada
sala en su propia sesión, siguiendo el recorrido "la mente de VAI VEN".

---

## 6. Fuera de alcance (queda para sesiones por sección)

- El arco de color real (cómo y dónde explota el color).
- Contenido, copy, layout y animaciones de cada sala.
- El carrusel semi-3D del portfolio (y resucitar/reescribir `data.js`).
- Resaltado de link activo en el nav / motivo conector persistente.
- Reintegración del 3D al hero.
