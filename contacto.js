// contacto.js — Contacto es el CIERRE del recorrido. En desktop (coverflow) su
// contenido REAL se mueve DENTRO del stage pineado como capa final
// (.contacto-reveal): cuando las puertas del inicio vuelven a cerrarse sobre el
// equipo, el contenido de Contacto aparece sobre la grilla ya cerrada. UNA sola
// copia — se MUEVE, no se clona. En galería/mobile/reduced-motion queda como
// sección normal (no se toca). Ref: spec 2026-09-17-contacto-puertas-cierre.
(() => {
    "use strict";
    if (!window.WorkCarousel || !window.WorkCarousel.coverflow) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const journey = document.querySelector(".mente-journey");
    const stage   = journey && journey.querySelector(".mente-stage");
    const section = document.querySelector("#contacto");
    const content = section && section.querySelector(".contacto__inner");
    if (!journey || !stage || !content) return;

    // Mover (no clonar) el contenido real al stage como capa final.
    const layer = document.createElement("div");
    layer.className = "contacto-reveal";
    layer.appendChild(content);          // MOVE — la sección real queda vacía
    stage.appendChild(layer);
    document.body.classList.add("contacto-in-stage");   // CSS colapsa #contacto

    // pointer-events: sólo con la capa revelada (puertas ya cerradas), si no taparía
    // clicks. La opacidad la maneja CSS con --cierre-progress; acá sólo leemos ese
    // valor (inline style que setea mente.js) para abrir/cerrar los eventos.
    let ticking = false;
    const sync = () => {
        const c = parseFloat(stage.style.getPropertyValue("--cierre-progress")) || 0;
        // ≥0.9: recién cuando el contenido ya es visible (fade 0.8→1) habilitamos clicks.
        layer.classList.toggle("is-open", c >= 0.9);
        ticking = false;
    };
    addEventListener("scroll", () => {
        if (!ticking) { ticking = true; requestAnimationFrame(sync); }
    }, { passive: true });
    sync();
})();
