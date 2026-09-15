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
    // se colorea el cerebro (aunque sea B&N) con sepia + hue-rotate — el sepia
    // aporta saturación para que el hue-rotate SÍ cambie el color (hue-rotate
    // solo no tiñe una imagen en escala de grises). Reemplazar por swap de src
    // (brain.src = BRAIN_SRCS[beat]) cuando existan las versiones de color.
    const BEAT_HUE = [340, 200, 10, 140, 210];   // deg, un tono por beat (aprox. marca)

    // Desde dónde entra la palabra de cada beat (vmin); se absorbe hacia (0,0).
    // Repartidas por la pantalla (las largas con x chico para no desbordar).
    const WORD_SPOTS = [
        { x: -14, y: -30 },   // Ilustración y Diseño Gráfico (larga)
        { x:  34, y: -16 },   // Modelado 3D
        { x: -36, y:  14 },   // Motion Graphics
        { x:  24, y:  30 },   // Desarrollo web
        { x:   0, y:  34 },   // Campañas publicitarias (larga)
    ];

    const smooth01 = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

    const computeProgress = () => {
        const total = journey.offsetHeight - innerHeight;
        const scrolled = clamp(-journey.getBoundingClientRect().top, 0, total);
        return total > 0 ? scrolled / total : 0;
    };

    // Fase 2 (herramientas): la completan las tareas 2 (palabra + color),
    // 3 (lluvia de logos) y 4 (polvo). Recibe el progreso local 0..1.
    // La palabra aparece al empezar cada beat; el COLOR del cerebro cambia recién
    // cuando esa palabra se ABSORBE (se mete en el cerebro), no cuando aparece.
    const ABSORB_AT = 0.8;   // punto del beat en que la palabra ya está "adentro"

    let currentBeat = -1;
    const setWord = (beat) => {
        if (beat === currentBeat) return;
        currentBeat = beat;
        wordEl.dataset.text = DISCIPLINES[beat];
        window.erraticize(wordEl);
    };

    // idx -1 = B&N (nada absorbido aún); >=0 = color del beat idx (placeholder sepia).
    let currentColor = -2;
    const setBrainColor = (idx) => {
        if (idx === currentColor) return;
        currentColor = idx;
        if (idx < 0) { brain.style.filter = ""; return; }   // B&N
        brain.style.filter = `sepia(1) saturate(4) hue-rotate(${BEAT_HUE[idx]}deg)`;
        brain.classList.remove("is-absorbing");
        void brain.offsetWidth;              // reinicia el pulso
        brain.classList.add("is-absorbing"); // pulso al absorber
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
        if (herrP <= 0) {
            // fase 1 / umbral: cerebro B&N, sin palabra.
            currentBeat = -1;
            if (currentColor !== -2) { currentColor = -2; brain.style.filter = ""; }
            wordEl.style.opacity = 0;
        } else {
            const beatFloat = herrP * BEATS;
            const beat = clamp(Math.floor(beatFloat), 0, BEATS - 1);
            const local = beatFloat - beat;
            setWord(beat);
            renderWord(beat, local);
            // color: recién cuando la palabra del beat se absorbe. Antes, el color
            // del beat anterior (o B&N en el beat 0, idx -1).
            setBrainColor(local >= ABSORB_AT ? beat : beat - 1);
        }
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
