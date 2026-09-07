// portfolio-grid.js — unified, filterable portfolio grid for the home page.
// Replaces the old per-category bento links (portfolio.html?cat=...) with a
// single grid of all projects, filterable by category + tool + free text.
// Adapted from the design in specs/02-explora-todo-page.md, but embedded in
// the home page instead of a separate explora.html (per the 2026-09-07
// storytelling redesign — the team decided to drop separate category pages
// entirely rather than add a third page).
//
// Depends on window.VaivenData (data.js, loaded first).

(function () {
    "use strict";

    var DATA = window.VaivenData;
    if (!DATA) return; // data.js failed to load — fail quiet, don't break the page

    var root = document.querySelector("[data-portfolio-grid]");
    if (!root) return;

    var state = {
        categoria: "todos",
        tools: new Set(),
        search: "",
    };

    // --- Build the static chrome (tabs, chips, search, counter) once --------
    var tabsEl = root.querySelector("[data-filter-categoria]");
    var chipsEl = root.querySelector("[data-filter-tools]");
    var searchEl = root.querySelector("[data-filter-search]");
    var counterEl = root.querySelector("[data-results-counter]");
    var resetEls = root.querySelectorAll("[data-reset-filters]");
    var gridEl = root.querySelector("[data-results-grid]");
    var emptyEl = root.querySelector("[data-empty-state]");

    function makeTab(key, label) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "filter-tab";
        btn.textContent = label;
        btn.dataset.categoria = key;
        btn.setAttribute("aria-pressed", key === "todos" ? "true" : "false");
        btn.addEventListener("click", function () {
            state.categoria = key;
            syncTabs();
            render();
        });
        return btn;
    }

    function syncTabs() {
        tabsEl.querySelectorAll(".filter-tab").forEach(function (btn) {
            btn.setAttribute("aria-pressed", btn.dataset.categoria === state.categoria ? "true" : "false");
        });
    }

    tabsEl.appendChild(makeTab("todos", "Todos"));
    Object.keys(DATA.CATEGORIES).forEach(function (key) {
        tabsEl.appendChild(makeTab(key, DATA.CATEGORIES[key].title));
    });

    Object.keys(DATA.TOOLS).forEach(function (key) {
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "tool-chip";
        chip.textContent = DATA.TOOLS[key].label;
        chip.dataset.tool = key;
        chip.setAttribute("aria-pressed", "false");
        chip.addEventListener("click", function () {
            if (state.tools.has(key)) state.tools.delete(key);
            else state.tools.add(key);
            chip.setAttribute("aria-pressed", state.tools.has(key) ? "true" : "false");
            render();
        });
        chipsEl.appendChild(chip);
    });

    searchEl.addEventListener("input", function () {
        state.search = searchEl.value.trim().toLowerCase();
        render();
    });

    resetEls.forEach(function (resetEl) {
        resetEl.addEventListener("click", function (e) {
            e.preventDefault();
            state.categoria = "todos";
            state.tools.clear();
            state.search = "";
            searchEl.value = "";
            chipsEl.querySelectorAll(".tool-chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
            syncTabs();
            render();
        });
    });

    // --- Filtering + rendering ----------------------------------------------
    function matches(p) {
        if (state.categoria !== "todos" && p.categoria !== state.categoria) return false;
        if (state.tools.size > 0) {
            var hasAny = p.programas.some(function (t) { return state.tools.has(t); });
            if (!hasAny) return false;
        }
        if (state.search) {
            var haystack = [
                p.titulo, p.copy, DATA.CATEGORIES[p.categoria].title,
                p.programas.map(function (t) { return DATA.TOOLS[t] ? DATA.TOOLS[t].label : t; }).join(" "),
            ].join(" ").toLowerCase();
            if (haystack.indexOf(state.search) === -1) return false;
        }
        return true;
    }

    function cardFor(p) {
        var card = document.createElement("article");
        card.className = "project-card";
        card.dataset.media = p.media;

        var thumbWrap = document.createElement("div");
        thumbWrap.className = "project-card-thumb is-blurred";
        if (p.thumb) {
            var img = document.createElement("img");
            img.src = p.thumb;
            img.alt = "";
            img.loading = "lazy";
            img.decoding = "async";
            thumbWrap.appendChild(img);
        } else {
            // No asset yet (video pendiente, o placeholder sin subir). Muestra
            // un bloque con el tipo de medio esperado en vez de dejarlo vacío.
            var stand = document.createElement("div");
            stand.className = "project-card-standin";
            stand.textContent = p.media === "video" ? "VIDEO — próximamente" : "IMAGEN — próximamente";
            thumbWrap.appendChild(stand);
        }
        // Juego de blur: se destapa al pasar el mouse o al enfocar con teclado.
        card.addEventListener("mouseenter", function () { thumbWrap.classList.remove("is-blurred"); });
        card.addEventListener("mouseleave", function () { thumbWrap.classList.add("is-blurred"); });
        card.addEventListener("focusin", function () { thumbWrap.classList.remove("is-blurred"); });
        card.addEventListener("focusout", function () { thumbWrap.classList.add("is-blurred"); });

        var body = document.createElement("div");
        body.className = "project-card-body";

        var cat = document.createElement("span");
        cat.className = "project-card-categoria";
        cat.textContent = DATA.CATEGORIES[p.categoria].title;

        var title = document.createElement("h3");
        title.className = "project-card-title";
        title.textContent = p.titulo;

        var copy = document.createElement("p");
        copy.className = "project-card-copy";
        copy.textContent = p.copy;

        var autor = document.createElement("span");
        autor.className = "project-card-autor";
        autor.textContent = p.autor === "TODO" ? "Autor: a completar" : p.autor;

        var tools = document.createElement("div");
        tools.className = "project-card-tools";
        p.programas.forEach(function (t) {
            var pill = document.createElement("span");
            pill.className = "project-tool-pill";
            pill.textContent = DATA.TOOLS[t] ? DATA.TOOLS[t].label : t;
            tools.appendChild(pill);
        });

        body.appendChild(cat);
        body.appendChild(title);
        body.appendChild(copy);
        body.appendChild(autor);
        body.appendChild(tools);

        card.appendChild(thumbWrap);
        card.appendChild(body);
        return card;
    }

    function render() {
        var results = DATA.PROYECTOS.filter(matches);
        gridEl.innerHTML = "";
        results.forEach(function (p) { gridEl.appendChild(cardFor(p)); });

        var anyFilterActive = state.categoria !== "todos" || state.tools.size > 0 || state.search !== "";
        // Only the meta-row reset (outside data-empty-state) hides when idle —
        // the one inside the empty state is always relevant when it's shown.
        resetEls.forEach(function (resetEl) {
            if (!resetEl.closest("[data-empty-state]")) resetEl.hidden = !anyFilterActive;
        });

        counterEl.textContent = results.length + (results.length === 1 ? " proyecto" : " proyectos");

        emptyEl.hidden = results.length !== 0;
        gridEl.hidden = results.length === 0;
    }

    render();
})();
