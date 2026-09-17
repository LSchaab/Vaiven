// nosotros.js — patrón "mismo lugar" (igual que portfolio vs herramientas):
// inyecta .nos-stage dentro de .mente-stage; la sección real #nosotros se oculta
// hasta que el stage se despina (top < 0), cuando toma el relevo sin salto.
// Solo en modo coverflow (desktop, sin reduced-motion).
(() => {
    "use strict";
    if (!window.WorkCarousel) return;
    const menteStage  = document.querySelector(".mente-stage");
    const nosSection  = document.querySelector("#nosotros");
    const nosInner    = nosSection && nosSection.querySelector(".nosotros__stage");
    if (!menteStage || !nosInner) return;

    // 1. Inyectar clon de Nosotros dentro del stage pineado
    const nosStage = document.createElement("div");
    nosStage.className = "nos-stage";
    nosStage.setAttribute("aria-hidden", "true");   // real #nosotros es la fuente accesible
    nosStage.appendChild(nosInner.cloneNode(true));
    menteStage.appendChild(nosStage);

    // 2. Ocultar la sección real cuando el stage está pineado (evita doble visibilidad).
    //    Comparamos scrollY con maxScroll directamente — sin rAF ni reflow — para que
    //    la visibilidad se actualice en el mismo frame que el scroll, nunca un frame tarde.
    const journey = document.querySelector(".mente-journey");
    let maxScroll = journey.offsetHeight - innerHeight;
    const syncVisibility = () => {
        nosSection.style.visibility = window.scrollY > maxScroll + 1 ? "" : "hidden";
    };
    nosSection.style.visibility = "hidden";
    syncVisibility();   // estado inicial (maneja recarga con scroll ya pasado maxScroll)
    window.addEventListener("scroll", syncVisibility, { passive: true });
    window.addEventListener("resize", () => {
        maxScroll = journey.offsetHeight - innerHeight;
        syncVisibility();
    }, { passive: true });

    // 3. Nav link "nosotros": en coverflow el ancla nativa llega a maxScroll (stage aún
    //    pineado → syncVisibility lo mantiene hidden). Interceptamos y añadimos +4px para
    //    que el stage se despine y syncVisibility lo revele.
    const nosLink = document.querySelector('nav a[href="#nosotros"]');
    if (nosLink) {
        nosLink.addEventListener("click", (e) => {
            e.preventDefault();
            scrollTo({ top: maxScroll + 4, behavior: "smooth" });
        });
    }
})();
