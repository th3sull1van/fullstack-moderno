# Soluções — Capítulo 13: ORMs e Migrações

## Exercício 1 — O que é uma migração e por que versionar

Uma **migração** é um arquivo SQL (gerado ou manual) que leva o schema de um
estado a outro — `CREATE TABLE`, `ALTER`, índices. Versioná-la (com histórico
de arquivos) permite: reproduzir o banco em qualquer ambiente (dev, staging,
prod), revisar as mudanças em code review e aplicar em ordem (`migrate
deploy`). É o schema como **código versionado**, não como estado invisível.

## Exercício 2 — Modelo Prisma `Usuario → Post → Comentario`

```prisma
model Usuario {
  id         Int          @id @default(autoincrement())
  nome       String
  posts      Post[]
  comentarios Comentario[]
}

model Post {
  id          Int          @id @default(autoincrement())
  titulo      String
  autorId     Int
  autor       Usuario      @relation(fields: [autorId], references: [id])
  comentarios Comentario[]
}

model Comentario {
  id        Int     @id @default(autoincrement())
  texto     String
  postId    Int
  post      Post    @relation(fields: [postId], references: [id])
  autorId   Int
  autor     Usuario @relation(fields: [autorId], references: [id])
}
```

## Exercício 3 — Posts com autor e comentários (Prisma)

```ts
const posts = await prisma.post.findMany({
  where: { autorId: usuarioId },
  include: {
    autor: true,
    comentarios: { include: { autor: true } },
  },
});
```
Um único `findMany` com `include` — o Prisma resolve em **1 consulta** (ou 3
com `JOIN`), sem N+1.

## Exercício 4 — Mesma query em Drizzle

```ts
import { eq } from "drizzle-orm";
import { posts, usuarios, comentarios } from "./schema";

const resultado = await db
  .select()
  .from(posts)
  .innerJoin(usuarios, eq(posts.autorId, usuarios.id))
  .leftJoin(comentarios, eq(comentarios.postId, posts.id))
  .where(eq(posts.autorId, usuarioId));
```
Drizzle é SQL-first: você monta o `JOIN` explicitamente, com tipos inferidos
do schema.

## Exercício 5 — Problema N+1 e as duas soluções

**N+1**: 1 query para listar N registros + 1 query **para cada** registro ao
acessar a relação — N+1 queries no total (ex.: 100 posts → 100 queries de
autor). Destrói a performance de APIs.

Soluções:
1. **Eager loading / JOIN** — `include` no Prisma ou `JOIN` no SQL: busca
   tudo em poucas queries;
2. **Paginação + limite** — nunca liste N grande sem limite (mitiga o impacto).

## Exercício 6 — `prisma migrate deploy`

Aplica as migrações **pendentes** em ordem, sem gerar novas — o comando certo
para **produção/CI**. (Em dev usa-se `migrate dev`, que também gera a próxima
migração a partir do schema; em produção você nunca quer gerar migração
automaticamente.)
