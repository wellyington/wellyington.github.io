---
date: 2026-11-12
ref: digital-that-works
title: "Digital that works, written down"
category: strategy
tags: [principles, process]
tone: teal
lede: >-
  A short manifesto I keep coming back to — and the three questions
  every build has to answer before a single pixel moves.
---

Every project I take on starts the same way: a long list of things the
site *could* do, and a much shorter list of things it *must* do. The job
is to get from the first list to the second without losing anything
that matters.

## the three questions

Before design, before code, I ask:

1. **Who is this for?** Not "everyone". One person, specifically.
2. **What should they do next?** One action, measurable.
3. **What can we remove?** Usually more than anyone expects.

> Simple, fast, and engineered to drive measurable momentum. Everything
> else is decoration.

## speed is a feature

Nobody notices a fast site, but everyone notices a slow one. I treat
performance as a design constraint from day one, not something to fix
at the end.

```css
/* The whole palette. Four tones, one ink. */
:root {
  --ice:  #e3fdfd;
  --mist: #cbf1f5;
  --aqua: #a6e3e9;
  --teal: #71c9ce;
  --ink:  #17484d;
}
```

| Budget        | Target  | Why                         |
|---------------|---------|-----------------------------|
| First paint   | < 1.0 s | Feels instant on 4G         |
| Total JS      | < 30 kB | Less to parse, less to break |
| Fonts         | 1 file  | One variable woff2          |

## what gets removed

The carousel. The second call to action. The "welcome to our website"
paragraph. The animation that plays on every scroll.[^1]

---

What's left is usually a site that loads fast, says one thing clearly and
asks for one thing politely. That's the job.

[^1]: Motion is good when it explains something. Otherwise it's a toll.
