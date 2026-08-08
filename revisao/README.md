# Sistema de Revisão por Pares — Full Stack Moderno

O livro é submetido a um **sistema de revisão por pares simulado**: agentes
independentes executam papéis de revisor com checklists objetivos, e um script
valida o resultado de forma mecânica (compilação, execução de código,
referências cruzadas).

## Os três revisores (agentes independentes)

| Revisor | Foco | Checklist |
|---------|------|-----------|
| **Técnico** | Os exemplos funcionam? Versões corretas? Código executa? | `checklist-tecnico.md` |
| **Pedagógico** | Ordem linear? Pré-requisitos? Dificuldade progressiva? Clareza? | `checklist-pedagogico.md` |
| **De fontes** | Dados com fonte oficial? Docs oficiais priorizadas? Datas registradas? | `checklist-fontes.md` |

Cada revisor **não conversa com os outros** (independência) e produz um
relatório no formato `relatorio-modelo.md`.

## Passos da revisão (por rodada)

1. **Compilação**: `scripts/build-pdf.sh` sem erros e sem overfull hbox grave;
2. **Código**: `tsc --noEmit` e testes verdes em `codigo/` (quando aplicável);
3. **Referências cruzadas**: script `scripts/verificar-latex.sh` valida
   `\label`/`\ref`, arquivos incluídos e `\lstinputlisting` existentes;
4. **Revisão técnica**: executar os 3 capítulos completos (01–04) e conferir
   os exemplos de cada capítulo esqueleto;
5. **Revisão pedagógica**: aplicar o checklist por capítulo;
6. **Revisão de fontes**: cruzar cada dado de mercado com a fonte oficial;
7. **Consolidação**: relatório final com severidade (bloqueante / maior /
   menor / sugestão) e plano de correção.

## Como executar

```bash
# 1. Validação mecânica (não precisa de LaTeX instalado)
bash scripts/verificar-latex.sh

# 2. Compilação real do PDF (requer TeX Live/TinyTeX)
cd livro && ../scripts/build-pdf.sh

# 3. Geração do EPUB (requer tex4ebook)
cd livro && ../scripts/build-epub.sh

# 4. Relatório de revisão (preencher por rodada)
cp revisao/relatorio-modelo.md revisao/relatorios/rodada-2026-08.md
```

## Critérios de aceite editorial

- Nenhum erro bloqueante (conteúdo incorreto, código que não roda, fonte ausente);
- `\ref` sem erros e sem `??` no PDF;
- Código do repositório 100% executável conforme os capítulos completos;
- Versões e datas atualizadas no apêndice E e em `MANUTENCAO.md`.

## Registro de rodadas

Cada rodada gera um relatório em `revisao/relatorios/` com a data, os
achados por severidade e o plano de correção.
