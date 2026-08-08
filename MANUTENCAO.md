# MANUTENCAO.md — Manutenção do Livro "Full Stack Moderno"

Este arquivo registra as **versões das tecnologias**, as **datas de consulta
das documentações** e as **mudanças futuras** do livro. Mantenha-o atualizado a
cada revisão. O apêndice E do livro (`livro/capitulos/apendice-e-manutencao.tex`)
é o espelho deste arquivo — atualize os dois juntos.

## Versões registradas (consulta em 2026-08-08)

| Tecnologia | Versão | Documentação consultada | Data |
|------------|--------|-------------------------|------|
| Next.js | 16.3 (usado 16.3.0) | https://nextjs.org/docs | 2026-08-08 |
| React | 19.2 (usado 19.2.8) | https://react.dev | 2026-08-08 |
| TypeScript | 6.0 (usado 5.9) | https://www.typescriptlang.org/docs/ | 2026-08-08 |
| Node.js | 24 LTS (ambiente: v26.5) | https://nodejs.org/docs/latest/api/ | 2026-08-08 |
| PostgreSQL | 18.4 | https://www.postgresql.org/docs/current/ | 2026-08-08 |
| Tailwind CSS | 4.x (usado 4.3.3) | https://tailwindcss.com/docs | 2026-08-08 |
| Prisma | 6.x (usado 6.19.3) | https://www.prisma.io/docs | 2026-08-08 |
| Drizzle ORM | 1.x | https://orm.drizzle.team | 2026-08-08 |
| Vitest | 4.x (usado 4.1.10) | https://vitest.dev | 2026-08-08 |
| Vite | 8.x (usado 8.2.1) | https://vite.dev | 2026-08-08 |
| Fastify | 5.x (usado 5.11.3) | https://fastify.dev | 2026-08-08 |
| Zod | 4.x (usado 4.4.3) | https://zod.dev | 2026-08-08 |
| Playwright | 1.x (usado 1.62.1) | https://playwright.dev | 2026-08-08 |
| Docker | 27+/28 | https://docs.docker.com | 2026-08-08 |
| GitHub Actions | — | https://docs.github.com/actions | 2026-08-08 |
| OWASP Top 10 | 2025 | https://owasp.org/Top10/2025/en/ | 2026-08-08 |
| Vercel AI SDK | 5.x | https://ai-sdk.dev | 2026-08-08 |

## Fontes de mercado consultadas

| Fonte | Período | URL | Data |
|-------|---------|-----|------|
| Stack Overflow Developer Survey | 2025 | https://survey.stackoverflow.co/2025/technology | 2026-08-08 |
| GitHub Octoverse | 2025 | https://octoverse.github.com/ | 2026-08-08 |
| State of JavaScript | 2024 | https://2024.stateofjs.com/ | 2026-08-08 |
| ThoughtWorks Technology Radar | Vol. 33 (nov/2025) | https://www.thoughtworks.com/radar | 2026-08-08 |

## Estado editorial dos capítulos

| Capítulo | Estado |
|----------|--------|
| 01–04 (Parte I) | ✅ Texto completo + código executável |
| 05–25 | ✅ Texto completo (rodada editorial 2) — código: 06–19 ✅, 05 e 20–25 em preparação |
| Apêndices A–F | ✅ Completos (instalação, soluções, glossário, referências, manutenção, revisão) |

## Política de atualização

1. **Revisão trimestral** das documentações oficiais (próxima: nov/2026);
2. **Regra de quebra**: mudança de versão que quebre exemplo → atualizar
   código + registrar aqui com data;
3. **Fonte de verdade dos exemplos**: `codigo/` (o livro referencia via
   `\lstinputlisting`);
4. **Feedback**: issues/PRs no repositório.

## Histórico

| Data | Ação |
|------|------|
| 2026-08-08 | Criação do projeto: estrutura, Parte I completa, esqueletos 05–25, infraestrutura LaTeX, código 01–04, revisão e manutenção. |
| 2026-08-08 | Rodada 2: capítulos 05–25 em texto completo (PDF 233p, 0 overfull). |
| 2026-08-08 | Códigos 06–19 implementados e testados (104 testes verdes). |
| 2026-08-08 | Rodada 3: revisão completa (técnica/pedagógica/fontes), URLs 26/26 válidas, índice remissivo adicionado (PDF 235p). |

## Mudanças futuras previstas

- [x] Expandir capítulos 05–25 para texto completo (rodada editorial 2);
- [x] Rodada de revisão por pares completa (rodada 3 — ver `revisao/`);
- [x] Gerar e validar EPUB (`scripts/build-epub.sh`);
- [x] Validar URLs de `referencias.bib` (26/26, 2026-08-08);
- [x] Índice remissivo (`makeindex` + `scripts/gerar-indice.py`);
- [ ] Implementar códigos 05 e 20–25 e preencher `codigo/--solucoes/`;
- [ ] Reconsultar versões (nov/2026);
- [ ] Publicação sob CC BY 4.0 (texto) e MIT (código).
