#!/usr/bin/env node
"use strict";

// Writes /llms.txt (https://llmstxt.org): a plain Markdown guide to this
// site for language models and AI agents.
//
// Built from the same sources as the pages themselves:
//   locales/en.json                    who, what, where, services, projects
//   journal-src/<lang>/articles/*.md   journal entries (title, description)
//   challenge/dayN/index.html          100 Days concept pages
// build-pages.js calls this after the homepages and sitemap, and the journal
// workflow commits the result, so a new article shows up here automatically.
//
// Format (llms.txt v2): H1 name, blockquote summary, body text without
// headings, then H2 sections of "- [name](url): notes" links. The section
// titled "Optional" holds links an agent can skip when it needs less context.

const fs = require("fs");
const path = require("path");
const journal = require("./journal-entries");

const root = path.resolve(__dirname, "..");
const origin = "https://wellyington.github.io";
const LANGS = [
  { code: "en", name: "English", home: "/" },
  { code: "es", name: "Spanish", home: "/es/" },
  { code: "pt", name: "Portuguese (Brazil)", home: "/pt/" },
  { code: "ru", name: "Russian", home: "/ru/" },
];

// One line per field: Markdown link text and notes must not break the list.
function clean(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[[\]]/g, "")
    .trim();
}

function link(name, url, notes) {
  const n = clean(notes);
  return "- [" + clean(name) + "](" + url + ")" + (n ? ": " + n : "");
}

function sentence(text) {
  const t = clean(text);
  return t && !/[.!?…]$/.test(t) ? t + "." : t;
}

// Concept pages in /challenge/dayN/, with their <title>. Pages whose canonical
// points to another address, or marked noindex, are left out.
function challengePages() {
  const dir = path.join(root, "challenge");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(function (name) {
      return /^day\d+$/.test(name) && fs.existsSync(path.join(dir, name, "index.html"));
    })
    .sort(function (a, b) { return Number(a.slice(3)) - Number(b.slice(3)); })
    .map(function (name) {
      const url = origin + "/challenge/" + name + "/";
      const html = fs.readFileSync(path.join(dir, name, "index.html"), "utf8");
      const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
      if (/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html)) return null;
      if (canonical && canonical[1] !== url) return null;
      const title = html.match(/<title>([^<]*)<\/title>/i);
      const desc = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i);
      return {
        day: Number(name.slice(3)),
        url: url,
        title: title ? title[1] : name,
        description: desc ? desc[1] : "",
      };
    })
    .filter(Boolean);
}

function build() {
  const t = JSON.parse(fs.readFileSync(path.join(root, "locales", "en.json"), "utf8"));
  const offers = t.schemaOffers || [];
  const out = [];

  out.push("# Wellyington", "");
  out.push(
    "> Wellyington is Wellington Almeida, a web developer, digital designer and " +
      "strategist based in Estepona, on the Costa del Sol in Spain. He designs and " +
      "builds websites and apps for businesses along the coast (Marbella, Málaga, " +
      "Torremolinos, Nerja, Algeciras, Gibraltar) and further afield, working in " +
      "English, Spanish and Portuguese.",
    ""
  );

  out.push(
    "He has more than 15 years of experience, starting in advertising, film and " +
      "visual media before moving full-time into web platforms and interface " +
      "design, for clients from Brazil to Barcelona, Ibiza and the south of Spain. " +
      "He works directly with founders and small teams, and starts from how the " +
      "business makes money before designing or writing code.",
    ""
  );
  out.push("Key facts:", "");
  out.push("- Name: Wellington Almeida, who works as Wellyington.");
  out.push("- Role: " + sentence(t.heroEyebrow.replace(/ · /g, ", ")));
  out.push("- Based in: Estepona, Málaga, Spain. Works in person on the Costa del Sol and remotely anywhere.");
  out.push("- Languages of work: English, Spanish and Portuguese. This site is published in English, Spanish, Portuguese and Russian.");
  out.push("- Pricing: no fixed packages. Each project gets a clear price after a conversation about what it needs, before work starts.");
  out.push("- Brine Club: his landing-page service, from €99, delivered in 24–48 hours.");
  out.push("- Contact: the form on the homepage, email welly.almeida@gmail.com, or WhatsApp +34 604 286 691.");
  out.push("");
  out.push("Services:", "");
  offers.forEach(function (o) {
    out.push("- " + o.name + ": " + sentence(o.description));
  });
  out.push("");
  out.push(
    "The journal is written in four languages with the same entries in each. " +
      "The 100 Days series is a public challenge: one website concept a day for a " +
      "real business, each with a write-up. Concept pages are design proposals " +
      "shown on this site; they are not the businesses' own websites unless an " +
      "entry says otherwise.",
    ""
  );

  // ── Site
  out.push("## Site", "");
  out.push(link("Wellyington, home (English)", origin + "/", t.description));
  LANGS.slice(1).forEach(function (l) {
    out.push(link("Home in " + l.name, origin + l.home, "The same page in " + l.name));
  });
  out.push(link("Brine Club", origin + "/brineclub/", "Landing pages for the UK and Europe from €99, designed and built in 24–48 hours"));
  out.push("");

  // ── Selected work
  out.push("## Selected work", "");
  out.push(link("EQUA Estates", "https://equaestates.com/", t.featuredBody));
  [
    ["Mirela B. Interiors", "https://mirelabinteriors.com/", t.p1summary],
    ["Mistral & Marea", "https://mistralmarea.com/", t.p2summary],
    ["Chill and Heal Hub", "https://www.chillandhealhub.com/", t.p3summary],
    ["Your New Life in Spain", "https://www.yournewlifeinspain.com/", t.p4summary],
  ].forEach(function (p) { out.push(link(p[0], p[1], p[2])); });
  out.push("");

  // ── Journal (English entries; the other languages are under Optional)
  const en = journal.articles("en");
  out.push("## Journal", "");
  out.push(link("Journal home", origin + "/journal/en/", "Working notes on websites, design and the 100 Days challenge"));
  en.forEach(function (a) {
    const cat = a.category ? a.category + ". " : "";
    out.push(link(a.title, origin + "/journal/en/articles/" + a.slug + "/", cat + a.description));
  });
  out.push("");

  // ── 100 Days concept pages
  const days = challengePages();
  if (days.length) {
    out.push("## 100 Days concepts", "");
    days.forEach(function (d) {
      out.push(link("Day " + d.day + ": " + d.title, d.url, d.description));
    });
    out.push("");
  }

  // ── Optional
  out.push("## Optional", "");
  out.push(link("CV", origin + "/cv/", "Wellington Almeida's CV"));
  out.push(link("Journal archive", origin + "/journal/en/archive/", "Every entry, newest first"));
  out.push(link("Journal feed (Atom)", origin + "/journal/en/feed.xml", "English entries with full text"));
  LANGS.slice(1).forEach(function (l) {
    const list = journal.articles(l.code);
    out.push(link("Journal in " + l.name, origin + "/journal/" + l.code + "/", list.length + " entries, the same as the English journal"));
    out.push(link("Journal feed in " + l.name + " (Atom)", origin + "/journal/" + l.code + "/feed.xml", "Full text of each entry"));
  });
  out.push(link("Sitemap", origin + "/sitemap.xml", "Main site pages"));
  out.push(link("Journal sitemap", origin + "/journal/sitemap.xml", "Every journal page with its language versions"));
  out.push(link("LinkedIn", "https://www.linkedin.com/in/wellyington/"));
  out.push(link("Instagram", "https://instagram.com/wellyington"));
  out.push(link("X", "https://x.com/wellyington"));
  out.push(link("Facebook", "https://facebook.com/wellyington/"));

  const text = out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
  validate(text);
  fs.writeFileSync(path.join(root, "llms.txt"), text);
  return text;
}

// Fails the build if the file stops following the format.
function validate(text) {
  const lines = text.split("\n");
  if (!/^# \S/.test(lines[0])) throw new Error("llms.txt: first line must be the H1");
  if (!lines[2] || !lines[2].startsWith("> ")) throw new Error("llms.txt: blockquote summary must follow the H1");
  if (lines.filter(function (l) { return /^# /.test(l); }).length !== 1) throw new Error("llms.txt: exactly one H1");
  if (lines.some(function (l) { return /^#{3,} /.test(l); })) throw new Error("llms.txt: only H1 and H2 headings");
  let inList = false;
  lines.forEach(function (l, i) {
    if (/^## /.test(l)) { inList = true; return; }
    if (inList && l.startsWith("- ") && !/^- \[[^\]]+\]\(https?:\/\/[^)\s]+\)(: .+)?$/.test(l)) {
      throw new Error("llms.txt: bad link line " + (i + 1) + ": " + l);
    }
    if (inList && l && !l.startsWith("- ")) throw new Error("llms.txt: line " + (i + 1) + " in a file list is not a link");
  });
  if (!/\n## Optional\n/.test(text)) throw new Error("llms.txt: missing Optional section");
}

if (require.main === module) {
  build();
  console.log("Wrote llms.txt");
}

module.exports = { build: build };
