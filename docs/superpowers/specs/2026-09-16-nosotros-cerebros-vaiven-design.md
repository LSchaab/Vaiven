# Nosotros — "los cerebros detrás del vaivén" (diseño)

Estado: 🟡 En revisión de Luly — 2026-09-16.
Branch: `storytelling-redesign`. Sesión por sección del recorrido "la mente de VAI VEN".
Sala 4 de 5 (ver `2026-09-14-recorrido-mente-vaiven-pantallazo.md`).

---

## 1. Rol en el relato

Nosotros son **los cerebros del lugar: el equipo**. Es zona de **color** (seguís
adentro de la mente). Cierra el arco humano del viaje: la mente que te miró todo el
recorrido (el motivo del ojo, recurrente en la marca) **se resuelve en las personas
reales** detrás del estudio. Guiño sutil al concepto de "cerebros" — no se metaforiza
a cada persona como un cerebro/lóbulo; el guiño vive en el título y en el motivo del
ojo, no en una ilustración literal.

---

## 2. Fondo y color

- Fondo de la sección: **verde `#167A72`** (`var(--verde)`).
- Se descartó el azul: ya se usa en hero/portfolio y los retratos ya vienen sobre
  círculos azules; el verde los hace resaltar y da un color propio a la sala.
- Los retratos duotono existentes (`resources/nosotros/{Matias,Luly,Vicky,Agus,Bautista}.png`)
  ya están sobre círculo azul de marca — se dejan como están; contrastan bien sobre verde.

---

## 3. Layout — "fila en vaivén"

Los 5 integrantes en **una fila a todo el ancho**, con la **línea de base en zig-zag**
(el "vaivén" hecho ritmo): miembro 1 abajo, 2 arriba, 3 abajo, 4 arriba, 5 abajo.

- Título grande: **"Los cerebros detrás del vaivén."** ("cerebros" en itálica/acento).
- **Sin antetítulo** y **sin marca de esquina** (se quitaron en revisión).
- Cada integrante: figura circular (ojo→retrato, ver §4) + **nombre** + **rol**, y una
  **frase** que aparece en hover.

Orden y contenido (final, aportado por Luly):

| # | Persona | Retrato | Rol | Frase |
|---|---|---|---|---|
| 1 | Matías | `Matias.png` | Texturizador 3D | "Te amo Messi" |
| 2 | Lourdes | `Luly.png` | Programadora | "Me quiero jubilar" |
| 3 | Victoria | `Vicky.png` | Diseñadora Gráfica | "Ya estoy grande pa' estos trotes" |
| 4 | Agustina | `Agus.png` | Directora Creativa | "Una gota y a seguir" |
| 5 | Bautista | `Bautista.png` | Modelador 3D | "Ke decirte" |

---

## 4. Interacción — el ojo que se da vuelta

Cada integrante **entra como un ojo** (la mente te sigue mirando). Al **hover**, el ojo
hace un **flip 3D** (rotateY) y revela el **retrato** de la persona; el **nombre + rol**
están siempre visibles debajo, y la **frase** se revela en el hover (fade-up).

- **Front del flip = la foto del ojo REAL de cada integrante** (no el ojo genérico de
  marca). → **Dependencia de contenido: Luly sube 5 fotos de ojos.**
  Nombres de archivo esperados: `resources/nosotros/ojo_Matias.png`, `ojo_Luly.png`,
  `ojo_Vicky.png`, `ojo_Agus.png`, `ojo_Bautista.png`.
  **Hasta que existan**, se usa un ojo de marca como placeholder
  (`resources/ojo_1.webp` / `ojo_2.webp`, alternados).
- **Back del flip = retrato** (`resources/nosotros/<Nombre>.png`).
- Flip con `transform: rotateY(180deg)` + `backface-visibility: hidden`; eje limpio (el
  offset del zig-zag va en un wrapper, no en el elemento que gira).

---

## 5. Transición de entrada — "el iris se cierra"

Reemplaza la actual "salida espejo" (cápsula violeta que crece y se contrae — se sentía
floja / pantalla muerta). El portfolio **se cierra como un iris** haciendo eco del iris
con que **abrió** el portfolio, pero en reversa:

- Un agujero circular se **contrae** sobre la última card; el **verde** entra desde los
  bordes hacia el centro hasta cerrarse del todo, y ese cierre **abre sobre la fila**.
- Técnica: elemento con `border-radius:50%` + `box-shadow: 0 0 0 9999px var(--verde)`
  cuyo tamaño va de grande → 0 (el "hueco" se cierra y el verde tapa todo).
- **Se implementa reutilizando `--work-exit`** (ya existe en `work-carousel.js`, 0→1 a
  partir de `CONFIG.exitStart`): el iris se cierra en la primera mitad de `--work-exit`
  y la fila (`#nosotros`) se revela en la segunda mitad. Cambio de JS mínimo (sigue
  seteando `--work-exit`); el reemplazo es de CSS sobre `.work__exit` + `#nosotros`.
- **Alternativa B a probar en vivo (swap trivial):** "el ojo se cierra" — dos párpados
  verdes que bajan/suben hasta juntarse (parpadeo de la mente). Misma mecánica de
  `--work-exit`. Decisión final A vs B **en la página real**, no en mockup.

---

## 6. Responsive y accesibilidad

- **Touch (sin hover):** el flip se dispara con **tap/focus**; alternativamente, mostrar
  el retrato directo. El nombre, rol y frase están **siempre en el DOM** (no dependen del
  hover) para lectores de pantalla.
- **Reduced-motion:** sin iris animado (revelado directo del `#nosotros`) y sin flip
  automático (retrato visible directo). Coherente con el gate ya existente de `#work`.
- **Mobile:** `#work` ya cae a galería vertical, así que el iris de cierre (ligado al
  coverflow desktop) no aplica; `#nosotros` entra como sección normal debajo.
- Contraste del texto sobre verde `#167A72`: blanco para título/nombres; amarillo o
  verde-agua para acentos/frase, verificando contraste AA.

---

## 7. Archivos que toca

- `index.html` — markup real de `#nosotros` (fila de 5, flip ojo/retrato, título).
- `styles.css` — estilos de la fila en vaivén + flip 3D + iris de cierre (reemplaza el
  bloque actual de `.work__exit` / `#nosotros`).
- `work-carousel.js` — ajuste chico: `--work-exit` maneja el iris (hoy alimenta la
  cápsula). Sin tocar el dueño del scroll (`mente.js`).

---

## 8. Dependencias de contenido (no bloquean el build; placeholder mientras tanto)

- **5 fotos de ojos** de los integrantes (`resources/nosotros/ojo_<Nombre>.png`) — las
  sube Luly. Placeholder: ojo de marca.
- Retratos y frases: ✅ ya definidos.

---

## 9. Fuera de alcance

- La sección **Contacto** (sala 5, la salida en B&N) — sesión aparte.
- Cualquier "motivo conector persistente" entre salas (decisión futura del mapa general).
- Rework del coverflow del portfolio en sí (solo se toca su transición de salida).
