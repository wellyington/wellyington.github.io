/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./404.html",
    "./templates/**/*.html",
    "./es/**/*.html",
    "./pt/**/*.html",
    "./ru/**/*.html",
    "./js/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', '"Space Grotesk Fallback"', "Manrope", "sans-serif"],
      },
      colors: {
        "brand-cream": "rgb(var(--brand-cream) / <alpha-value>)",
        "brand-primary": "rgb(var(--brand-primary) / <alpha-value>)",
        "brand-dark": "rgb(var(--brand-dark) / <alpha-value>)",
      },
      aspectRatio: {
        "3/4": "3 / 4",
        "4/5": "4 / 5",
        "2/1": "2 / 1",
        "16/9": "16 / 9",
        "3/2": "3 / 2",
      },
    },
  },
  plugins: [],
  safelist: [
    "col-span-4",
    "md:col-span-2",
    "md:col-span-3",
    "md:col-span-4",
    "md:col-span-5",
    "md:col-span-6",
    "md:col-span-10",
    "aspect-3/4",
    "aspect-square",
    "aspect-16/9",
    "aspect-2/1",
    "aspect-4/5",
    "aspect-3/2",
    "translate-y-[7px]",
    "-translate-y-[7px]",
    "rotate-45",
    "-rotate-45",
  ],
};
