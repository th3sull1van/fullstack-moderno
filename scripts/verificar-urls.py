"""Verifica as URLs de livro/referencias.bib (HEAD, seguindo redirects)."""
import os
import re
import sys
import urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BIB = os.path.join(RAIZ, "livro", "referencias.bib")

texto = open(BIB, encoding="utf-8").read()
urls = re.findall(r"url\s*=\s*\{([^}]+)\}", texto)

ok = 0
falhas = []
for url in urls:
    try:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            status = r.status
        if 200 <= status < 400:
            ok += 1
        else:
            falhas.append((url, f"HTTP {status}"))
    except urllib.error.HTTPError as e:
        # alguns servidores não respondem HEAD → tenta GET
        try:
            req = urllib.request.Request(url, method="GET", headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20) as r:
                if 200 <= r.status < 400:
                    ok += 1
                else:
                    falhas.append((url, f"GET HTTP {r.status}"))
        except Exception as e2:
            falhas.append((url, f"GET falhou: {e2}"))
    except Exception as e:
        falhas.append((url, f"HEAD falhou: {e}"))

print(f"URLs: {len(urls)} | OK: {ok} | Falhas: {len(falhas)}")
for url, motivo in falhas:
    print(f"  ! {url} -> {motivo}")
sys.exit(1 if falhas else 0)
