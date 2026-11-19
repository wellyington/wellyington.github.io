---
date: 2026-11-12
ref: digital-that-works
title: "Lo digital que funciona, por escrito"
category: estrategia
tags: [principios, proceso]
tone: teal
lede: >-
  Un breve manifiesto al que siempre vuelvo, y las tres preguntas que
  cualquier proyecto debe responder antes de mover un solo píxel.
---

Todos mis proyectos empiezan igual: una lista larga de cosas que la web
*podría* hacer y otra mucho más corta de cosas que *debe* hacer. El
trabajo consiste en pasar de la primera a la segunda sin perder nada que
importe.

## las tres preguntas

Antes del diseño y antes del código, pregunto:

1. **¿Para quién es?** No para "todo el mundo". Para una persona concreta.
2. **¿Qué debe hacer después?** Una sola acción, medible.
3. **¿Qué podemos quitar?** Casi siempre, más de lo que nadie espera.

> Simple, rápido y pensado para generar un impulso medible. Todo lo demás
> es decoración.

## la velocidad es una función

Nadie se fija en una web rápida, pero todo el mundo nota una lenta. Trato
el rendimiento como una restricción de diseño desde el primer día, no como
algo que arreglar al final.

```css
/* Toda la paleta. Cuatro tonos, una tinta. */
:root {
  --ice:  #e3fdfd;
  --mist: #cbf1f5;
  --aqua: #a6e3e9;
  --teal: #71c9ce;
  --ink:  #17484d;
}
```

| Presupuesto     | Objetivo | Por qué                         |
|-----------------|----------|---------------------------------|
| Primer pintado  | < 1,0 s  | Se siente instantáneo en 4G     |
| JS total        | < 30 kB  | Menos que procesar y que romper |
| Tipografías     | 1 archivo | Un único woff2 variable        |

## qué se elimina

El carrusel. La segunda llamada a la acción. El párrafo de "bienvenido a
nuestra web". La animación que salta en cada scroll.[^1]

---

Lo que queda suele ser una web que carga rápido, dice una cosa con
claridad y pide una sola cosa con educación. Ese es el trabajo.

[^1]: El movimiento está bien cuando explica algo. Si no, es un peaje.
