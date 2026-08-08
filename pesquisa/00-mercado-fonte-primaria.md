# Pesquisa de Mercado — Fontes Primárias (Rodada 1)

Data da consulta: 2026-08-08
Ferramenta: busca web (Google via API), fontes oficiais dos levantamentos.

---

## 1. Stack Overflow Developer Survey 2025

Fonte oficial: https://survey.stackoverflow.co/2025/technology e https://survey.stackoverflow.co/2025

Dados-chave (49.000+ respostas, 177 países, 314 tecnologias):
- JavaScript continua a linguagem mais popular (topo desde 2013/2014, exceto 2013–14 quando SQL liderou).
- React segue como framework web nº 1 (~44,7%–46,9% dos desenvolvedores).
- PostgreSQL é o banco de dados nº 1 (58,2%).
- Node.js lidera entre runtimes web (~49,1%).
- SQL, Java e JavaScript no top 3 de tecnologias.
- Rust segue como linguagem mais admirada (~72%); Go subiu ao topo como linguagem preferida para backend em 2025.
- Redis ~28% vs Valkey 2,4%.
- Destaque novo em 2025: agentes de IA (novo foco do survey).
- jQuery ainda aparece (23,4%) — legado relevante para manutenção.

## 2. State of JavaScript 2024

Fonte oficial: https://2024.stateofjs.com/en-US/libraries/front-end-frameworks/
- React mantém o topo; Vue em 2º lugar (retention melhorou muito); Angular em 3º.
- TypeScript consolidado como padrão dominante na comunidade JS.
- Sentimento: React e Vue bem avaliados pelos desenvolvedores.

## 3. GitHub Octoverse 2025

Fontes: https://octoverse.github.com/ e https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/
- Em agosto/2025, **TypeScript ultrapassou Python e JavaScript** e tornou-se a linguagem mais usada no GitHub — 1ª vez na história.
- Um novo desenvolvedor entra no GitHub a cada segundo (~180M devs, 1B+ projetos).
- O avanço de TypeScript está ligado ao crescimento de IA/agentes (código gerado em TS).
- Python segue fortíssimo (IA/dados); JavaScript continua enorme.

## 4. Padrões de stack full stack 2025/2026 (múltiplas fontes)

- Next.js (Vercel) é o meta-framework React mais usado (52,9% de uso em levantamento tsh.io) e virou o "default" para apps full stack.
- Stack moderna consolidada: **TypeScript + React + Next.js + PostgreSQL + Prisma/Drizzle + Tailwind + Docker + AWS/Vercel**.
- ORMs: Prisma e Drizzle lideram no ecossistema TS; shadcn/ui + Tailwind para UI.
- Autenticação: Clerk, Auth.js, NextAuth — além de soluções próprias com JWT/sessões.
- Cloud: AWS é o provedor mais usado; Vercel dominante para Next.js; MongoDB e DynamoDB comuns ao lado de PostgreSQL.
- SaaS em 2026: PostgreSQL 55,6% de adoção; React 44,7%; TypeScript nº1 no GitHub (2,63M contribuidores).

## Decisão preliminar (a validar na próxima rodada)

Stack principal do livro: **TypeScript + HTML/CSS + React + Next.js + PostgreSQL + Prisma/Drizzle + Tailwind + Docker + AWS (+ testagem com Vitest/Playwright, CI com GitHub Actions)**.

Motivos:
1. Dados de mercado acima (SO Survey 2025, Octoverse 2025, State of JS 2024).
2. Preferência declarada do leitor por Next.js.
3. Ecossistema único de linguagem (TS) reduz fricção do iniciante e cobre full stack de ponta a ponta.
