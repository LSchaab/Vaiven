// Portfolio data — single source for the 3D carousel (portfolio.js consumes it).
// Categories are in the same order/hue as DISCIPLINES/BEAT_HUE in mente.js so the
// portfolio re-uses the brain's per-discipline color. Keep the two in sync.
// Copy note: work titles derived from filenames are PROVISIONAL placeholders;
// authors are intentionally omitted (do not invent — see CLAUDE.md).
(() => {
    "use strict";
    // hue per discipline — mirror of BEAT_HUE in mente.js (deg).
    window.PORTFOLIO = [
        {
            key: "grafico",
            label: "Ilustración y Diseño Gráfico",
            hue: 340,
            portada: null, // 16:9 cover pending (design team) → brain-hue fallback
            works: [
                { title: "Inari",        portada: null, media: "image" },
                { title: "Lightyear",    portada: null, media: "image" },
                { title: "Perfume",      portada: null, media: "image" },
                { title: "Infinity War", portada: null, media: "image" },
                { title: "Interstellar", portada: null, media: "image" },
            ],
        },
        {
            key: "modelado3d",
            label: "Modelado 3D",
            hue: 200,
            portada: null,
            works: [
                { title: "Caja de fantasía",        portada: null, media: "image" },
                { title: "Máquina expendedora",     portada: null, media: "image" },
                { title: "Personaje toon",          portada: null, media: "image" },
            ],
        },
        {
            key: "motion",
            label: "Motion Graphics",
            hue: 10,
            portada: "resources/portadas/motion/sandman.png", // category cover
            works: [
                { title: "The Sandman",      portada: "resources/portadas/motion/sandman.png",          media: "video" },
                { title: "Club Ruido",       portada: "resources/portadas/motion/clubRuido.png",        media: "video" },
                { title: "Ctrl Lost",        portada: "resources/portadas/motion/ctrlLostt.png",        media: "video" },
                { title: "Tiger Woods",      portada: "resources/portadas/motion/tiger_woods.png",      media: "video" },
                { title: "Beautiful",        portada: "resources/portadas/motion/beautiful_webinar.png", media: "video" },
            ],
        },
        {
            key: "web",
            label: "Desarrollo web",
            hue: 140,
            portada: null,
            works: [], // assets pending
        },
        {
            key: "campanas",
            label: "Campañas publicitarias",
            hue: 210,
            portada: "resources/portadas/campanas/portadas.webp",
            works: [
                { title: "Proyecto Hocicos Contentos", portada: "resources/portadas/campanas/portadas.webp", media: "video" },
            ],
        },
    ];
})();
