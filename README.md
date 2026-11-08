# Welly

Personal site of Wellington Almeida (Welly), an independent web developer, designer and digital strategist based on the Costa del Sol. GitHub Pages serves this repository from the root of `main`:

https://wellyington.github.io/

## Work on it

The site is static. From this folder:

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173/.

Styles are [Tailwind CSS](https://tailwindcss.com/) utilities compiled to `css/site.css`. GitHub Pages does not run a build. After changing class names in `index.html` or `js/main.js`, rebuild and commit the CSS:

```bash
npm install
npm run build:css
```

`Node.js` is only needed for that stylesheet build. Space Grotesk is self-hosted (OFL, see `fonts/OFL.txt`). Project screenshots live in `images/projects/` as WebP with a JPEG fallback. The contact and footer photographs in `images/` are optimized WebP.

`/cv/` and `/blog/` are published from other repositories. Do not add folders with those names here.
