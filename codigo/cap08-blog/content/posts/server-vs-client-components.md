---
titulo: "Server Components vs Client Components na prática"
data: "2026-07-05"
resumo: "O modelo mental que resolve 90% das dúvidas sobre o App Router: o servidor como padrão e o 'use client' como exceção consciente."
---

Desde o App Router, todo componente é um **Server Component** por padrão.
Isso não é uma limitação — é a nova arquitetura.

## O que cada um pode fazer

| | Server Component | Client Component |
|---|---|---|
| Ler banco/arquivos | ✅ direto | ❌ |
| Usar hooks (`useState`) | ❌ | ✅ |
| Enviar JS ao navegador | ❌ (zero) | ✅ |
| Lidar com eventos | ❌ | ✅ |

## A regra de ouro

Comece no servidor. Desça para o cliente **só** quando precisar de
interatividade — e desça o mínimo possível (o componente menor que usa o
hook, não a página inteira).

```tsx
// page.tsx — Server Component: busca dados e renderiza
export default async function Pagina() {
  const posts = await obterPosts();
  return <Lista posts={posts} />; // Lista pode ser client, posts chegam prontos
}
```

<Dica>
"use client" não torna o componente *só* do cliente: ele continua sendo
pré-renderizado no servidor. O marcador apenas diz "este componente também
precisa rodar JavaScript no navegador".
</Dica>

## Decisão prática

Se a página não tem botão que muda estado, formulário interativo ou efeito,
ela deve ser um Server Component. Isso reduz o bundle e melhora o TTFB —
medidas que você vai otimizar no capítulo 20.
