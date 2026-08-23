// category-heroes.js — GSAP-driven heroes for the Web and Motion categories.
// ---------------------------------------------------------------------------
// Classic script (matches portfolio.js). Exposes two renderers on the shared
// window.VaivenHeroes namespace; portfolio.js dispatches to the right one based
// on the active category's `hero` field. The Three.js 3D hero lives separately
// in hero-3d.js because it needs to be an ES module (importmap).
//
// Both renderers respect prefers-reduced-motion (instant, no typing/looping)
// and only animate CSS/opacity so they never fight the erratic per-letter
// jitter or the pointer parallax already running in portfolio.js.

(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  var hasGSAP = typeof window.gsap !== "undefined";

  // === A2 — Web hero: GSAP typewriter ======================================
  // Types the title "Programación Web" then a description line, each with a
  // blinking caret. Reduced motion shows everything instantly.
  //
  // container = the .cat-hero section. We take over its .cat-title and
  // .cat-hero-desc (already in the DOM) instead of adding new nodes.
  function mountWebHero(container, cat) {
    var titleEl = container.querySelector(".cat-title");
    var descEl = container.querySelector(".cat-hero-desc");
    if (!titleEl || !descEl) return;

    var titleText = "Programación Web";
    var descText =
      "Sitios que cargan rápido, se ven bien en cualquier pantalla y hacen " +
      "lo que tienen que hacer. HTML, CSS y JavaScript hasta que funcione.";

    // The shell filled these with the config title/desc and (for the title)
    // ran erraticize. For the typewriter we want plain, controllable text, so
    // reset both elements and drop the erratic per-letter styling.
    titleEl.classList.remove("erratic");
    titleEl.textContent = "";
    titleEl.setAttribute("aria-label", titleText);
    descEl.textContent = "";
    descEl.setAttribute("aria-label", descText);

    // A dedicated caret element we move from title → description.
    var caret = document.createElement("span");
    caret.className = "tw-caret";
    caret.setAttribute("aria-hidden", "true");

    if (reduceMotion || !hasGSAP) {
      // Instant: show the full copy, no typing, static caret parked on desc.
      titleEl.textContent = titleText;
      descEl.textContent = descText;
      descEl.appendChild(caret);
      return;
    }

    // Typewriter using a GSAP timeline that steps an index and rewrites text.
    // Using textContent (not innerHTML) keeps it safe and simple.
    titleEl.appendChild(caret);

    var titleState = { i: 0 };
    var descState = { i: 0 };

    function renderTitle() {
      titleEl.textContent = titleText.slice(0, Math.round(titleState.i));
      titleEl.appendChild(caret); // keep caret trailing the text
    }
    function renderDesc() {
      descEl.textContent = descText.slice(0, Math.round(descState.i));
      descEl.appendChild(caret);
    }

    var tl = gsap.timeline({ delay: 0.3 });
    tl.to(titleState, {
      i: titleText.length,
      duration: titleText.length * 0.06,
      ease: "none",
      onUpdate: renderTitle,
    })
      .to({}, { duration: 0.5 }) // beat before the description types
      .add(function () {
        // Hand the caret over to the description line.
        descEl.appendChild(caret);
      })
      .to(descState, {
        i: descText.length,
        duration: descText.length * 0.018,
        ease: "none",
        onUpdate: renderDesc,
      });
  }

  // === A3 — Motion hero: GSAP kinetic ======================================
  // Per-letter entrance with DISTINCT eases, then a subtle continuous loop
  // (gentle y-bob + skew oscillation) so "nothing stays still" — tastefully.
  // Reduced motion: static title + fade-in desc.
  function mountMotionHero(container, cat) {
    var titleEl = container.querySelector(".cat-title");
    var descEl = container.querySelector(".cat-hero-desc");
    if (!titleEl) return;

    // The shell already erraticized the title into per-letter <span>s. Reuse
    // them as the kinetic units.
    var letters = Array.prototype.slice.call(titleEl.querySelectorAll("span"));

    if (reduceMotion || !hasGSAP) {
      // Static title (already visible); just make sure desc is shown.
      if (descEl) descEl.style.opacity = "1";
      return;
    }

    // Distinct eases cycled across letters so each one enters with its own
    // character — the hallmark of a motion-graphics reel.
    var eases = [
      "back.out(2.2)",
      "elastic.out(1, 0.5)",
      "power4.out",
      "bounce.out",
      "circ.out",
      "expo.out",
    ];

    gsap.set(letters, {
      opacity: 0,
      yPercent: 120,
      display: "inline-block", // needed for transforms on inline spans
    });
    if (descEl) gsap.set(descEl, { opacity: 0, y: 20 });

    var tl = gsap.timeline({ delay: 0.2 });

    letters.forEach(function (el, idx) {
      tl.to(
        el,
        {
          opacity: 1,
          yPercent: 0,
          duration: 0.75,
          ease: eases[idx % eases.length],
        },
        idx * 0.09, // absolute-ish stagger via position param
      );
    });

    if (descEl) {
      tl.to(descEl, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, ">-0.2");
    }

    // Continuous loop after the entrance: each letter bobs + skews on its own
    // phase so the wordmark keeps breathing without being frantic.
    tl.add(function () {
      letters.forEach(function (el, idx) {
        gsap.to(el, {
          y: "-=6",
          skewX: 4,
          duration: 1.4 + (idx % 3) * 0.25,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: idx * 0.08,
        });
      });
    });
  }

  window.VaivenHeroes = window.VaivenHeroes || {};
  window.VaivenHeroes.mountWebHero = mountWebHero;
  window.VaivenHeroes.mountMotionHero = mountMotionHero;
})();
