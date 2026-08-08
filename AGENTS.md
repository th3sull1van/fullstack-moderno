# AGENTS.md — Guia para agentes que trabalham neste repositório

Este repositório contém o livro **"Full Stack Moderno: do zero ao sênior"**
(texto em LaTeX) e o **repositório de código** dos seus projetos (um por
capítulo). O projeto é todo em **pt-BR** — inclusive comentários de código e
documentação. Mantenha esse idioma.

**Licenças:** texto `LICENSE-TEXTO.txt` (CC BY 4.0) · código `LICENSE-CODIGO.txt` (MIT).

---

## Estrutura

```
livro/          Fonte LaTeX do livro (XeLaTeX + biber)
  capitulos/    25 capítulos + 6 apêndices (01-*.tex … 25-*.tex, apendice-*.tex)
  main.tex      Arquivo mestre (usa \include)
  preambulo.tex Pacotes e macros · referencias.bib (BibLaTeX)
codigo/         Projetos independentes por capítulo (capNN-nome/)
  --solucoes/   Soluções dos exercícios (A PREENCHER)
  README.md     Mapa de projetos com status
scripts/        build-pdf.sh · build-epub.sh · verificar-latex.sh · empacotar-epub.py
revisao/        Sistema de revisão por pares (checklists + relatórios por rodada)
pesquisa/       Notas da pesquisa de mercado
MANUTENCAO.md   Versões das tecnologias e datas de consulta (espelho do apêndice E)
TODO.md         Quadro geral de pendências
```

## Regras de ouro

1. **Nunca descarte, sobrescreva ou faça `git add -A`/`git commit` sem
   permissão explícita.** O repositório é um checkout local compartilhado —
   verifique `git status` antes de qualquer operação de Git. O repositório
   público é `th3sull1van/fullstack-moderno` (branch `main`); **nunca `git
   push`, crie release ou mexa em tags sem pedido explícito** (ver
   "Releases e publicação").
2. **Uma fonte de verdade por assunto**, para não divergir:
   - versões das tecnologias → `MANUTENCAO.md` + apêndice E (atualize os dois);
   - exemplos de código → `codigo/` (o livro referencia via `\lstinputlisting`);
   - pendências → `TODO.md`; revisões → `revisao/relatorios/`.
3. **Nada de "código solto"**: todo projeto em `codigo/` precisa de
   `npm run typecheck` limpo, testes verdes e `README.md` com instruções.
4. **Não atualize versões de bibliotecas por impulso** — o livro documenta
   versões específicas. Se uma atualização for necessária, registre em
   `MANUTENCAO.md` com data.

## Livro (LaTeX)

- Compile com `scripts/build-pdf.sh` (XeLaTeX + biber). Requer TinyTeX/TeX Live.
- **Meta de qualidade**: zero *overfull hbox* (estouro de borda) e zero
  referências indefinidas. Confira no log: `grep -c "Overfull" livro/main.log`.
- Validação estrutural rápida (sem LaTeX): `scripts/verificar-latex.sh`
  (includes, `\lstinputlisting`, `\label`/`\ref`, balanceamento).
- EPUB: `scripts/build-epub.sh` (tex4ebook; no Windows o `zip` não existe —
  o script cai no `scripts/empacotar-epub.py`, spec-compliant).

### Armadilhas conhecidas do LaTeX (já resolvidas — não regrida)

- **Fontes**: carregadas **por nome de arquivo via kpathsea** (o fontconfig do
  Windows não enxerga TeX Gyre). Não mude para carregamento por nome de família.
- **babel português ativa `"` como caractere especial** → o preâmbulo usa
  `\shorthandoff{"}`. Sem isso, aspas retas dentro de `\texttt{...}` quebram.
- **Escape em `\texttt`**: `#` → `\#`, `_` → `\_`, chaves → `\{\}`.
- **URLs/caminhos longos**: use `\path{...}` (quebrável) ou `\url{...}`, nunca
  `\texttt{...}` cru — causa overfull de até 90pt.
- **Comandos de autoria** (`\autordolivro` etc.) vivem no `preambulo.tex`
  (a capa usa antes do front matter).
- **Capa** é condicional para o EPUB (`\ifdefined\HCode`) — o tikz quebra a
  conversão tex4ht. Não coloque tikz na capa sem essa proteção.
- **Diagramas**: todo TikZ no corpo do livro deve ser embrulhado em
  `\diagramatikz{...}` (macro do preâmbulo) — renderiza TikZ no PDF e uma nota
  textual no EPUB (que não converte TikZ sem dvisvgm). Padrão: `figure` com
  `\centering`, `caption` e `label`; largura total ≤ ~14cm para não estourar
  o texto; use a paleta (`primaria`/`secundaria`/`azulclaro`).
- Compilar sempre com **nome alternativo** se `main.pdf` estiver aberto num
  visualizador (o Windows bloqueia o arquivo): ex. `latexmk ... -jobname=main2`.

## Código (`codigo/`)

Convenções por projeto (ver padrão em `cap15-skillhub` ou `cap11-cineapi`):

- **Node 24+ / TypeScript strict** (`strict: true` + `noUncheckedIndexedAccess`).
- **npm 11 bloqueia scripts de instalação por padrão** → todo `package.json`
  precisa do campo `allowScripts` listando os pacotes com postinstall
  (`prisma`, `@prisma/engines`, `esbuild`, `@tailwindcss/oxide`...). Sem isso,
  `npm install` silenciosamente não roda o `prisma generate` etc.
- **Prisma fixado em 6.19.3** (o livro usa sintaxe 6.x; a 7.x já é latest mas
  mudou o client). `cap13`/`cap14` usam **SQLite em dev/teste** (testável sem
  Docker) e documentam a troca para PostgreSQL em produção.
- **Vitest 4**. Em projetos com `jsdom` + Node 26, o `window.localStorage`
  chega `undefined` (proxy do vitest + localStorage experimental do Node):
  use um **stub de Storage** num `test-setup.ts` (ver `cap07-kanban`).
- Config de testes em projeto Vite/Next: use `defineConfig` de
  `vitest/config`; em Next o tsconfig usa `jsx: "preserve"` (o `next build`
  corrige para `react-jsx`).
- **Playwright**: specs vivem em `e2e/` e não devem ser apanhados pelo vitest
  (`include: ["src/**/*.test.{ts,tsx}"]`).
- Cada projeto tem `.gitignore` próprio (`node_modules/`, `*.db`, `.env`, `dist/`).

## Revisão por pares (`revisao/`)

Três revisores simulados e independentes — **técnico**, **pedagógico** e **de
fontes** — com checklists em `revisao/checklist-*.md`. Cada rodada gera um
relatório em `revisao/relatorios/rodada-YYYY-MM-DD.md` com achados por
severidade (bloqueante / maior / menor / sugestão) e plano de correção. Ao
terminar uma rodada, atualize o relatório e o `TODO.md`.

## Releases e publicação

O livro é publicado via **GitHub Releases** com compilação automatizada
(ver `MANUTENCAO.md` → "Política de releases"):

1. **Tags `v*` disparam o CI** (`.github/workflows/livro.yml`): o workflow
   instala TinyTeX, compila PDF e EPUB e anexa `main.pdf` + `main.epub` à
   release da tag;
2. **Os artefatos das releases são os do CI** (TeX Live do GitHub), não os do
   TinyTeX local — que podem diferir em poucos bytes por versões de pacotes;
3. **`overwrite: true`** no upload permite **backfill**: re-executar o
   workflow numa tag já publicada substitui os assets sem falhar em upload
   duplicado;
4. **Build manual sem release**: `gh workflow run livro.yml` compila e valida
   sem anexar (o upload só roda em `refs/tags/`);
5. **Tamanhos mínimos validados** (PDF > 500 KB, EPUB > 100 KB) — artefato
   quebrado falha o workflow em vez de subir silenciosamente;
6. **Nova versão de conteúdo** exige **nova tag** (v0.4+); mudanças só de
   CI/scripts não exigem release nova (backfill via `overwrite`).

Ao publicar: atualize `MANUTENCAO.md`/README/`TODO.md`, crie a tag com `gh
release create vX.Y <pdf> <epub>` (ou apenas `git push origin vX.Y` para o CI
anexar) e nunca apague/recrie tags sem pedido explícito.

## Fluxo típico por tipo de tarefa

| Tarefa | Passos |
|--------|--------|
| Editar capítulo | editar `livro/capitulos/NN-*.tex` → `scripts/verificar-latex.sh` → compilar PDF → conferir overfull/refs |
| Implementar projeto | ler a caixa "Projeto do capítulo" no `.tex` do capítulo → criar `codigo/capNN-nome/` → implementar + testes + README → `npm run typecheck && npm test` → atualizar mapa em `codigo/README.md` |
| Revisão | seguir `revisao/README.md` → aplicar checklists → relatório por severidade |
| Publicar | `git status` → commit apenas dos arquivos do escopo → ver "Releases e publicação" → `gh release create` ou push de tag (nunca sem pedido) |
