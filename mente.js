// Recorrido "la mente de VAI VEN" — controlador único.
// Un escenario sticky (.mente-stage) pineado toda la travesía. Un progreso
// global 0..1 sobre .mente-journey se parte en dos fases: umbral/puertas
// (--hero-progress) y absorción/herramientas (--herr-progress). Conserva el
// glow de grilla y el parallax del hero. Las tareas 2-4 completan renderPhase2.
// Guards: cursor sin efecto en touch/reduced-motion; scrub sin efecto en
// reduced-motion (mobile/touch sí scrollea, igual que el hero actual).
// Ref: docs/superpowers/specs/2026-09-15-herramientas-cerebro-absorbe-design.md
(() => {
    "use strict";
    const journey = document.querySelector(".mente-journey");
    if (!journey) return;
    const stage = journey.querySelector(".mente-stage");

    const reduce  = matchMedia("(prefers-reduced-motion: reduce)");
    const noHover = matchMedia("(hover: none)");

    // ----- glow de grilla + parallax (migrado de hero.js) -----
    if (!noHover.matches && !reduce.matches) {
        window.addEventListener("mousemove", (e) => {
            stage.style.setProperty("--mx", e.clientX + "px");
            stage.style.setProperty("--my", e.clientY + "px");
            const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
            const ny = (e.clientY / window.innerHeight - 0.5) * 2;
            stage.style.setProperty("--mnx", nx.toFixed(3));
            stage.style.setProperty("--mny", ny.toFixed(3));
        }, { passive: true });
    }

    if (reduce.matches) return;   // sin scrub; CSS deja umbral estático + fallback

    // ----- fases (afinables; en sync con .mente-journey height y #herramientas top) -----
    const DOOR_VH  = 150;   // largo de scroll de la apertura de puertas
    const TOOLS_VH = 500;   // largo de scroll de la absorción
    const B = DOOR_VH / (DOOR_VH + TOOLS_VH);   // límite de fase en progreso global

    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

    const brain = stage.querySelector(".cerebro");
    const wordEl = stage.querySelector(".herr-palabra");

    const DISCIPLINES = [
        "Ilustración y Diseño Gráfico",
        "Modelado 3D",
        "Motion Graphics",
        "Desarrollo web",
        "Campañas publicitarias",
    ];
    const BEATS = DISCIPLINES.length;

    // Placeholder de "cerebro de color por beat": hasta tener los assets reales,
    // se quita el B&N y se tinta con hue-rotate. Reemplazar por swap de src
    // (brain.src = BRAIN_SRCS[beat]) cuando existan las versiones de color.
    const BEAT_HUE = [0, 205, 45, 265, 140];   // deg, un tono por beat

    // Desde dónde entra la palabra de cada beat (vmin); se absorbe hacia (0,0).
    const WORD_SPOTS = [
        { x: -24, y: -14 }, { x: 24, y: -16 }, { x: -26, y: 16 },
        { x: 26, y: 14 }, { x: 0, y: -22 },
    ];

    const smooth01 = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

    const computeProgress = () => {
        const total = journey.offsetHeight - innerHeight;
        const scrolled = clamp(-journey.getBoundingClientRect().top, 0, total);
        return total > 0 ? scrolled / total : 0;
    };

    // Fase 2 (herramientas): la completan las tareas 2 (palabra + color),
    // 3 (lluvia de logos) y 4 (polvo). Recibe el progreso local 0..1.
    let currentBeat = -1;
    const setBeat = (beat) => {
        if (beat === currentBeat) return;
        currentBeat = beat;
        wordEl.dataset.text = DISCIPLINES[beat];
        window.erraticize(wordEl);
        // Enciende color en la 1ª absorción y cambia por beat (placeholder).
        brain.style.filter = `hue-rotate(${BEAT_HUE[beat]}deg) saturate(1.5)`;
        brain.classList.remove("is-absorbing");
        void brain.offsetWidth;              // reinicia la animación de pulso
        brain.classList.add("is-absorbing");
    };

    const renderWord = (beat, local) => {
        const spot = WORD_SPOTS[beat];
        const absorb = smooth01((local - 0.6) / 0.4);   // 0 hasta 0.6, →1 al final
        const wx = spot.x * (1 - absorb);
        const wy = spot.y * (1 - absorb);
        const scale = 1 - 0.8 * absorb;
        const op = clamp(Math.min(local / 0.2, 1) * (1 - absorb), 0, 1);
        wordEl.style.transform =
            `translate(-50%, -50%) translate(${wx}vmin, ${wy}vmin) scale(${scale})`;
        wordEl.style.opacity = op;
    };

    const renderPhase2 = (herrP) => {
        const beatFloat = herrP * BEATS;
        const beat = clamp(Math.floor(beatFloat), 0, BEATS - 1);
        const local = beatFloat - beat;
        setBeat(beat);
        renderWord(beat, local);
    };

    const render = (p) => {
        const heroP = clamp(p / B, 0, 1);
        const herrP = clamp((p - B) / (1 - B), 0, 1);
        stage.style.setProperty("--hero-progress", heroP.toFixed(4));
        stage.style.setProperty("--herr-progress", herrP.toFixed(4));
        renderPhase2(herrP);
    };

    // ----- scroll (rAF) -----
    let ticking = false;
    const update = () => { render(computeProgress()); ticking = false; };
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
})();
