# Storytelling y portfolio unificado — spec de rediseño

Estado: 🟡 Validado por el equipo (2026-09-07) — quedan detalles de copy por resolver, pero la estructura y el enfoque están confirmados.
Contexto: surge de una revisión grupal donde se identificó que la web actual no logra buen storytelling ni un uso gráfico coherente con los recursos que la marca dice usar (grunge, recortes tipo revista, blur). Referencia externa: resetagencia.online.

**Decisiones confirmadas por el equipo:**
1. Se elimina la navegación por categoría separada (`portfolio.html?cat=`) — el portfolio pasa a ser una sola sección unificada dentro de la home.
2. El "vaivén emocional" no se representa como una sección abstracta aparte, sino asignando una emoción a cada sección real de la página (ver punto 3.2 actualizado) — evitando que sea solo un tramo "negativo" del recorrido.
3. Cada proyecto del portfolio suma copy mínimo de presentación, además de autor y programas usados (ver punto 6).

## 1. Diagnóstico — qué le falta a la web actual

Repasando `index.html`, `portfolio.js` y `styles.css` tal como están hoy:

- El sitio **cuenta** que hay un vaivén emocional (está en el copy del ADN y el manifiesto) pero no lo **hace sentir** en la navegación. Uno entra, lee texto, mira un hero por categoría, y listo — no hay tensión, no hay un arco.
- Los recursos gráficos que la marca definió como propios — fotos blureadas/distorsionadas, recortes estilo collage en blanco y negro o duotono, texturas grunge, misceláneas técnicas (líneas, grillas, coordenadas) — existen como archivos sueltos en `resources/textures/` pero casi no se usan en la interfaz real. La web se ve más limpia/corporativa que "extremista y perfeccionista a la vez", que es literalmente el ADN del grupo.
- Separar el portfolio en 5 páginas por categoría (`portfolio.html?cat=...`) diluye el recorrido: cada categoría es una isla, no hay una sola narrativa que uno atraviesa de punta a punta. Esto además contradice la idea de "ir y venir" — cada categoría es un camino lineal separado, no un vaivén.
- No hay autoría visible por proyecto (quién lo hizo, con qué programa), algo que el equipo ahora quiere mostrar.
- No hay ningún elemento que invite a quedarse, tocar, descubrir algo oculto. Es un sitio para recorrer una vez y listo.

## 2. Por qué resetagencia.online funciona (análisis)

Entré al sitio y lo recorrí. Estas son las técnicas concretas, no solo la sensación:

- **Textura de fondo full-bleed**: un grano/paper-noise oscuro con líneas verticales tipo rotura de página, presente en todo el scroll (no es una imagen de fondo estática por sección, es una capa continua). Genera la sensación "sucia"/grunge sin depender de fotos.
- **Cursor propio**: reemplazan el puntero por un círculo delgado que sigue al mouse con un pequeño delay/inercia. Es barato de hacer y cambia por completo la sensación de "estar tocando algo" en vez de "estar leyendo una página".
- **Estructura narrativa en tres actos, numerados**: `(01) DISEÑAR`, `(02) CONECTAR`, `(03) REINVENTAR` — cada uno con un verbo corto como título y una frase manifiesto más larga debajo. Es literalmente la misma lógica que ya usan ustedes en el manifiesto (momentos: calma/control, ansiedad, hipervigilancia...) pero Reset la trajo a la home en vez de dejarla solo en el video del manifiesto.
- **Tipografía "doblada"/eco**: el copy de cada acto se ve con las letras dibujadas dos veces superpuestas con un leve corrimiento (efecto de duplicado, no es una fuente especial) — da una textura de vibración/glitch usando solo CSS/JS sobre texto real. Esto es prácticamente el mismo truco que ya tienen en `script.js` con el efecto "erratic" (que envuelve cada letra en un span con jitter aleatorio) — no hay que inventar nada nuevo, solo extender esa técnica.
- **Numeración entre paréntesis como recurso gráfico** (`( 01 )`, `( PROGRAMAS )`): funciona como una "marca de medición/anotación técnica" — un recurso que su propio moodboard de Branding (TP3) ya pide explícitamente: *"Elementos de orden y estructura, como líneas, grillas, figuras geométricas o marcas de medición, que contrasten con el desorden."* Reset lo resolvió con tipografía sola, sin ilustrar nada.
- **Portfolio embebido, no separado**: proyectos, programas usados y equipo viven en la misma página continua, no en subpáginas por disciplina.
- **Paleta acotada con un solo acento neón** sobre negro: el contraste hace que cualquier elemento de color se sienta importante. Ustedes tienen 11 colores — no hace falta reducir la paleta, pero sí ser más deliberados con cuándo aparece cada uno (ver punto 5, paleta narrativa).

## 3. Estructura de página propuesta (single page, sin subpáginas por categoría)

Reemplaza el esquema actual (home + 5 `portfolio.html?cat=`) por una sola página continua, navegación por anclas (esto ya lo tienen resuelto):

1. **Hero / apertura** — versión reforzada del hero actual. Frase ADN o una derivada corta como entrada ("La chispa que enciende y el ancla que sostiene"), con el efecto 3D que ya existe (`hero-3d.js`) como elemento central, no decorativo.
2. **Emoción por sección, no un tramo aparte** — en vez de meter un bloque abstracto de "actos emocionales" desconectado del contenido real (y evitar que el vaivén se sienta como solo la parte "negativa" del recorrido), cada sección real de la página ya tiene una emoción propia, sin forzar nada:
   - **Nosotros/equipo → Ansiedad/Obsesión.** Es honesto: son el grupo que se define a sí mismo como "extremistas, obsesivos, ansiosos y perfeccionistas" (TP1 ADN). Mostrar el proceso real, un poco caótico, con ese mismo tono irónico-cómplice de la marca (no como confesión dramática, sino como autoburla — "somos así, y funciona").
   - **Cómo trabajamos / proceso → Control/Calma.** El contraste: el ancla, el método, el orden que aparece en medio de esa vorágine (literal del ADN: "siempre hay uno que tira el ancla"). Esta sección puede ser chica — un statement de método más que un bloque largo.
   - **Portfolio → Diversión/Alegría.** Es el "más allá" que menciona el TP6 Experiencia: la recompensa del recorrido, donde el vaivén se resuelve en algo que se disfruta. Los filtros (categoría/programa/búsqueda) pueden tratarse como algo lúdico, no como una herramienta utilitaria fría.
   - **Contacto → Calma.** El cierre, el lugar de aterrizaje después de todo el ida y vuelta.
   
   Cada una de estas secciones cambia de acento de color según su emoción (ver "paleta narrativa" en la sección 5) y usa el efecto "erratic" existente donde haya copy largo. La sensación de vaivén sale de pasar de una sección tensa (Nosotros) a una calma (Cómo trabajamos) a una divertida (Portfolio) a otra calma (Contacto) — no de narrar las 6 emociones del recorrido físico una por una, que tiene sentido en la experiencia inmersiva pero se sentiría forzado y "bajón" si se replica literal en la web.
3. **Portfolio unificado** — un solo grid con los ~25 proyectos, filtrable por categoría y por herramienta/programa usado (esto ya está diseñado en `specs/02-explora-todo-page.md` y su plan en `docs/superpowers/plans/2026-08-01-explora-todo-page.md`: taxonomía de 10 tools, búsqueda de texto, combinación AND). La diferencia clave respecto a ese spec: en vez de vivir en una página aparte `explora.html`, esta sección **es** el portfolio de la home — no hace falta mantener las 5 páginas de categoría en paralelo. Cada tarjeta suma autor + programa(s) usados (ver sección 6).
4. **Nosotros / equipo** — ya existe contenido (`resources/nosotros/*.png`), se puede enriquecer con el "quién hizo qué" del portfolio (ej: al pasar el mouse por una foto del equipo, resaltar sus proyectos en la sección anterior).
5. **Contacto** — igual que hoy.

## 4. Recursos gráficos a explotar (ya definidos en la marca, subutilizados en la web)

Todo esto está pedido explícitamente en TP3/TP4 (Branding y Personalidad de marca) y casi no aparece en el sitio hoy:

- **Recortes estilo collage en blanco y negro o duotono** para las fotos de proyectos — aplicar un filtro CSS (`grayscale` + `contrast`, o un duotono con `mix-blend-mode` usando dos colores de la paleta) sobre los thumbnails del portfolio, en vez de mostrarlos a color plano. El manifiesto final incluso menciona un recurso concreto: efecto *halftone* como recorte — se puede lograr con un SVG filter o un patrón de puntos superpuesto.
- **Fotografías parcialmente blureadas/distorsionadas** — no solo como estética estática: puede ser interactivo (ver "juego de blur" en recursos web).
- **Texturas grunge** (`resources/textures/grunge_texture.webp`, ya están en el repo) — usarlas como capa de fondo continua en toda la página, no solo en algún fondo suelto.
- **Misceláneas técnicas** (líneas, grillas, coordenadas, asteriscos, el ojo, el corazón, la mano con lupa — todos ya diseñados y mencionados en el Manifiesto) — usarlas como elementos que acompañan el scroll, no como ilustración fija. Encajan perfecto con la idea de "línea que te acompaña" de Reset.
- **Tipografía**: CLAUDE.md fija Montserrat Alternates como única tipografía, con jerarquía solo por peso/tamaño/mayúsculas. Para lograr el look "estirado" que mencionás sin romper esa regla, conviene usar `font-stretch`/transformaciones CSS (`scaleX`) sobre la misma tipografía en vez de sumar una fuente nueva — mantiene la regla y da el efecto.

## 5. Recursos web / interactivos (con lo que ya tienen + lo que sumaría Claude Code)

Todo lo siguiente es vanilla JS/CSS, consistente con la regla "Default to vanilla" de CLAUDE.md, y todo es implementable con Claude Code porque son patrones bien documentados (cursor custom, scroll-linked SVG, filtros CSS, IntersectionObserver):

- **Cursor con blur/deformación** — esto ya está anotado como concepto pendiente en las instrucciones del proyecto ("el cursor tiene efecto de blur/deformación"), pero no está construido todavía. Se resuelve con un div que sigue al mouse (extendiendo el parallax que ya existe en `script.js`) más un filtro SVG `feTurbulence` + `feDisplacementMap` aplicado a lo que queda debajo del cursor. Es el mismo espíritu que el círculo de Reset, pero más "sucio", acorde a la marca.
- **La línea que te acompaña** — un `<svg>` fijo con un path tipo onda (sube y baja, literal "vaivén") cuyo `stroke-dashoffset` se ata al scroll total de la página. Puede vivir en el costado, cerca de la sidebar-nav que ya existe. Es barato y muy efectivo para dar sensación de recorrido con dirección.
- **Juego de blur en fotos (y video)** — thumbnails de proyectos que arrancan blureados y se destapan al hacer hover o al centrarse en el viewport (`IntersectionObserver` + transición de `filter: blur()`). Convierte el recurso estético (fotos blureadas) en una interacción real de "descubrir". Como Motion y Campañas van a ser video, el mismo tratamiento tiene que aplicarse sobre el poster/primer frame del video (blureado hasta que se hace foco, ahí recién arranca la reproducción).
- **Juego con los programas** — ya existe la taxonomía de herramientas diseñada en el spec 02 (`data.js` con TOOLS: blender, illustrator, photoshop, figma, etc.). En vez de usarla solo como filtro, se puede sumar una capa que, al hacer hover sobre una tarjeta de proyecto, revele los logos de los programas usados con una animación (fade/stagger), y quién lo hizo.
- **Paleta narrativa** — ya tienen `palette.js` (toggle base/alt vía el ícono del ojo). Se puede extender la misma infraestructura de variables CSS para que cada sección dispare su propio acento de color según la emoción que le tocó (punto 3.2): Nosotros = naranja (ansiedad/obsesión), Cómo trabajamos = azul-oscuro (control/calma), Portfolio = amarillo (diversión), Contacto = verde-agua-claro (calma/cierre). Se resuelve con el mismo mecanismo de `data-palette`/CSS custom properties que ya existe, solo con más estados en vez de un simple toggle base/alt.
- **Easter eggs** — ya hay precedente técnico: `tour.js` soporta `?tour=reset` como flag de desarrollo, y `script.js` tiene el efecto "erratic" de scramble de texto. Ideas concretas: click en el logo dispara el scramble sobre el propio wordmark; N segundos de inactividad activan una micro-animación del ancla/chispa (motivo del ADN); un scroll "en falso" (ida y vuelta rápida) desbloquea un mensaje oculto, jugando literalmente con el concepto de vaivén.
- **3D**: sí, tiene sentido seguir usándolo — ya está resuelto técnicamente y bien (`hero-3d.js` con fallback si no hay WebGL o si el usuario prefiere menos movimiento). Recomendación: no lo repliquen en las 5 categorías como hoy, sino que lo concentren en 1-2 momentos fuertes (el hero principal, y quizás un objeto recurrente tipo "ancla" que aparece en transiciones de scroll) para que impacte sin pesar en performance.

## 6. Portfolio unificado con crédito de autoría y copy mínimo

Sobre la base ya diseñada en `specs/02-explora-todo-page.md` y su plan de implementación:

- Extraer `CATEGORIES`/proyectos a un `data.js` compartido (esto ya está redactado en `docs/superpowers/plans/2026-08-01-explora-todo-page.md`, paso 1 — no hay que rediseñarlo, solo ejecutarlo).
- Cada proyecto suma estos campos (el modelo de datos por proyecto queda así):
  - `titulo` — ya contemplado.
  - `autor` — quién del equipo lo hizo (puede ser más de una persona si fue colaborativo).
  - `programas` — array de tools usadas (taxonomía ya definida en spec 02: blender, substance, after-effects, illustrator, photoshop, figma, html, css, js, php).
  - `copy` — presentación mínima del proyecto, 1-2 líneas. No es una descripción técnica ("hecho en Blender, 4 renders") sino una frase corta en el tono de marca (irónica/cómplice/cercana) que dé contexto de qué es y por qué existe — el equivalente a la copy que ya se había redactado en `specs/01-finishing-portfolio-categories.md` para las categorías, pero a nivel de cada proyecto individual. Esto es justamente lo que hoy falta en el código real (`portfolio.js` sigue con placeholders) y hay que escribir antes de dar por implementado el spec 01. **La redacta Lourdes.**
  - Todos estos campos se muestran juntos al hacer hover/reveal de la tarjeta (punto 5): copy + autor + logos de programas.
- Filtro por categoría (single-select) + filtro por programa (multi-select) + búsqueda de texto, tal como está especificado — pero embebido como sección de la home, no como página aparte.
- Pendiente de contenido real: `motions/` y `campanas/` siguen sin assets ni copy. Confirmado que ambas categorías van a ser **video** (no fotos/renders estáticos como el resto) — Lourdes no sube ese contenido, lo aporta el equipo. Esto tiene una consecuencia técnica directa: la tarjeta de proyecto y sus tratamientos (duotono/grayscale del punto 4, blur-reveal del punto 5) tienen que funcionar tanto sobre `<img>` como sobre `<video>`/su poster frame — no son tratamientos exclusivos de foto. Conviene que `data.js` contemple un campo de tipo de media (`imagen` | `video`) por proyecto para que el grid renderice cada tarjeta como corresponde.

## 7. Para llevarlo a Claude Code — orden sugerido de trabajo

1. Extraer `data.js` (categorías + proyectos + tools + autor) — el contenido ya está borrador en el plan del 2026-08-01, solo falta sumarle el campo `autor` y ejecutarlo.
2. Unificar el portfolio: nueva sección en `index.html` que reemplace el link a `portfolio.html` por categoría, reusando el grid/filtro ya especificado en spec 02.
3. Resolver la discrepancia pendiente de `specs/01`: escribir la copy real de `grafico` y `campanas` (hoy siguen en placeholder) — esto hay que hacerlo de todos modos para tener contenido real en el grid unificado.
4. Construir la sección "Vaivén narrativo" (actos numerados + paleta narrativa), extendiendo `palette.js`.
5. Construir el cursor con blur/deformación (extiende el parallax de `script.js`).
6. Construir la línea de scroll tipo onda (SVG + `stroke-dashoffset`).
7. Sumar el juego de blur-reveal y el reveal de programas/autoría en las tarjetas de proyecto.
8. Acotar el 3D a 1-2 momentos clave y sumar 2-3 easter eggs chicos.
9. Actualizar `CLAUDE.md`/specs para que documenten el nuevo esquema de una sola página con portfolio unificado (y marcar `specs/01` y `specs/02` como superados por este documento).

## Preguntas resueltas (2026-09-07)

- Copy mínimo de cada proyecto: lo redacta Lourdes.
- Contenido de Motion Graphics y Campañas: ambas categorías van a ser video, aportado por el equipo (no es algo que Lourdes tenga que subir). Falta solo definir cuándo llega ese material para poder completar el grid unificado.

## Estado de implementación (2026-09-07, primera pasada)

Hecho en esta pasada (ver también CLAUDE.md, sección "Known gaps"):

- Portfolio unificado: se eliminaron `portfolio.html`/`.css`/`.js` y las 5 páginas por categoría. Nuevo `data.js` (categorías + 25 proyectos: título, copy, autor, programas, tipo de medio) + `portfolio-grid.js` (filtro por categoría, por programa, búsqueda de texto, contador, estado vacío, reset) embebido en `#portfolio` de `index.html`.
- Emoción por sección: implementado como override acotado de `--accent-primary` vía `[data-emotion]` — Portfolio (diversión/amarillo), Nosotros (ansiedad/naranja, ya era el default), Contacto (calma/verde-agua-claro). Hero y Destacados quedan sin asignar todavía.
- Cursor con blur/deformación: `.cursor-follower` + filtro SVG `#cursor-distort` (feTurbulence/feDisplacementMap), con lag/lerp, desactivado en reduced-motion y touch.
- "Línea que te acompaña": adaptada de scroll-linked a section-linked, porque el sitio **no scrollea** (secciones fijas, nav lateral) — este es un ajuste real sobre lo que proponía este documento originalmente. El punto se mueve entre 5 posiciones en zigzag según la sección activa (`window.VaivenNav.onSectionChange`).
- Juego de blur en las tarjetas de proyecto: arrancan blureadas, se destapan con hover/foco. Preparado para funcionar igual sobre el poster de un video cuando Motion/Campañas suban contenido real.

Discrepancias encontradas al implementar (no eran evidentes solo leyendo los specs):

- `resources/logos/` (12 logos de programas) que el spec 02 asumía que ya existía **no existe en el repo**. Los filtros de programa son chips de texto por ahora, no íconos.
- El sitio no tiene scroll continuo — es de secciones fijas con nav lateral. Cualquier propuesta futura que asuma "scroll" tiene que adaptarse a este modelo (o se decide migrar a scroll continuo, que es un cambio más grande).

Deliberadamente no incluido en esta pasada (para no entregar algo a medio romper):

- Reintegrar `hero-3d.js`/`category-heroes.js` en el hero principal — quedaron sin montar en ninguna página.
- Animaciones de entrada específicas por categoría para `grafico`/`campanas` (print misregistration / marquee flicker, del spec 01).
- Easter eggs.
- Copy final de proyectos y categorías, y autoría real — quedan placeholders marcados explícitamente (`autor: "TODO"`), a completar por el equipo.
