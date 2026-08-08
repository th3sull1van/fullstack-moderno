# Pesquisa de Mercado — Fontes Complementares (Rodada 2)

Data da consulta: 2026-08-08

---

## 5. Versões atuais e oficiais das tecnologias (confirmadas)

| Tecnologia | Versão atual (ago/2026) | Fonte oficial | Notas |
|---|---|---|---|
| Next.js | 16.3 | https://nextjs.org/blog/next-16 (21/10/2025) | App Router sobre React canary (React 19.2); Turbopack estável; Cache Components; Instant Navigations (16.3) |
| React | 19.2.x | https://react.dev/blog/2024/12/05/react-19 | Server Components estáveis; Actions; React Compiler |
| TypeScript | 6.0 (5.9 em ago/2025) | https://github.com/microsoft/TypeScript/releases | TS 6.0 adiciona target es2025; TS 5.9 trouxe `import defer`, novo `tsc --init` |
| Node.js | 24 LTS (v26 Current) | https://nodejs.org/en/about/previous-releases | Node 24 (LTS out/2025): `.env` nativo, V8 13.6, test runner aprimorado, npm 11 |
| PostgreSQL | 18.4 (19 em beta) | https://www.postgresql.org/docs/current/ (18.4, jul/2026) | PG 18 (set/2025): async I/O, UUIDv7, colunas geradas virtuais, melhorias de upgrade |
| Tailwind CSS | v4 | https://tailwindcss.com/blog/tailwindcss-v4 (22/01/2025) | Config CSS-first; sem tailwind.config.js por padrão; motor Oxide |
| Prisma | 6.x | https://www.prisma.io/docs | Abstração madura; API expressiva |
| Drizzle ORM | 1.0+ | https://orm.drizzle.team | SQL-first, ~50kB, cold starts melhores em serverless |
| Vitest | 3.x | https://vitest.dev | Runner nativo Vite, TS/ESM nativo, ~5x mais rápido que Jest |
| Playwright | 1.x | https://playwright.dev | E2E multi-browser (incl. WebKit/Safari), paralelismo, sharding |

## 6. OWASP Top 10:2025 (lista oficial completa)

Fonte: https://owasp.org/Top10/2025/en/
1. A01:2025 — Broken Access Control (Controle de Acesso Quebrado)
2. A02:2025 — Security Misconfiguration (Má Configuração de Segurança)
3. A03:2025 — Software Supply Chain Failures (Falhas na Cadeia de Suprimentos de Software)
4. A04:2025 — Cryptographic Failures (Falhas Criptográficas)
5. A05:2025 — Injection (Injeção)
6. A06:2025 — Insecure Design (Design Inseguro)
7. A07:2025 — Authentication Failures (Falhas de Autenticação — renomeado em 2025)
8. A08:2025 — Software and Data Integrity Failures (Falhas de Integridade de Software e Dados)
9. A09:2025 — Logging and Monitoring Failures (Falhas de Registro e Monitoramento)
10. A10:2025 — Server-Side Request Forgery (Falsificação de Requisição no Lado do Servidor)

Mudanças vs 2021: A07 renomeado; Supply Chain subiu para A03; SSRF entrou na lista (2021 já tinha).

## 7. Ferramentas de teste (decisão)

- Unit/componentes: **Vitest** (ecossistema Vite/TS; compatível com API do Jest; recomendado para projetos Vite/Next.js modernos). Jest citado como alternativa madura.
- E2E: **Playwright** (cross-browser, paralelismo nativo, multi-tab/mobile) — recomendado; Cypress citado como alternativa com DX superior.

## 8. ThoughtWorks Technology Radar

- Vol. 33 (nov/2025): ~48 blips de IA (quase metade do total) — IA em plataformas/agentes é tema dominante.
- Vol. 32 (abr/2025): 105 blips; agentes supervisionados em assistentes de código.
- Relevância para o livro: capítulo de IA no full stack é obrigatório; boas práticas de agentes/assistentes.

## 9. Roadmaps de full stack 2026 (síntese de múltiplas fontes)

Ordem de aprendizado consensual: Fundamentos (HTML, CSS, JS, Git) → Frontend (React, Tailwind) → Framework full stack (Next.js) → Backend (Node, APIs, banco) → Testes → DevOps (Docker, CI/CD) → Cloud → IA/avançado → Carreira.

## 10. Decisões finais (consolidadas)

- **Stack principal**: TypeScript (linguagem única ponta a ponta) + HTML/CSS + React + Next.js 16 + Tailwind v4 + PostgreSQL 18 + Prisma (ensino) e Drizzle (avançado) + Docker + GitHub Actions + AWS + Vitest/Playwright + Redis + IA (Vercel AI SDK / OpenAI-compatível).
- **Justificativa**: Stack Overflow Survey 2025 (JS nº1, React nº1, PostgreSQL 58,2%, Node ~49%), Octoverse 2025 (TypeScript nº1 no GitHub desde ago/2025), State of JS 2024 (React nº1), preferência do leitor por Next.js, ecossistema único TS (menos fricção para iniciante).
- **Escopo do livro**: full stack completo (frontend, backend, dados, testes, devops, cloud, segurança, arquitetura, IA, carreira), pt-BR com termos técnicos em inglês.
- **Q13 não respondido**: sem exclusões obrigatórias; o livro foca no stack TS (dominante) e menciona comparativamente Java/Spring, C#/.NET, Python/Django/FastAPI, Go e PHP/Laravel no capítulo de mercado. Sem foco em blockchain/WASM/desktop.
