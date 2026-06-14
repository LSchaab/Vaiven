// hero-motion.js — entrance animation for the hero, powered by GSAP.
// Runs after script.js, so the per-letter "erratic" spans already exist.
//
// We animate ONLY opacity here, on purpose. script.js already writes inline
// `transform` to two things: the hero headline + collage (pointer parallax) and
// each erratic letter (the style jitter). If GSAP also animated `transform` on
// those elements it would overwrite that motion. Opacity is untouched by either
// system, so a fade/cascade reveal coexists cleanly with the parallax + jitter.

// Skip entirely if GSAP failed to load or the visitor prefers reduced motion.
if (typeof gsap !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {

    // The collage cutouts (megaphone + brain) and every individual letter span.
    const collage = gsap.utils.toArray("#hero .hero-collage");
    const letters = gsap.utils.toArray("#hero .hero-headline .erratic > span");

    // Hide them before the first paint so there's no flash of the final state.
    gsap.set(collage, { opacity: 0 });
    gsap.set(letters, { opacity: 0 });

    // Timeline: collage fades in, then the headline appears letter by letter in
    // a quick cascade (the kinetic, "tipografía en movimiento" feel).
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    tl.to(collage, { opacity: 1, duration: 1.2, stagger: 0.2 })
      .to(letters, { opacity: 1, duration: 0.5, stagger: 0.018 }, "-=0.8");
}
