"""Autossuficiência: URLs externas, código real referenciado e tamanho por capítulo."""
import glob
import os
import re

CAP = os.path.join(os.path.dirname(__file__), "..", "livro", "capitulos")

print(f"{'cap':>4} {'urls':>5} {'lstinput':>9} {'palavras':>8} {'linhas':>6}")
for f in sorted(glob.glob(os.path.join(CAP, "*.tex"))):
    nome = os.path.basename(f)
    if not re.match(r"^\d{2}-", nome):
        continue
    t = open(f, encoding="utf-8").read()
    urls = len(re.findall(r"\\url\{", t)) + len(re.findall(r"\\href\{", t))
    lsti = len(re.findall(r"\\lstinputlisting", t))
    # palavras: remove comandos latex, conta palavras textuais
    corpo = re.sub(r"\\[a-zA-Z]+(\[[^\]]*\])?(\{[^{}]*\})?", " ", t)
    corpo = re.sub(r"[{}%\\]", " ", corpo)
    palavras = len([w for w in re.split(r"\s+", corpo) if re.search(r"[a-zA-ZÀ-ú]", w)])
    linhas = t.count("\n")
    print(f"{nome[:2]:>4} {urls:>5} {lsti:>9} {palavras:>8} {linhas:>6}")

print("\nProjetos dos caps 20-24 (caixaprojeto, 2 primeiras linhas):")
for num in ("20", "21", "22", "23", "24"):
    f = os.path.join(CAP, f"{num}-*.tex")
    import glob as g
    fs = g.glob(f)
    if not fs:
        continue
    t = open(fs[0], encoding="utf-8").read()
    m = re.search(r"\\begin\{caixaprojeto\}(.*?)\\end\{caixaprojeto\}", t, re.S)
    if m:
        texto = re.sub(r"\\(textbf|texttt|emph)\{", "", m.group(1))
        texto = re.sub(r"[{}]", " ", texto)
        texto = re.sub(r"\s+", " ", texto).strip()
        print(f"  cap{num}: {texto[:230]}")
