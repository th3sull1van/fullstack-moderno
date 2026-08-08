# Soluções — Capítulo 19: Segurança

## Exercício 1 — OWASP Top 10 (2025), de memória

1. **A01 — Access Control Failures** (controle de acesso quebrado);
2. **A02 — Cryptographic Failures** (falhas criptográficas);
3. **A03 — Injection** (SQL, NoSQL, OS — injeção);
4. **A04 — Insecure Design** (falhas de design/fluxo de confiança);
5. **A05 — Security Misconfiguration** (configuração insegura);
6. **A06 — Vulnerable and Outdated Components** (componentes vulneráveis/desatualizados);
7. **A07 — Identification and Authentication Failures** (falhas de identificação/autenticação);
8. **A08 — Software and Data Integrity Failures** (falhas de integridade);
9. **A09 — Security Logging and Monitoring Failures** (falhas de logging/monitoramento);
10. **A10 — Server-Side Request Forgery (SSRF)**.

## Exercício 2 — SQL injection e as duas defesas

Ocorre quando dados do usuário são **concatenados** no SQL, alterando a
estrutura do comando:

```sql
-- ❌ "'; DROP TABLE usuarios; --" vira parte do comando
SELECT * FROM usuarios WHERE email = '""'; DROP TABLE usuarios; --"'
```

Defesas:
1. **Query parametrizada / prepared statement** — o valor nunca é interpretado
   como SQL (`WHERE email = $1`);
2. **ORM** (Prisma, Drizzle) com API tipada — parametriza por padrão.

## Exercício 3 — XSS vs CSRF

- **XSS** (Cross-Site Scripting): o atacante **injeta script** que roda no
  navegador da vítima (ex.: comentário com `<script>` não sanitizado) — rouba
  cookies/tokens, altera a página;
- **CSRF** (Cross-Site Request Forgery): o atacante **faz a vítima autenticada
  disparar uma ação** sem ela saber (ex.: `<img src="/api/transferir?para=...">`
  executado com os cookies da vítima) — usa a sessão dela contra ela.

Defesas: XSS → escapar/sanitizar saída + CSP + HttpOnly; CSRF → tokens
anti-CSRF (SameSite, double-submit).

## Exercício 4 — O que uma Content Security Policy restringe

A CSP (header `Content-Security-Policy`) diz ao navegador **de onde** cada
tipo de recurso pode vir: scripts, estilos, imagens, conexões, frames.
Ex.: `default-src 'self'; script-src 'self'` bloqueia **scripts inline e
externos** que não sejam do próprio domínio — a defesa estrutural contra XSS
(mesmo que um `<script>` malicioso entre no HTML, ele não executa).

## Exercício 5 — Esconder botão de admin ≠ controle de acesso

Esconder é **só UI**: o atacante chama a API diretamente (`curl POST
/api/usuarios/1/delete`) e o botão não está no caminho. O controle de acesso
precisa existir **no servidor**, em cada rota/ação sensível — verificar papel
e permissão na autorização (RBAC), nunca depender do frontend. UI escondida é
conveniência; autorização no servidor é segurança.
