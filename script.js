// Erratic typography effect — based on a code Mateo wrote for Luly.
// Wraps each character of an `.erratic` element in its own span and
// randomly assigns: font family, weight, italic, outline-vs-fill, plus
// micro-jitter (translation, rotation, scale, letter-spacing).
// Apply: <span class="erratic">Texto</span>  → letters get scrambled in style.

const FAMILIES = ["mont", "malt"];
const WEIGHTS = ["w200", "w300", "w400", "w600", "w700", "w800"];

const P = {
    italic: 0.3,
};

function jitter(letter) {
    letter.classList.add(FAMILIES[Math.random() < 0.5 ? 0 : 1]);
    letter.classList.add(WEIGHTS[Math.floor(Math.random() * WEIGHTS.length)]);
    if (Math.random() < P.italic) letter.classList.add("it");

    const y = (Math.random() * 6 - 3).toFixed(1);
    const r = (Math.random() * 2 - 1).toFixed(1);
    const s = (0.97 + Math.random() * 0.12).toFixed(2);
    letter.style.transform = `translateY(${y}px) rotate(${r}deg) scale(${s})`;
    letter.style.letterSpacing = (Math.random() * 1.1 - 0.2).toFixed(2) + "px";
}

function erraticize(el) {
    const text = el.dataset.text || el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    [...text].forEach((ch) => {
        const span = document.createElement("span");
        span.textContent = ch;
        span.setAttribute("aria-hidden", "true");
        jitter(span);
        el.appendChild(span);
    });
}

document.querySelectorAll(".erratic").forEach(erraticize);

// Exposed for design iteration — call window.reshuffleErratic() from devtools
// to remix without reloading.
window.reshuffleErratic = () => {
    document.querySelectorAll(".erratic").forEach((el) => {
        el.querySelectorAll("span").forEach((s) => {
            s.className = "";
            s.removeAttribute("style");
            jitter(s);
        });
    });
};

// === Section switching ===
// Page scroll is locked (styles.css). The side menu is the only way to
// navigate. Click → swap which section has [data-active]. URL hash kept in
// sync so deep links and the browser's back/forward buttons still work.

const SECTIONS = ["hero", "portfolio", "contacto", "nosotros", "destacados"];

function setActiveSection(id) {
    if (!SECTIONS.includes(id)) id = "hero";
    document.querySelectorAll("main > section").forEach((section) => {
        if (section.id === id) section.setAttribute("data-active", "");
        else section.removeAttribute("data-active");
    });
    document.querySelectorAll("nav a").forEach((link) => {
        const href = link.getAttribute("href") || "";
        if (href === `#${id}`) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });
}

// Intercept any in-page anchor click (menu + logo). Stop the browser from
// trying to scroll to the target, switch sections instead. Links whose hash
// doesn't match a section (e.g. placeholder href="#" on the bento cards)
// are short-circuited so they don't accidentally navigate away.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
        const href = link.getAttribute("href") || "";
        const id = href.slice(1);
        e.preventDefault();
        if (!SECTIONS.includes(id)) return;
        history.replaceState(null, "", `#${id}`);
        setActiveSection(id);
    });
});

// Initial state — read from URL so deep links land on the right section.
setActiveSection((location.hash || "#hero").slice(1));

// Sync when the user uses browser back/forward.
window.addEventListener("hashchange", () => {
    setActiveSection((location.hash || "#hero").slice(1));
});

// === Pointer parallax ===
// The page doesn't scroll, so depth is driven by cursor position instead.
// Each layer has a `depth` (px of travel); we write --px/--py custom properties
// that the CSS transforms consume, so the elements' own rotation/offset are
// preserved. Larger depth = "closer" = moves more. Movement is opposite to the
// cursor for a "looking into the scene" feel. Skipped if the user prefers
// reduced motion. Updates are throttled to one per animation frame.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion) {
    const layers = [
        { sel: ".hero-megafono",       depth: 28 },
        { sel: ".hero-cerebro",        depth: 38 },
        { sel: ".hero-headline",       depth: 10 },
        { sel: ".contacto-hand-left",  depth: 22 },
        { sel: ".contacto-hand-right", depth: 28 },
        { sel: ".portfolio-eye-tr",    depth: 26 },
        { sel: ".portfolio-eye-bl",    depth: 32 },
        { sel: ".destacados-hand-left",  depth: 22 },
        { sel: ".destacados-hand-right", depth: 28 },
    ]
        .map((layer) => ({ el: document.querySelector(layer.sel), depth: layer.depth }))
        .filter((layer) => layer.el);

    let pointerX = 0;
    let pointerY = 0;
    let frameQueued = false;

    function applyParallax() {
        frameQueued = false;
        // Normalized -0.5..0.5 offset from the viewport center.
        const nx = pointerX / window.innerWidth - 0.5;
        const ny = pointerY / window.innerHeight - 0.5;
        layers.forEach(({ el, depth }) => {
            el.style.setProperty("--px", `${(-nx * depth).toFixed(1)}px`);
            el.style.setProperty("--py", `${(-ny * depth).toFixed(1)}px`);
        });
    }

    window.addEventListener("mousemove", (e) => {
        pointerX = e.clientX;
        pointerY = e.clientY;
        if (!frameQueued) {
            frameQueued = true;
            requestAnimationFrame(applyParallax);
        }
    });
}

// === Modal del manifiesto (video de YouTube) ===
// Click en "Play al manifesto" → abre un lightbox con el reproductor de YouTube.
// El iframe se crea recién al abrir (así el video no carga ni suena de fondo) y
// se borra al cerrar (eso detiene la reproducción). Se cierra con: el botón ×,
// un click en el fondo oscuro, o la tecla Escape.

const manifiestoBtn = document.querySelector(".nosotros-btn");
const videoModal = document.getElementById("manifiesto-modal");
const videoPlayer = document.getElementById("manifiesto-player");

function openVideoModal(videoId) {
    // URL del embed: autoplay + ocultar videos relacionados al final (rel=0).
    const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    videoPlayer.innerHTML =
        `<iframe src="${src}" title="Manifiesto VAI VEN"
                 allow="autoplay; encrypted-media; fullscreen"
                 allowfullscreen></iframe>`;
    videoModal.hidden = false;
}

function closeVideoModal() {
    videoModal.hidden = true;
    videoPlayer.innerHTML = ""; // quitar el iframe detiene el video
}

if (manifiestoBtn && videoModal) {
    manifiestoBtn.addEventListener("click", () => {
        const videoId = manifiestoBtn.dataset.video;
        if (videoId) openVideoModal(videoId);
    });

    // Cualquier elemento con data-close (el botón × y el fondo) cierra el modal.
    videoModal.querySelectorAll("[data-close]").forEach((el) => {
        el.addEventListener("click", closeVideoModal);
    });

    // La tecla Escape también cierra.
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !videoModal.hidden) closeVideoModal();
    });
}

// === Carrusel de Destacados ===
// Tres cards apiladas en abanico. `activeIndex` dice cuál está en el centro.
// render() recorre las cards y, para cada una, le pide a cardStateFor() qué
// clase de estado debe llevar ("is-active" / "is-prev" / "is-next"). El CSS hace
// el resto (posición, escala, desaturado). Click en una card lateral o las
// flechas ←/→ cambian cuál está activa.

const destacadosCarousel = document.querySelector(".destacados-carousel");

if (destacadosCarousel) {
    const cards = Array.from(destacadosCarousel.querySelectorAll(".destacados-card"));
    const total = cards.length;
    let activeIndex = 1; // arrancamos con la card del medio al centro

    // Decide qué clase de estado recibe cada card según su posición respecto a
    // la activa. Debe devolver una de: "is-active", "is-prev", "is-next".
    // - "is-active": la card que está en el centro (cardIndex === activeIndex)
    // - "is-prev":   la card inmediatamente anterior (con wrap-around)
    // - "is-next":   la card inmediatamente siguiente (con wrap-around)
    // "wrap-around" = si te pasás del final, volvés al principio (y al revés).
    // Pista: el operador % (módulo) y sumar `total` antes del % evita negativos.
    function cardStateFor(cardIndex, activeIndex, total) {
        if (cardIndex === activeIndex) return "is-active";
        if (cardIndex === (activeIndex - 1 + total) % total) return "is-prev";
        if (cardIndex === (activeIndex + 1) % total) return "is-next";
        return "";
    }

    function render() {
        cards.forEach((card, i) => {
            card.classList.remove("is-active", "is-prev", "is-next");
            const state = cardStateFor(i, activeIndex, total);
            if (state) card.classList.add(state);
            // Solo la card activa es alcanzable por Tab; las laterales no.
            card.tabIndex = i === activeIndex ? 0 : -1;
        });
    }

    // Avanzar/retroceder rotando el abanico (con wrap-around).
    function rotate(step) {
        activeIndex = (activeIndex + step + total) % total;
        render();
    }

    // Click en cualquier card → esa pasa a ser la activa (centro).
    cards.forEach((card, i) => {
        card.addEventListener("click", () => {
            activeIndex = i;
            render();
        });
    });

    // Manos = controles: la izquierda retrocede, la derecha avanza.
    document.querySelectorAll("#destacados .destacados-hand").forEach((hand) => {
        hand.addEventListener("click", () => {
            rotate(hand.dataset.dir === "next" ? 1 : -1);
        });
    });

    // Flechas del teclado para rotar el abanico.
    destacadosCarousel.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") rotate(1);
        else if (e.key === "ArrowLeft") rotate(-1);
    });

    render();
}
