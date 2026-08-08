"""Remove TODOS os \\index{...} dos capítulos (reset limpo, ordem reversa)."""
import glob
import os
import re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAPITULOS = os.path.join(RAIZ, "livro", "capitulos")

removidos = 0
for f in sorted(glob.glob(os.path.join(CAPITULOS, "*.tex"))):
    nome = os.path.basename(f)
    if not re.match(r"^\d{2}-", nome):
        continue
    with open(f, encoding="utf-8") as fh:
        t = fh.read()
    alvos = [(m.start(), m.end()) for m in re.finditer(r"\\index\{[^{}]*\}", t)]
    for inicio, fim in sorted(alvos, reverse=True):
        t = t[:inicio] + t[fim:]
        removidos += 1
    if alvos:
        with open(f, "w", encoding="utf-8") as fh:
            fh.write(t)

print(f"{removidos} \\index removidos (reset).")
