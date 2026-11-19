# Journal · /journal/

Multilingual (EN / ES / PT / RU) Jekyll journal, published at
https://wellyington.github.io/journal/. It uses the main site's design
system: ice + ink, Space Grotesk, a visible grid, and lowercase titles
that end with a period.

This folder is the only part of the repo that Jekyll builds.
`.github/workflows/pages.yml` builds it and publishes it next to the
static site, which is copied as-is.

```
journal/
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

Add `en/articles/my-slug.md` (and/or `es/articles/mi-slug.md`):

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
cd journal
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
