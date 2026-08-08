# Repositório de Código — Full Stack Moderno

Todos os projetos, exemplos e soluções do livro **Full Stack Moderno: do zero
ao sênior**, organizados por capítulo. Cada projeto é **independente** e tem
seu próprio README com instruções de execução.

Licença dos códigos: **MIT** (veja `../LICENSE-CODIGO.txt`).

## Mapa de projetos por capítulo

| Capítulo | Projeto | Status |
|----------|---------|--------|
| 01 — Universo full stack | `cap01-portfolio/` — portfólio no GitHub Pages | ✅ completo |
| 02 — HTML | `cap02-receita/` — página de receitas acessível | ✅ completo |
| 03 — CSS | `cap03-landing/` — landing page responsiva | ✅ completo |
| 04 — JavaScript | `cap04-jogo-memoria/` — jogo da memória (Fisher–Yates) | ✅ completo |
| 05 — Git | `cap05-git/` — scripts e convenções | 📝 em preparação |
| 06 — TypeScript | `cap06-validador/` — biblioteca de validação tipada | ✅ completo |
| 07 — React | `cap07-kanban/` — quadro Kanban (Vite + localStorage) | ✅ completo |
| 08 — Next.js | `cap08-blog/` — blog com MDX e ISR | ✅ completo |
| 09 — Estilização | `cap09-design-system/` — design system OrçaUI (Tailwind v4) | ✅ completo |
| 10 — Node.js | `cap10-encurtador/` — encurtador de URLs (base62, Node nativo) | ✅ completo |
| 11 — APIs | `cap11-cineapi/` — API de catálogo de filmes (Fastify + Swagger) | ✅ completo |
| 12 — PostgreSQL | `cap12-ecommerce/` — schema de e-commerce (SQL + seed + relatórios) | ✅ completo |
| 13 — ORMs | `cap13-biblioteca/` — API de biblioteca (Prisma, 2 migrações) | ✅ completo |
| 14 — Autenticação | `cap14-authhub/` — AuthHub (JWT rotativo + RBAC + rate limit) | ✅ completo |
| 15 — Full stack | `cap15-skillhub/` — marketplace de serviços (Next 16 + Prisma + Auth.js) | ✅ completo |
| 16 — Testes | `cap16-suites/` — suíte de testes do SkillHub (Vitest + Playwright) | 📝 em preparação |
| 17 — Docker | `cap17-docker/` — ambiente dev dockerizado (Dockerfile + Compose) | 📝 em preparação |
| 18 — CI/CD | `cap18-pipeline/` — GitHub Actions (CI + GHCR) | 📝 em preparação |
| 19 — Segurança | `cap19-hardening/` — hardening do SkillHub (headers + rate limit) | 📝 em preparação |
| 20 — Performance | `cap20-otimizacao/` — orçamentos Lighthouse + CI (LCP/INP/CLS) | ✅ completo |
| 21 — Arquitetura | `cap21-eventos/` — filas BullMQ + idempotência (7 testes) | ✅ completo |
| 22 — Observabilidade | `cap22-observabilidade/` — logs JSON (pino) + métricas RED | ✅ completo |
| 23 — Cloud | `cap23-aws/` — infraestrutura Terraform AWS (referência) | ✅ completo |
| 24 — IA | `cap24-skillchat/` — assistente RAG (embeddings + busca vetorial, 8 testes) | ✅ completo |
| 25 — Carreira | `cap25-carreira/` — templates de portfólio/currículo/STAR | ✅ completo |

## Soluções dos exercícios

Em `--solucoes/`, organizadas por capítulo: `cap01/solucoes-cap01.md` …
`cap25/solucoes-cap25.md` — gabaritos comentados dos exercícios de fixação
de todos os capítulos (veja o README de `--solucoes/`).

## Como rodar os projetos completos

```bash
# Estáticos (cap 01–04): basta servir a pasta
npx serve codigo/cap01-portfolio
npx serve codigo/cap02-receita
npx serve codigo/cap03-landing
npx serve codigo/cap04-jogo-memoria

# Tipado e testável (cap 06–14) — Node.js 24+:
cd codigo/cap06-validador && npm install && npm test      # biblioteca TS
cd codigo/cap07-kanban    && npm install && npm run dev   # Kanban (Vite)
cd codigo/cap08-blog      && npm install && npm run dev   # blog MDX+ISR
cd codigo/cap09-design-system && npm install && npm run dev  # OrçaUI
cd codigo/cap10-encurtador && npm install && npm run dev  # encurtador (Node nativo)
cd codigo/cap11-cineapi   && npm install && npm run dev   # CineAPI (:3333, /docs)
cd codigo/cap12-ecommerce && docker compose up -d         # schema SQL (pg18)
cd codigo/cap13-biblioteca && npm install && npm run db:migrate && npm run dev
cd codigo/cap14-authhub   && npm install && npm run db:migrate && npm run db:seed && npm run dev

# SkillHub (cap 15): requer Node 24 + PostgreSQL
cd codigo/cap15-skillhub
cp .env.example .env        # ajuste DATABASE_URL e AUTH_SECRET
npm install
npm run db:migrate && npm run db:seed
npm run dev                 # http://localhost:3000
# login demo: ana@exemplo.com / senha-forte-123
# testes: npm test · npm run test:e2e · npm run test:coverage
```

Os projetos ainda em preparação (05 e 16–19) exigem Node.js 24 LTS, Docker e as
dependências descritas em cada README — instale conforme o apêndice A do livro.
