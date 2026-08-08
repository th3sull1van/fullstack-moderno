# TODO.md — Tarefas do projeto "Full Stack Moderno"

Livro digital gratuito (pt-BR) + repositório de código. Texto sob **CC BY 4.0**,
código sob **MIT**. Este arquivo é o quadro geral do que falta — mantenha-o
atualizado a cada rodada de trabalho.

> Legenda: `[ ]` pendente · `[x]` concluído · marcadores de prioridade
> `P0` (bloqueante p/ publicação) / `P1` (importante) / `P2` (melhoria).

---

## ✅ Já concluído (contexto)

- [x] Livro: **25 capítulos em texto completo** + 6 apêndices (v0.2)
- [x] PDF compilado: **237 páginas, 0 overfull hbox, 0 referências indefinidas** (`livro/main.pdf`)
- [x] EPUB gerado (`livro/main.epub`), com fallback textual dos diagramas TikZ
- [x] Revisão por pares: **Rodadas 1, 1.1, 2 e 3** registradas em `revisao/relatorios/`
- [x] **Índice remissivo** (151 entradas) + script `scripts/verificar-indice.py`
- [x] URLs de `referencias.bib` validadas (26/26 vivas, `scripts/verificar-urls.py`)
- [x] Repositório publicado: **https://github.com/th3sull1van/fullstack-moderno** (branch `main`)
- [x] **Release v0.3** publicada com `main.pdf` e `main.epub` (GitHub Releases)
- [x] **CI do livro**: `.github/workflows/livro.yml` — compila PDF/EPUB a cada tag `v*` e anexa à release
- [x] Código dos capítulos **01–04, 06–15 e 20–25** implementados (102 testes verdes nos 11 projetos testáveis — ver `codigo/README.md`)
- [x] **Gabaritos das fixações**: `codigo/--solucoes/cap01..cap25/solucoes-capNN.md` (+ README)
- [x] **6 diagramas TikZ** (requisição, ISR, DER, SkillHub, AWS, RAG) — 1 por parte
- [x] Ambiente `seniores` ("Sênior N.") nos 25 capítulos; prefácio e apêndice B alinhados
- [x] Análise didática completa em `revisao/analise-didatica.md` (+ `scripts/metricas-didatica.py`)

---

## 📦 Código — projetos pendentes

- [ ] **P0** `cap05-git/` — scripts e convenções de Git (único da Parte I sem projeto)
- [ ] **P0** `cap16-suites/` — suíte de testes do SkillHub (Vitest + Playwright) — hoje só README
- [ ] **P1** `cap17-docker/` — Dockerfile multi-stage + compose de dev do SkillHub — hoje só README + compose
- [ ] **P1** `cap18-pipeline/` — GitHub Actions (CI + GHCR) do SkillHub — hoje só README
- [ ] **P1** `cap19-hardening/` — hardening (headers + rate limit + CSP) — hoje só README

## ✅ Código — validações complementares

- [ ] **P1** cap09: rodar os testes visuais de verdade (`npx playwright install chromium` + `npm run test:e2e`) e registrar screenshots
- [ ] **P1** cap12: executar `schema.sql`/`seed.sql`/`relatorios.sql` num PostgreSQL real (`docker compose up -d` no `cap12-ecommerce`) e conferir os `EXPLAIN ANALYZE`
- [ ] **P2** cap15: executar o fluxo completo com PostgreSQL (migrar/seed/login real) — depende de Docker na máquina de dev
- [ ] **P2** cap23: `terraform fmt -check` e `terraform validate` (sem conta AWS, sem custo)

## 🎓 Reforço pedagógico (da análise didática)

- [ ] **P2** Checkpoints "Revisão da Parte X" (10 questões objetivas por parte, com link para os gabaritos)
- [ ] **P2** Narrativas de debugging (1 por parte: programa quebrado → processo de raciocínio)
- [ ] **P3** Quiz rápido no fim de cada parte para autoavaliação objetiva

## 🛠️ Manutenção

- [ ] **P1** Atualizar `MANUTENCAO.md` + apêndice E:
  - estado editorial (soluções, diagramas, projetos 20–25, análise didática)
  - versões **reais usadas no código**: Vitest 4, Vite 8, Fastify 5, Tailwind 4.3, Prisma 6.19, zod 4.4, Node 26 (livro registra Vitest 3.x, Node 24 LTS)
- [ ] **P1** Reconsultar versões das documentações oficiais (**nov/2026**, conforme política trimestral)
- [ ] **P2** Instalar `tidy` (opcional) para EPUB ainda mais rigoroso

## 🚀 Publicação

- [x] **P0** Push do commit inicial para o GitHub (repo público criado, branch `main`)
- [x] **P1** Publicar `main.pdf` e `main.epub` via **GitHub Releases** (release v0.3)
- [x] **P2** CI do livro (`.github/workflows/livro.yml` — compilar PDF/EPUB em cada tag e anexar à release)

## 🧭 Roadmap (ideias, não compromissos)

- [ ] Rodada editorial 4: conferir cada `\lstinputlisting` do livro contra o código real do `codigo/` (fonte única de verdade)
- [ ] Exercícios sêniores resolvidos e testados (auth com TOTP, Redis no AuthHub, focus trap no Modal…)
- [ ] Contribuições: guia em `revisao/README.md` + apêndice F já prontos para issues/PRs
