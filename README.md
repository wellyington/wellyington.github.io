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

`npm run build` writes the four pages and `sitemap.xml`, then compiles Tailwind from `src/input.css` to `css/site.css`. After editing a locale or the template, run that and commit the output. `npm run build:pages` or `npm run build:css` run the steps on their own.

Space Grotesk (Latin) and Manrope (Cyrillic, only downloaded when Cyrillic is on the page) are self-hosted under the SIL Open Font License. See `fonts/OFL.txt` and `fonts/OFL-Manrope.txt`. Three.js r128 is self-hosted and loads only when the featured visual is near the viewport. Project screenshots live in `images/projects/` as WebP with a JPEG fallback. The contact and footer photographs in `images/` are optimized WebP.

`/cv/` and `/blog/` are published from other repositories. Do not add folders with those names here.
