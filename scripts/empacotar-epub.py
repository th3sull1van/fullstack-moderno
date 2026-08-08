#!/usr/bin/env python3
"""Empacota a pasta gerada pelo tex4ebook em um EPUB válido.

Uso: python3 empacotar-epub.py <pasta-fonte> <arquivo-saida.epub>

Garante: arquivo `mimetype` primeiro e sem compressão (ZIP_STORED),
conforme a especificação EPUB. Necessário quando o comando `zip` não está
disponível (ex.: Windows/Git Bash).
"""
import os
import sys
import zipfile


def empacotar(src: str, out: str) -> None:
    if os.path.exists(out):
        os.remove(out)

    entries = []
    for root, _dirs, files in os.walk(src):
        for f in files:
            full = os.path.join(root, f)
            arc = os.path.relpath(full, src).replace(os.sep, "/")
            entries.append((full, arc))

    mimetype = next((e for e in entries if e[1] == "mimetype"), None)
    if mimetype:
        entries.remove(mimetype)

    with zipfile.ZipFile(out, "w") as z:
        if mimetype:
            z.write(mimetype[0], "mimetype", zipfile.ZIP_STORED)
        for full, arc in entries:
            z.write(full, arc, zipfile.ZIP_DEFLATED)

    print(f"EPUB criado: {out} ({os.path.getsize(out)} bytes)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    empacotar(sys.argv[1], sys.argv[2])
