---
titulo: "MDX: escreva em Markdown, componha com React"
data: "2026-06-18"
resumo: "MDX é Markdown com superpoderes: você importa e usa componentes React dentro do artigo. Veja como este blog funciona por dentro."
---

Markdown é ótimo para texto. Mas às vezes você precisa de mais que `#`, `**`
e listas — precisa de um componente. É aí que entra o MDX.

## O que este blog faz

Cada artigo é um arquivo `.mdx` com **frontmatter** (título, data, resumo)
e corpo em Markdown:

```mdx
---
titulo: "MDX na prática"
data: "2026-06-18"
resumo: "Markdown + React no mesmo arquivo"
---

Texto comum em Markdown...

<Dica>Componentes React funcionam aqui dentro!</Dica>
```

## Como o componente chega ao artigo

A página `[slug]` define os componentes disponíveis e o `MDXRemote` os
injeta no corpo do artigo:

```tsx
const componentesMdx = { Dica };
<MDXRemote source={post.conteudo} components={componentesMdx} />
```

<Dica>
Esta caixinha azul é um componente React renderizado dentro de um arquivo
MDX — o critério de aceite do projeto do capítulo 8.
</Dica>

## Por que isso importa

Time de conteúdo escreve em Markdown (fácil, seguro); time de produto
compõe componentes reutilizáveis. O MDX une os dois mundos sem que nenhum
dos lados precise aprender a ferramenta do outro.
