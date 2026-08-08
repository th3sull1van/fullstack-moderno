# Soluções — Capítulo 15: Full Stack com Next.js

## Exercício 1 — Server Component, Server Action, Route Handler

- **Server Component**: renderiza dados no servidor (leitura) — página de
  listagem de serviços;
- **Server Action**: **muta** dados a partir de um formulário (POST) —
  criar serviço, comentário;
- **Route Handler** (`route.ts`): API HTTP para **consumidores externos**
  (apps, webhooks, terceiros) — endpoint `GET /api/servicos`.

Regra: leitura → Server Component; mutação interna → Server Action;
integração externa → Route Handler.

## Exercício 2 — `revalidatePath`

Invalida o **cache de rota** do Next (ISR/estática) para que a próxima visita
re-renderize com dados novos. Necessário após uma **mutação** porque, sem ele,
o Next pode servir a página em cache com dados velhos — o usuário cria um
serviço e não o vê na listagem.

## Exercício 3 — Server Action com validação Zod

```ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  postId: z.coerce.number().int().positive(),
  texto: z.string().min(1, "Comentário vazio").max(500),
});

export async function criarComentario(dados: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(dados));
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await prisma.comentario.create({ data: parsed.data });
  revalidatePath(`/posts/${parsed.data.postId}`);
  return { ok: true };
}
```
`z.coerce.number()` converte o valor de `FormData` (sempre string) com
validação; o retorno é o estado serializável que o `useActionState` consome.

## Exercício 4 — Por que revalidar a sessão *dentro* da Server Action

A ação roda no servidor com os cookies da requisição; revalidar **dentro** da
ação (via `getServerSession`/`auth()`) usa o token **atual** — nunca confie em
dados de sessão passados pelo cliente (o formulário pode ser adulterado).
Assim, autorização e identidade são decididas no mesmo lugar onde a mutação
acontece.

## Exercício 5 — Formulário com `useActionState`

```tsx
"use client";

import { useActionState } from "react";
import { criarComentario } from "@/actions/comentarios";

export function FormComentario({ postId }: { postId: number }) {
  const [estado, acao, pendente] = useActionState(
    (_prev: unknown, dados: FormData) => criarComentario(postId, dados),
    null,
  );

  return (
    <form action={acao}>
      <textarea name="texto" required maxLength={500} />
      <button type="submit" disabled={pendente}>
        {pendente ? "Enviando…" : "Comentar"}
      </button>
      {estado?.erro && <p role="alert">{estado.erro}</p>}
    </form>
  );
}
```
`useActionState` dá o estado de erro/carregamento do formulário sem
JavaScript manual: o botão desabilita durante o envio e o erro aparece
acessível (`role="alert"`).
