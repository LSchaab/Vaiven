// Portfolio data — single source consumed by work-carousel.js (carrusel) y portfolio-modal.js (modal).
// Portada: imagen para la card. En works de video, el carrusel desktop loopea el video (la portada es su poster) y la galería mobile muestra la portada.
// Media "video" + video: field → card loopea el mp4 muted; modal lo muestra con controles.
// Media "video" + galeria → modal muestra video primero, luego imágenes.
(() => {
    "use strict";
    window.PORTFOLIO = [
        {
            key: "grafico",
            label: "Ilustración y Diseño Gráfico",
            hue: 340,
            portada: "resources/portfolio/grafico/inari/inari_mockup.webp",
            tools: ["illustrator", "photoshop"],
            works: [
                {
                    title: "Inari",
                    portada: "resources/portfolio/grafico/inari/inari_mockup.webp",
                    media: "image",
                    galeria: [
                        "resources/portfolio/grafico/inari/01.webp",
                        "resources/portfolio/grafico/inari/02.webp",
                    ],
                    proceso: "resources/portfolio/grafico/inari/proceso.mp4",                },
                {
                    title: "Lightyear",
                    portada: "resources/portfolio/grafico/lightyear/portada.webp",
                    media: "image",
                    galeria: [
                        "resources/portfolio/grafico/lightyear/05.webp",
                        "resources/portfolio/grafico/lightyear/06.webp",
                        "resources/portfolio/grafico/lightyear/07.webp",
                    ],
                    proceso: "resources/portfolio/grafico/lightyear/proceso.mp4",                },
                {
                    title: "Perfume",
                    portada: "resources/portfolio/grafico/perfume/mopckup.webp",
                    media: "image",
                    galeria: [
                        "resources/portfolio/grafico/perfume/01.webp",
                        "resources/portfolio/grafico/perfume/02.webp",
                    ],
                    proceso: "resources/portfolio/grafico/perfume/proceso.mp4",                },
                {
                    title: "Infinity War",
                    portada: "resources/portfolio/grafico/infinityWar/infinity_war_mockup.webp",
                    media: "image",
                    galeria: [
                        "resources/portfolio/grafico/infinityWar/01.webp",
                    ],
                    proceso: "resources/portfolio/grafico/infinityWar/proceso.mp4",                },
                {
                    title: "Interstellar",
                    portada: "resources/portfolio/grafico/interstellar/mockup.webp",
                    media: "image",
                    galeria: [
                        "resources/portfolio/grafico/interstellar/01.webp",
                        "resources/portfolio/grafico/interstellar/02.webp",
                    ],
                    proceso: "resources/portfolio/grafico/interstellar/animado.mp4",                },
                {
                    title: "Harley",
                    portada: "resources/portfolio/grafico/harley/Harley_portada.webp",
                    media: "image",
                    galeria: [
                        "resources/portfolio/grafico/harley/Harley_8.webp",
                        "resources/portfolio/grafico/harley/harley_mockup.webp",
                    ],
                    proceso: "resources/portfolio/grafico/harley/proceso.mp4",                },
                {
                    title: "Mangeki",
                    portada: "resources/portfolio/grafico/mangeki/01.webp",
                    media: "image",
                    galeria: [
                        "resources/portfolio/grafico/mangeki/02.webp",
                        "resources/portfolio/grafico/mangeki/03.webp",
                        "resources/portfolio/grafico/mangeki/04.webp",
                        "resources/portfolio/grafico/mangeki/05.webp",
                        "resources/portfolio/grafico/mangeki/06.webp",
                        "resources/portfolio/grafico/mangeki/07.webp",
                        "resources/portfolio/grafico/mangeki/08.webp",
                        "resources/portfolio/grafico/mangeki/09.webp",
                        "resources/portfolio/grafico/mangeki/10.webp",
                        "resources/portfolio/grafico/mangeki/11.webp",
                        "resources/portfolio/grafico/mangeki/12.webp",
                        "resources/portfolio/grafico/mangeki/13.webp",
                        "resources/portfolio/grafico/mangeki/14.webp",
                        "resources/portfolio/grafico/mangeki/15.webp",
                        "resources/portfolio/grafico/mangeki/16.webp",
                        "resources/portfolio/grafico/mangeki/17.webp",
                        "resources/portfolio/grafico/mangeki/18.webp",
                        "resources/portfolio/grafico/mangeki/19.webp",
                        "resources/portfolio/grafico/mangeki/20.webp",
                        "resources/portfolio/grafico/mangeki/21.webp",
                        "resources/portfolio/grafico/mangeki/21-2.webp",
                        "resources/portfolio/grafico/mangeki/21-3.webp",
                        "resources/portfolio/grafico/mangeki/22.webp",
                    ],
                },
            ],
        },
        {
            key: "modelado3d",
            label: "Modelado 3D",
            hue: 200,
            portada: null,
            tools: ["substance-3d-painter", "blender", "photoshop"],
            works: [
                {
                    title: "Caja Reloj",
                    portada: "resources/portfolio/modelado3d/caja_reloj/01.webp",
                    media: "video",
                    video: "resources/portfolio/modelado3d/caja_reloj/video.mp4",
                    galeria: [
                        "resources/portfolio/modelado3d/caja_reloj/01.webp",
                        "resources/portfolio/modelado3d/caja_reloj/02.webp",
                        "resources/portfolio/modelado3d/caja_reloj/03.webp",
                        "resources/portfolio/modelado3d/caja_reloj/04.webp",
                        "resources/portfolio/modelado3d/caja_reloj/05.webp",
                        "resources/portfolio/modelado3d/caja_reloj/06.webp",
                        "resources/portfolio/modelado3d/caja_reloj/07.webp",
                    ],                },
                {
                    title: "Calesita",
                    portada: "resources/portfolio/modelado3d/calesita/01.webp",
                    media: "video",
                    video: "resources/portfolio/modelado3d/calesita/video.mp4",
                    galeria: [
                        "resources/portfolio/modelado3d/calesita/01.webp",
                        "resources/portfolio/modelado3d/calesita/02.webp",
                        "resources/portfolio/modelado3d/calesita/03.webp",
                        "resources/portfolio/modelado3d/calesita/04.webp",
                        "resources/portfolio/modelado3d/calesita/05.webp",
                    ],                },
                {
                    title: "Máquina Arcade",
                    portada: "resources/portfolio/modelado3d/maquina_arcade/01.webp",
                    media: "video",
                    video: "resources/portfolio/modelado3d/maquina_arcade/video.mp4",
                    galeria: [
                        "resources/portfolio/modelado3d/maquina_arcade/01.webp",
                        "resources/portfolio/modelado3d/maquina_arcade/02.webp",
                        "resources/portfolio/modelado3d/maquina_arcade/03.webp",
                        "resources/portfolio/modelado3d/maquina_arcade/04.webp",
                        "resources/portfolio/modelado3d/maquina_arcade/05.webp",
                    ],                },
                {
                    title: "Máquina Expendedora",
                    portada: "resources/portfolio/modelado3d/maquina_exp/01.webp",
                    media: "video",
                    video: "resources/portfolio/modelado3d/maquina_exp/video.mp4",
                    galeria: [
                        "resources/portfolio/modelado3d/maquina_exp/01.webp",
                        "resources/portfolio/modelado3d/maquina_exp/02.webp",
                        "resources/portfolio/modelado3d/maquina_exp/03.webp",
                        "resources/portfolio/modelado3d/maquina_exp/04.webp",
                        "resources/portfolio/modelado3d/maquina_exp/05.webp",
                        "resources/portfolio/modelado3d/maquina_exp/06.webp",
                        "resources/portfolio/modelado3d/maquina_exp/07.webp",
                        "resources/portfolio/modelado3d/maquina_exp/08.webp",
                        "resources/portfolio/modelado3d/maquina_exp/09.webp",
                        "resources/portfolio/modelado3d/maquina_exp/10.webp",
                        "resources/portfolio/modelado3d/maquina_exp/11.webp",
                        "resources/portfolio/modelado3d/maquina_exp/12.webp",
                        "resources/portfolio/modelado3d/maquina_exp/13.webp",
                        "resources/portfolio/modelado3d/maquina_exp/14.webp",
                    ],                },
                {
                    title: "Personaje Toon",
                    portada: "resources/portfolio/modelado3d/personaje/portada.webp",
                    media: "image",
                    galeria: [
                        "resources/portfolio/modelado3d/personaje/01.webp",
                        "resources/portfolio/modelado3d/personaje/02.webp",
                        "resources/portfolio/modelado3d/personaje/03.webp",
                        "resources/portfolio/modelado3d/personaje/04.webp",
                        "resources/portfolio/modelado3d/personaje/05.webp",
                    ],                },
            ],
        },
        {
            key: "motion",
            label: "Motion Graphics",
            hue: 10,
            portada: null,
            tools: ["after-effects", "illustrator", "photoshop"],
            works: [
                { title: "The Sandman",       portada: "resources/portfolio/motion/sandman-poster.webp",          media: "video", video: "resources/portfolio/motion/Sandman.mp4" },
                { title: "Fiesta Rave",        portada: "resources/portfolio/motion/fiesta_rave-poster.webp",      media: "video", video: "resources/portfolio/motion/Fiesta%20Rave.mp4" },
                { title: "Muestra Arte",       portada: "resources/portfolio/motion/muestra_arte-poster.webp",     media: "video", video: "resources/portfolio/motion/Muestra%20Arte.mp4" },
                { title: "Tiger Woods",        portada: "resources/portfolio/motion/tiger_woods-poster.webp",      media: "video", video: "resources/portfolio/motion/tiger_woods.mp4" },
                { title: "Beautiful Webinar",  portada: "resources/portfolio/motion/beautiful_webinar-poster.webp", media: "video", video: "resources/portfolio/motion/beautiful_Webinar.mp4" },
            ],
        },
        {
            key: "web",
            label: "Desarrollo web",
            hue: 140,
            portada: "resources/portfolio/web/Dormie/00-mockup.webp",
            tools: ["visual-studio-code", "figma", "claude"],
            works: [
                {
                    title: "Dormie",
                    slug: "dormie",
                    url: "https://dormie-ecommerce.vercel.app/",
                    portada: "resources/portfolio/web/Dormie/00-mockup.webp",
                    media: "image",
                    galeria: [
                        "resources/portfolio/web/Dormie/01.webp",
                        "resources/portfolio/web/Dormie/02.webp",
                        "resources/portfolio/web/Dormie/03.webp",
                        "resources/portfolio/web/Dormie/04.webp",
                        "resources/portfolio/web/Dormie/05.webp",
                        "resources/portfolio/web/Dormie/06.webp",
                        "resources/portfolio/web/Dormie/07.webp",
                        "resources/portfolio/web/Dormie/08.webp",
                        "resources/portfolio/web/Dormie/09.webp",
                    ],
                },
                {
                    title: "VolKno",
                    slug: "volkno",
                    url: "https://volkno.lourdesschaab.com",
                    portada: "resources/portfolio/web/VolKno/00-mockup.webp",
                    media: "image",
                    galeria: [
                        "resources/portfolio/web/VolKno/01.webp",
                        "resources/portfolio/web/VolKno/02.webp",
                        "resources/portfolio/web/VolKno/03.webp",
                        "resources/portfolio/web/VolKno/04.webp",
                        "resources/portfolio/web/VolKno/05.webp",
                    ],
                },
                {
                    title: "Mangeki",
                    slug: "mangeki-web",
                    url: "https://mangeki.lourdesschaab.com",
                    portada: "resources/portfolio/web/Mangeki/00-mockup.webp",
                    media: "image",
                    galeria: [
                        "resources/portfolio/web/Mangeki/01.webp",
                        "resources/portfolio/web/Mangeki/02.webp",
                        "resources/portfolio/web/Mangeki/03.webp",
                        "resources/portfolio/web/Mangeki/04.webp",
                        "resources/portfolio/web/Mangeki/05.webp",
                    ],
                },
            ],
        },
        {
            key: "campanas",
            label: "Campañas publicitarias",
            hue: 210,
            portada: "resources/portfolio/campanas/portada.webp",
            tools: ["illustrator", "photoshop", "chatgpt", "capcut"],
            works: [
                {
                    title: "Hocicos Contentos",
                    portada: "resources/portfolio/campanas/portada.webp",
                    media: "video",
                    video: "resources/portfolio/campanas/PHC-2026_1.mp4",
                },
            ],
        },
    ];

    // Slug derivation: kebab-case from title, accent-stripped, unique across all works.
    // Works with an explicit slug field keep it; others derive from title.
    const toKebab = (str) => str
        .normalize("NFD").replace(/[̀-ͯ]/g, "")   // strip diacritics
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")                        // non-alphanumeric → hyphen
        .replace(/^-+|-+$/g, "");                           // trim leading/trailing hyphens

    // Interleave round-robin: un trabajo de cada categoría por turno → mezcla sin agrupar.
    const pools = window.PORTFOLIO
        .filter((cat) => cat.works.length)
        .map((cat) => cat.works.map((w) => ({
            ...w,
            catKey: cat.key,
            catLabel: cat.label,
            hue: cat.hue,
            tools: w.tools || cat.tools || [],   // tools por categoría; un work puede override
            // url carried through if present (currently only Dormie/VolKno)
        })));
    const mixed = [];
    const maxLen = Math.max(...pools.map((p) => p.length));
    for (let i = 0; i < maxLen; i++) {
        for (const pool of pools) { if (i < pool.length) mixed.push(pool[i]); }
    }

    // Assign stable unique slugs. Explicit slug wins; otherwise derive from title.
    const usedSlugs = new Set();
    mixed.forEach((w) => {
        let base = w.slug ? w.slug : toKebab(w.title);
        if (!base) base = "work";
        let candidate = base;
        let count = 2;
        while (usedSlugs.has(candidate)) { candidate = `${base}-${count}`; count++; }
        usedSlugs.add(candidate);
        w.slug = candidate;
    });

    window.WORKS = mixed;
})();
