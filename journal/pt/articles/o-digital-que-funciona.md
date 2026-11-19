---
date: 2026-11-12
ref: digital-that-works
title: "O digital que funciona, por escrito"
category: estratégia
tags: [princípios, processo]
tone: teal
lede: >-
  Um breve manifesto ao qual sempre volto, e as três perguntas que todo
  projeto precisa responder antes de mexer em um único pixel.
---

Todo projeto que eu pego começa do mesmo jeito: uma lista longa de coisas
que o site *poderia* fazer e outra bem mais curta do que ele *precisa*
fazer. O trabalho é ir da primeira à segunda sem perder nada que importe.

## as três perguntas

Antes do design e antes do código, eu pergunto:

1. **Para quem é?** Não para "todo mundo". Para uma pessoa específica.
2. **O que ela deve fazer em seguida?** Uma única ação, mensurável.
3. **O que podemos tirar?** Quase sempre, mais do que alguém imagina.

> Simples, rápido e pensado para gerar resultados mensuráveis. Todo o
> resto é decoração.

## velocidade é uma funcionalidade

Ninguém repara em um site rápido, mas todo mundo percebe um lento. Trato
a performance como uma restrição de design desde o primeiro dia, não como
algo para consertar no final.

```css
/* A paleta inteira. Quatro tons, uma tinta. */
:root {
  --ice:  #e3fdfd;
  --mist: #cbf1f5;
  --aqua: #a6e3e9;
  --teal: #71c9ce;
  --ink:  #17484d;
}
```

| Orçamento        | Meta      | Por quê                           |
|------------------|-----------|-----------------------------------|
| Primeira pintura | < 1,0 s   | Parece instantâneo no 4G          |
| JS total         | < 30 kB   | Menos para processar e para quebrar |
| Fontes           | 1 arquivo | Um único woff2 variável           |

## o que sai

O carrossel. A segunda chamada para ação. O parágrafo de "bem-vindo ao
nosso site". A animação que dispara a cada rolagem.[^1]

---

O que sobra costuma ser um site que carrega rápido, diz uma coisa com
clareza e pede uma única coisa com educação. Esse é o trabalho.

[^1]: Movimento é bom quando explica algo. Fora isso, é pedágio.
