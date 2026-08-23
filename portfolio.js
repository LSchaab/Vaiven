// portfolio.js — behavior for the portfolio category page (portfolio.html).
// Two jobs, kept self-contained so this never interferes with the home page:
//   1. The "erratic" per-letter type effect (same look as the home page).
//   2. A GSAP entrance for the category hero (collage + title cascade), exactly
//      like hero-motion.js on the home page.

// --- Erratic typography ----------------------------------------------------
// Wraps each character of an .erratic element in its own span with a random
// family / weight / italic + a tiny transform jitter, so the type looks
// hand-set. (Same logic the home page uses in script.js.)
const FAMILIES = ["mont", "malt"];
const WEIGHTS = ["w200", "w300", "w400", "w600", "w700", "w800"];

function jitter(letter) {
    letter.classList.add(FAMILIES[Math.random() < 0.5 ? 0 : 1]);
    letter.classList.add(WEIGHTS[Math.floor(Math.random() * WEIGHTS.length)]);
    if (Math.random() < 0.3) letter.classList.add("it");
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

// --- Category config: ONE template, five variants --------------------------
// Which category to render comes from the URL (?cat=3d). Each entry owns its
// copy, its collage cutouts and which entrance "signature" to play. To add a
// real category you only fill in an entry here — never copy this whole page.
//
//   title    — the big erratic wordmark
//   desc     — the line under it
//   hero     — which hero RENDERER mounts for this category (dispatched in
//              mountHero() after the shell is built). One of:
//                "three"         — Three.js extruded "3D" wordmark (hero-3d.js)
//                "typewriter"    — GSAP typewriter (category-heroes.js)
//                "motion-kinetic"— GSAP per-letter kinetic (category-heroes.js)
//                (unset)         — no custom renderer; the erratic-title cascade
//                                  below (anim) plays as before.
//   anim     — entrance for the DEFAULT cascade only: "orbit" (parallax + tilt +
//              extrude) or "default" (simple opacity cascade). Ignored when a
//              custom `hero` renderer owns the section.
//   cutouts  — collage images, listed FRONT → BACK. `depth` = how far each one
//              travels/tilts with the pointer (bigger = feels closer). `pos`
//              is a CSS class that places it (see .cutout-left / -right).
const CATEGORIES = {
    "3d": {
        title: "3D",
        // Copy lifted straight from the approved 3D mock.
        desc: "No es magia, es Cinema 4D, Blender, ZBrush y Substance, pero queda como magia. El realismo es nuestro extremo, y también el delirio de crear cosas que todavía no existen.",
        hero: "three", // Three.js extruded wordmark (falls back to the text below)
        anim: "orbit", // fallback cascade if the canvas can't mount
        cutouts: [],   // the 3D canvas IS the hero art now — no collage cutouts
    },

    // Desarrollo web — GSAP typewriter on a dark surface (scoped in CSS).
    "web": {
        title: "Web",
        desc: "Placeholder — reemplazar con la copy de Desarrollo web.",
        hero: "typewriter",
        anim: "default",
        cutouts: [],
    },
    "grafico": {
        title: "Gráfico",
        desc: "Placeholder — reemplazar con la copy de Ilustración y Diseño Gráfico.",
        anim: "default",
        cutouts: [],
    },
    "campanas": {
        title: "Campañas",
        desc: "Placeholder — reemplazar con la copy de Campañas publicitarias.",
        anim: "default",
        cutouts: [],
    },

    // Motion Graphics — GSAP kinetic signature (per-letter distinct eases + loop).
    "motion": {
        title: "Motion",
        desc: "Acá nada se queda quieto. After Effects, Cinema 4D y litros de café para que todo se mueva como tiene que moverse… o como nunca te lo imaginaste. El movimiento es el mensaje.",
        hero: "motion-kinetic",
        anim: "default",
        cutouts: [
            // TEMP stand-ins — swap for the real Motion cutouts when you have them.
            { src: "resources/megafono.webp", depth: 40, pos: "cutout-right" },
            { src: "resources/cerebro.webp",  depth: 24, pos: "cutout-left" },
        ],
    },
};

// Pick the category from ?cat=, falling back to 3D (our gold prototype).
const slug = new URLSearchParams(location.search).get("cat");
const cat = (CATEGORIES[slug] && CATEGORIES[slug].title) ? CATEGORIES[slug] : CATEGORIES["3d"];
const activeSlug = cat === CATEGORIES[slug] ? slug : "3d";
document.body.dataset.cat = activeSlug; // CSS styling hook per category

// Fill the hero shell from the chosen config. This MUST run before erraticize,
// because erraticize reads the title to split it into per-letter spans.
const titleEl = document.querySelector(".cat-title");
titleEl.dataset.text = cat.title;
titleEl.textContent = cat.title;
document.querySelector(".cat-hero-desc").textContent = cat.desc;

// Build the collage cutouts (front-to-back via z-index). Each <img> exposes a
// data-depth the parallax loop reads, and consumes the same CSS vars as the
// home page (--px/--py) plus --rx/--ry (tilt) and --enter-* (entrance).
const collage = document.querySelector(".cat-hero-collage");
const cutouts = cat.cutouts || [];
cutouts.forEach((c, i) => {
    const img = document.createElement("img");
    img.src = c.src;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.decoding = "async";
    img.className = `cat-cutout ${c.pos || ""}`.trim();
    img.dataset.depth = c.depth;
    img.style.zIndex = String(cutouts.length - i); // first listed = frontmost
    collage.appendChild(img);
});

// When a category brings its own collage, hide the default eye decor so they
// don't fight for the same corner.
if (cutouts.length) {
    document.querySelector(".cat-hero-decor").style.display = "none";
}

document.querySelectorAll(".erratic").forEach(erraticize);

// --- Section switching -----------------------------------------------------
// Scroll is locked (the global rules in styles.css), so the sidebar swaps which
// section is visible by toggling [data-active] — the same mechanism the home
// page uses. The active link gets aria-current (→ the orange brush underline).
const PAGE_SECTIONS = ["cat-hero", "contacto", "cat-projects"];

function setActiveSection(id) {
    if (!PAGE_SECTIONS.includes(id)) id = "cat-hero";
    document.querySelectorAll("main > section").forEach((s) => {
        if (s.id === id) s.setAttribute("data-active", "");
        else s.removeAttribute("data-active");
    });
    document.querySelectorAll("nav a").forEach((link) => {
        const href = link.getAttribute("href") || "";
        if (href === `#${id}`) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });
}

// Sidebar clicks switch sections instead of scrolling. (The logo and the eye
// link to index.html, so they aren't "#"-anchors and navigate normally.)
document.querySelectorAll('nav a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
        const id = (link.getAttribute("href") || "").slice(1);
        if (!PAGE_SECTIONS.includes(id)) return;
        e.preventDefault();
        history.replaceState(null, "", `#${id}`);
        setActiveSection(id);
    });
});

// Land on the section in the URL (deep link), else the hero. Keep in sync with
// the browser's back/forward buttons.
setActiveSection((location.hash || "#cat-hero").slice(1));
window.addEventListener("hashchange", () => {
    setActiveSection((location.hash || "#cat-hero").slice(1));
});

// --- Pointer orbit + parallax (3D signature) -------------------------------
// The cutouts read the cursor to fake depth: they TRANSLATE opposite the mouse
// (--px/--py, like the home page) AND TILT toward it (--rx/--ry) so the collage
// feels like it's orbiting in space. We only write CSS vars — the element's own
// rotation and the entrance vars live in the same transform and aren't touched.
// Throttled to one update per frame; skipped under reduced-motion.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const orbitLayers = [...document.querySelectorAll(".cat-cutout")].map((el) => ({
    el,
    depth: parseFloat(el.dataset.depth) || 24,
}));

if (!reduceMotion && orbitLayers.length) {
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let frameQueued = false;

    function applyOrbit() {
        frameQueued = false;
        const nx = pointerX / window.innerWidth - 0.5;   // -0.5 .. 0.5
        const ny = pointerY / window.innerHeight - 0.5;
        orbitLayers.forEach(({ el, depth }) => {
            // Translate AWAY from the cursor (looking into the scene)…
            el.style.setProperty("--px", `${(-nx * depth).toFixed(1)}px`);
            el.style.setProperty("--py", `${(-ny * depth).toFixed(1)}px`);
            // …and TILT toward it. Tilt scales with depth so near layers swing
            // more — that difference is what reads as 3D rotation.
            el.style.setProperty("--ry", `${(nx * depth * 0.5).toFixed(1)}deg`);
            el.style.setProperty("--rx", `${(-ny * depth * 0.5).toFixed(1)}deg`);
        });
    }

    window.addEventListener("mousemove", (e) => {
        pointerX = e.clientX;
        pointerY = e.clientY;
        if (!frameQueued) {
            frameQueued = true;
            requestAnimationFrame(applyOrbit);
        }
    });
}

// --- GSAP hero entrance ----------------------------------------------------
// Two signatures, chosen by the active category's `anim`:
//   "orbit"   — the 3D one: cutouts swing in from below + the wordmark EXTRUDES
//               (its stacked text-shadow grows from flat to deep).
//   "default" — the simple opacity cascade every other category uses for now.
// In both cases we animate opacity + bespoke CSS vars (--enter-y/rot/scale,
// --extrude) so we never collide with the parallax/orbit transform above or the
// per-letter jitter. Skipped if GSAP didn't load or reduced-motion is on.
//
// A category with its OWN hero renderer (cat.hero set → mountHero below) owns
// the hero art entirely, so we skip this default cascade for it.
if (!cat.hero && typeof gsap !== "undefined" && !reduceMotion) {
    const letters = gsap.utils.toArray(".cat-hero .cat-title > span");
    const desc = gsap.utils.toArray(".cat-hero .cat-hero-desc");
    const decor = gsap.utils.toArray(".cat-hero .cat-hero-decor");

    gsap.set(desc, { opacity: 0, y: 20 });

    if (cat.anim === "orbit") {
        // Cutouts start lower, smaller and rotated, then settle (the "orbit in").
        gsap.set(orbitLayers.map((l) => l.el), {
            opacity: 0,
            "--enter-y": "70px",
            "--enter-rot": "-10deg",
            "--enter-scale": 0.8,
        });
        gsap.set(letters, { opacity: 0 });

        // Drive the extrude depth (px) and rebuild the stacked shadow each frame.
        const extrude = { d: 0 };
        const setExtrude = () => {
            const n = Math.round(extrude.d);
            let layers = "";
            for (let i = 1; i <= n; i++) layers += `${i}px ${i}px 0 var(--extrude-color),`;
            titleEl.style.textShadow = layers.slice(0, -1);
        };

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.to(orbitLayers.map((l) => l.el), {
            opacity: 1,
            "--enter-y": "0px",
            "--enter-rot": "0deg",
            "--enter-scale": 1,
            duration: 1.1,
            stagger: 0.12,
            ease: "back.out(1.4)", // slight overshoot = the cutouts "land"
        })
          .to(letters, { opacity: 1, duration: 0.4, stagger: 0.04 }, "-=0.7")
          .to(extrude, { d: 12, duration: 0.7, onUpdate: setExtrude }, "<")
          .to(desc, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4");
    } else {
        // Default cascade (the old behavior) for categories without a signature.
        gsap.set(decor, { opacity: 0 });
        gsap.set(letters, { opacity: 0 });
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
        tl.to(decor, { opacity: 1, duration: 1.2 })
          .to(letters, { opacity: 1, duration: 0.5, stagger: 0.015 }, "-=0.8")
          .to(desc, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3");
    }
}

// --- Per-category hero dispatch (Feature A) --------------------------------
// After the shell is built (title/desc filled, cutouts injected, erratic run),
// mount the category's custom hero renderer if it has one. Each renderer is an
// isolated module registered on window.VaivenHeroes:
//   "three"          → hero-3d.js       (ES module, importmap; async-registered)
//   "typewriter"     → category-heroes.js (mountWebHero)
//   "motion-kinetic" → category-heroes.js (mountMotionHero)
// Categories without a `hero` keep the erratic-title cascade above untouched.
const catHero = document.getElementById("cat-hero");

function mountHero(cat) {
    const H = window.VaivenHeroes || {};

    if (cat.hero === "typewriter" && typeof H.mountWebHero === "function") {
        H.mountWebHero(catHero, cat);
    } else if (cat.hero === "motion-kinetic" && typeof H.mountMotionHero === "function") {
        H.mountMotionHero(catHero, cat);
    } else if (cat.hero === "three") {
        mount3D();
    }
}

// The 3D hero is an ES module that may register AFTER this classic script runs.
// Try now; if it isn't ready yet, wait for the module's ready event once.
function mount3D() {
    const run = () => {
        const fn = window.VaivenHeroes && window.VaivenHeroes.mount3DHero;
        if (typeof fn !== "function") return false;
        // Mount the canvas into the collage layer. Only hide the erratic
        // fallback title once the canvas confirms it's rendering.
        const ok = fn(collage);
        if (ok) {
            catHero.classList.add("has-canvas-hero");
            const decor = document.querySelector(".cat-hero-decor");
            if (decor) decor.style.display = "none";
        }
        return true;
    };
    if (!run()) {
        document.addEventListener("vaiven:hero3d-ready", run, { once: true });
    }
}

mountHero(cat);
