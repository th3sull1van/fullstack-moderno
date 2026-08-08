# Soluções — Capítulo 3: CSS, Layout e Responsividade

## Exercício 1 — Especificidade vs cascata

- **Cascata**: quando regras empatam em especificidade, vence a que aparece por
  **último** no CSS.
- **Especificidade**: quando regras competem, vence a de **maior peso**
  (id > classe > tipo de elemento).

Exemplo: `.botao { color: blue; }` e `button { color: red; }` — o parágrafo
abaixo usa classes, então a classe vence mesmo vindo antes:
```css
button { color: red; }
.botao { color: blue; }   /* vence: classe > tipo */
```

## Exercício 2 — `box-sizing`

Sem `border-box`, `width: 300px` **exclui** o padding: o elemento ocupa
`300 + 30 + 30 = 360px` (padding soma por fora). Com `border-box`, o padding é
**incluído** nos 300px — o conteúdo encolhe para 240px e o elemento continua
com 300px. Por isso o reset universal é padrão em todo projeto:
```css
* { box-sizing: border-box; }
```

## Exercício 3 — Botão centralizado com Flexbox

```css
body {
  display: flex;
  min-height: 100vh;      /* ocupa a tela toda */
  justify-content: center; /* horizontal */
  align-items: center;     /* vertical */
}
```

## Exercício 4 — Grade 3 colunas → 1 no celular, sem media query

```css
.grade {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
```
Com `auto-fit` + `minmax`, o grid encaixa quantas colunas couberem: em telas
largas entram 3+ colunas; em telas estreitas, 1. O navegador decide — sem
media query.

## Exercício 5 — Cartão com sombra, borda arredondada e transição

```css
.cartao {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.cartao:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}
```

## Exercício 6 — `em` vs `rem`

- **`rem`** é relativo ao **`font-size` da raiz** (`<html>`, normalmente 16px).
  Previsível em qualquer lugar da árvore — ótimo para espaçamento e tipografia global.
- **`em`** é relativo ao **`font-size` do próprio elemento** (ou do pai). Útil
  quando você quer que algo escale com o texto ao redor — ex.: `padding` de um
  botão que cresce junto com o `font-size` dele.

Regra prática: `rem` para o sistema (espaçamentos, fontes), `em` para
componentes que devem escalar junto com o próprio texto.
