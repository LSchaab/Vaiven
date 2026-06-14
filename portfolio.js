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

// --- GSAP hero entrance ----------------------------------------------------
// Animate OPACITY (and a safe y on the plain description) only — the letter
// transforms above are left alone, so the two systems don't overwrite each
// other. Skipped if GSAP didn't load or the visitor prefers reduced motion.
if (typeof gsap !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {

    const decor = gsap.utils.toArray(".cat-hero .cat-hero-decor");
    const letters = gsap.utils.toArray(".cat-hero .cat-title .erratic > span, .cat-hero .cat-title > span");
    const desc = gsap.utils.toArray(".cat-hero .cat-hero-desc");

    // Hide before first paint so there's no flash of the final state.
    gsap.set(decor, { opacity: 0 });
    gsap.set(letters, { opacity: 0 });
    gsap.set(desc, { opacity: 0, y: 20 });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.to(decor, { opacity: 1, duration: 1.2 })
      .to(letters, { opacity: 1, duration: 0.5, stagger: 0.015 }, "-=0.8")
      .to(desc, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3");
}
