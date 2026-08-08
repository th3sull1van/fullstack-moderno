# cap08-blog — Blog com MDX e ISR (Next.js)

Blog completo onde **cada artigo é um arquivo MDX** (Markdown + JSX), com
listagem, rota dinâmica com **ISR**, metadata dinâmica e componentes React
dentro dos artigos. Projeto do capítulo 8 (Next.js) do livro
*Full Stack Moderno*.

## O que o projeto demonstra

| Recurso | Onde |
|---------|------|
| Lista de posts em `/blog` com título, resumo e data | `src/app/blog/page.tsx` |
| Rota dinâmica `/blog/[slug]` com `generateStaticParams` + `revalidate` | `src/app/blog/[slug]/page.tsx` |
| Conteúdo MDX com componente JSX customizado (`<Dica>`) | `content/posts/*.mdx` |
| `loading.tsx` (skeleton) e `not-found.tsx` (404) | `src/app/blog/[slug]/` |
| `generateMetadata` por post (SEO) | `src/app/blog/[slug]/page.tsx` |
| Deploy na Vercel | seção abaixo |

## Como rodar

```bash
npm install
npm run dev        # http://localhost:3000 → /blog
```

## Adicionar um post

Crie um arquivo em `content/posts/` com frontmatter:

```mdx
---
titulo: "Meu novo post"
data: "2026-08-01"
resumo: "Uma frase que aparece na listagem."
---

Conteúdo em Markdown... e até `<Dica>componentes React</Dica>`.
```

O `generateStaticParams` pega o novo slug no build; com `revalidate = 3600`
o Next revalida a página a cada hora sem rebuild.

## Testes e build

```bash
npm test            # camada de conteúdo (frontmatter, ordenação, slug)
npm run typecheck   # tsc --noEmit
npm run build       # gera todas as páginas estáticas no build
```

## Deploy na Vercel (grátis)

1. Suba o repositório para o GitHub (apêndice do cap. 5);
2. Em [vercel.com](https://vercel.com) → *Add New Project* → importe o repo;
3. Framework preset **Next.js** (auto-detectado); clique em *Deploy*.

O ISR funciona nativamente na Vercel (Edge/Serverless) — nenhuma
configuração extra é necessária.

## Critérios de aceite (cap. 8)

| Critério | Status |
|----------|--------|
| Lista em `/blog` com título, resumo e data | ✅ |
| Rota dinâmica com `generateStaticParams` e `revalidate` | ✅ |
| MDX com componente JSX customizado no artigo | ✅ `<Dica>` em 3 posts |
| `loading.tsx` e `not-found.tsx` | ✅ |
| Metadata dinâmica (SEO) | ✅ |
| Deploy na Vercel | ✅ instruções |
