/* Wellyington — Journal · small, dependency-free, progressive. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  doc.classList.add("js");

  /* ── theme ─────────────────────────────────────────── */
  var toggle = $("[data-theme-toggle]");
  function syncTheme() {
    if (!toggle) return;
    var dark = doc.getAttribute("data-theme") === "dark";
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.setAttribute("aria-label", toggle.getAttribute(dark ? "data-label-light" : "data-label-dark") || "");
  }
  if (toggle) {
    syncTheme();
    toggle.addEventListener("click", function () {
      var next = doc.getAttribute("data-theme") === "dark" ? "light" : "dark";
      doc.setAttribute("data-theme", next);
      try { localStorage.setItem("journal-theme", next); } catch (e) {}
      syncTheme();
    });
  }

  /* ── menu ──────────────────────────────────────────── */
  var btn = $("[data-menu-btn]"), menu = $("[data-menu]");
  function setMenu(open) {
    doc.classList.toggle("menu-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", btn.getAttribute(open ? "data-label-close" : "data-label-open") || "");
    menu.setAttribute("aria-hidden", String(!open));
    if (open) { menu.removeAttribute("inert"); var f = $("a", menu); if (f) setTimeout(function () { f.focus(); }, 300); }
    else { menu.setAttribute("inert", ""); }
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (btn && menu) {
    btn.addEventListener("click", function () { setMenu(!doc.classList.contains("menu-open")); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && doc.classList.contains("menu-open")) { setMenu(false); btn.focus(); }
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  }

  /* ── language choice: remembered for the /journal/ redirect ── */
  $$("[data-set-lang]").forEach(function (a) {
    a.addEventListener("click", function () { try { localStorage.setItem("journal-lang", a.getAttribute("data-set-lang")); } catch (e) {} });
  });

  /* ── marquee: duplicate track for a seamless loop ─── */
  $$("[data-marquee]").forEach(function (t) { t.innerHTML += t.innerHTML; });

  /* ── live clocks ───────────────────────────────────── */
  var clocks = $$("[data-clock]");
  if (clocks.length && window.Intl) {
    var fmts = {};
    var tick = function () {
      var now = new Date();
      clocks.forEach(function (c) {
        var tz = c.getAttribute("data-clock");
        try {
          fmts[tz] = fmts[tz] || new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
          c.textContent = fmts[tz].format(now);
        } catch (e) {}
      });
    };
    tick(); setInterval(tick, 1000);
  }

  /* ── index filters ─────────────────────────────────── */
  var filters = $("[data-filters]");
  if (filters) {
    var rows = $$("[data-index] .row"), empty = $("[data-empty]");
    var apply = function (cat) {
      var shown = 0;
      $$(".filter", filters).forEach(function (b) {
        var on = b.getAttribute("data-filter") === cat;
        b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", String(on));
      });
      rows.forEach(function (r) {
        var hit = cat === "all" || r.getAttribute("data-cat") === cat;
        r.classList.toggle("is-hidden", !hit); if (hit) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    };
    filters.addEventListener("click", function (e) {
      var b = e.target.closest(".filter"); if (!b) return;
      var cat = b.getAttribute("data-filter");
      apply(cat);
      try { history.replaceState(null, "", cat === "all" ? location.pathname : "#" + cat); } catch (e2) {}
    });
    var h = location.hash.slice(1);
    if (h && $('[data-filter="' + h + '"]', filters)) apply(h);
  }

  /* ── image peek that follows the cursor on index rows ─ */
  var peek = $("[data-peek]");
  if (peek && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var img = $("img", peek), x = 0, y = 0, px = 0, py = 0, raf = null;
    var loop = function () {
      px += (x - px) * .18; py += (y - py) * .18;
      peek.style.left = px + "px"; peek.style.top = py + "px";
      raf = Math.abs(x - px) + Math.abs(y - py) > .5 ? requestAnimationFrame(loop) : null;
    };
    $$(".row[data-img]").forEach(function (r) {
      r.addEventListener("mouseenter", function (e) {
        img.src = r.getAttribute("data-img"); px = x = e.clientX; py = y = e.clientY; loop();
        peek.classList.add("is-on");
      });
      r.addEventListener("mousemove", function (e) { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
      r.addEventListener("mouseleave", function () { peek.classList.remove("is-on"); });
    });
  }

  /* ── reading progress ──────────────────────────────── */
  var bar = $("[data-progress]"), prose = $("[data-prose]");
  if (bar && prose) {
    var onScroll = function () {
      var r = prose.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (r.height + vh * .25)));
      bar.style.transform = "scaleX(" + p + ")";
    };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  /* ── table of contents from h2s ────────────────────── */
  var toc = $("[data-toc]"), list = $("[data-toc-list]");
  if (toc && prose) {
    var hs = $$("h2", prose).filter(function (h) { return !h.closest(".footnotes"); });
    if (hs.length > 1) {
      hs.forEach(function (h, i) {
        if (!h.id) h.id = "section-" + (i + 1);
        var li = document.createElement("li"), a = document.createElement("a");
        a.href = "#" + h.id; a.textContent = h.textContent; li.appendChild(a); list.appendChild(li);
      });
      toc.hidden = false;
      if ("IntersectionObserver" in window) {
        var links = $$("a", list);
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (en) {
            if (en.isIntersecting) links.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id); });
          });
        }, { rootMargin: "-20% 0px -70% 0px" });
        hs.forEach(function (h) { io.observe(h); });
      }
    }
  }

  /* ── copy link ─────────────────────────────────────── */
  var copy = $("[data-copy-link]");
  if (copy) copy.addEventListener("click", function () {
    var spans = $$(".roll > span", copy), old = spans[0].textContent;
    var done = function (t) { spans.forEach(function (s) { s.textContent = t; }); setTimeout(function () { spans.forEach(function (s) { s.textContent = old; }); }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { done(copy.getAttribute("data-copied") || "copied."); }, function () {});
  });

  /* ── reveal on scroll ──────────────────────────────── */
  if (!reduce && "IntersectionObserver" in window) {
    var targets = $$(".section-head, .feature, .row, .card, .prose > *, .pager, .cta, .year");
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); rio.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (t) { t.classList.add("reveal"); rio.observe(t); });
  }
})();
