# cap11-cineapi — CineAPI (catálogo de filmes REST)

API REST de catálogo de filmes com **Fastify 5** — projeto do capítulo 11
(HTTP, REST e APIs) do livro *Full Stack Moderno*.

## Rotas

| Método | Rota | Comportamento |
|--------|------|---------------|
| `GET` | `/filmes` | Lista com filtros (`genero`, `ano`, `q`), paginação (`limite`/`offset`) e total no header `X-Total-Count` |
| `GET` | `/filmes/:id` | Detalhe → `200` / `404` |
| `POST` | `/filmes` | Cria → `201`; título duplicado → `409`; inválido → `422` com erros por campo |
| `PUT` | `/filmes/:id` | Substitui por inteiro (idempotente) → `200` / `404` / `409` |
| `PATCH` | `/filmes/:id` | Atualiza parcialmente → `200` / `404` / `409` |
| `DELETE` | `/filmes/:id` | Exclui → `204` / `404` |
| `GET` | `/docs` | Documentação OpenAPI (Swagger UI) |

## Exemplos

```bash
npm install
npm run dev          # http://localhost:3333 — docs em /docs

# buscar ignorando acentos (o "algoritmo útil" do capítulo)
curl "localhost:3333/filmes?q=ANEIS"
# → [ { "titulo": "O Senhor dos Anéis: A Sociedade do Anel", ... } ]

# criar com validação
curl -X POST localhost:3333/filmes -H "Content-Type: application/json" \
  -d '{"titulo":"Parasita","genero":"drama","ano":2019,"diretor":"Bong Joon-ho","duracaoMin":132}'

# paginação com total
curl -i "localhost:3333/filmes?genero=drama&limite=3&offset=0"
# → X-Total-Count: 6 ...
```

## Validação (contrato do capítulo)

- `titulo` obrigatório (1–200 caracteres);
- `genero` em lista fechada: `acao, aventura, animacao, comedia, documentario,
  drama, ficcao-cientifica, romance, suspense, terror`;
- `ano` entre **1888** (primeiro filme da história) e **2026**;
- `duracaoMin` entre 1 e 600.

Erros de validação retornam **422** com `{ erro, detalhes: [{ campo, mensagem }] }`
(versão enxuta do *Problem Details* RFC 7807, desafio do capítulo).

## Testes

```bash
npm test            # 11 testes de contrato (status + shape) via app.inject
npm run typecheck   # tsc --noEmit (strict)
```

## Decisões de design

- **Busca por similaridade simples**: `normalizar()` minúscula + remove acentos
  (NFD) antes do `includes` — a base de autocomplete; no cap. 12 isso vira
  `to_tsvector` no PostgreSQL e no cap. 24, embeddings;
- **Validação**: JSON Schema nativo do Fastify (validação + docs OpenAPI com
  uma única fonte) e `setErrorHandler` convertendo em `422` por campo;
- **409** para título duplicado com comparação normalizada (acentos/caixa);
- Repositório em memória isolado atrás de uma interface — troque por
  PostgreSQL (caps. 12/13) sem tocar nas rotas.

## Critérios de aceite (cap. 11)

| Critério | Status |
|----------|--------|
| CRUD com status corretos (201, 204, 404, 409) | ✅ testado |
| Filtros por gênero/ano e busca `?q=` | ✅ testado (acentos) |
| Paginação com `limite`/`offset` e total no header | ✅ `X-Total-Count` |
| Validação de entrada (ano 1888–2026, título, gênero) | ✅ 422 por campo |
| Seed com 20 filmes clássicos | ✅ `src/seed.ts` |
| Documentação em `/docs` (Swagger) | ✅ OpenAPI + UI |
