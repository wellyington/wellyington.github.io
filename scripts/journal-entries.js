#!/usr/bin/env node
"use strict";

// Latest journal entries for the homepage, per language.
// Reads the article sources in journal-src/<code>/articles/*.md at build
// time, so the cards are plain HTML links that search engines can follow.
// build-pages.js calls latestEntries(locale); the journal workflow reruns
// build-pages.js whenever an article changes, so the homepages stay current.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const SHOW = 3;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Top-level scalar keys only; lists and nested maps are skipped.
function frontMatter(file) {
  const raw = fs.readFileSync(file, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error("No front matter in " + file);
  const data = {};
  m[1].split("\n").forEach(function (line) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!kv || kv[2] === "") return;
    let v = kv[2].trim();
    if (v.startsWith('"')) v = JSON.parse(v);
    else if (v.startsWith("'")) v = v.slice(1, -1).replace(/''/g, "'");
    data[kv[1]] = v;
  });
  return data;
}

// "2026-11-20 11:30:00 +0100" or "2026-11-19" → Date
function parseDate(value) {
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + "T12:00:00+01:00");
  const iso = s.replace(" ", "T").replace(/\s?([+-]\d{2})(\d{2})$/, "$1:$2");
  const d = new Date(iso);
  if (isNaN(d)) throw new Error("Bad date: " + s);
  return d;
}

function articles(code) {
  const dir = path.join(root, "journal-src", code, "articles");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(function (f) { return f.endsWith(".md"); })
    .map(function (f) {
      const fm = frontMatter(path.join(dir, f));
      if (fm.published === "false") return null;
      return {
        slug: f.replace(/\.md$/, ""),
        title: fm.title,
        lede: fm.lede || fm.description || "",
        description: fm.description || fm.lede || "",
        category: fm.category || "",
        image: fm.image || "",
        imageAlt: fm.image_alt || "",
        date: parseDate(fm.date),
      };
    })
    .filter(Boolean)
    .sort(function (a, b) { return b.date - a.date; });
}

// Journal house style: titles close with a period unless already punctuated.
function titleHtml(title) {
  const t = String(title).trim();
  return escapeHtml(t) + (/[.?!…]$/.test(t) ? "" : '<span class="opacity-60">.</span>');
}

function pad(n) { return String(n).padStart(3, "0"); }

function shorten(text, max) {
  const t = String(text).replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(" ", max)).replace(/[,:;]$/, "") + "…";
}

function localImage(url) {
  // Covers live on this same site; keep them same-origin.
  return String(url).replace(/^https:\/\/wellyington\.github\.io/, "");
}

function latestEntries(locale) {
  const list = articles(locale.code);
  const total = list.length;
  const fmt = new Intl.DateTimeFormat(String(locale.ogLocale || locale.htmlLang).replace("_", "-"), { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" });
  const base = "/journal/" + locale.code + "/";
  const cards = list.slice(0, SHOW).map(function (a, i) {
    const no = pad(total - i);
    const url = base + "articles/" + a.slug + "/";
    const border = i === 0 ? "" : " border-t border-brand-primary/50 md:border-l md:border-t-0";
    const img = a.image
      ? '<span class="relative block aspect-16/9 overflow-hidden border-b border-brand-primary/50">' +
          '<img src="' + escapeHtml(localImage(a.image)) + '" alt="' + escapeHtml(a.imageAlt) + '" width="1600" height="900" loading="lazy" decoding="async" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105">' +
          '<span class="absolute bottom-3 left-3 border border-brand-primary/40 bg-brand-cream px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-brand-primary">' + escapeHtml(locale.journalNo) + " " + no + "</span>" +
        "</span>"
      : "";
    return (
      '<article class="group col-span-4 flex flex-col md:col-span-1' + border + '">' +
        '<a href="' + url + '" class="flex h-full flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-brand-primary">' +
          img +
          '<span class="flex flex-1 flex-col gap-4 p-6 md:p-8">' +
            '<span class="text-xs font-bold uppercase tracking-[0.18em] opacity-70">' + escapeHtml(a.category) + ' · <time datetime="' + a.date.toISOString() + '">' + escapeHtml(fmt.format(a.date)) + "</time></span>" +
            '<span class="text-2xl font-bold leading-tight tracking-tight md:text-3xl">' + titleHtml(a.title) + "</span>" +
            '<span class="text-base font-light leading-relaxed opacity-90">' + escapeHtml(shorten(a.lede, 150)) + "</span>" +
            '<span class="mt-auto inline-flex items-center gap-2 pt-2 text-xs font-semibold uppercase tracking-widest"><span class="underline underline-offset-4">' + escapeHtml(locale.journalRead) + '</span><span aria-hidden="true" class="transition-transform duration-300 group-hover:translate-x-1">→</span></span>' +
          "</span>" +
        "</a>" +
      "</article>"
    );
  });
  if (!cards.length) {
    return '<p class="col-span-4 p-6 text-lg font-light md:col-span-3 md:p-10"><a class="underline underline-offset-4" href="' + base + '">' + escapeHtml(locale.journalAll) + " →</a></p>";
  }
  return cards.join("\n            ");
}

module.exports = { latestEntries: latestEntries, articles: articles, SHOW: SHOW };
