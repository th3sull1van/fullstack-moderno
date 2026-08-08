---
titulo: "SSG, SSR e ISR: qual renderização usar (e quando)"
data: "2026-07-20"
resumo: "As três estratégias de renderização do Next.js explicadas com casos de uso reais — e por que ISR é o padrão de 2026."
---

O Next.js oferece três formas de transformar seu código em HTML. A diferença
está em **quando** e **com que frequência** o HTML é gerado.

## SSG — estático no build

O HTML é gerado **uma vez**, no `next build`. Perfeito para conteúdo que
muda pouco: páginas institucionais, documentação, este blog.

## SSR — dinâmico a cada request

O HTML é gerado **a cada requisição**, no servidor. Necessário quando a
página depende do usuário (carrinho, painel) ou de dados voláteis.

## ISR — o meio-termo

O HTML é gerado no build **e revalidado** em segundo plano a cada intervalo:

```tsx
export const revalidate = 3600; // revalida a cada 1 hora
```

O usuário sempre recebe HTML pronto (rápido como SSG), mas o conteúdo se
atualiza sem rebuild (atual como SSR). É o padrão para blogs e vitrines.

<Dica>
No App Router, `generateStaticParams` pré-renderiza todas as rotas do blog
no build. Combine com `revalidate` e você tem SSG com atualização automática —
exatamente o que esta página faz.
</Dica>

## Resumo

| Estratégia | Quando gera | Caso de uso |
|------------|-------------|-------------|
| SSG | build | Conteúdo fixo |
| SSR | cada request | Dados por usuário |
| ISR | build + revalidação | Blog, vitrine, docs |
