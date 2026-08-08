#!/usr/bin/env bash
# Gera o EPUB do livro com tex4ebook (conversão LaTeX -> HTML -> EPUB).
# Requisitos: TeX Live/TinyTeX com tex4ebook, make4ht e luaxml.
# Se o comando `zip` não existir (Windows), empacota via Python.
set -euo pipefail

cd "$(dirname "$0")/../livro"

if ! command -v tex4ebook >/dev/null 2>&1; then
  echo "ERRO: tex4ebook não encontrado. Instale: tlmgr install tex4ebook make4ht luaxml" >&2
  exit 1
fi

echo "==> Convertendo LaTeX -> HTML (tex4ebook)..."
rm -rf main-epub
# No Windows não existe `zip`, e o tex4ebook falha só na etapa final de
# empacotamento — mesmo tendo gerado o HTML. Por isso não abortamos aqui.
tex4ebook -x main.tex > epub-build.log 2>&1 || true

if [ ! -f main.epub ]; then
  if [ -d main-epub ]; then
    echo "==> Empacotando com Python (sem 'zip' no sistema)..."
    if command -v python3 >/dev/null 2>&1; then
      python3 ../scripts/empacotar-epub.py main-epub main.epub
    else
      echo "ERRO: 'zip' e 'python3' ausentes — não foi possível empacotar o EPUB." >&2
      exit 1
    fi
  else
    echo "ERRO na conversão. Veja livro/epub-build.log" >&2
    exit 1
  fi
fi

echo "==> EPUB gerado: livro/main.epub"
