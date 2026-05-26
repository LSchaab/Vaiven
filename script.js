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
