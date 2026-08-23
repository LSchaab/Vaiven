// hero-3d.js — Three.js extruded "3D" wordmark for the 3D category hero.
// ---------------------------------------------------------------------------
// Loaded as an ES module (see the importmap in portfolio.html). It registers a
// single entry point on window.VaivenHeroes so the classic-script portfolio.js
// can call it after building the page shell.
//
// GEOMETRY APPROACH — why ExtrudeGeometry, not TextGeometry/FontLoader:
//   The wordmark is just two glyphs ("3" and "D"). Rather than fetch a heavy
//   typeface JSON at runtime (an extra async load that can fail and needs a
//   font choice that isn't Montserrat anyway), we hand-build each glyph as a
//   THREE.Shape and extrude it. Deterministic, zero extra network requests,
//   and it fails loudly at parse time (in dev) instead of silently at runtime.
//
// COLOR — every colour is read from the resolved CSS custom properties so the
//   scene stays on-palette (and picks up a palette toggle on reload).
//
// INTERACTION — hand-rolled drag-to-orbit (pointer + touch) on the wordmark
//   group, with a gentle idle auto-spin that resumes after release. Vertical
//   orbit is clamped so the wordmark never flips.
//
// REDUCED MOTION — a single static framed render, no auto-spin, drag disabled.
//
// FALLBACK — the caller only hides the erratic .cat-title once mount3DHero()
//   resolves true. If WebGL is missing or anything throws, it returns false and
//   the existing text hero stays visible.

import * as THREE from "three";

// Read a resolved CSS custom property as a THREE.Color (falls back to a token
// hex if the var is empty for any reason). Colours come from styles.css :root.
function tokenColor(name, fallback) {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return new THREE.Color(raw || fallback);
}

// Detect WebGL up front so we can bail to the text fallback cleanly.
function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

// --- Glyph shapes ----------------------------------------------------------
// Each glyph is drawn in a ~1 unit em box (origin bottom-left) as a filled
// Shape with holes. Kept blocky/condensed to match the heavy display type.

// "3" — a chunky blocky 3 as a single non-self-intersecting outline. Traced
// counter-clockwise from the top-left, hugging the two bowls of the glyph.
function shape3() {
  const s = new THREE.Shape();
  s.moveTo(0.05, 0.9); // top-left
  s.lineTo(0.95, 0.9); // top bar
  s.lineTo(0.95, 0.4); // down the right edge of the upper bowl
  s.lineTo(0.95, 0.0); // continue down (single straight right edge)
  s.lineTo(0.05, 0.0); // bottom bar
  s.lineTo(0.05, 0.22); // up the short bottom-left stub
  s.lineTo(0.62, 0.22); // inner bottom bar
  s.lineTo(0.62, 0.4); // up to the middle notch
  s.lineTo(0.2, 0.4); // inner middle bar (the pinch of the 3)
  s.lineTo(0.2, 0.58); // small step back up
  s.lineTo(0.62, 0.58); // inner upper bar
  s.lineTo(0.62, 0.68); // up to the top counter
  s.lineTo(0.05, 0.68); // inner top bar
  s.closePath(); // back up the top-left edge
  return s;
}

// "D" — outer rounded rectangle with a rounded-rect counter (hole).
function shapeD() {
  const s = new THREE.Shape();
  s.moveTo(0.05, 0.0);
  s.lineTo(0.05, 0.9);
  s.lineTo(0.5, 0.9);
  // Right bowl via a quadratic curve out and back.
  s.bezierCurveTo(0.95, 0.9, 1.0, 0.55, 1.0, 0.45);
  s.bezierCurveTo(1.0, 0.35, 0.95, 0.0, 0.5, 0.0);
  s.closePath();

  // Counter (hole).
  const hole = new THREE.Path();
  hole.moveTo(0.28, 0.2);
  hole.lineTo(0.28, 0.7);
  hole.lineTo(0.5, 0.7);
  hole.bezierCurveTo(0.72, 0.7, 0.74, 0.52, 0.74, 0.45);
  hole.bezierCurveTo(0.74, 0.38, 0.72, 0.2, 0.5, 0.2);
  hole.closePath();
  s.holes.push(hole);
  return s;
}

// Public entry point. Returns true on success (canvas confirmed rendering),
// false if it fell back (caller keeps the erratic text hero visible).
export function mount3DHero(container) {
  if (!container || !webglAvailable()) return false;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let renderer;
  try {
    // --- Renderer / canvas -------------------------------------------------
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // let the blue section background show through
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const canvas = renderer.domElement;
    canvas.className = "cat-hero-canvas";
    // The wordmark should feel draggable; the section still gets pointer
    // events elsewhere because the canvas only covers the collage layer.
    canvas.style.touchAction = "none";
    container.appendChild(canvas);

    function sizeToContainer() {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    // --- Scene / camera ----------------------------------------------------
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    // --- Wordmark mesh -----------------------------------------------------
    const extrudeSettings = {
      depth: 0.45,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.045,
      bevelSegments: 3,
      curveSegments: 12,
    };

    const geo3 = new THREE.ExtrudeGeometry(shape3(), extrudeSettings);
    const geoD = new THREE.ExtrudeGeometry(shapeD(), extrudeSettings);
    // Place glyphs side by side (each glyph spans ~1 unit wide).
    geo3.translate(-1.05, 0, 0);
    geoD.translate(0.05, 0, 0);

    // Brand material: orange body, faintly metallic so the lighting reads as
    // a real extrude. Colours pulled from tokens.
    const bodyColor = tokenColor("--naranja", "#FF5B23");
    const material = new THREE.MeshStandardMaterial({
      color: bodyColor,
      metalness: 0.35,
      roughness: 0.35,
    });

    const group = new THREE.Group();
    const mesh3 = new THREE.Mesh(geo3, material);
    const meshD = new THREE.Mesh(geoD, material);
    group.add(mesh3, meshD);

    // Centre the group on its combined bounds so it orbits about its middle.
    const box = new THREE.Box3().setFromObject(group);
    const center = new THREE.Vector3();
    box.getCenter(center);
    group.position.sub(center);

    const pivot = new THREE.Group(); // outer pivot we rotate for the orbit
    pivot.add(group);
    scene.add(pivot);

    // --- Lighting (three-point, tinted with brand tokens) ------------------
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const keyColor = tokenColor("--blanco", "#FFFFFF");
    const key = new THREE.DirectionalLight(keyColor, 2.1);
    key.position.set(4, 5, 6);
    scene.add(key);

    // Cool rim from the aqua highlight token = brand edge glow.
    const rim = new THREE.DirectionalLight(
      tokenColor("--verde-agua-claro", "#ADE6ED"),
      1.4,
    );
    rim.position.set(-5, -2, -4);
    scene.add(rim);

    // Warm fill from the yellow accent token.
    const fill = new THREE.DirectionalLight(
      tokenColor("--amarillo", "#FFCC00"),
      0.6,
    );
    fill.position.set(-3, 3, 4);
    scene.add(fill);

    sizeToContainer();

    // --- Orbit state -------------------------------------------------------
    // We rotate the pivot directly (simpler + sturdier than OrbitControls for a
    // single hero object). rotX is clamped so the wordmark never back-flips.
    const MAX_TILT = 0.6; // ~34deg up/down clamp
    let rotX = -0.12; // slight downward tilt for a nice 3/4 read
    let rotY = -0.35;
    let velX = 0;
    let velY = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let idleSpin = !reduceMotion; // auto-spin unless reduced motion

    function onDown(e) {
      if (reduceMotion) return;
      dragging = true;
      idleSpin = false;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture?.(e.pointerId);
      canvas.style.cursor = "grabbing";
    }
    function onMove(e) {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      rotY += dx * 0.008;
      rotX += dy * 0.008;
      rotX = Math.max(-MAX_TILT, Math.min(MAX_TILT, rotX));
      velY = dx * 0.008;
      velX = dy * 0.008;
    }
    function onUp(e) {
      if (!dragging) return;
      dragging = false;
      canvas.releasePointerCapture?.(e.pointerId);
      canvas.style.cursor = "grab";
      // Resume idle spin shortly after release (once the throw settles).
      window.setTimeout(() => {
        if (!dragging) idleSpin = true;
      }, 900);
    }

    if (!reduceMotion) {
      canvas.style.cursor = "grab";
      canvas.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    }

    window.addEventListener("resize", sizeToContainer);

    // --- Render loop -------------------------------------------------------
    const clock = new THREE.Clock();
    function frame() {
      const dt = clock.getDelta();

      if (!reduceMotion) {
        if (idleSpin && !dragging) {
          rotY += dt * 0.35; // gentle continuous spin
        } else if (!dragging) {
          // Momentum throw after release, decaying to a stop.
          rotY += velY;
          rotX += velX;
          rotX = Math.max(-MAX_TILT, Math.min(MAX_TILT, rotX));
          velY *= 0.92;
          velX *= 0.92;
        }
        // Subtle idle bob so it never reads as a frozen frame.
        pivot.position.y = Math.sin(clock.elapsedTime * 1.1) * 0.06;
      }

      pivot.rotation.x = rotX;
      pivot.rotation.y = rotY;
      renderer.render(scene, camera);
      if (!reduceMotion) requestAnimationFrame(frame);
    }

    if (reduceMotion) {
      // Static framed shot: one render, slight 3/4 pose, no loop.
      pivot.rotation.x = rotX;
      pivot.rotation.y = rotY;
      renderer.render(scene, camera);
    } else {
      requestAnimationFrame(frame);
    }

    return true;
  } catch (err) {
    // Anything unexpected → tear down and let the text hero stand.
    console.warn("[hero-3d] init failed, keeping text fallback:", err);
    try {
      renderer && renderer.dispose();
      renderer && renderer.domElement.remove();
    } catch (e) {}
    return false;
  }
}

// Register on the shared namespace so the classic-script portfolio.js can reach
// this module function without importing it.
window.VaivenHeroes = window.VaivenHeroes || {};
window.VaivenHeroes.mount3DHero = mount3DHero;
// Let portfolio.js know the module resolved (it may have run first).
document.dispatchEvent(new CustomEvent("vaiven:hero3d-ready"));
