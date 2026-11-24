#!/usr/bin/env node
"use strict";

// Builds the legal pages from scripts/data/legal/<lang>.js:
//   privacy policy, cookie policy, legal notice and terms of use,
//   in English, Spanish, Portuguese and Russian (12 pages).
// Each page links to its translations (hreflang), loads the cookie banner,
// and follows the visitor's light or dark choice from the main site.
// build-pages.js runs this, so `node scripts/build-pages.js` rebuilds them.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const origin = "https://wellyington.github.io";
const CODES = ["en", "es", "pt", "ru"];
const HREFLANG = { en: "en", es: "es", pt: "pt-BR", ru: "ru" };
const DOCS = ["privacy", "cookies", "terms"];

function load(code) {
  return require(path.join(__dirname, "data", "legal", code + ".js"));
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Chinese appears only on Brine Club; its legal pages link to the English ones.
const ZH = {
  footerLabel: "法律信息",
  cookieSettings: "Cookie 设置",
  nav: { privacy: "隐私政策（英文）", cookies: "Cookie 政策（英文）", terms: "法律声明（英文）" },
  consentBefore: "我已阅读",
  consentLink: "隐私政策（英文）",
  consentAfter: "，并了解我的信息将用于回复我的咨询。",
  formNote: "Wellington Almeida 仅使用这些信息回复您。您可以随时查阅、更正或删除这些信息。",
};

// Footer links for other builders: { privacy: {href, label}, ... , settings }
function links(code) {
  const L = load(CODES.includes(code) ? code : "en");
  const out = {};
  DOCS.forEach(function (d) {
    out[d] = { href: L.docs[d].slug, label: code === "zh" ? ZH.nav[d] : L.docs[d].nav };
  });
  out.settings = code === "zh" ? ZH.cookieSettings : L.cookieSettings;
  out.label = code === "zh" ? ZH.footerLabel : L.footerLabel;
  return out;
}

// The required "I have read the privacy policy" checkbox for contact forms.
// `cls` holds optional class names: { label, box, link, note }.
function formConsent(code, id, cls) {
  const L = load(CODES.includes(code) ? code : "en");
  const T = code === "zh" ? ZH : L;
  cls = cls || {};
  const c = function (k) { return cls[k] ? ' class="' + cls[k] + '"' : ""; };
  return (
    "<label" + c("label") + ' for="' + id + '">' +
    '<input id="' + id + '" name="privacy_accepted" type="checkbox" value="yes" required' + c("box") + ">" +
    "<span>" + esc(T.consentBefore) +
    '<a href="' + L.docs.privacy.slug + '" target="_blank" rel="noopener"' + c("link") + ">" + esc(T.consentLink) + "</a>" +
    esc(T.consentAfter) + "</span></label>" +
    "<p" + c("note") + ">" + esc(T.formNote) + "</p>"
  );
}

// The legal links row for footers. `cls`: { nav, link }.
function footerLinks(code, cls) {
  const k = links(code);
  cls = cls || {};
  const a = cls.link ? ' class="' + cls.link + '"' : "";
  return (
    '<nav aria-label="' + esc(k.label) + '"' + (cls.nav ? ' class="' + cls.nav + '"' : "") + ">" +
    DOCS.map(function (d) { return '<a href="' + k[d].href + '"' + a + ">" + esc(k[d].label) + "</a>"; }).join("") +
    '<a href="#" data-cookie-settings' + a + ">" + esc(k.settings) + "</a></nav>"
  );
}

function render(L, doc, all) {
  const d = L.docs[doc];
  const url = origin + d.slug;
  const body = d.body
    .replace(/\{\{privacy\}\}/g, L.docs.privacy.slug)
    .replace(/\{\{cookies\}\}/g, L.docs.cookies.slug)
    .replace(/\{\{terms\}\}/g, L.docs.terms.slug)
    .trim();
  const alternates = CODES.map(function (c) {
    return '  <link rel="alternate" hreflang="' + HREFLANG[c] + '" href="' + origin + all[c].docs[doc].slug + '">';
  })
    .concat(['  <link rel="alternate" hreflang="x-default" href="' + origin + all.en.docs[doc].slug + '">'])
    .join("\n");
  const langs = CODES.map(function (c) {
    const here = c === L.code;
    return (
      '<a class="inline-flex min-h-11 items-center px-2 underline underline-offset-4" href="' +
      all[c].docs[doc].slug +
      '" hreflang="' + HREFLANG[c] + '" lang="' + HREFLANG[c] + '"' +
      (here ? ' aria-current="page"' : "") +
      ">" + esc(all[c].langName) + "</a>"
    );
  }).join("\n      ");
  const nav = DOCS.map(function (k) {
    const here = k === doc;
    return (
      '<li><a href="' + L.docs[k].slug + '"' + (here ? ' aria-current="page"' : "") + ">" +
      esc(L.docs[k].title) + "</a></li>"
    );
  }).join("\n        ");

  return `<!DOCTYPE html>
<html lang="${L.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(d.title)} · Wellyington</title>
  <meta name="description" content="${esc(d.description)}">
  <link rel="canonical" href="${url}">
${alternates}
  <meta name="theme-color" content="#e3fdfd" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#17484d" media="(prefers-color-scheme: dark)">
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
  <link rel="manifest" href="/site.webmanifest">
  <script>
    (function () {
      try {
        var saved = localStorage.getItem("welly-theme");
        var theme = saved === "light" || saved === "dark" ? saved
          : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        document.documentElement.setAttribute("data-theme", theme);
      } catch (e) {}
    })();
  </script>
  <link rel="stylesheet" href="/css/site.css">
  <style>
    .legal { font-size: 1.0625rem; line-height: 1.7; }
    .legal h2 { margin: 3rem 0 .75rem; font-size: 1.6rem; font-weight: 700; line-height: 1.15; letter-spacing: -.04em; }
    .legal h3 { margin: 1.75rem 0 .5rem; font-size: 1.15rem; font-weight: 700; letter-spacing: -.02em; }
    .legal p, .legal ul { margin: .75rem 0; max-width: 68ch; }
    .legal ul { list-style: disc; padding-left: 1.25rem; }
    .legal li { margin: .35rem 0; }
    .legal a { text-decoration: underline; text-underline-offset: 3px; }
    .legal .table { overflow-x: auto; margin: 1rem 0; }
    .legal table { width: 100%; min-width: 34rem; border-collapse: collapse; font-size: .95rem; }
    .legal th, .legal td { border: 1px solid currentColor; padding: .55rem .7rem; text-align: left; vertical-align: top; }
    .legal th { font-weight: 700; }
    .legal td:first-child { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .85rem; overflow-wrap: anywhere; }
    .legal-nav a[aria-current="page"] { font-weight: 700; text-decoration: none; }
  </style>
  <script src="/js/consent.js" data-ga="G-4XBY16BPLY" data-bg="#17484d" data-fg="#e3fdfd" defer></script>
</head>
<body class="bg-brand-cream font-sans text-brand-primary antialiased">
  <header class="flex flex-wrap items-center justify-between gap-2 border-b border-brand-primary/50">
    <a href="${L.home}" class="site-wordmark inline-flex min-h-14 items-center whitespace-nowrap px-3 font-bold tracking-[-0.06em] md:px-5">Wellyington</a>
    <nav class="flex flex-wrap text-sm" aria-label="Language">
      ${langs}
    </nav>
  </header>
  <main id="top" class="mx-auto max-w-3xl px-6 py-16 md:py-24">
    <p class="mb-3 text-xs font-bold uppercase tracking-[0.2em]">${esc(L.eyebrow)}</p>
    <h1 class="text-5xl font-bold leading-[0.9] tracking-[-0.06em] md:text-7xl">${esc(d.title)}</h1>
    <p class="mt-6 text-sm uppercase tracking-[0.14em] opacity-75">${esc(L.updatedLabel)}: <time datetime="2026-11-24">${esc(L.updated)}</time></p>
    <div class="legal mt-10">
${body}
    </div>
    <nav class="legal legal-nav mt-16 border-t border-brand-primary/50 pt-8" aria-label="${esc(L.otherDocs)}">
      <p class="text-xs font-bold uppercase tracking-[0.2em]">${esc(L.otherDocs)}</p>
      <ul>
        ${nav}
        <li><a href="#" data-cookie-settings>${esc(L.cookieSettings)}</a></li>
      </ul>
      <p class="mt-8"><a href="${L.home}">${esc(L.backHome)}</a></p>
    </nav>
  </main>
</body>
</html>
`;
}

// The journal (Jekyll) reads its footer links from _data/legal.yml.
function writeJournalData(all) {
  const q = function (v) { return JSON.stringify(String(v)); };
  const lines = ["# Generated by scripts/build-legal.js from scripts/data/legal/. Do not edit."];
  CODES.forEach(function (c) {
    const L = all[c];
    lines.push(c + ":");
    lines.push("  label: " + q(L.footerLabel));
    lines.push("  settings: " + q(L.cookieSettings));
    lines.push("  links:");
    DOCS.forEach(function (d) {
      lines.push("    - title: " + q(L.docs[d].nav));
      lines.push("      url: " + q(L.docs[d].slug));
    });
  });
  fs.writeFileSync(path.join(root, "journal-src", "_data", "legal.yml"), lines.join("\n") + "\n");
}

function buildLegal() {
  const all = {};
  CODES.forEach(function (c) { all[c] = load(c); });
  writeJournalData(all);
  let n = 0;
  CODES.forEach(function (c) {
    DOCS.forEach(function (doc) {
      const L = all[c];
      const html = render(L, doc, all);
      if (/\{\{/.test(html)) throw new Error(c + " " + doc + ": unreplaced token");
      if (html.includes("googletagmanager.com")) throw new Error(c + " " + doc + ": Google tag outside consent");
      const dir = path.join(root, L.docs[doc].slug.replace(/^\/|\/$/g, ""));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), html);
      n += 1;
    });
  });
  return n;
}

if (require.main === module) {
  console.log("Built " + buildLegal() + " legal pages.");
}

module.exports = { buildLegal: buildLegal, links: links, formConsent: formConsent, footerLinks: footerLinks, CODES: CODES, DOCS: DOCS };
