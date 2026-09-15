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

    const computeProgress = () => {
        const total = journey.offsetHeight - innerHeight;
        const scrolled = clamp(-journey.getBoundingClientRect().top, 0, total);
        return total > 0 ? scrolled / total : 0;
    };

    // Fase 2 (herramientas): la completan las tareas 2 (palabra + color),
    // 3 (lluvia de logos) y 4 (polvo). Recibe el progreso local 0..1.
    const renderPhase2 = (herrP) => { /* Task 2-4 */ };

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
