// palette.js — the eye = palette toggle (Feature B).
//
// Page-agnostic: works on index.html AND portfolio.html (any page that loads
// it). It guards for missing elements, so it's a safe no-op where there is no
// `.volver` eye. The eye STOPS navigating and instead flips between two
// palettes:
//   - base : the current CSS (no attribute on <html>)
//   - alt  : <html data-palette="alt"> (the Figma "changed" look, styled in
//            styles.css under html[data-palette="alt"] …)
//
// The chosen palette persists in localStorage under "vaiven-palette" and is
// applied pre-paint by a tiny inline snippet in each page's <head> (so there's
// no flash). This module keeps the DOM/localStorage in sync from then on.

(function () {
    "use strict";

    var STORAGE_KEY = "vaiven-palette";
    var root = document.documentElement;

    // --- Read/write the persisted choice (localStorage may be unavailable). ---
    function readStored() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    function writeStored(value) {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch (e) {
            /* storage blocked (private mode etc.) — toggle still works in-session */
        }
    }

    // --- Apply a palette to <html> + reflect it on the eye's aria-label. ---
    function isAlt() {
        return root.dataset.palette === "alt";
    }

    function applyPalette(mode) {
        if (mode === "alt") root.dataset.palette = "alt";
        else delete root.dataset.palette; // base = no attribute
    }

    // On load, sync <html> with storage. The pre-paint snippet already set the
    // attribute for "alt"; this makes sure "base" (or a cleared key) is clean.
    applyPalette(readStored() === "alt" ? "alt" : "base");

    // --- Wire the eye ---------------------------------------------------------
    var eye = document.querySelector(".volver");
    if (!eye) return; // page has no eye — nothing to toggle.

    // Re-role the eye from "navigate" to "toggle colors". It stays an <a> (fine
    // for keyboard: Enter activates natively), but must no longer route.
    eye.setAttribute("role", "button");
    eye.removeAttribute("href"); // kill navigation entirely; we handle activation
    eye.setAttribute("tabindex", "0");

    function labelFor() {
        // Announce what the control does next, not its current state.
        return isAlt() ? "Volver a los colores originales" : "Cambiar colores";
    }
    eye.setAttribute("aria-label", labelFor());

    function toggle() {
        var next = isAlt() ? "base" : "alt";
        applyPalette(next);
        writeStored(next);
        eye.setAttribute("aria-label", labelFor());
    }

    // Own the eye completely: block navigation AND stop any other click handler
    // (e.g. script.js's a[href^="#"] section-nav, or portfolio.js's) from firing.
    eye.addEventListener(
        "click",
        function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();
            toggle();
        },
        true // capture: run before bubbling handlers so they never see the click
    );

    // Keyboard: an <a> without href isn't activated by Enter automatically, and
    // Space should also flip it (button semantics). Handle both.
    eye.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
            e.preventDefault();
            toggle();
        }
    });
})();
