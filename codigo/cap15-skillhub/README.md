# SkillHub — Marketplace de serviços

Projeto do **capítulo 15** do livro *Full Stack Moderno: do zero ao sênior*:
uma aplicação full stack completa em um único projeto Next.js, integrando
frontend, backend e banco de dados.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Prisma 6 ·
PostgreSQL · Auth.js (NextAuth v5) · Zod · argon2

## O que o projeto demonstra

| Conceito | Onde está |
|----------|-----------|
| Server Components lendo o banco | `src/app/servicos/page.tsx`, `src/app/page.tsx` |
| Server Actions com validação (Zod) | `src/actions/servicos.ts` |
| Formulários com `useActionState` | `src/components/formulario-servico.tsx` |
| Autenticação (Credentials + argon2, sessão JWT) | `src/lib/auth.ts` |
| RBAC no servidor (só o dono exclui) | `excluirServico` em `src/actions/servicos.ts` |
| Cache revalidado após mutações | `revalidatePath` em `src/actions/*` |
| Rota protegida (layout com `auth()`) | `src/app/painel/layout.tsx` |
| Rota de API (Auth.js) | `src/app/api/auth/[...nextauth]/route.ts` |
| Metadata dinâmica | `generateMetadata` em `src/app/servicos/[id]/page.tsx` |
| Busca + filtro + paginação via URL | `src/app/servicos/page.tsx` |

## Como rodar

### 1. Pré-requisitos

- Node.js 24 LTS (ou superior)
- PostgreSQL em execução — local ou via Docker:

```bash
docker run -d --name skillhub-db \
  -e POSTGRES_USER=app -e POSTGRES_PASSWORD=senha -e POSTGRES_DB=skillhub \
  -p 5432:5432 postgres:18
```

> O capítulo 17 do livro dockeriza o ambiente completo (app + banco + redis).

### 2. Configurar e instalar

```bash
cp .env.example .env   # ajuste DATABASE_URL e AUTH_SECRET
npm install            # gera o Prisma Client automaticamente (postinstall)
```

Gere um `AUTH_SECRET` forte:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Criar o banco e popular

```bash
npm run db:migrate     # cria a tabela de migrações e aplica o schema
npm run db:seed        # usuário demo + 15 serviços
```

### 4. Rodar

```bash
npm run dev            # http://localhost:3000
```

**Login de demonstração:** `ana@exemplo.com` / `senha-forte-123`
(também `bruno@exemplo.com` / `senha-forte-123` — serviços de outro dono,
para testar o RBAC).

## Fluxos para testar

1. **Cadastro** → crie uma conta e você é levado ao painel;
2. **Anunciar** → publique um serviço pelo painel (validação no servidor);
3. **Buscar/filtrar** → `/servicos` com busca por texto, categoria e paginação;
4. **Contratar** → abra um serviço de outro usuário e clique em *Contratar*;
5. **RBAC** → tente excluir um serviço que não é seu (a ação recusa no servidor);
6. **Cache** → publique um serviço e veja a listagem atualizar via `revalidatePath`.

## Estrutura

```
prisma/            schema, migrações e seed
src/
  actions/         Server Actions (autenticação, serviços)
  app/             rotas do App Router (páginas e API)
  components/      componentes (client: formulários, botões; server: header)
  lib/             prisma singleton, auth, validações, utilitários
  types/           augmentação de tipos do next-auth
```

## Comandos úteis

```bash
npm run dev            # servidor de desenvolvimento
npm run build          # build de produção
npm run start          # serve o build (após npm run build)
npm run typecheck      # tsc --noEmit
npm run db:migrate     # aplica migrações (dev)
npm run db:deploy      # aplica migrações (produção/CI)
npm run db:seed        # popula o banco
```

## Verificação deste projeto

Validado em 08/08/2026 com:

- `tsc --noEmit` — 0 erros;
- `next build` (produção) — todas as rotas compilam (ƒ dinâmicas);
- Smoke test com `next start`: `/login` e `/cadastro` respondem 200,
  `/api/auth/providers` lista o provider de credenciais.
  As rotas que leem o banco exigem o PostgreSQL em execução.

## Licença

MIT — veja `../LICENSE-CODIGO.txt`.
