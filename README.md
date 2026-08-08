# Full Stack Moderno — do zero ao sênior

Livro digital, aberto e gratuito sobre **desenvolvimento web full stack** com
TypeScript, React, Next.js, PostgreSQL, Docker e AWS. Escrito em português
brasileiro, do iniciante absoluto ao nível sênior, com um projeto independente
por capítulo, exercícios em 3 níveis, soluções testadas e revisão por pares
simulada.

**Texto:** CC BY 4.0 · **Código:** MIT (livre e permissivo para tudo).

## Transparência: criação com IA

Este livro foi **100% criado com inteligência artificial** — texto, código,
diagramas, exercícios e processo editorial — usando o modelo
**DeepSeek V4 Flash 0731** executado no harness **FreeBuff**. A revisão por
pares também foi simulada com agentes de IA independentes (ver `revisao/`),
e as versões e datas de consulta das documentações ficam em
`MANUTENCAO.md`.

## Conteúdo

| Parte | Capítulos | Nível |
|-------|-----------|-------|
| I — Fundamentos da Web | 01 universo full stack · 02 HTML · 03 CSS · 04 JavaScript | Iniciante |
| II — Frontend com TS e React | 05 Git · 06 TypeScript · 07 React · 08 Next.js · 09 Estilização/Design Systems | Iniciante→Pleno |
| III — Backend, APIs e Dados | 10 Node.js · 11 HTTP/REST · 12 PostgreSQL · 13 ORMs · 14 Autenticação | Pleno |
| IV — Full Stack Integrado | 15 Full stack Next.js · 16 Testes · 17 Docker · 18 CI/CD · 19 Segurança | Pleno |
| V — Avançado e Produção | 20 Performance · 21 Arquitetura · 22 Observabilidade · 23 Cloud/AWS · 24 IA | Sênior |
| VI — Carreira | 25 Carreira e mercado | Sênior |
| Apêndices | A instalação · B soluções · C glossário · D referências · E manutenção · F revisão | — |

## Estado do projeto

- **Capítulos 1–25**: texto completo, didático e no padrão editorial da Parte I
  (rodada editorial 2 concluída em 08/08/2026);
- **Apêndices A–F**: completos;
- **Código**: `codigo/` com os projetos 01–04 prontos e o mapa dos demais
  (SkillHub e projetos 05–25 a implementar);
- **Revisão por pares**: sistema simulado implementado em `revisao/`;
- **Manutenção**: versões e datas em `MANUTENCAO.md`.

## Estrutura do repositório

```
livro/        # fonte LaTeX (XeLaTeX): main.tex, preambulo, capítulos, apêndices
codigo/       # repositório de código dos projetos e soluções
pesquisa/     # pesquisa de mercado salva por rodada (com fontes e datas)
revisao/      # sistema de revisão por pares (checklists, relatórios)
scripts/      # build do PDF/EPUB e validador estrutural
MANUTENCAO.md # versões, datas de consulta e mudanças futuras
```

## Como compilar o livro

Requisitos: **TeX Live 2023+** (ou TinyTeX) com XeLaTeX, latexmk, biber e os
pacotes (lista validada em 08/08/2026):

```
latexmk xetex biber fontspec babel-portuges microtype xcolor listings
tcolorbox fancyhdr titlesec enumitem booktabs tools caption hyperref xurl
biblatex etoolbox pgf amsmath amsfonts tex-gyre csquotes   # PDF
tex4ebook make4ht luaxml                                  # EPUB
```

> As fontes (TeX Gyre Pagella/Heros, fallback Latin Modern) são carregadas por
> **nome de arquivo via kpathsea** — não dependem do fontconfig do sistema
> operacional. `\shorthandoff{"}` desliga o atalho do babel para permitir
> aspas retas em `\texttt{...}`.

```bash
# 1. Validação estrutural (não precisa de TeX)
bash scripts/verificar-latex.sh

# 2. PDF
cd livro && ../scripts/build-pdf.sh

# 3. EPUB (requer tex4ebook; empacota com Python se `zip` faltar)
cd livro && ../scripts/build-epub.sh
```

> **Windows (Git Bash)**: os scripts usam bash/POSIX — rode-os pelo Git Bash.
> **TinyTeX** (recomendado para começar):
> `tlmgr option repository https://mirror.ctan.org/systems/texlive/tlnet`
> e depois o `tlmgr install` com a lista acima.

## Status do build (08/08/2026, TinyTeX local)

- **PDF**: `livro/main.pdf` — **233 páginas**, **0 overfull hbox**, 0 referências indefinidas;
- **EPUB**: `livro/main.epub` — conteúdo completo, `mimetype` spec-compliant
  (primeiro e sem compressão), empacotado via `scripts/empacotar-epub.py`
  (o Windows não tem `zip`).

## Como usar o código

```bash
npx serve codigo/cap01-portfolio    # portfólio (cap. 1)
npx serve codigo/cap02-receita      # receitas (cap. 2)
npx serve codigo/cap03-landing      # landing page (cap. 3)
npx serve codigo/cap04-jogo-memoria # jogo da memória (cap. 4)
```

## Como contribuir

Veja `revisao/README.md` (processo de revisão) e o apêndice F do livro.
Correções, atualizações de versão e melhorias didáticas são bem-vindas.
