# Checklist — Revisão Técnica

Revisor técnico: confere que **o que está escrito funciona**.

## Por capítulo
- [ ] Todo código apresentado existe no repositório `codigo/` (ou é auto-contido na listagem);
- [ ] `tsc --noEmit` passa (projetos TypeScript);
- [ ] Testes (Vitest/Playwright) passam, quando existem;
- [ ] Versões citadas correspondem às versões do `MANUTENCAO.md`;
- [ ] APIs/funções usadas existem na versão citada (checar docs oficiais);
- [ ] Comandos de terminal estão corretos para o sistema-alvo (Windows/Git Bash e Linux/macOS);
- [ ] Status HTTP, nomes de rotas e schemas de dados estão consistentes entre capítulos;
- [ ] Referências cruzadas entre capítulos (`\ref`) apontam para o lugar certo;
- [ ] Nenhuma instrução depende de ferramenta não apresentada no apêndice A.

## Global
- [ ] Compilação LaTeX sem erros;
- [ ] Sem overfull hbox significativo (estouro de borda);
- [ ] Listagens quebram linhas corretamente (não estouram a margem);
- [ ] Figuras/tabelas cabem na página;
- [ ] Nenhum segredo/credencial real no código dos exemplos;
- [ ] Código dos capítulos 01–04 executado de ponta a ponta.

## Relatório
- [ ] Para cada achado: capítulo, seção, severidade (bloqueante/maior/menor/sugestão), correção proposta.
