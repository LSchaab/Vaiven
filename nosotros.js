// nosotros.js — Nosotros es el FINAL del recorrido. En desktop (coverflow) su
// contenido REAL se mueve DENTRO del stage pineado como capa de salida
// (.nos-reveal): cuando el iris verde se cierra, el equipo aparece YA CENTRADO y
// quieto (el stage sigue pineado), sin "subir desde abajo" ni scroll extra. Al
// seguir scrolleando el stage se despina y el equipo se va hacia arriba dando paso
// a #contacto. UNA sola copia — se MUEVE, no se clona. En galería/mobile queda
// como sección normal (no se toca).
(() => {
    "use strict";
    if (!window.WorkCarousel) return;
    const journey = document.querySelector(".mente-journey");
    const stage   = journey && journey.querySelector(".mente-stage");
    const section = document.querySelector("#nosotros");
    const content = section && section.querySelector(".nosotros__stage");
    if (!journey || !stage || !content) return;

    if (window.WorkCarousel.coverflow) {
        // Mover (no clonar) el contenido real al stage como capa de salida.
        const layer = document.createElement("div");
        layer.className = "nos-reveal";
        layer.appendChild(content);          // MOVE — la sección real queda vacía
        stage.appendChild(layer);            // (CSS la colapsa: body.coverflow #nosotros)

        // pointer-events: sólo con la capa revelada (iris ya verde), si no taparía
        // los clicks de las cards. La opacidad la maneja CSS con --work-exit; acá
        // sólo leemos ese valor (inline style que setea work-carousel.js, sin forzar
        // reflow) para abrir/cerrar los eventos en el mismo umbral (0.5).
        let ticking = false;
        const sync = () => {
            const exit = parseFloat(document.documentElement.style.getPropertyValue("--work-exit")) || 0;
            layer.classList.toggle("is-open", exit >= 0.5);
            ticking = false;
        };
        addEventListener("scroll", () => {
            if (!ticking) { ticking = true; requestAnimationFrame(sync); }
        }, { passive: true });
        sync();

        // Nav "#nosotros": el equipo vive dentro del recorrido pineado (la sección
        // real está colapsada) → llevamos el scroll al tramo donde el equipo está
        // centrado y quieto (iris verde), con margen para seguir a #contacto.
        const nosLink = document.querySelector('nav a[href="#nosotros"]');
        if (nosLink) {
            nosLink.addEventListener("click", (e) => {
                e.preventDefault();
                // El final es ahora Contacto (puertas cerradas). Nosotros vive en la
                // pausa QUIET justo antes del cierre: retrocedemos CIERRE_VH(150) +
                // ~½ QUIET_VH(60) ≈ 1.8 viewports desde el fondo → equipo centrado y quieto.
                const maxScroll = journey.offsetHeight - innerHeight;
                scrollTo({ top: maxScroll - innerHeight * 1.8, behavior: "smooth" });
            });
        }
    }
})();
