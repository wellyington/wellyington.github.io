"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const origin = "https://wellyington.github.io";

const HREFLANGS = [
  ["en", origin + "/brineclub/"],
  ["es", origin + "/brineclub/es/"],
  ["es-ES", origin + "/brineclub/es/"],
  ["pt-BR", origin + "/brineclub/pt/"],
  ["ru", origin + "/brineclub/ru/"],
  ["ru-RU", origin + "/brineclub/ru/"],
  ["ru-KZ", origin + "/brineclub/ru/"],
  ["ru-BY", origin + "/brineclub/ru/"],
  ["zh-Hans", origin + "/brineclub/zh/"],
  ["zh-CN", origin + "/brineclub/zh/"],
  ["x-default", origin + "/brineclub/"]
];

const PAGES = [
  { code: "en", url: origin + "/brineclub/", path: "/brineclub/" },
  { code: "es", url: origin + "/brineclub/es/", path: "/brineclub/es/" },
  { code: "pt", url: origin + "/brineclub/pt/", path: "/brineclub/pt/" },
  { code: "ru", url: origin + "/brineclub/ru/", path: "/brineclub/ru/" },
  { code: "zh", url: origin + "/brineclub/zh/", path: "/brineclub/zh/" }
];

const LABELS = { en: "EN", es: "ES", pt: "PT", ru: "RU", zh: "中文" };
const LINK_LANG = { en: "en", es: "es", pt: "pt-BR", ru: "ru", zh: "zh-CN" };

const RAW = new Set([
  "byline", "h1", "seal", "jarTitle", "introH", "whyH", "card1H", "card2H", "card3H",
  "howH", "priceH", "promiseQ", "faqH", "contactH", "footerNote", "footerByline", "extraHead",
  "jsonLd", "hreflang", "ogAlternates", "langSwitch", "langSwitchMenu", "faqItems"
]);

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function relHref(fromPath, toPath) {
  let rel = path.posix.relative(fromPath, toPath);
  if (!rel) return "./";
  if (!rel.endsWith("/")) rel += "/";
  return rel;
}

function loadLocale(code) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "data", "brineclub", code + ".json"), "utf8"));
}

function faqHtml(items) {
  return items.map(function (pair) {
    return "<details><summary>" + esc(pair[0]) + "</summary><p>" + esc(pair[1]) + "</p></details>";
  }).join("");
}

function jsonLd(locale, pageUrl) {
  const areas = locale.areas.map(function (name, i) {
    return { "@type": locale.areaTypes[i] || "Country", name: name };
  });
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": origin + "/#person",
        name: "Wellington Almeida",
        alternateName: "Wellyington",
        url: origin + "/",
        email: "welly.almeida@gmail.com",
        telephone: "+34604286691",
        knowsLanguage: ["en", "es", "pt"],
        sameAs: [
          origin + "/",
          "https://x.com/wellyington",
          "https://instagram.com/wellyington",
          "https://facebook.com/wellyington/",
          "https://www.linkedin.com/in/wellyington/"
        ]
      },
      {
        "@type": ["Service", "ProfessionalService"],
        "@id": pageUrl + "#service",
        name: "Brine Club",
        url: pageUrl,
        inLanguage: locale.htmlLang,
        description: locale.description,
        provider: { "@id": origin + "/#person" },
        areaServed: areas,
        serviceType: locale.serviceTypes,
        offers: {
          "@type": "AggregateOffer",
          lowPrice: "99",
          highPrice: "249",
          priceCurrency: "EUR",
          offerCount: "2",
          url: pageUrl + "#pricing",
          offers: [
            {
              "@type": "Offer",
              name: "The Gherkin",
              price: "99",
              priceCurrency: "EUR",
              description: locale.offerGherkin,
              url: pageUrl + "#pricing"
            },
            {
              "@type": "Offer",
              name: "The Full Jar",
              price: "249",
              priceCurrency: "EUR",
              description: locale.offerFull,
              url: pageUrl + "#pricing"
            }
          ]
        }
      },
      {
        "@type": "FAQPage",
        "@id": pageUrl + "#faq",
        url: pageUrl + "#faq",
        inLanguage: locale.htmlLang,
        mainEntity: locale.faq.map(function (pair) {
          return {
            "@type": "Question",
            name: pair[0],
            acceptedAnswer: { "@type": "Answer", text: pair[1] }
          };
        })
      }
    ]
  };
  return '<script type="application/ld+json">\n' + JSON.stringify(graph, null, 2) + "\n</script>";
}

function hreflangLinks() {
  return HREFLANGS.map(function (pair) {
    return '<link rel="alternate" hreflang="' + pair[0] + '" href="' + pair[1] + '">';
  }).join("\n");
}

function ogAlternates(current) {
  return PAGES.filter(function (page) { return page.code !== current; }).map(function (page) {
    const locale = loadLocale(page.code);
    return '<meta property="og:locale:alternate" content="' + locale.ogLocale + '">';
  }).join("\n");
}

function switcher(fromPath, locale) {
  const parts = PAGES.map(function (page) {
    const current = page.path === fromPath ? ' aria-current="page"' : "";
    return '<a href="' + relHref(fromPath, page.path) + '" hreflang="' + LINK_LANG[page.code] + '" lang="' + LINK_LANG[page.code] + '"' + current + ">" + LABELS[page.code] + "</a>";
  });
  const inner = parts.join('<span class="dot" aria-hidden="true">·</span>');
  return '<nav class="lang-switch" aria-label="' + esc(locale.langLabel) + '">' + inner + "</nav>";
}

function brineclubSitemap() {
  const alternates = HREFLANGS.map(function (pair) {
    return '    <xhtml:link rel="alternate" hreflang="' + pair[0] + '" href="' + pair[1] + '"/>';
  }).join("\n");
  return PAGES.map(function (page) {
    return (
      "  <url>\n" +
      "    <loc>" + page.url + "</loc>\n" +
      alternates + "\n" +
      "    <lastmod>2026-11-14</lastmod>\n" +
      "    <changefreq>monthly</changefreq>\n" +
      "    <priority>0.8</priority>\n" +
      "  </url>"
    );
  }).join("\n");
}

function renderPage(template, locale, page) {
  const values = Object.assign({}, locale, {
    assets: page.code === "en" ? "" : "../",
    canonical: page.url,
    hreflang: hreflangLinks(),
    ogAlternates: ogAlternates(page.code),
    jsonLd: jsonLd(locale, page.url),
    faqItems: faqHtml(locale.faq),
    langSwitch: switcher(page.path, locale),
    langSwitchMenu: switcher(page.path, locale),
    mailSubject: encodeURIComponent(locale.mailSubject)
  });
  const html = template.replace(/\{\{([a-zA-Z0-9]+)\}\}/g, function (_, key) {
    if (!Object.prototype.hasOwnProperty.call(values, key)) {
      throw new Error(page.code + " missing token " + key);
    }
    const value = values[key];
    if (value == null) return "";
    return RAW.has(key) ? String(value) : esc(value);
  });
  if (html.includes("{{")) throw new Error(page.code + " still has a token");
  if ((html.match(/G-4XBY16BPLY/g) || []).length !== 2) throw new Error(page.code + " GA count");
  if (!html.includes('async src="https://www.googletagmanager.com/gtag/js?id=G-4XBY16BPLY"')) {
    throw new Error(page.code + " GA script");
  }
  return html;
}

function buildBrineclub() {
  const template = fs.readFileSync(path.join(__dirname, "templates", "brineclub.html"), "utf8");
  PAGES.forEach(function (page) {
    const locale = loadLocale(page.code);
    const html = renderPage(template, locale, page);
    const dir = page.code === "en" ? path.join(root, "brineclub") : path.join(root, "brineclub", locale.dir);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html);
  });
  console.log("Built Brine Club pages: en, es, pt, ru, zh.");
}

module.exports = { brineclubSitemap, HREFLANGS, PAGES, buildBrineclub };

if (require.main === module) buildBrineclub();
