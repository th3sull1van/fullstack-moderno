#!/usr/bin/env bash
# Gera o PDF do livro com XeLaTeX + biber.
# Requisitos: TeX Live 2023+ ou TinyTeX com os pacotes do README.
set -euo pipefail

cd "$(dirname "$0")/../livro"

if ! command -v latexmk >/dev/null 2>&1; then
  echo "ERRO: latexmk não encontrado. Instale o TeX (veja README.md)." >&2
  exit 1
fi

echo "==> Compilando o livro (XeLaTeX + biber)..."
latexmk -xelatex -interaction=nonstopmode -halt-on-error -synctex=1 main.tex

echo ""
echo "==> PDF gerado: livro/main.pdf"
echo "==> Para iterar mais rápido, use \\includeonly em main.tex."
