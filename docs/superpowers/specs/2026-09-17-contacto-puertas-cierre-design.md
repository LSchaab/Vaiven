# Contacto — cierre del vaivén con las puertas del inicio

**Fecha:** 2026-09-17
**Sección:** Contacto (`#contacto`)
**Estado:** Diseño aprobado — pendiente plan de implementación

---

## Concepto

La web abre con las puertas de grilla **abriéndose** (hero / umbral "Abrí la cabeza")
y cierra con esas mismas puertas **cerrándose** (Contacto). Cuando se cierran, se vuelve
exactamente al umbral negro con grilla del inicio — pero ahora con un mensaje de despedida
encima. El nombre del proyecto (VAI VEN = ida y vuelta) se cumple literalmente: la última
sección devuelve a la primera imagen.

Contacto es el otro **extremo en B&N** (junto al hero), tal como ya estaba anotado en
`index.html` ("Extremos (hero/contacto) en B&N"). Esto reemplaza la nota vieja del
`CLAUDE.md` que preveía fondo lila para Contacto: **el fondo de Contacto es negro con
grilla**, no lila. El lila queda solo como acento mínimo.

## Propósito

- Trabajo principal: que el email sea el protagonista y la gente escriba.
- Redes (Instagram, X) como secundario.
- Título editorial que cierra el mensaje de la web.

## Layout (centrado, estilo Milan Compain)

```
┌─────────────────────────────────────────┐   ← negro + grilla del hero (estática)
│                                          │
│           Vení, que la seguimos.         │   ← titular grande, centrado (Montserrat, blanco)
│      Traé la idea. Nosotros ponemos      │   ← bajada corta
│              el movimiento.              │
│                                    ▟      │
│      vaivendv@gmail.com  ←────────╱       │   ← EMAIL enorme, blanco + flecha-sticker
│                                          │
│           INSTAGRAM · X                  │   ← redes chiquitas, uppercase, tracking
│                                          │
└─────────────────────────────────────────┘
```

- Alineación: **centrada** (todo el bloque).
- Fondo: **negro con la grilla del hero, estática** (sin el glow que sigue al mouse).
- Email como pieza central, tamaño display, con flecha-cursor tipo sticker apoyada.
- Redes como texto chico secundario, uppercase con tracking, separadas por `·`.
- Acento lila mínimo (flecha y/o hover de links).

## Contenido (datos reales, no placeholders)

- **Título:** "Vení, que la seguimos."
- **Bajada:** "Traé la idea. Nosotros ponemos el movimiento."
- **Email:** `vaivendv@gmail.com` → `mailto:` directo al click.
- **Instagram:** https://www.instagram.com/vaiven.dm/
- **X (Twitter):** https://x.com/vaiven_dm

> La copy final la reescribe Lourdes. El título/bajada de arriba es borrador de trabajo
> aprobado para maquetar, no texto definitivo.

## Email + flecha-cursor

- **Flecha-cursor:** sticker estático (imagen o SVG) apoyado sobre el email, como parte
  del collage — apuntándole tipo "hacé click acá". Siempre visible.
- **Click:** abre el cliente de mail (`mailto:vaivendv@gmail.com`) directo. Sin
  copiar-al-portapapeles.
- Si no hay asset de flecha todavía, se usa un SVG inline de flecha-puntero, marcado como
  reemplazable. Decorativa → `aria-hidden`.

## La transición: puertas cerrándose (desktop / coverflow)

En desktop, Nosotros es el final del recorrido pineado (`.mente-stage`). Se extiende el
recorrido con una fase final de **cierre**, reusando el patrón que ya existe (`nos-reveal`):

1. Venís de Nosotros: el equipo está centrado y quieto (iris verde). **El equipo NO se
   mueve.**
2. Al seguir scrolleando, las dos puertas de grilla entran desde los lados
   (`.puerta-izq` / `.puerta-der`, animadas al revés: de abiertas ±100% a cerradas en el
   centro) **por encima del equipo**, tapándolo. El equipo queda quieto debajo.
3. Las puertas se juntan en el centro → tapan todo → umbral negro con grilla, idéntico al
   primer frame de la web.
4. Con las puertas ya cerradas, el contenido de Contacto (título + email + redes) aparece
   **sobre la cara de las puertas cerradas** con un fade suave. La grilla de las puertas
   ES el fondo de Contacto (una sola capa — opción A).

- Todo **scroll-scrubbed** (lo controla el usuario con el scroll), consistente con el
  resto del recorrido.
- Click en "contacto" del nav lateral → smooth-scroll hasta el final del recorrido → las
  puertas terminan cerradas con el contenido de Contacto visible.
- El contenido de Contacto vive como una capa dentro del stage pineado
  (`.contacto-reveal`), igual que el equipo vive en `.nos-reveal`.

### Nota de implementación (a resolver en el plan)

Las puertas hoy están atadas a `--hero-progress` (0 cerradas → 1 abiertas) en el umbral
inicial. Para la fase de cierre necesitan un driver independiente (p. ej. una variable
`--cierre-progress` 0→1 que las lleve de abiertas a cerradas al final del recorrido), sin
romper la apertura del hero. Definir el orquestado exacto en `mente.js` / `styles.css`
durante el plan.

## Fallbacks

- **Mobile / galería (no-coverflow):** sin recorrido pineado. Contacto es una **sección
  normal** (`<section id="contacto">`) con fondo negro + grilla estática, título, email y
  redes. Sin animación de puertas (igual que Nosotros ya cambia de comportamiento en
  mobile).
- **Reduced-motion:** `mente.js` ya corta el scrub y deja el umbral estático. Contacto
  queda como sección accesible normal, sin puertas animadas. El email sigue siendo
  `mailto:` clickeable con la flecha estática.

## Estructura y detalles técnicos

- **Markup:** en `#contacto` (y su capa `.contacto-reveal` en el stage para desktop):
  - `<h2>` título
  - `<p>` bajada
  - `<a class="contacto__mail" href="mailto:vaivendv@gmail.com">` con la flecha-sticker
  - lista de redes: `<a>` Instagram + X, con `target="_blank"` y `rel="noopener"`
- **Colores (solo tokens):** fondo negro, texto blanco, bajada en `--lila` o blanco
  tenue, acento/hover en `--lila`. Sin hardcodear hex.
- **Accesibilidad:** email link real (`mailto:`); redes con `aria-label`; foco visible;
  contraste AA (blanco sobre negro sobra); flecha decorativa con `aria-hidden`.
- **Archivos afectados:**
  - `index.html` — markup de Contacto + capa `.contacto-reveal`.
  - `styles.css` — bloque nuevo `#contacto` / `.contacto-reveal`; animación de cierre de
    puertas atada al nuevo driver.
  - `mente.js` — nueva fase de cierre al final del recorrido (driver de puertas +
    reveal de Contacto), análoga a cómo `nosotros.js`/`work-carousel.js` manejan salidas.
- **Sin librerías nuevas.** Vanilla, consistente con el stack.

## Fuera de alcance (YAGNI)

- Copiar-email-al-portapapeles + toast "¡copiado!".
- Formulario de contacto.
- Redes extra (Behance/LinkedIn/TikTok) — se reemplazó TikTok por X.
- Animación de la flecha-cursor (queda estática).
- Fondo lila (descartado a favor de negro + grilla).
