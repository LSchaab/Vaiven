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
            // parallax: cursor normalizado a -1..1 respecto del centro
            const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
            const ny = (e.clientY / window.innerHeight - 0.5) * 2;
            hero.style.setProperty("--mnx", nx.toFixed(3));
            hero.style.setProperty("--mny", ny.toFixed(3));
        }, { passive: true });
    }
})();
