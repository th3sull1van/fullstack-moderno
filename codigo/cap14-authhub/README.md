# cap14-authhub — AuthHub (sistema de autenticação completo)

API de autenticação com **cadastro, login, refresh token rotativo, logout,
RBAC e rate limit** — projeto do capítulo 14 (Autenticação e Autorização) do
livro *Full Stack Moderno*. É o "esqueleto de segurança" que o SkillHub
(cap. 15) usa como base.

## Rotas

| Método | Rota | Comportamento |
|--------|------|---------------|
| `POST` | `/cadastro` | Cria usuário (argon2id) → `201`; e-mail duplicado → `409`; inválido → `422` com erros por campo |
| `POST` | `/login` | Valida credenciais → `200` com `accessToken` (15 min) + `refreshToken` (7 dias) em cookie `httpOnly`; erro genérico → `401`; força bruta → `429` (5/min por IP) |
| `POST` | `/refresh` | **Rotação**: cada uso gera par novo; token reusado → revoga a família inteira → `401` |
| `POST` | `/logout` | Revoga o refresh token (lista negra no banco) → `204` |
| `GET` | `/me` | Perfil do usuário autenticado (`Bearer` token) |
| `GET` | `/admin` | Qualquer autenticado com papel `ADMIN`/`MODERADOR` → `200`; comum → `403` |
| `GET` | `/admin/usuarios` | Somente `ADMIN` → `200`; demais → `403` |

## Segurança aplicada (e testada)

- **Senhas**: argon2id (OWASP params) — nunca texto puro, nunca hash rápido;
- **JWT**: access 15 min + refresh **rotativo** de 7 dias; `HS256` explícito
  (anti *algorithm confusion*); refresh guardado **apenas como sha256** no banco;
- **Reuse detection**: apresentar um refresh já usado revoga a **família**
  inteira (ataque de replay neutralizado);
- **Anti-enumeração**: `401` idêntico para e-mail inexistente e senha errada;
- **Rate limit**: janela deslizante própria (5 tentativas/min por IP) com
  `Retry-After` — sem biblioteca (desafio do capítulo);
- **Headers**: `helmet` + CSP; cookies `httpOnly` + `SameSite=Lax` (+ `Secure`
  em produção via `COOKIE_SECURE=true`);
- **RBAC**: 3 papéis (`USUARIO`, `MODERADOR`, `ADMIN`), default deny, `403`
  correto (não `401`).

## Como rodar

```bash
npm install
cp .env.example .env
npm run db:migrate    # cria o SQLite local e aplica as migrações
npm run db:seed       # admin@authhub.dev / Moderadora... / usuario...
npm run dev           # http://localhost:4000

# exemplo rápido
curl -X POST localhost:4000/login -H "Content-Type: application/json" \
  -d '{"email":"admin@authhub.dev","senha":"Admin-forte-123"}'
```

Usuários do seed: `admin@authhub.dev` / `moderadora@authhub.dev` /
`usuario@authhub.dev` (senhas: `Admin-forte-123`, `Moderadora-forte-123`,
`Usuario-forte-123`).

## Testes — incluindo os ataques

```bash
npm test            # 16 testes (banco SQLite temporário por execução)
npm run typecheck   # tsc --noEmit (strict)
```

A suíte cobre os fluxos felizes **e** os ataques: força bruta (429),
refresh reusado (revoga família), token adulterado (401), e-mail
inexistente vs senha errada (mesma resposta), RBAC (403), headers de
segurança.

## Produção (PostgreSQL)

Troque o `provider` para `postgresql` no `prisma/schema.prisma`, aponte
`DATABASE_URL` para o PostgreSQL, gere uma migração nova
(`npm run db:migrate`) e rode `npm run db:deploy` no deploy. O refresh
token já fica no banco — em multi-instância, mova o rate limit para o
Redis (cap. 21) e considere TOTP/2FA (desafio sênior do capítulo).

## Critérios de aceite (cap. 14)

| Critério | Status |
|----------|--------|
| Cadastro validado (e-mail único, senha forte) + argon2 | ✅ testado |
| Login JWT: access 15 min + refresh 7 dias rotativo | ✅ testado |
| Logout revoga o refresh (lista negra no banco) | ✅ testado |
| Rotas protegidas com middleware `exigeAuth` | ✅ testado |
| RBAC 3 papéis + rotas de admin (403 correto) | ✅ testado |
| Rate limit no login (5/min por IP) | ✅ testado (429) |
| Headers `helmet` + cookies `httpOnly` | ✅ testado |
| Testes dos fluxos felizes e dos ataques | ✅ 16 testes |
