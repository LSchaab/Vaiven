// Hero "Abrí la cabeza" — interacción del hero.
// Setea variables CSS a partir del mouse (glow de grilla) y del scroll
// (apertura de las puertas). El movimiento se resuelve en CSS a partir de
// esas variables. Guards: sin efecto en touch / reduced-motion.
(() => {
    "use strict";
    const hero = document.querySelector("#hero");
    if (!hero) return;

    const reduce  = matchMedia("(prefers-reduced-motion: reduce)");
    const noHover = matchMedia("(hover: none)");

    // ----- glow de grilla: posición del cursor en px (viewport) -----
    if (!noHover.matches && !reduce.matches) {
        window.addEventListener("mousemove", (e) => {
            hero.style.setProperty("--mx", e.clientX + "px");
            hero.style.setProperty("--my", e.clientY + "px");
        }, { passive: true });
    }
})();
