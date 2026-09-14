# Recorrido "la mente de VAI VEN" — pantallazo general

Estado: 🟢 Aprobado por Luly (2026-09-14) — mapa de alto nivel confirmado.
Alcance: **a propósito NO es un spec de detalle.** Define la historia completa, qué
secciones hay, en qué orden, y cómo se conectan entre sí. El detalle fino de cada
sala (contenido exacto, layout, animaciones, copy) se trabaja después, en **una
sesión por sección**. Este documento es la brújula hacia la cual reconstruir.

Contexto: la página se rehace desde cero. Antes de reconstruir, definimos la
narrativa que atraviesa todo el sitio. Reemplaza el enfoque del rediseño anterior
(`2026-09-07-storytelling-redesign.md`, secciones fijas conmutadas por nav, sin
scroll) por un **viaje con scroll** guiado por una sola idea.

---

## 1. La idea central

**Entrás a la mente de VAI VEN y salís con una idea.**

El hero abre las puertas de la agencia = una entrada a nuestra cabeza. Adentro todo
es color, vida y movimiento. Cuando salís, aterrizás en contacto y volvés al blanco
y negro: *"Seguro saliste con una idea, llamanos."* El vaivén es eso — fuiste a la
cabeza de VAI VEN y volviste distinto.

El concepto no se explica con texto: **se cuenta con el color.** Estás en blanco y
negro afuera, la mente explota en color adentro, y volvés al blanco y negro a la
salida. El color *es* el vaivén.

---

## 2. Arquitectura del recorrido

- **Scroll vertical continuo** = el viaje de entrada y salida. Scrollear hacia abajo
  es adentrarse en la mente. Esto cambia la arquitectura actual: el sitio hoy no
  scrollea (secciones fijas conmutadas por el nav) — pasa a ser una sola página que
  se recorre scrolleando.
- **Movimiento lateral dentro de algunas salas.** El eje principal es vertical, pero
  algunas secciones se mueven de costado (el carrusel semi-3D del portfolio es el
  caso claro; la "lluvia de ideas" también puede tener movimiento lateral). El
  contraste vertical/lateral refuerza la sensación de vaivén.
- **Nav superior centrado.** Las 5 etiquetas funcionan como **atajos de ancla**
  dentro del scroll (no como conmutador de secciones fijas). Es el nav que ya se
  decidió mover del costado derecho al centro-arriba.

---

## 3. El arco de color (el hilo que conecta todo)

| Zona | Color | Por qué |
|---|---|---|
| Hero | **B&N** | Todavía estás afuera, en el umbral. Puertas cerradas. |
| Salas del medio | **Color** | Estás adentro de la mente: todo vivo, en movimiento. |
| Contacto | **B&N** | Saliste. Volvés al mundo real, pero con una idea. |

El arco es **B&N → color → B&N**, simétrico. Entraste en blanco y negro y volviste
en blanco y negro, pero volviste distinto.

---

## 4. Las 5 salas (en orden)

| # | Sección | Color | Rol en el relato | Nota de forma |
|---|---|---|---|---|
| 1 | **Hero (entrada)** | B&N | El umbral. Se abren las puertas de la mente. | — |
| 2 | **Herramientas y servicios** | Color | Lluvia de ideas: qué sabemos hacer y con qué. Primera sala adentro, energía creativa cruda. | Posible movimiento lateral |
| 3 | **Portfolio** | Color | Las ideas hechas realidad: los trabajos. | Carrusel semi-3D (movimiento lateral) |
| 4 | **Nosotros** | Color | Los cerebros del lugar: el equipo. | — |
| 5 | **Contacto (salida)** | B&N | La salida. *"Seguro saliste con una idea, llamanos."* | — |

Nota respecto del mapa anterior: **desaparece "Destacados"** como sección aparte, y
**aparece "Herramientas y servicios"** como primera sala del interior. El portfolio
deja de ser una grilla filtrable y pasa a ser un **carrusel semi-3D**.

---

## 5. El momento clave

La transición **Hero → Herramientas** es cuando **cruzás el umbral y explota el
color.** Es el "abrir las puertas" hecho literal: el B&N del hero da paso, de golpe,
al color de la primera sala. Es el latido central de toda la página y merece el mayor
cuidado de diseño cuando lleguemos a esa sesión.

---

## 6. Conexión entre salas

Por ahora, **solo scroll + color.** No sumamos todavía un motivo persistente que te
acompañe (tipo "la línea que te acompaña" del rediseño anterior) ni transiciones
tematizadas de "puertas/umbrales" entre cada sala. Queda como **decisión futura**,
una vez que veamos el recorrido armado con lo básico.

---

## 7. Qué NO define este spec (queda para sesiones por sección)

- Contenido y copy exacto de cada sala.
- Layout, tipografía y composición fina de cada sección.
- Animaciones concretas (cómo se arma el carrusel semi-3D, cómo explota el color,
  cómo se mueve la lluvia de ideas).
- Si hay o no un motivo conector persistente (ver punto 6).
- Assets reales (los de Motion/Campañas siguen pendientes; ver CLAUDE.md).

---

## 8. Primer paso técnico (ya acordado, en pausa)

Antes de reconstruir, se desarma el sitio actual hasta un esqueleto: hero en blanco,
nav movido a centro-arriba, y limpieza del código huérfano (grilla de portfolio,
tour, heroes por categoría, toggle de paleta, etc.). Ese desarme sigue siendo el
primer paso correcto — ahora sabemos hacia qué reconstruir. El detalle de ese desarme
está fuera de este documento (es trabajo de implementación, no de narrativa).
