# [Nome do Projeto]

> Uma linha: o que é, para quem é, e por que existe.

## Problema

*Por que este projeto existe? Qual dor ele resolve? (2-4 frases.)*

## Solução

*O que ele faz e quais decisões técnicas importantes foram tomadas — com o
"porquê". Ex.: "Usei Next.js App Router para ter Server Components (menos JS
no cliente); o banco é PostgreSQL com Prisma; as filas de e-mail usam Redis."*

## Arquitetura

![Diagrama](docs/arquitetura.png)

*Se o projeto não tem diagrama, desenhe um — é a primeira coisa que um
recrutador/sênior procura.*

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS |
| Backend | Server Actions, Fastify |
| Banco | PostgreSQL + Prisma |
| Infra | Docker, GitHub Actions, AWS ECS |
| Qualidade | Vitest, Playwright, Lighthouse |

## Como rodar

```bash
cp .env.example .env   # ajuste as variáveis
npm install
npm run db:migrate && npm run db:seed
npm run dev            # http://localhost:3000
```

## Testes

```bash
npm test          # 104 testes
npm run test:e2e  # Playwright
```

## Deploy

*Onde está no ar e como foi publicado (link). CI: GitHub Actions (lint,
typecheck, testes, build, Lighthouse).*

## Decisões e trade-offs

*2-4 decisões com o raciocínio — é isso que separa "quem fez" de "quem
decorou". Ex.: "JWT rotativo em vez de sessão porque o deploy é stateless;
o custo (revogação) é mitigado com blacklist curta."*
