// Portfolio data — single source consumed by work-carousel.js (carrusel) y portfolio-modal.js (modal).
// Portada: imagen para la card. Si es null en works de video, la card muestra el video en loop.
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
            works: [
                {
                    title: "Inari",
                    portada: "resources/portfolio/grafico/inari/inari_mockup.webp",
                    media: "image",
                    galeria: [
                        "resources/portfolio/grafico/inari/01.webp",
                        "resources/portfolio/grafico/inari/02.webp",
                    ],
                    proceso: "resources/portfolio/grafico/inari/proceso.mp4",
                    tools: ["photoshop", "illustrator"],
                },
                {
                    title: "Lightyear",
                    portada: "resources/portfolio/grafico/lightyear/portada.webp",
                    media: "image",
                    galeria: [
                        "resources/portfolio/grafico/lightyear/05.webp",
                        "resources/portfolio/grafico/lightyear/06.webp",
                        "resources/portfolio/grafico/lightyear/07.webp",
                    ],
                    proceso: "resources/portfolio/grafico/lightyear/proceso.mp4",
                    tools: ["photoshop", "illustrator"],
                },
                {
                    title: "Perfume",
                    portada: "resources/portfolio/grafico/perfume/mopckup.webp",
                    media: "image",
                    galeria: [
                        "resources/portfolio/grafico/perfume/01.webp",
                        "resources/portfolio/grafico/perfume/02.webp",
                    ],
                    proceso: "resources/portfolio/grafico/perfume/proceso.mp4",
                    tools: ["photoshop", "illustrator"],
                },
                {
                    title: "Infinity War",
                    portada: "resources/portfolio/grafico/infinityWar/infinity_war_mockup.webp",
                    media: "image",
                    galeria: [
                        "resources/portfolio/grafico/infinityWar/01.webp",
                    ],
                    proceso: "resources/portfolio/grafico/infinityWar/proceso.mp4",
                    tools: ["photoshop", "illustrator"],
                },
                {
                    title: "Interstellar",
                    portada: "resources/portfolio/grafico/interstellar/mockup.webp",
                    media: "image",
                    galeria: [
                        "resources/portfolio/grafico/interstellar/01.webp",
                        "resources/portfolio/grafico/interstellar/02.webp",
                    ],
                    proceso: "resources/portfolio/grafico/interstellar/animado.mp4",
                    tools: ["photoshop", "illustrator"],
                },
                {
                    title: "Harley",
                    portada: "resources/portfolio/grafico/harley/Harley_portada.webp",
                    media: "image",
                    galeria: [
                        "resources/portfolio/grafico/harley/Harley_8.webp",
                        "resources/portfolio/grafico/harley/harley_mockup.webp",
                    ],
                    proceso: "resources/portfolio/grafico/harley/proceso.mp4",
                    tools: ["photoshop", "illustrator"],
                },
            ],
        },
        {
            key: "modelado3d",
            label: "Modelado 3D",
            hue: 200,
            portada: null,
            works: [
                {
                    title: "Caja Reloj",
                    portada: null,
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
                    ],
                    tools: ["blender"],
                },
                {
                    title: "Calesita",
                    portada: null,
                    media: "video",
                    video: "resources/portfolio/modelado3d/calesita/video.mp4",
                    galeria: [
                        "resources/portfolio/modelado3d/calesita/01.webp",
                        "resources/portfolio/modelado3d/calesita/02.webp",
                        "resources/portfolio/modelado3d/calesita/03.webp",
                        "resources/portfolio/modelado3d/calesita/04.webp",
                        "resources/portfolio/modelado3d/calesita/05.webp",
                    ],
                    tools: ["blender"],
                },
                {
                    title: "Máquina Arcade",
                    portada: null,
                    media: "video",
                    video: "resources/portfolio/modelado3d/maquina_arcade/video.mp4",
                    galeria: [
                        "resources/portfolio/modelado3d/maquina_arcade/01.webp",
                        "resources/portfolio/modelado3d/maquina_arcade/02.webp",
                        "resources/portfolio/modelado3d/maquina_arcade/03.webp",
                        "resources/portfolio/modelado3d/maquina_arcade/04.webp",
                        "resources/portfolio/modelado3d/maquina_arcade/05.webp",
                    ],
                    tools: ["blender"],
                },
                {
                    title: "Máquina Expendedora",
                    portada: null,
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
                    ],
                    tools: ["blender"],
                },
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
                    ],
                    tools: ["blender"],
                },
            ],
        },
        {
            key: "motion",
            label: "Motion Graphics",
            hue: 10,
            portada: null,
            works: [
                { title: "The Sandman",       portada: null, media: "video", video: "resources/portfolio/motion/Sandman.mp4" },
                { title: "Fiesta Rave",        portada: null, media: "video", video: "resources/portfolio/motion/Fiesta%20Rave.mp4" },
                { title: "Muestra Arte",       portada: null, media: "video", video: "resources/portfolio/motion/Muestra%20Arte.mp4" },
                { title: "Tiger Woods",        portada: null, media: "video", video: "resources/portfolio/motion/tiger_woods.mp4" },
                { title: "Beautiful Webinar",  portada: null, media: "video", video: "resources/portfolio/motion/beautiful_Webinar.mp4" },
            ],
        },
        {
            key: "web",
            label: "Desarrollo web",
            hue: 140,
            portada: null,
            works: [],
        },
        {
            key: "campanas",
            label: "Campañas publicitarias",
            hue: 210,
            portada: "resources/portfolio/campanas/portada.webp",
            works: [
                {
                    title: "Hocicos Contentos",
                    portada: "resources/portfolio/campanas/portada.webp",
                    media: "video",
                    video: "resources/portfolio/campanas/video.mp4",
                },
            ],
        },
    ];

    // Interleave round-robin: un trabajo de cada categoría por turno → mezcla sin agrupar.
    const pools = window.PORTFOLIO
        .filter((cat) => cat.works.length)
        .map((cat) => cat.works.map((w) => ({ ...w, catKey: cat.key, catLabel: cat.label, hue: cat.hue })));
    const mixed = [];
    const maxLen = Math.max(...pools.map((p) => p.length));
    for (let i = 0; i < maxLen; i++) {
        for (const pool of pools) { if (i < pool.length) mixed.push(pool[i]); }
    }
    window.WORKS = mixed;
})();
