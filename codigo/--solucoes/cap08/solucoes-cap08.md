# Soluções — Capítulo 8: Next.js

## Exercício 1 — Server vs Client Components

- **Server Components** rodam no servidor (e no build): acesso direto a banco,
  sem JavaScript no cliente, mais rápidos. Use por **padrão**.
- **Client Components** (`"use client"`) rodam no navegador: estado, efeitos,
  eventos. Use apenas quando precisar de interatividade.

Regra: server por padrão, client quando necessário — e componentes client
devem ficar "nas pontas" da árvore.

## Exercício 2 — SSR, SSG e ISR

- **SSR** (Server-Side Rendering): HTML gerado a **cada requisição** — dados
  sempre frescos (painel com dados do usuário);
- **SSG** (Static Site Generation): HTML gerado **no build** — conteúdo que
  muda pouco (página de documentação);
- **ISR** (Incremental Static Regeneration): SSG com **revalidação periódica**
  (`revalidate: 3600`) — conteúdo que muda às vezes sem derrubar o build
  (blog, catálogo).

## Exercício 3 — Pastas → rotas + arquivos especiais

Cada pasta em `app/` vira um segmento da URL; `page.tsx` torna a pasta uma
rota pública. Arquivos especiais:
- `layout.tsx` — layout compartilhado (persiste entre navegações);
- `loading.tsx` — UI de carregamento (streaming);
- `not-found.tsx` — página 404 do segmento.

## Exercício 4 — Criar projeto e rota dinâmica

```bash
npx create-next-app@latest meu-projeto
```
Estrutura de uma rota dinâmica de produto:
```
app/
  produtos/
    [slug]/
      page.tsx        # recebe params: { slug }
      loading.tsx
      not-found.tsx
```

## Exercício 5 — `Link` vs `<a>`

O `<Link>` do Next.js faz **navegação client-side** (prefetch + troca de
página sem recarregar), preservando estado e dando navegação instantânea. O
`<a>` puro dispara um carregamento completo do documento. Use `Link` para
navegação interna e `<a>` para links externos.

## Exercício 6 — `generateStaticParams`

Pré-renderiza as páginas de uma rota dinâmica **no build** (SSG): retorna a
lista de slugs a gerar. É necessário sempre que a rota dinâmica deve ser
estática — sem ele, a página só é gerada on-demand (SSR) ou com dynamic
rendering. Combine com `revalidate` para virar ISR.
