// data.js — shared, side-effect-free data module for the unified portfolio.
// No DOM access here on purpose: this file is loaded by BOTH index.html (the
// live site) at some point possibly by tooling/tests, so it must be safe to
// evaluate outside a browser context. Exposes window.VaivenData.
//
// STATUS: copy fields below are still Claude-drafted placeholders (from
// specs/01 and specs/02) except where noted — Lourdes is rewriting the
// per-project `copy` field herself (see docs/superpowers/specs/2026-09-07-
// storytelling-redesign.md, sección 6). `autor` is left as TODO for every
// project: we don't have a real mapping of who made what, and inventing one
// would misattribute someone's work — fill these in before shipping.

(function () {
    "use strict";

    // --- Categories -------------------------------------------------------
    // title/desc: real copy for 3d & motion (already approved); web/grafico/
    // campanas carry the Spec #1 draft copy, still pending Lourdes' edit.
    var CATEGORIES = {
        "3d": {
            title: "3D",
            desc: "No es magia, es Cinema 4D, Blender, ZBrush y Substance, pero queda como magia. El realismo es nuestro extremo, y también el delirio de crear cosas que todavía no existen.",
        },
        "web": {
            title: "Desarrollo Web",
            desc: "SE COMPILA, SE ROMPE, SE ARREGLA. Achicamos la distancia entre el Figma y el navegador de verdad. Acá el pixel perfect se pelea con el deadline, y cada bug es una excusa para iterar más rápido.",
        },
        "grafico": {
            title: "Diseño Gráfico",
            desc: "CORTAMOS, PEGAMOS, ROMPEMOS LA GRILLA. Diseño que no pide permiso: tipografía que se superpone, capas que casi no calzan, orden que convive con el quilombo. Si entra en una grilla perfecta, no es nuestro.",
        },
        "motion": {
            title: "Motion Graphics",
            desc: "Acá nada se queda quieto. After Effects, Cinema 4D y litros de café para que todo se mueva como tiene que moverse… o como nunca te lo imaginaste. El movimiento es el mensaje.",
        },
        "campanas": {
            title: "Campañas Publicitarias",
            desc: "HABLAMOS FUERTE PORQUE NADIE ESCUCHA BAJITO. Campañas pensadas para parar el scroll, no para acompañarlo. Ideas con gancho, ejecutadas para que se note — en la calle, en la pantalla, donde sea.",
        },
    };

    // --- Tools (filter taxonomy from specs/02) -----------------------------
    // No logo assets exist yet (specs/02 assumed a resources/logos/ folder
    // that was never actually added — see the redesign spec's discrepancy
    // note). Filter chips render as text pills for now; swap to icons by
    // adding a `logo` path here once real assets exist.
    var TOOLS = {
        "blender": { label: "Blender" },
        "substance": { label: "Substance 3D" },
        "after-effects": { label: "After Effects" },
        "illustrator": { label: "Illustrator" },
        "photoshop": { label: "Photoshop" },
        "figma": { label: "Figma" },
        "html": { label: "HTML" },
        "css": { label: "CSS" },
        "js": { label: "JS" },
        "php": { label: "PHP" },
    };

    // --- Projects -----------------------------------------------------------
    // Flat list (not nested per category) so the unified grid can filter
    // across all of them at once. Fields:
    //   id        — stable slug, unique
    //   categoria — key into CATEGORIES
    //   titulo    — project title
    //   copy      — 1-2 line presentation. STILL A DRAFT (from specs/01's
    //               blurbs) — Lourdes is rewriting these herself.
    //   autor     — TODO: nadie asignado todavía. No inventar nombres.
    //   programas — array of TOOLS keys
    //   media     — "imagen" | "video". motion & campanas are confirmed
    //               video content (not yet uploaded); the rest are image-based
    //               (renders/posters) per the existing asset folders.
    //   thumb     — path to an existing asset used as a stand-in thumbnail,
    //               where one exists in the repo already; null if none yet.
    var PROYECTOS = [
        // Modelado 3D
        { id: "3d-craneo-roto", categoria: "3d", titulo: "Cráneo Roto", copy: "Estudio de anatomía low-poly con textura procedural.", autor: "TODO", programas: ["blender", "substance"], media: "imagen", thumb: "3d/personaje_toon/pj_toon_mesh.jpeg" },
        { id: "3d-objeto-cotidiano", categoria: "3d", titulo: "Objeto Cotidiano #04", copy: "Render fotorrealista de un objeto que no debería existir.", autor: "TODO", programas: ["blender", "substance"], media: "imagen", thumb: "3d/caja_fantasia/RENDER1.png" },
        { id: "3d-personaje-estatica", categoria: "3d", titulo: "Personaje: Estática", copy: "Rigging y pose de un personaje original para animación.", autor: "TODO", programas: ["blender"], media: "imagen", thumb: "3d/personaje_toon/pj_toon_sintextura.jpeg" },
        { id: "3d-entorno-abandonado", categoria: "3d", titulo: "Entorno Abandonado", copy: "Escena ambiental con iluminación volumétrica.", autor: "TODO", programas: ["blender", "substance"], media: "imagen", thumb: "3d/maquinaexp_laserenisima/render_mesh.png" },
        { id: "3d-prop-pack-ciudad", categoria: "3d", titulo: "Prop Pack: Ciudad", copy: "Set de props modulares para escenas urbanas.", autor: "TODO", programas: ["blender"], media: "imagen", thumb: "3d/maquinaexp_laserenisima/RenderConPost1-01.png" },

        // Motion Graphics — VIDEO (por confirmar / a subir)
        { id: "motion-loop-pulso", categoria: "motion", titulo: "Loop: Pulso", copy: "Animación en loop de 8 segundos, tipografía kinética.", autor: "TODO", programas: ["after-effects", "illustrator"], media: "video", thumb: null },
        { id: "motion-ident-vaiven", categoria: "motion", titulo: "Ident VAI VEN", copy: "Cortina de marca de 5 segundos para redes.", autor: "TODO", programas: ["after-effects", "illustrator"], media: "video", thumb: null },
        { id: "motion-explainer", categoria: "motion", titulo: "Explainer: Cómo Funciona", copy: "Motion explicativo con iconografía custom.", autor: "TODO", programas: ["after-effects", "illustrator"], media: "video", thumb: null },
        { id: "motion-transicion-caotica", categoria: "motion", titulo: "Transición Caótica", copy: "Estudio de transiciones entre escenas.", autor: "TODO", programas: ["after-effects"], media: "video", thumb: null },
        { id: "motion-titulo-extremos", categoria: "motion", titulo: "Título Animado: Extremos", copy: "Secuencia de títulos para un corto.", autor: "TODO", programas: ["after-effects"], media: "video", thumb: null },

        // Desarrollo Web
        { id: "web-landing-estudio-x", categoria: "web", titulo: "Landing: Estudio X", copy: "Sitio one-page con scroll-driven animation.", autor: "TODO", programas: ["figma", "html", "css", "js"], media: "imagen", thumb: null },
        { id: "web-dashboard-interno", categoria: "web", titulo: "Dashboard Interno", copy: "Panel de datos con componentes reutilizables.", autor: "TODO", programas: ["figma", "html", "css", "js", "php"], media: "imagen", thumb: null },
        { id: "web-ecommerce-capsula", categoria: "web", titulo: "E-commerce Cápsula", copy: "Tienda pequeña con carrito funcional.", autor: "TODO", programas: ["figma", "html", "css", "js", "php"], media: "imagen", thumb: null },
        { id: "web-prototipo-interactivo", categoria: "web", titulo: "Prototipo Interactivo", copy: "Experimento de interacción con canvas/WebGL.", autor: "TODO", programas: ["html", "css", "js"], media: "imagen", thumb: null },
        { id: "web-refactor-sitio-viejo", categoria: "web", titulo: "Refactor: Sitio Viejo", copy: "Migración de un sitio legacy a stack moderno.", autor: "TODO", programas: ["html", "css", "js", "php"], media: "imagen", thumb: null },

        // Diseño Gráfico
        { id: "grafico-identidad-ruido", categoria: "grafico", titulo: "Identidad: Estudio Ruido", copy: "Sistema de marca completo, de logo a papelería.", autor: "TODO", programas: ["illustrator"], media: "imagen", thumb: null },
        { id: "grafico-editorial-revista-cero", categoria: "grafico", titulo: "Editorial: Revista Cero", copy: "Diagramación de una revista independiente.", autor: "TODO", programas: ["illustrator", "photoshop"], media: "imagen", thumb: null },
        { id: "grafico-serie-afiches", categoria: "grafico", titulo: "Serie de Afiches", copy: "Colección de posters experimentales, técnica mixta.", autor: "TODO", programas: ["illustrator", "photoshop"], media: "imagen", thumb: "diseno_grafico/Poster_interstellar/FINAL TDI2 AFICHE JPG.jpg" },
        { id: "grafico-packaging-linea-cruda", categoria: "grafico", titulo: "Packaging: Línea Cruda", copy: "Diseño de packaging para producto artesanal.", autor: "TODO", programas: ["illustrator", "photoshop"], media: "imagen", thumb: null },
        { id: "grafico-tipografia-custom", categoria: "grafico", titulo: "Tipografía Custom", copy: "Fuente experimental diseñada desde cero.", autor: "TODO", programas: ["illustrator"], media: "imagen", thumb: null },

        // Campañas Publicitarias — VIDEO (por confirmar / a subir)
        { id: "campanas-ruptura", categoria: "campanas", titulo: "Campaña: Ruptura", copy: "Campaña 360° para lanzamiento de producto.", autor: "TODO", programas: ["illustrator", "photoshop"], media: "video", thumb: null },
        { id: "campanas-spot-15s", categoria: "campanas", titulo: "Spot: 15 Segundos", copy: "Guion y storyboard para spot de TV/redes.", autor: "TODO", programas: ["after-effects", "illustrator"], media: "video", thumb: null },
        { id: "campanas-activacion-marca", categoria: "campanas", titulo: "Activación de Marca", copy: "Concepto de activación experiencial en vía pública.", autor: "TODO", programas: ["illustrator", "photoshop"], media: "video", thumb: null },
        { id: "campanas-serie-digital", categoria: "campanas", titulo: "Serie Digital", copy: "Set de piezas para pauta digital, formato cuadrado y vertical.", autor: "TODO", programas: ["photoshop", "illustrator"], media: "video", thumb: null },
        { id: "campanas-rebranding", categoria: "campanas", titulo: "Rebranding: Antes/Después", copy: "Caso de estudio de un reposicionamiento de marca.", autor: "TODO", programas: ["illustrator", "photoshop"], media: "video", thumb: null },
    ];

    window.VaivenData = { CATEGORIES: CATEGORIES, TOOLS: TOOLS, PROYECTOS: PROYECTOS };
})();
