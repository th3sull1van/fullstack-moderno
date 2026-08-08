#!/usr/bin/env python3
"""
gerar-indice.py — semeia entradas de \\index{...} no livro.

Curadoria: cada capítulo tem uma lista de termos-chave (ver CHAVES). O script
insere \\index{Termo} na PRIMEIRA ocorrência real de cada termo no corpo do
capítulo, com guarda de contexto (não insere dentro de \\texttt{}/\\url{}/...).

Uso:
    python scripts/gerar-indice.py --dry-run   # mostra o que faria
    python scripts/gerar-indice.py --apply     # insere nos arquivos

Idempotente: termos já indexados não recebem nova entrada.
"""
import argparse
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAPITULOS = os.path.join(RAIZ, "livro", "capitulos")

# Termos-chave por capítulo (curadoria editorial — base: objetivos + projeto).
CHAVES: dict[str, list[str]] = {
    "01-universo-fullstack.tex": ["full stack", "frontend", "backend", "JavaScript",
                                  "SQL", "React", "PostgreSQL", "Node.js", "HTTP",
                                  "requisição"],
    "02-html.tex": ["HTML", "HTML semântico", "acessibilidade", "ARIA", "SEO",
                    "elementos HTML", "atributos", "formulários"],
    "03-css.tex": ["CSS", "box model", "Flexbox", "Grid", "responsividade",
                   "especificidade", "cascata", "media queries", "unidades relativas"],
    "04-javascript.tex": ["JavaScript", "ES Modules", "Promise", "async/await",
                          "fetch", "DOM", "event loop", "debounce", "closures",
                          "imutabilidade"],
    "05-git-github.tex": ["Git", "GitHub", "commit", "branch", "merge",
                          "pull request", "GitHub Pages", ".gitignore"],
    "06-typescript.tex": ["TypeScript", "tipagem estática", "strict", "interface",
                          "type alias", "generics", "union types", "narrowing",
                          "inferência de tipos"],
    "07-react.tex": ["React", "JSX", "componentes", "props", "estado", "hooks",
                     "useState", "useEffect", "lifting state up", "useLocalStorage",
                     "reconciliação", "key"],
    "08-nextjs.tex": ["Next.js", "App Router", "Server Components", "Client Components",
                      "SSG", "SSR", "ISR", "generateStaticParams", "MDX",
                      "generateMetadata", "loading.tsx", "not-found.tsx"],
    "09-estilizacao-design-systems.tex": ["design system", "tokens de design",
                                          "Tailwind CSS", "utility-first", "@theme",
                                          "dark mode", "WCAG", "shadcn/ui"],
    "10-nodejs.tex": ["Node.js", "event loop", "módulos", "node:fs", "node:http",
                      "streams", "base62", "npm"],
    "11-http-rest-apis.tex": ["HTTP", "REST", "API", "métodos HTTP",
                              "códigos de status", "JSON", "OpenAPI", "paginação",
                              "Fastify", "Content-Type"],
    "12-postgresql-sql.tex": ["PostgreSQL", "SQL", "ACID", "chave primária",
                              "chave estrangeira", "índice", "transação", "JOIN",
                              "EXPLAIN ANALYZE", "UUID"],
    "13-orms-migracoes.tex": ["ORM", "Prisma", "Drizzle", "migrações", "schema",
                              "seed", "N+1", "prisma migrate", "upsert"],
    "14-autenticacao-autorizacao.tex": ["autenticação", "autorização", "JWT",
                                        "refresh token", "argon2", "RBAC",
                                        "hash de senha", "rate limit", "httpOnly"],
    "15-fullstack-nextjs.tex": ["full stack", "Server Actions", "useActionState",
                                "revalidatePath", "Prisma", "Zod", "middleware"],
    "16-testes.tex": ["testes unitários", "testes de integração", "testes end-to-end",
                      "TDD", "mocks", "Vitest", "Playwright", "cobertura",
                      "pirâmide de testes"],
    "17-docker.tex": ["Docker", "contêiner", "imagem", "Dockerfile", "multi-stage",
                      "docker-compose", "volumes", "não-root"],
    "18-ci-cd.tex": ["CI/CD", "GitHub Actions", "pipeline", "workflow", "deploy",
                     "artefatos", "secrets", "GHCR"],
    "19-seguranca.tex": ["segurança", "XSS", "CSRF", "SQL injection", "OWASP Top 10",
                         "CSP", "headers de segurança", "dependências vulneráveis"],
    "20-performance.tex": ["performance", "Core Web Vitals", "LCP", "INP", "CLS",
                           "cache", "código splitting", "lazy loading", "Lighthouse"],
    "21-arquitetura-escala.tex": ["arquitetura", "monólito", "microsserviços",
                                  "escalabilidade", "Redis", "filas", "mensageria",
                                  "stateless", "balanceamento de carga"],
    "22-observabilidade.tex": ["observabilidade", "métricas", "logs", "tracing",
                               "OpenTelemetry", "Prometheus", "Grafana", "alertas"],
    "23-cloud-aws.tex": ["cloud", "AWS", "EC2", "S3", "RDS", "Terraform", "IaC",
                         "VPC", "serverless"],
    "24-ia-fullstack.tex": ["inteligência artificial", "LLM", "RAG", "embeddings",
                            "prompt", "token", "Vercel AI SDK", "alucinação"],
    "25-carreira.tex": ["carreira", "portfólio", "LinkedIn", "entrevistas",
                        "networking", "soft skills", "open source"],
}

# Caracteres especiais do makeindex: entrada "SORT@DISPLAY" (o display pode
# carregar \texttt{...} com o termo literal).
SPECIAIS = re.compile(r"[@!|]")


def chave_index(termo: str) -> str:
    """Devolve a entrada \\index{...} segura para o makeindex."""
    if SPECIAIS.search(termo):
        sort = re.sub(r"[@!|]", "-", termo).strip("-")
        return f"{sort}@\\texttt{{{termo}}}"
    return termo


def fora_de_macro(texto: str, pos: int) -> bool:
    """True se a posição está em nível de texto (não dentro de \\macro{...})."""
    ant = texto[:pos]
    ultima_abre = ant.rfind("{")
    ultima_fecha = ant.rfind("}")
    # o caractere estrutural mais próximo é um fechamento (ou não há chave) → texto
    if ultima_fecha > ultima_abre or ultima_abre == -1:
        return True
    # a mais próxima é uma abertura: ela pertence a um \macro{...}?
    pedaco = ant[max(0, ultima_abre - 60):ultima_abre]
    return re.search(r"\\([a-zA-Z@]+)\s*$", pedaco) is None


def dentro_de_lstlisting(texto: str, pos: int) -> bool:
    """True se a posição está dentro de um bloco \\begin{lstlisting}...\\end{lstlisting}."""
    inicio = texto.rfind("\\begin{lstlisting}", 0, pos)
    fim = texto.rfind("\\end{lstlisting}", 0, pos)
    return inicio > fim


def processar(caminho: str, termos: list[str], aplicar: bool) -> list[str]:
    with open(caminho, encoding="utf-8") as f:
        texto = f.read()

    feitos = []
    for termo in termos:
        # fronteira de palavra: evita "SQL" casar dentro de "PostgreSQL"
        alvo = re.compile(
            r"(?<![A-Za-z0-9])" + re.escape(termo) + r"(?![A-Za-z0-9])",
            re.IGNORECASE,
        )
        pos = None
        for m in alvo.finditer(texto):
            if not fora_de_macro(texto, m.start()):
                continue
            if dentro_de_lstlisting(texto, m.start()):
                continue
            # não inserir dentro de outro \index (ex.: display \texttt{...})
            if texto.rfind("\\index{", 0, m.start()) > texto.rfind("}", 0, m.start()):
                continue
            # não reinserir se já existe \index{...} logo após
            depois = texto[m.end():m.end() + 12]
            if "\\index{" in depois:
                continue
            pos = m
            break
        if pos is None:
            continue
        insercao = f"\\index{{{chave_index(termo)}}}"
        fim = pos.end()
        texto = texto[:fim] + insercao + texto[fim:]
        feitos.append(termo)

    if feitos and aplicar:
        with open(caminho, "w", encoding="utf-8") as f:
            f.write(texto)
    return feitos


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()
    if not args.dry_run and not args.apply:
        ap.error("informe --dry-run ou --apply")

    total = 0
    sem_ocorrencia: dict[str, list[str]] = {}
    for arquivo, termos in CHAVES.items():
        caminho = os.path.join(CAPITULOS, arquivo)
        if not os.path.exists(caminho):
            print(f"[!!] capítulo não encontrado: {arquivo}")
            continue
        feitos = processar(caminho, termos, args.apply)
        nao_achados = [t for t in termos if t not in feitos]
        if nao_achados:
            sem_ocorrencia[arquivo] = nao_achados
        acao = "aplicaria" if args.dry_run else "indexou"
        print(f"[{acao}] {arquivo}: {len(feitos)}/{len(termos)}")
        total += len(feitos)

    if sem_ocorrencia:
        print("\n== Termos sem ocorrência em nível de texto (revisar curadoria) ==")
        for arquivo, termos in sem_ocorrencia.items():
            print(f"  {arquivo}: {', '.join(termos)}")
    print(f"\nTotal de entradas: {total}")


if __name__ == "__main__":
    sys.exit(main())
