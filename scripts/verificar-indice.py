"""Verifica a saúde do índice remissivo nos capítulos.

Problemas REAIS flagados:
  1. \\index dentro de blocos lstlisting (quebra o verbatim);
  2. \\index aninhado dentro de outro \\index (quebra o makeindex);
  3. resíduos de edições antigas (display com \\texttt, @theme etc.).

Obs.: \\index dentro de \\textbf{}/\\texttt{}/\\section{} é VÁLIDO em TeX
(executa e grava a página corretamente) — não é flagado.
"""
import glob
import os
import re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAPITULOS = os.path.join(RAIZ, "livro", "capitulos")


def dentro_de_lstlisting(texto: str, pos: int) -> bool:
    inicio = texto.rfind("\\begin{lstlisting}", 0, pos)
    fim = texto.rfind("\\end{lstlisting}", 0, pos)
    return inicio > fim


def problema_aninhado(texto: str, pos: int) -> bool:
    """True se a posição cai DENTRO do argumento de outro \\index{...}."""
    ultimo_index = texto.rfind("\\index{", 0, pos)
    ultima_fecha = texto.rfind("}", 0, pos)
    return ultimo_index > ultima_fecha


problematicos = 0
for f in sorted(glob.glob(os.path.join(CAPITULOS, "*.tex"))):
    nome = os.path.basename(f)
    if not re.match(r"^\d{2}-", nome):
        continue
    t = open(f, encoding="utf-8").read()

    for m in re.finditer(r"\\index\{", t):
        pos = m.start()
        linha = t[:pos].count("\n") + 1
        if dentro_de_lstlisting(t, pos):
            problematicos += 1
            print(f"!! {nome}:{linha} \\index DENTRO DE LSTLISTING")
        elif problema_aninhado(t, pos):
            problematicos += 1
            ctx = t[max(0, pos - 50):pos + 50].replace("\n", " ")
            print(f"!! {nome}:{linha} \\index ANINHADO -> ...{ctx}...")

    # resíduos de edições antigas
    for padrao, desc in [
        (r"\\index\{[^{}]*\\index\{", "aninhado (sem chaves)"),
        (r"@theme\\index|\\index\{theme@", "resíduo de @theme"),
    ]:
        for m in re.finditer(padrao, t):
            problematicos += 1
            print(f"!! {nome}:{t[:m.start()].count(chr(10)) + 1} [{desc}]")

if problematicos == 0:
    print("OK: índice saudável (sem lstlisting, aninhamento ou resíduos).")
else:
    print(f"\n{problematicos} problema(s) — rode: python scripts/limpar-indice.py && python scripts/gerar-indice.py --apply")
