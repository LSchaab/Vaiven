# VAI VEN

Sitio web de portfolio / showcase del equipo **VAI VEN**, desarrollado como proyecto de carrera.
El sitio presenta el trabajo del equipo a través de cinco disciplinas: **Ilustración y Diseño Gráfico,
Modelado 3D, Motion Graphics, Desarrollo web y Campañas publicitarias**, con una identidad visual
editorial, cinética y de alta energía construida sobre la tensión entre **orden y caos**.

🔗 **Live:** [vaiven.lourdesschaab.com](https://vaiven.lourdesschaab.com)

---

## Stack

Sitio estático, sin paso de build. Se prioriza vanilla; solo se suma una librería cuando hay una razón clara.

| Capa | Tecnología |
|---|---|
| Markup | HTML5 |
| Estilos | CSS3 (custom properties, mobile-first) |
| Interactividad | JavaScript vanilla |
| Hosting | GitHub Pages (deploy automático al hacer push a `main`) |

---

## Estructura del proyecto

```
.
├── index.html          # Home / Hero + secciones (Portfolio unificado, Nosotros, Destacados, Contacto)
├── styles.css          # Estilos globales, tokens y roles semánticos de color
├── script.js           # Interactividad general del sitio (cursor, línea de vaivén, secciones)
├── data.js             # Datos del portfolio (categorías, proyectos, tools) — sin acceso al DOM
├── portfolio-grid.js   # Filtro + render del portfolio unificado (categoría, programa, búsqueda)
├── hero-motion.js      # Parallax del hero, guiado por puntero (respeta reduced-motion)
├── hero-3d.js          # Hero 3D con Three.js — actualmente sin montar en ninguna página (ver CLAUDE.md)
├── category-heroes.js  # Heroes de typewriter/kinetic por categoría — ídem, sin montar por ahora
├── resources/          # Imágenes, logos, íconos, texturas y fotos del equipo (nosotros/)
│
│   # Obra por disciplina
├── 3d/                 # Modelado 3D — renders y mallas (caja_fantasia, personaje_toon, etc.)
├── diseno_grafico/     # Ilustración y Diseño Gráfico — posters y su proceso
├── motions/            # Motion Graphics
├── campanas/           # Campañas publicitarias
│
│   # Proyecto y contexto
├── specs/              # Especificaciones de features del sitio
├── docs/               # Documentación de trabajo (planes, notas)
├── CNAME               # Dominio personalizado para GitHub Pages
└── CLAUDE.md           # Guía de contexto del proyecto (identidad visual, paleta, tipografía)
```

---

## Desarrollo local

No hay paso de build: alcanza con servir la carpeta con un servidor estático.

```bash
# Opción A — Python
python3 -m http.server 8080
# luego abrir http://localhost:8080

# Opción B — Node
npx serve .
```

---

## Identidad visual

- **Keywords:** Cinético · Extremos · Intensidad · Movimiento · Tensión
- **Tipografía:** Montserrat Alternates (tipografía única; la jerarquía se logra con peso, tamaño y caja).
- **Paleta:** definida en `Mode 1.tokens.json` (export de Figma) como única fuente de verdad.
  En el código vive como CSS custom properties (`var(--azul)`, `var(--naranja)`, etc.).
  **Nunca se hardcodea un hex** — siempre se referencia un token.
- **Idioma:** contenido en español (rioplatense); comentarios de código en inglés.

Para la guía completa de diseño, paleta y decisiones del proyecto, ver [`CLAUDE.md`](./CLAUDE.md).
