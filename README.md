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

`Node.js` is only needed for that stylesheet build. Space Grotesk (OFL, see `fonts/OFL.txt`) and Three.js r128 are self-hosted. Three.js loads only when the featured visual is near the viewport. Photography is stored locally in `images/` (Unsplash originals, resized to WebP).

`/cv/` and `/blog/` are published from other repositories. Do not add folders with those names here.
