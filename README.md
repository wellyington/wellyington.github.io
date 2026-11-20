# Wellyington

Personal site of Wellington Almeida (Wellyington), an independent web developer, designer and digital strategist based on the Costa del Sol. GitHub Pages serves this repository from the root of `main`:

https://wellyington.github.io/

## Work on it

The site is static. From this folder:

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173/.

The pages are generated. English stays at `/`. Spanish, Brazilian Portuguese and Russian are static pages at `/es/`, `/pt/` and `/ru/`. Copy lives in `locales/*.json`. Layout lives in `templates/index.html`. GitHub Pages does not run a build, so the generated HTML is committed.

```bash
npm install
npm run build
```

`npm run build` writes the four pages and `sitemap.xml`, compiles Tailwind from `src/input.css` to `css/site.css`, and minifies `js/main.js` to `js/main.min.js`. After editing a locale, the template, or `js/main.js`, run that and commit the output. `npm run build:pages`, `npm run build:css`, or `npm run build:js` run the steps on their own.

Space Grotesk (Latin) and Manrope (Cyrillic, only downloaded when Cyrillic is on the page) are self-hosted under the SIL Open Font License. See `fonts/OFL.txt` and `fonts/OFL-Manrope.txt`. Three.js r128 is self-hosted and loads only when the featured visual is near the viewport. Project screenshots live in `images/projects/` as WebP with a JPEG fallback. The contact and footer photographs in `images/` are optimized WebP.

`/cv/` and `/blog/` are published from other repositories. Do not add folders with those names here.

## Journal

`/journal/` is a multilingual (EN / ES / PT / RU) Jekyll site. Edit the source in `journal-src/`. On every push to `main`, `.github/workflows/pages.yml` builds it and commits the finished pages into `journal/`. Don't edit `journal/` by hand: the next build overwrites it. See `journal-src/README.md`.

Each homepage (`/`, `/es/`, `/pt/`, `/ru/`) has a "latest entries" section with the three newest articles in its language, plus a journal link in the menu. `scripts/journal-entries.js` reads them from `journal-src/<lang>/articles/` when the pages are built, so they are plain HTML links. The journal workflow reruns `scripts/build-pages.js` after every article change and commits the four homepages with the journal, so new entries show up without running `npm run build` by hand. If you change the card markup in `scripts/journal-entries.js`, run `npm run build` once so Tailwind picks up any new classes.
