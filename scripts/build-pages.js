#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const origin = "https://wellyington.github.io";
const templatePath = path.join(root, "templates", "index.html");
const localeDir = path.join(root, "locales");

const codes = ["en", "es", "pt", "ru"];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function replaceAll(html, from, to) {
  assert(html.includes(from), "Missing snippet:\n" + from.slice(0, 180));
  return html.split(from).join(to);
}

function replaceValue(html, value, token) {
  const escaped = escapeHtml(value);
  const forms = [];
  if (escaped !== value) forms.push(escaped);
  forms.push(value);

  function apply(source, form) {
    const parts = source.split(/(\{\{[^}]+\}\})/g);
    let count = 0;
    const next = parts
      .map(function (part) {
        if (part.indexOf("{{") === 0) return part;
        const bits = part.split(form);
        count += bits.length - 1;
        return bits.join("{{" + token + "}}");
      })
      .join("");
    return { source: next, count: count };
  }

  let count = 0;
  forms.forEach(function (form) {
    const result = apply(html, form);
    html = result.source;
    count += result.count;
  });
  assert(count > 0, "Missing copy for " + token + ":\n" + value.slice(0, 180));
  return { html: html, count: count };
}

function flagUk(id) {
  return (
    '<svg class="flag" viewBox="0 0 60 30" aria-hidden="true" focusable="false">' +
    '<defs><clipPath id="' + id + '"><path d="M0 0h60v30H0z"/></clipPath></defs>' +
    '<g clip-path="url(#' + id + ')">' +
    '<path fill="#012169" d="M0 0h60v30H0z"/>' +
    '<path stroke="#fff" stroke-width="6" d="M0 0l60 30M60 0L0 30"/>' +
    '<path stroke="#C8102E" stroke-width="4" d="M0 0l60 30M60 0L0 30"/>' +
    '<path stroke="#fff" stroke-width="10" d="M30 0v30M0 15h60"/>' +
    '<path stroke="#C8102E" stroke-width="6" d="M30 0v30M0 15h60"/>' +
    "</g></svg>"
  );
}

function flagEs() {
  return (
    '<svg class="flag" viewBox="0 0 60 40" aria-hidden="true" focusable="false">' +
    '<path fill="#AA151B" d="M0 0h60v40H0z"/>' +
    '<path fill="#F1BF00" d="M0 10h60v20H0z"/>' +
    "</svg>"
  );
}

function flagBr() {
  return (
    '<svg class="flag" viewBox="0 0 60 42" aria-hidden="true" focusable="false">' +
    '<path fill="#009B3A" d="M0 0h60v42H0z"/>' +
    '<path fill="#FFDF00" d="M30 4 56 21 30 38 4 21z"/>' +
    '<circle cx="30" cy="21" r="8.5" fill="#002776"/>' +
    "</svg>"
  );
}

function flagRu() {
  return (
    '<svg class="flag" viewBox="0 0 60 42" aria-hidden="true" focusable="false">' +
    '<path fill="#fff" d="M0 0h60v14H0z"/>' +
    '<path fill="#0039A6" d="M0 14h60v14H0z"/>' +
    '<path fill="#D52B1E" d="M0 28h60v14H0z"/>' +
    "</svg>"
  );
}

function flag(code, id) {
  if (code === "en") return flagUk(id);
  if (code === "es") return flagEs();
  if (code === "pt") return flagBr();
  return flagRu();
}

function pageUrl(locale) {
  return origin + locale.path;
}

function switcher(locale, locales, variant) {
  const id = "lang-menu-" + variant;
  const current = locales[locale.code];
  const links = codes
    .map(function (code) {
      const item = locales[code];
      const currentAttr = code === locale.code ? ' aria-current="page"' : "";
      return (
        '<a href="' + item.path + '" hreflang="' + item.hreflang + '" lang="' + item.htmlLang + '" data-set-lang="' + code + '"' + currentAttr + ">" +
        flag(code, "flag-" + variant + "-" + code) +
        "<span>" + escapeHtml(item.label) + "</span></a>"
      );
    })
    .join("");
  return (
    '<div class="lang-switcher lang-switcher--' + variant + '" data-lang-switcher>' +
    '<button type="button" aria-expanded="false" aria-haspopup="true" aria-controls="' + id + '" aria-label="' + escapeHtml(locale.langLabel) + '">' +
    flag(locale.code, "flag-" + variant + "-current") +
    "<span>" + escapeHtml(current.label) + "</span></button>" +
    '<div id="' + id + '" class="lang-menu" data-lang-menu role="group" aria-label="' + escapeHtml(locale.langLabel) + '" hidden>' +
    links +
    "</div></div>"
  );
}

function hint(locale) {
  return (
    '<div id="langHint" hidden>' +
    '<a id="langHintLink" href="/"></a>' +
    '<button type="button" id="langHintDismiss" aria-label="' + escapeHtml(locale.hintDismiss) + '">×</button>' +
    "</div>"
  );
}

function filterButtons(locale) {
  const items = [
    ["*", locale.filterAll],
    ["real-estate", locale.catRealEstate],
    ["relocation", locale.catRelocation],
    ["interior", locale.catInterior],
    ["renovation", locale.catRenovation],
    ["editorial", locale.catEditorial],
    ["culture", locale.catCulture],
    ["wellness", locale.catWellness],
    ["health", locale.catHealth],
    ["coaching", locale.catCoaching],
    ["costa", locale.catCosta],
  ];
  return items
    .map(function (item) {
      const pressed = item[0] === "*" ? "true" : "false";
      return (
        '<button type="button" class="tag-filter-btn" data-cat="' + item[0] + '" aria-pressed="' + pressed + '">' +
        escapeHtml(item[1]) +
        "</button>"
      );
    })
    .join("");
}

function hreflangLinks() {
  const locales = loadLocales();
  const lines = codes.map(function (code) {
    const item = locales[code];
    return '  <link rel="alternate" hreflang="' + item.hreflang + '" href="' + pageUrl(item) + '">';
  });
  lines.push('  <link rel="alternate" hreflang="x-default" href="' + origin + '/">');
  return lines.join("\n");
}

function ogAlternates(locale) {
  const locales = loadLocales();
  return codes
    .filter(function (code) {
      return code !== locale.code;
    })
    .map(function (code) {
      return '  <meta property="og:locale:alternate" content="' + locales[code].ogLocale + '">';
    })
    .join("\n");
}

function jsonLd(locale) {
  const url = pageUrl(locale);
  const cities = [
    locale.cityEstepona,
    locale.cityMarbella,
    locale.cityMalaga,
    locale.cityTorremolinos,
    locale.cityNerja,
    locale.cityGibraltar,
    locale.cityAlgeciras,
  ].map(function (name) {
    return { "@type": "City", name: name };
  });
  cities.push({ "@type": "AdministrativeArea", name: locale.schemaArea });
  const faqs = [1, 2, 3, 4].map(function (index) {
    return {
      "@type": "Question",
      name: locale["faq" + index + "q"],
      acceptedAnswer: { "@type": "Answer", text: locale["faq" + index + "a"] },
    };
  });
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": origin + "/#person",
        name: "Wellington Almeida",
        alternateName: "Wellyington",
        jobTitle: locale.schemaJobTitle,
        description: locale.schemaPerson,
        url: url,
        email: "welly.almeida@gmail.com",
        telephone: "+34604286691",
        knowsLanguage: ["en", "pt", "es"],
        image: origin + "/images/welly-portrait.jpg",
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: "School of Visual Arts",
          address: {
            "@type": "PostalAddress",
            addressLocality: "New York",
            addressCountry: "US",
          },
        },
        homeLocation: {
          "@type": "Place",
          name: locale.schemaHome,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Estepona",
            addressRegion: "Costa del Sol",
            addressCountry: "ES",
          },
        },
        sameAs: [
          "https://x.com/wellyington",
          "https://instagram.com/wellyington",
          "https://facebook.com/wellyington/",
          "https://www.linkedin.com/in/wellyington/",
        ],
      },
      {
        "@type": ["ProfessionalService", "LocalBusiness"],
        "@id": origin + "/#business",
        name: "Wellyington",
        url: url,
        email: "welly.almeida@gmail.com",
        telephone: "+34604286691",
        image: origin + "/images/welly-portrait.jpg",
        description: locale.schemaBusiness,
        inLanguage: locale.htmlLang,
        areaServed: cities,
        serviceType: locale.schemaOffers.map(function (offer) {
          return offer.name;
        }),
        address: {
          "@type": "PostalAddress",
          addressLocality: "Estepona",
          addressRegion: "Málaga",
          addressCountry: "ES",
        },
        founder: { "@id": origin + "/#person" },
        provider: { "@id": origin + "/#person" },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: locale.schemaCatalog,
          itemListElement: locale.schemaOffers.map(function (offer) {
            return {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: offer.name,
                description: offer.description,
              },
            };
          }),
        },
      },
      {
        "@type": "FAQPage",
        "@id": url + "#faq",
        inLanguage: locale.htmlLang,
        mainEntity: faqs,
      },
    ],
  };
  return '<script type="application/ld+json">\n  ' + JSON.stringify(data, null, 2).replace(/\n/g, "\n  ") + "\n  </script>";
}

function loadLocales() {
  const locales = {};
  codes.forEach(function (code) {
    locales[code] = readJson(path.join(localeDir, code + ".json"));
    assert(locales[code].code === code, code + " locale has the wrong code");
  });
  return locales;
}

function tokenize(source) {
  const en = readJson(path.join(localeDir, "en.json"));
  let html = source;

  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    "{{jsonLd}}"
  );

  html = replaceAll(
    html,
    '<html lang="en" data-theme="light">',
    '<html lang="{{htmlLang}}" data-lang="{{code}}" data-theme="light" data-theme-to-dark="{{themeToDark}}" data-theme-to-light="{{themeToLight}}">'
  );
  html = replaceAll(
    html,
    '<link rel="canonical" href="https://wellyington.github.io/">',
    "{{hreflang}}\n  <link rel=\"canonical\" href=\"{{pageUrl}}\">"
  );
  html = replaceAll(
    html,
    '<meta property="og:locale" content="en_GB">',
    '<meta property="og:locale" content="{{ogLocale}}">\n{{ogAlternates}}'
  );
  html = replaceAll(
    html,
    '<meta property="og:url" content="https://wellyington.github.io/">',
    '<meta property="og:url" content="{{pageUrl}}">'
  );

  [
    ["href=\"favicon", "href=\"/favicon"],
    ["href=\"apple-touch.png\"", "href=\"/apple-touch.png\""],
    ["href=\"site.webmanifest\"", "href=\"/site.webmanifest\""],
    ["href=\"fonts/", "href=\"/fonts/"],
    ["href=\"css/", "href=\"/css/"],
    ["href=\"images/", "href=\"/images/"],
    ["src=\"images/", "src=\"/images/"],
    ["srcset=\"images/", "srcset=\"/images/"],
    ["src=\"js/", "src=\"/js/"],
  ].forEach(function (pair) {
    html = replaceAll(html, pair[0], pair[1]);
  });

  html = replaceAll(
    html,
    "md:col-span-3 md:px-6",
    "md:col-span-2 md:px-6"
  );
  html = replaceAll(
    html,
    "justify-end md:col-span-3",
    "justify-end md:col-span-4"
  );
  html = replaceAll(
    html,
    '<button id="themeToggleBtn"',
    "{{langSwitcherHeader}}\n      <button id=\"themeToggleBtn\""
  );
  html = replaceAll(
    html,
    '<span class="theme-word"></span>\n          <span class="theme-word" aria-hidden="true"></span>',
    '<span class="theme-word" data-light="{{themeLight}}" data-dark="{{themeDark}}"></span>\n          <span class="theme-word" data-light="{{themeLight}}" data-dark="{{themeDark}}" aria-hidden="true"></span>'
  );
  html = replaceAll(
    html,
    '<a class="skip-link" href="#top">',
    "{{langHint}}\n  <a class=\"skip-link\" href=\"#top\">"
  );
  html = replaceAll(
    html,
    'aria-label="Open menu"',
    'aria-label="{{menuOpen}}" data-label-open="{{menuOpen}}" data-label-close="{{menuClose}}"'
  );
  html = replaceAll(html, 'aria-label="Menu"', 'aria-label="{{menuLabel}}"');
  html = replaceAll(
    html,
    'aria-hidden="true" inert>\n    <div class="grid grid-cols-1 gap-8',
    'aria-hidden="true" inert>\n    {{langSwitcherMenu}}\n    <div class="grid grid-cols-1 gap-8'
  );
  html = replaceAll(
    html,
    "<span>about</span><span aria-hidden=\"true\">about</span>",
    "<span>{{footerAbout}}</span><span aria-hidden=\"true\">{{footerAbout}}</span>"
  );
  html = replaceAll(
    html,
    "<span>works</span><span aria-hidden=\"true\">works</span>",
    "<span>{{footerWorks}}</span><span aria-hidden=\"true\">{{footerWorks}}</span>"
  );
  html = replaceAll(
    html,
    "<span>contact</span><span aria-hidden=\"true\">contact</span>",
    "<span>{{footerContact}}</span><span aria-hidden=\"true\">{{footerContact}}</span>"
  );
  html = replaceAll(html, ">Call</span>", ">{{callLabel}}</span>");
  html = replaceAll(html, ">Close</button>", ">{{closeLabel}}</button>");
  html = replaceAll(
    html,
    'aria-label="Filter projects"></div>',
    'aria-label="{{filterAria}}">{{filterButtons}}</div>'
  );
  html = replaceAll(
    html,
    '<div id="worksGrid" class="grid grid-cols-4 md:grid-cols-10">',
    '<div id="worksGrid" class="grid grid-cols-4 md:grid-cols-10" data-empty-query="{{emptyQuery}}" data-empty-filter="{{emptyFilter}}" data-status-one="{{statusOne}}" data-status-many="{{statusMany}}">'
  );
  html = replaceAll(
    html,
    'data-tags="Real Estate,Relocation,Costa del Sol"',
    'data-tags="real-estate,relocation,costa" data-tag-labels="{{p0tags}}"'
  );
  html = replaceAll(
    html,
    'data-tags="Interior Design,Renovation,Costa del Sol"',
    'data-tags="interior,renovation,costa" data-tag-labels="{{p1tags}}"'
  );
  html = replaceAll(
    html,
    'data-tags="Editorial,Culture,Costa del Sol"',
    'data-tags="editorial,culture,costa" data-tag-labels="{{p2tags}}"'
  );
  html = replaceAll(
    html,
    'data-tags="Wellness,Health"',
    'data-tags="wellness,health" data-tag-labels="{{p3tags}}"'
  );
  html = replaceAll(
    html,
    'data-tags="Relocation,Coaching"',
    'data-tags="relocation,coaching" data-tag-labels="{{p4tags}}"'
  );

  const skip = {
    htmlLang: 1, ogLocale: 1, hreflang: 1, path: 1, code: 1, label: 1,
    menuOpen: 1, menuClose: 1, menuLabel: 1, themeToDark: 1, themeToLight: 1, themeLight: 1, themeDark: 1,
    footerAbout: 1, footerWorks: 1, footerContact: 1, callLabel: 1, closeLabel: 1, filterAria: 1,
    langLabel: 1, hintDismiss: 1, filterAll: 1, catRealEstate: 1, catRelocation: 1,
    catCosta: 1, catInterior: 1, catRenovation: 1, catEditorial: 1, catCulture: 1,
    catWellness: 1, catHealth: 1, catCoaching: 1, emptyQuery: 1, emptyFilter: 1,
    statusOne: 1, statusMany: 1, p0tags: 1, p1tags: 1, p2tags: 1, p3tags: 1, p4tags: 1,
    schemaJobTitle: 1, schemaPerson: 1, schemaHome: 1, schemaBusiness: 1,
    schemaCatalog: 1, schemaArea: 1, schemaOffers: 1, cityEstepona: 1, cityMarbella: 1,
    cityMalaga: 1, cityTorremolinos: 1, cityNerja: 1, cityGibraltar: 1,
    cityAlgeciras: 1, cityCosta: 1,
  };

  const keys = Object.keys(en)
    .filter(function (key) {
      return !skip[key] && typeof en[key] === "string";
    })
    .sort(function (a, b) {
      return en[b].length - en[a].length;
    });

  keys.forEach(function (key) {
    const result = replaceValue(html, en[key], key);
    html = result.html;
  });

  const citySnippets = [
    ["cityEstepona", ">Estepona</li>"],
    ["cityMarbella", ">Marbella</li>"],
    ["cityMalaga", ">Málaga</li>"],
    ["cityTorremolinos", ">Torremolinos</li>"],
    ["cityNerja", ">Nerja</li>"],
    ["cityGibraltar", ">Gibraltar</li>"],
    ["cityAlgeciras", ">Algeciras</li>"],
    ["cityCosta", ">Costa del Sol</li>"],
  ];
  citySnippets.forEach(function (item) {
    html = replaceAll(html, item[1], ">{{" + item[0] + "}}</li>");
  });

  assert(!html.includes("{{" + "{{"), "Doubled token");
  const leftover = html.match(/\{\{[^}]+\}\}/g) || [];
  const unknown = leftover.filter(function (token) {
    const key = token.slice(2, -2);
    return !(key in en) && ["jsonLd", "hreflang", "pageUrl", "ogAlternates", "langSwitcherHeader", "langSwitcherMenu", "langHint", "filterButtons", "filterAria"].indexOf(key) === -1;
  });
  assert(!unknown.length, "Unknown tokens: " + unknown.join(", "));
  return html;
}

let localeCache = null;
function localesCached() {
  if (!localeCache) localeCache = loadLocales();
  return localeCache;
}

function render(template, locale) {
  const locales = localesCached();
  const raw = {
    jsonLd: jsonLd(locale),
    hreflang: hreflangLinks(),
    ogAlternates: ogAlternates(locale),
    langSwitcherHeader: switcher(locale, locales, "header"),
    langSwitcherMenu: switcher(locale, locales, "menu"),
    langHint: hint(locale),
    filterButtons: filterButtons(locale),
    pageUrl: pageUrl(locale),
  };
  return template.replace(/\{\{([a-zA-Z0-9]+)\}\}/g, function (_, key) {
    if (Object.prototype.hasOwnProperty.call(raw, key)) return raw[key];
    assert(Object.prototype.hasOwnProperty.call(locale, key), "Missing locale key " + key + " in " + locale.code);
    return escapeHtml(locale[key]);
  });
}

function writePage(locale, html) {
  const dir = locale.path === "/" ? root : path.join(root, locale.path.replace(/\//g, ""));
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "index.html");
  fs.writeFileSync(file, html);
}

function writeSitemap() {
  const locales = localesCached();
  const alternates = codes
    .map(function (code) {
      const item = locales[code];
      return "    <xhtml:link rel=\"alternate\" hreflang=\"" + item.hreflang + "\" href=\"" + pageUrl(item) + "\"/>";
    })
    .concat(["    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"" + origin + "/\"/>"])
    .join("\n");
  const urls = codes
    .map(function (code) {
      const item = locales[code];
      return (
        "  <url>\n" +
        "    <loc>" + pageUrl(item) + "</loc>\n" +
        alternates + "\n" +
        "    <lastmod>2026-11-08</lastmod>\n" +
        "    <changefreq>monthly</changefreq>\n" +
        "    <priority>" + (code === "en" ? "1.0" : "0.8") + "</priority>\n" +
        "  </url>"
      );
    })
    .join("\n");
  const cv =
    "  <url>\n" +
    "    <loc>" + origin + "/cv/</loc>\n" +
    "    <lastmod>2026-11-11</lastmod>\n" +
    "    <changefreq>monthly</changefreq>\n" +
    "    <priority>0.8</priority>\n" +
    "  </url>";
  const brine =
    "  <url>\n" +
    "    <loc>" + origin + "/brineclub/</loc>\n" +
    "    <lastmod>2026-11-11</lastmod>\n" +
    "    <changefreq>monthly</changefreq>\n" +
    "    <priority>0.8</priority>\n" +
    "  </url>";
  const xml =
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">\n" +
    urls + "\n" +
    cv + "\n" +
    brine + "\n" +
    "</urlset>\n";
  fs.writeFileSync(path.join(root, "sitemap.xml"), xml);
}

function fix404() {
  const file = path.join(root, "404.html");
  let html = fs.readFileSync(file, "utf8");
  html = html
    .replace('href="favicon.svg"', 'href="/favicon.svg"')
    .replace('href="favicon-32.png"', 'href="/favicon-32.png"')
    .replace('href="apple-touch.png"', 'href="/apple-touch.png"')
    .replace('href="site.webmanifest"', 'href="/site.webmanifest"')
    .replace('href="css/site.css"', 'href="/css/site.css"');
  if (!html.includes('href="/es/"')) {
    html = html.replace(
      "</main>",
      '<p class="mt-8 flex flex-wrap gap-2 text-sm"><a class="inline-flex min-h-11 items-center px-2 underline underline-offset-4" href="/">English</a> <a class="inline-flex min-h-11 items-center px-2 underline underline-offset-4" href="/es/">Español</a> <a class="inline-flex min-h-11 items-center px-2 underline underline-offset-4" href="/pt/">Português</a> <a class="inline-flex min-h-11 items-center px-2 underline underline-offset-4" href="/ru/">Русский</a></p>\n  </main>'
    );
  }
  fs.writeFileSync(file, html);
}

function validate(locale, html) {
  assert(!html.includes("{{"), locale.code + " still has a template token");
  assert(html.includes('lang="' + locale.htmlLang + '"'), locale.code + " lang");
  assert(html.includes('href="' + pageUrl(locale) + '"'), locale.code + " canonical missing");
  ["en", "es", "pt-BR", "ru", "x-default"].forEach(function (lang) {
    assert(html.includes('hreflang="' + lang + '"'), locale.code + " missing hreflang " + lang);
  });
  assert(html.includes('property="og:locale" content="' + locale.ogLocale + '"'), locale.code + " og:locale");
  assert((html.match(/og:locale:alternate/g) || []).length === 3, locale.code + " og alternates");
  assert((html.match(/gtag\/js\?id=G-4XBY16BPLY/g) || []).length === 1, locale.code + " gtag src");
  assert((html.match(/G-4XBY16BPLY/g) || []).length === 2, locale.code + " gtag id count");
  assert(html.includes('href="/css/site.css"'), locale.code + " css path");
  assert(html.includes('src="/js/main.min.js"'), locale.code + " js path");
  assert(!html.includes('src="images/') && !html.includes('href="css/'), locale.code + " relative asset");
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert(match, locale.code + " json-ld");
  const data = JSON.parse(match[1]);
  const faq = data["@graph"].find(function (node) {
    return node["@type"] === "FAQPage";
  });
  faq.mainEntity.forEach(function (question) {
    assert(html.includes(escapeHtml(question.name)), locale.code + " FAQ question not visible: " + question.name);
    assert(html.includes(escapeHtml(question.acceptedAnswer.text)), locale.code + " FAQ answer not visible");
  });
  assert(html.includes("welly.almeida@gmail.com"), locale.code + " email");
  assert(html.includes("+34 604 286 691"), locale.code + " phone");
  assert(html.includes("data-cat=\"real-estate\""), locale.code + " filters");
  assert((html.match(/data-set-lang="ru"/g) || []).length === 2, locale.code + " switcher links");
}

function sameKeys(locales) {
  const base = Object.keys(locales.en).sort();
  codes.forEach(function (code) {
    const keys = Object.keys(locales[code]).sort();
    assert(JSON.stringify(keys) === JSON.stringify(base), code + " keys differ from en");
    assert(locales[code].schemaOffers.length === locales.en.schemaOffers.length, code + " offers");
  });
}

function main() {
  localeCache = loadLocales();
  sameKeys(localeCache);
  const sourcePath = path.join(root, "index.html");
  const source = fs.readFileSync(sourcePath, "utf8");
  let template;
  if (source.includes("{{jsonLd}}")) {
    template = source;
  } else if (fs.existsSync(templatePath)) {
    template = fs.readFileSync(templatePath, "utf8");
  } else {
    template = tokenize(source);
    fs.mkdirSync(path.dirname(templatePath), { recursive: true });
    fs.writeFileSync(templatePath, template);
  }
  if (process.argv.includes("--tokenize")) {
    const pristine = fs.existsSync(path.join(root, "templates", "source.html"))
      ? fs.readFileSync(path.join(root, "templates", "source.html"), "utf8")
      : source;
    template = tokenize(pristine.includes("{{jsonLd}}") ? fs.readFileSync(templatePath, "utf8") : pristine);
    fs.mkdirSync(path.dirname(templatePath), { recursive: true });
    fs.writeFileSync(templatePath, template);
  }
  codes.forEach(function (code) {
    const html = render(template, localeCache[code]);
    validate(localeCache[code], html);
    writePage(localeCache[code], html);
  });
  writeSitemap();
  fix404();
  fs.writeFileSync(templatePath, template);
  console.log("Built en, es, pt and ru pages, sitemap and 404 paths.");
}

main();
