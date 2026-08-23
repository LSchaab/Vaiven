// tour.js — first-visit sequential gate (Feature C, HOME PAGE ONLY).
//
// On a first visit (no completion flag) the home sections must be walked in a
// fixed order:  hero → destacados → portfolio → nosotros → contacto.
// A section unlocks permanently once reached. Only the single next-allowed
// section is clickable ahead of the current reached-set; everything past it is
// dimmed + aria-disabled and its nav click is blocked. Finishing the whole
// sequence flips localStorage["vaiven-tour-done"] = "1" → free-nav forever.
//
// The logo and the eye (palette toggle) are NEVER gated — only the section nav
// links are. Integration with script.js is via two clean hooks it exposes:
//   window.VaivenNav.setActiveSection(id)   — the single source of navigation
//   window.VaivenNav.registerNavGuard(fn)   — (id) => boolean; return false to block
//   window.VaivenNav.onSectionChange(fn)    — called AFTER a section becomes active
//
// Dev reset: load index.html?tour=reset to clear the flag and re-arm the gate.

(function () {
    "use strict";

    var DONE_KEY = "vaiven-tour-done";
    // The REQUIRED walk order (independent of the nav's visual list order).
    var TOUR = ["hero", "destacados", "portfolio", "nosotros", "contacto"];

    var nav = window.VaivenNav;
    if (!nav) return; // script.js didn't expose its hooks — nothing to gate.

    // --- storage helpers (localStorage may be blocked) ------------------------
    function readDone() {
        try {
            return localStorage.getItem(DONE_KEY) === "1";
        } catch (e) {
            return false;
        }
    }
    function writeDone() {
        try {
            localStorage.setItem(DONE_KEY, "1");
        } catch (e) {}
    }
    function clearDone() {
        try {
            localStorage.removeItem(DONE_KEY);
        } catch (e) {}
    }

    // --- Dev reset: ?tour=reset clears the flag and re-arms the gate. ---------
    var params = new URLSearchParams(location.search);
    if (params.get("tour") === "reset") clearDone();

    // Already completed on this browser → free-nav, gate never runs.
    if (readDone()) return;

    // --- Gate state -----------------------------------------------------------
    var reached = new Set();

    // A section is unlocked if it's already reached OR it's the immediate next
    // unreached item in TOUR (the single allowed "next" step).
    function isUnlocked(id) {
        if (reached.has(id)) return true;
        for (var i = 0; i < TOUR.length; i++) {
            if (!reached.has(TOUR[i])) return TOUR[i] === id; // first unreached
        }
        return true; // all reached (shouldn't hit — gate is torn down by then)
    }

    // Reflect lock state on the section nav links (.is-locked + aria-disabled).
    // The logo and the eye are NOT `nav a` links, so they're never touched here.
    function refreshLocks() {
        document.querySelectorAll("nav a[href^='#']").forEach(function (link) {
            var id = (link.getAttribute("href") || "").slice(1);
            if (!TOUR.includes(id)) return; // ignore non-section anchors
            if (isUnlocked(id)) {
                link.classList.remove("is-locked");
                link.removeAttribute("aria-disabled");
            } else {
                link.classList.add("is-locked");
                link.setAttribute("aria-disabled", "true");
            }
        });
    }

    // Tear the gate down: mark done, drop all locks, unregister the guard.
    function complete() {
        writeDone();
        document.querySelectorAll("nav a.is-locked").forEach(function (link) {
            link.classList.remove("is-locked");
            link.removeAttribute("aria-disabled");
        });
        nav.registerNavGuard(null); // stop blocking future navigations
    }

    // --- Register with script.js ---------------------------------------------
    // Guard: block navigation to a locked section (return false).
    nav.registerNavGuard(function (id) {
        return isUnlocked(id);
    });

    // Observe: whenever a section actually becomes active, mark it reached and
    // refresh locks. Completing the full sequence tears the gate down.
    nav.onSectionChange(function (id) {
        if (TOUR.includes(id)) reached.add(id);
        if (TOUR.every(function (s) { return reached.has(s); })) {
            complete();
            return;
        }
        refreshLocks();
    });

    // Seed from the section script.js already activated on load (usually hero).
    var current = nav.getActiveSection && nav.getActiveSection();
    if (current && TOUR.includes(current)) reached.add(current);
    refreshLocks();
})();
