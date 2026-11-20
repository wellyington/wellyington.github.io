# Journal · /journal/

Multilingual (EN / ES / PT / RU) Jekyll journal, published at
https://wellyington.github.io/journal/. It uses the main site's design
system: ice + ink, Space Grotesk, a visible grid, and lowercase titles
that end with a period.

This folder is the **source**. `.github/workflows/pages.yml` builds it on
every push to `main` and commits the finished HTML into `../journal/`.
GitHub Pages then serves that folder like the rest of the static site, with
no Pages settings involved. Don't edit `journal/` by hand: the next build
overwrites it.

```
journal-src/
├── _config.yml          site settings + front-matter defaults per folder
├── _data/
│   ├── languages.yml    every UI string, month names, headline… per language
│   ├── navigation.yml   menu + footer links per language
│   └── ticker.yml       header clocks + "now writing" lines
├── _includes/  _layouts/  _sass/  assets/
├── index.html           /journal/ → redirects to the reader's language
├── en/  index.html · archive.md · about.md · feed.xml · articles/*.md
├── es/  …same
├── pt/  …same (Brazilian Portuguese, hreflang pt-BR, like the main site)
└── ru/  …same (Cyrillic falls back to Manrope from /fonts/)
```

## Write an article

Add `journal-src/en/articles/my-slug.md` (and/or `es/articles/mi-slug.md`):

```yaml
---
date: 2026-12-01                  # required: sets order and numbering
ref: my-slug                      # same value in both languages = linked translations
title: "A grid you can see"       # the period is added for you
category: design                  # drives the filter buttons
tags: [grid, typography]
lede: One-sentence standfirst.
tone: aqua                        # ice | mist | aqua | teal (cover with no image)
image: /journal/assets/images/x.webp   # optional
image_alt: …
image_caption: …
---
```

- Language and layout come from the folder, so no `lang:` or `layout:` is needed.
- The EN/ES switch takes readers to the same article in the other
  language when the `ref` matches. Otherwise it goes to that language's home page.
  Matching pairs also get `hreflang` tags for search engines.
- Entries are numbered per language: the oldest is 001.
- Each language has an Atom feed at `/journal/<lang>/feed.xml`.
- Russian slugs are transliterated (`vidimaya-setka`) to keep URLs readable.

## Run locally

```bash
cd journal-src
bundle install
bundle exec jekyll serve --baseurl /journal
```

Fonts and the footer and about images come from the main site (`/fonts/`,
`/images/`). They load once the journal is deployed. Locally they're missing
unless you also serve the repo root.

## Add a language

Copy a block in `_data/languages.yml` and `_data/navigation.yml`, add the
code to `languages:` in `_config.yml`, add two `defaults:` entries for the
new folder, and create the folder with `index.html`, `archive.md`,
`about.md` and `feed.xml`.

## SEO fields for articles

Each article also carries search metadata in its front matter. The visible
title stays poetic; these are what search engines and link previews show:

```yaml
seo_title: "Real Estate Website Concept: Nina Estate, Málaga"   # ≈ 45–62 chars, keyword first
description: "One or two sentences, ≈ 140–160 chars, with the main phrase."
keywords:                                  # 8–10 long-tail phrases in the article's language
  - "real estate website design in Málaga"
  - "web designer on the Costa del Sol"
about:                                     # the business the article features
  type: "RealEstateAgent"                  # schema.org type
  name: "Nina Estate"
  url: "https://ninaestate.com/"           # only if the article links it
  locality: "Málaga"
```

Write keywords the way people search in that language, not as translations,
and make sure the article's text actually supports each phrase. The build
fails if an article has no keywords.
