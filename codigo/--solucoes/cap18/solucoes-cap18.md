# Soluções — Capítulo 18: CI/CD

## Exercício 1 — CI vs CD

- **CI (Integração Contínua)**: a cada push, o pipeline **verifica** o código —
  lint, tipos, testes, build. Detecta problemas cedo;
- **CD (Entrega/Deploy Contínuo)**: após a CI passar, o código é **empacotado
  e enviado** ao ambiente (imagem Docker, deploy). CI responde "está bom?";
  CD responde "coloca no ar".

## Exercício 2 — Quatro checks mínimos de qualidade

1. **Lint** — estilo e erros óbvios (ESLint/Biome);
2. **Typecheck** — tipos corretos (`tsc --noEmit`);
3. **Testes** — unitários/integração (Vitest);
4. **Build** — compila/empacota de verdade (`next build`, `docker build`).

## Exercício 3 — `on: pull_request`

Faz o workflow disparar quando um **PR** é aberto (ou atualizado) — rodando
os checks na **branch do PR** sem tocar na `main`. É o gatilho padrão de CI:
cada PR precisa estar verde antes do merge.

## Exercício 4 — Por que segredos não aparecem literais

O workflow fica **público** no repositório — qualquer string literal vira
segredo exposto. Além disso, histórico do git preserva o vazamento para
sempre. Segredos vão em **secrets do repositório** (Settings → Secrets) e são
referenciados como `${{ secrets.DATABASE_URL }}` — mascarados nos logs pelo
GitHub.

## Exercício 5 — Workflow mínimo

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  qualidade:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
```
`npm ci` instala exatamente o `package-lock.json` (reproduzível); `cache: npm`
acelera as instalações seguintes.
