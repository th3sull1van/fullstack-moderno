# cap13-biblioteca — API de biblioteca com Prisma

API REST de uma biblioteca pública — **autores, livros e empréstimos** — com
**Prisma 6**, **migrações versionadas** e consultas tipadas. Projeto do
capítulo 13 (ORMs e Migrações) do livro *Full Stack Moderno*.

## Modelo de dados (4 tabelas relacionadas)

```
Autor 1───N Livro 1───N Emprestimo N───1 Leitor
```

- **Autor**: nome (+ coluna `nomeNormalizado` para busca), nacionalidade;
- **Livro**: título, ano, ISBN único, `disponivel` (flag de acervo), autor;
- **Leitor**: nome, e-mail único;
- **Emprestimo**: livro ↔ leitor, `dataEmprestimo`, `dataDevolucao` (null = ativo).

## Rotas

| Método | Rota | Comportamento |
|--------|------|---------------|
| `GET/POST` | `/autores` | Lista (com contagem de livros) / cria |
| `GET/PUT/DELETE` | `/autores/:id` | Detalhe com livros / atualiza / exclui (409 se tiver livros) |
| `GET` | `/livros?q=&disponivel=&limite=&offset=` | Lista + **busca por título OU autor** (contém, ignora acentos/caixa) |
| `GET/POST` | `/livros` | Lista / cria (409 para ISBN duplicado) |
| `GET/PUT/DELETE` | `/livros/:id` | Detalhe com histórico de empréstimos / atualiza / exclui |
| `POST` | `/emprestimos` | **Transação**: cria empréstimo + marca livro indisponível; livro emprestado → `409` |
| `POST` | `/emprestimos/:id/devolucao` | Transação: seta `dataDevolucao` + devolve ao acervo |
| `GET` | `/emprestimos/ativos` | Livros emprestados **sem N+1** (um `include` com autor e leitor) |
| `GET` | `/emprestimos/atrasados` | Atrasados (prazo de 15 dias calculado **no banco**) |

## Migrações (2 no histórico)

```
prisma/migrations/
  20260808180836_init/        → Autor, Livro, Leitor
  20260808180909_emprestimos/ → Emprestimo + Livro.disponivel + índices
```

A segunda migração foi criada **evoluindo o schema** (`prisma migrate dev`),
mostrando o fluxo real: modelar → migrar → evoluir. Em produção use
`prisma migrate deploy` (cap. 18) — nunca `migrate dev`.

## Sem N+1 (e como provar)

O endpoint `/emprestimos/ativos` usa um único `include` — **1 query**, não
1 + N. Em dev, o Prisma loga cada query (`lib/prisma.ts`): rode a API, chame
o endpoint e veja no console que não há queries repetidas de autor/leitor.

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed      # 10 autores, 30 livros reais, 4 leitores
npm run dev          # http://localhost:3500
```

## Testes

```bash
npm test            # 9 testes (banco SQLite temporário; migrações aplicadas via deploy)
npm run typecheck   # tsc --noEmit (strict)
```

## Bônus (exercício do capítulo): Prisma vs Drizzle

| Aspecto | Prisma 6 (este projeto) | Drizzle ORM |
|---------|------------------------|-------------|
| Abordagem | Abstração completa: schema declarativo + cliente gerado | **SQL-first**: você escreve o schema em TS mas controla o SQL |
| Tipos | Cliente tipado gerado automaticamente (`prisma generate`) | Tipos inferidos das tabelas; sem passo de geração |
| Migrações | Gerenciadas pelo CLI (`migrate dev/deploy`) | `drizzle-kit generate`/`migrate` (SQL puro por provider) |
| Queries | `include`/`select` encadeados (fácil, porém mais "mágica") | `innerJoin`/`leftJoin` explícitos (mais verbo, mais controle) |
| Busca insensível a acentos | Coluna normalizada manual (como aqui) ou `mode: "insensitive"` (PG) | `ilike` no PostgreSQL |
| Transações | `prisma.$transaction` com callback | `db.transaction` (callback) ou `transaction()` manual |
| Bundle/leveza | Cliente grande gerado | Leve, sem código gerado |
| Quando escolher | Produto que evolui rápido; DX importa | Time que quer SQL explícito e bundle mínimo |

## Critérios de aceite (cap. 13)

| Critério | Status |
|----------|--------|
| Schema com 3+ tabelas relacionadas e 2 migrações no histórico | ✅ 4 tabelas, 2 migrações |
| CRUD de autores e livros + empréstimos com `dataDevolucao` | ✅ testado |
| Busca por título/autor (contém, case/accent-insensitive) | ✅ testado (`?q=BAGAGEM`) |
| "Livros emprestados" sem N+1 | ✅ `include` único + log de queries em dev |
| Seed 10 autores / 30 livros reais | ✅ idempotente (upsert) |
| Comparativo Drizzle no README | ✅ acima |
