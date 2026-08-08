#!/usr/bin/env bash
# ============================================================================
# Validador estrutural do livro LaTeX.
# Não substitui o LaTeX, mas pega a maioria dos erros antes da compilação:
#  1. Arquivos \include existem
#  2. Arquivos de código (\lstinputlisting) existem
#  3. \label usados por \ref existem (e não há duplicatas)
#     - inclui labels definidos via label={...} (lstlisting/tcolorbox)
#     - ignora \ref ilustrativos como \ref{...}
#  4. Balanceamento de \begin/\end e de chaves por arquivo
# ============================================================================
set -u

cd "$(dirname "$0")/../livro" || exit 1

ERROS=0
AVISOS=0
ARQS_TEX=$(ls capitulos/*.tex preambulo.tex capa.tex pre-textual.tex main.tex 2>/dev/null)

echo "== 1. Arquivos \\include existem =="
while IFS= read -r inc; do
  if [ ! -f "${inc}.tex" ]; then
    echo "ERRO: include '${inc}.tex' não encontrado"
    ERROS=$((ERROS+1))
  fi
done < <(grep -o '\\include{[^}]*}' main.tex | sed 's/\\include{//;s/}//')

echo ""
echo "== 2. Arquivos de código referenciados existem =="
for caminho in $(grep -rho '\\codigopath/[^}]*' capitulos/ main.tex 2>/dev/null | sed 's/\\codigopath\///'); do
  if [ ! -f "../codigo/${caminho}" ]; then
    echo "ERRO: código ausente: codigo/${caminho}"
    ERROS=$((ERROS+1))
  fi
done

echo ""
echo "== 3. Labels e referências cruzadas =="
# Labels definidos por \label{...} ou label={...} (opção de lstlisting/tcolorbox)
{ grep -rho '\\label{[^}]*}' capitulos/*.tex; grep -rho 'label={[^}]*}' capitulos/*.tex; } \
  | sed 's/\\label{//;s/label={//;s/}//' | sort -u > /tmp/livro_labels.txt
# Referências (ignorando \ref ilustrativos com "...")
{ grep -rho '\\ref{[^}]*}' capitulos/*.tex pre-textual.tex; } \
  | sed 's/\\ref{//;s/}//' | grep -v '^\.\.\.$' | sort -u > /tmp/livro_refs.txt
while IFS= read -r r; do
  if ! grep -qx "$r" /tmp/livro_labels.txt; then
    echo "ERRO: \\ref{$r} sem \\label correspondente"
    ERROS=$((ERROS+1))
  fi
done < /tmp/livro_refs.txt
dups=$( { grep -rho '\\label{[^}]*}' capitulos/*.tex; grep -rho 'label={[^}]*}' capitulos/*.tex; } \
  | sed 's/\\label{//;s/label={//;s/}//' | sort | uniq -d )
if [ -n "$dups" ]; then
  echo "AVISO: labels duplicados: $dups"
  AVISOS=$((AVISOS+1))
fi

echo ""
echo "== 4. Balanceamento de ambientes e chaves =="
for f in $ARQS_TEX; do
  b=$(grep -o '\\begin{[^}]*}' "$f" | wc -l)
  e=$(grep -o '\\end{[^}]*}' "$f" | wc -l)
  if [ "$b" -ne "$e" ]; then
    echo "ERRO: $f: $b \\begin vs $e \\end"
    ERROS=$((ERROS+1))
  fi
  abertas=$(grep -o '{' "$f" | wc -l)
  fechadas=$(grep -o '}' "$f" | wc -l)
  if [ "$abertas" -ne "$fechadas" ]; then
    echo "AVISO: $f: $abertas chaves abertas vs $fechadas fechadas (pode ser falso positivo em lstlisting)"
    AVISOS=$((AVISOS+1))
  fi
done

echo ""
echo "== Resultado =="
echo "Erros: $ERROS | Avisos: $AVISOS"
if [ "$ERROS" -gt 0 ]; then
  echo "Existem erros a corrigir antes de compilar."
  exit 1
fi
echo "OK: estrutura validada (compile com scripts/build-pdf.sh para a prova final)."
exit 0
