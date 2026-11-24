/*
  Cookie consent for wellyington.github.io (main site, journal, Brine Club).

  What it does
  - Google Analytics (GA4) is the only thing on the site that needs consent.
    Its script is NOT loaded, and no _ga cookies are set, until the visitor
    presses "Accept". Nothing is sent to Google before that.
  - "Reject" is a button of the same size and weight as "Accept", on the
    first screen (AEPD cookie guide, 2023; EDPB guidelines 05/2020 and 03/2022).
  - The choice is kept for 12 months in localStorage ("welly-consent"), then
    the banner asks again. Any element with [data-cookie-settings] reopens it,
    so the visitor can change their mind at any time; rejecting after
    accepting deletes the _ga cookies.
  - Text follows <html lang>: en, es, pt, ru, zh (anything else: English).

  Use
    <script src="/js/consent.js" data-ga="G-XXXXXXX" defer></script>
  Optional: data-bg / data-fg / data-accent to match the page colours.
*/
(function () {
  "use strict";

  var me = document.currentScript;
  var GA = (me && me.getAttribute("data-ga")) || "";
  var KEY = "welly-consent";
  var VERSION = 1;
  var MAX_AGE = 365 * 24 * 60 * 60 * 1000;

  var TEXT = {
    en: {
      label: "Cookie choice",
      title: "Cookies",
      body: "I'd like to use Google Analytics to count visits and see which pages people read. It sets cookies, so it only runs if you agree. Your theme and language choices are stored on your device either way and never leave it.",
      accept: "Accept analytics",
      reject: "Reject",
      policy: "Cookie policy",
      href: "/cookies/",
    },
    es: {
      label: "Elección de cookies",
      title: "Cookies",
      body: "Me gustaría usar Google Analytics para contar las visitas y ver qué páginas se leen. Instala cookies, así que solo funciona si lo aceptas. Tus preferencias de tema e idioma se guardan en tu dispositivo en cualquier caso y no salen de él.",
      accept: "Aceptar analítica",
      reject: "Rechazar",
      policy: "Política de cookies",
      href: "/es/cookies/",
    },
    pt: {
      label: "Escolha de cookies",
      title: "Cookies",
      body: "Eu gostaria de usar o Google Analytics para contar as visitas e ver quais páginas são lidas. Ele grava cookies, então só funciona se você aceitar. As suas preferências de tema e idioma ficam no seu aparelho de qualquer forma e não saem dele.",
      accept: "Aceitar análise",
      reject: "Recusar",
      policy: "Política de cookies",
      href: "/pt/cookies/",
    },
    ru: {
      label: "Выбор cookies",
      title: "Cookies",
      body: "Я хотел бы использовать Google Analytics, чтобы считать посещения и видеть, какие страницы читают. Он сохраняет cookies, поэтому работает только с вашего согласия. Выбор темы и языка в любом случае хранится на вашем устройстве и никуда не передаётся.",
      accept: "Принять аналитику",
      reject: "Отклонить",
      policy: "Политика cookies",
      href: "/ru/cookies/",
    },
    zh: {
      label: "Cookie 选择",
      title: "Cookies",
      body: "我希望使用 Google Analytics 统计访问量并了解哪些页面被阅读。它会设置 Cookie，因此只有在您同意后才会运行。您的主题和语言选择无论如何都只保存在您的设备上。",
      accept: "接受分析",
      reject: "拒绝",
      policy: "Cookie 政策（英文）",
      href: "/cookies/",
    },
  };

  var lang = (document.documentElement.lang || "en").slice(0, 2).toLowerCase();
  var t = TEXT[lang] || TEXT.en;

  // ── stored choice ────────────────────────────────────────────────
  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!v || v.v !== VERSION || !v.ts || Date.now() - v.ts > MAX_AGE) return null;
      return v;
    } catch (e) {
      return null;
    }
  }
  function save(analytics) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: VERSION, analytics: !!analytics, ts: Date.now() }));
    } catch (e) {}
  }

  // ── Google Analytics, only after consent ──────────────────────────
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  function startAnalytics() {
    if (!GA || window.__wellyGa) return;
    window.__wellyGa = true;
    window.gtag = gtag;
    gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    gtag("js", new Date());
    gtag("config", GA);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA);
    document.head.appendChild(s);
  }

  function stopAnalytics() {
    if (window.__wellyGa) gtag("consent", "update", { analytics_storage: "denied" });
    var host = location.hostname;
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (!/^_ga/.test(name)) return;
      ["", "; domain=" + host, "; domain=." + host].forEach(function (d) {
        document.cookie = name + "=; Max-Age=0; path=/" + d;
      });
    });
  }

  // ── banner ───────────────────────────────────────────────────────
  var box;
  var css =
    ".wc-box{position:fixed;z-index:2147483000;left:16px;right:16px;bottom:16px;max-width:30rem;" +
    "padding:20px 20px 18px;background:var(--wc-bg,#fff);color:var(--wc-fg,#111);" +
    "border:1px solid currentColor;border-radius:4px;box-shadow:0 18px 50px -12px rgba(0,0,0,.35);" +
    "font:inherit;font-size:15px;line-height:1.5}" +
    ".wc-box h2{margin:0 0 6px;font:inherit;font-size:17px;font-weight:700;letter-spacing:-.01em}" +
    ".wc-box p{margin:0}" +
    ".wc-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}" +
    ".wc-btn{flex:1 1 9rem;min-height:44px;padding:10px 16px;border:1px solid currentColor;border-radius:2px;" +
    "background:transparent;color:inherit;font:inherit;font-weight:700;cursor:pointer}" +
    ".wc-btn:hover{background:var(--wc-fg,#111);color:var(--wc-bg,#fff)}" +
    ".wc-btn:focus-visible,.wc-link:focus-visible{outline:2px solid var(--wc-accent,currentColor);outline-offset:3px}" +
    ".wc-link{display:inline-block;margin-top:12px;color:inherit;text-decoration:underline;text-underline-offset:3px}" +
    "@media (min-width:640px){.wc-box{left:24px;bottom:24px;right:auto}}" +
    "@media print{.wc-box{display:none}}";

  function build() {
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);

    box = document.createElement("section");
    box.className = "wc-box";
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", t.label);
    if (me) {
      ["bg", "fg", "accent"].forEach(function (k) {
        var v = me.getAttribute("data-" + k);
        if (v) box.style.setProperty("--wc-" + k, v);
      });
    }

    var h = document.createElement("h2");
    h.textContent = t.title;
    var p = document.createElement("p");
    p.textContent = t.body;
    var row = document.createElement("div");
    row.className = "wc-row";
    var acc = button(t.accept, true);
    var rej = button(t.reject, false);
    row.appendChild(rej);
    row.appendChild(acc);
    var a = document.createElement("a");
    a.className = "wc-link";
    a.href = t.href;
    a.textContent = t.policy;

    box.appendChild(h);
    box.appendChild(p);
    box.appendChild(row);
    box.appendChild(a);
    document.body.appendChild(box);
  }

  function button(label, value) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "wc-btn";
    b.textContent = label;
    b.addEventListener("click", function () { choose(value); });
    return b;
  }

  function show(focus) {
    if (!box) build();
    box.hidden = false;
    if (focus) {
      var first = box.querySelector("button");
      if (first) first.focus();
    }
  }

  function hide() {
    if (box) box.hidden = true;
  }

  function choose(analytics) {
    var before = read();
    save(analytics);
    hide();
    if (analytics) startAnalytics();
    else stopAnalytics();
    if (before && before.analytics && !analytics && window.__wellyGa) {
      // GA was running on this page: reload so it is gone completely.
      location.reload();
    }
  }

  window.wellyConsent = {
    open: function () { show(true); },
    get: function () { var v = read(); return v ? v.analytics : null; },
  };

  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-cookie-settings]");
    if (!el) return;
    e.preventDefault();
    show(true);
  });

  function init() {
    var v = read();
    if (v && v.analytics) startAnalytics();
    else if (!v) show(false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
