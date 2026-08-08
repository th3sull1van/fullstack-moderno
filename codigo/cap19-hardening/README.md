# cap19-hardening — Hardening do SkillHub

Projeto do **capítulo 19** do livro: auditar e endurecer o SkillHub contra o
**OWASP Top 10:2025**. As correções de código vivem no projeto do capítulo 15;
esta pasta documenta a auditoria e o passo a passo de verificação.

## O que já está implementado no SkillHub

| OWASP 2025 | Medida aplicada | Onde |
|------------|-----------------|------|
| A01 — Controle de acesso | RBAC no servidor (só o dono exclui) | `src/actions/servicos.ts` |
| A01 | Rota protegida via `auth()` + redirect | `src/app/painel/layout.tsx` |
| A02 — Má configuração | Headers de segurança + CSP | `next.config.ts` (`headers()`) |
| A04 — Criptografia | Senhas com argon2id (nunca texto puro) | `src/lib/auth.ts`, seed |
| A05 — Injeção | Validação Zod + Prisma parametrizado | `src/lib/validacoes.ts`, actions |
| A07 — Autenticação | Mensagens genéricas + rate limit de login | `src/actions/autenticacao.ts` |
| A07 | Cookie de sessão JWT (httpOnly, SameSite) | Auth.js v5 (padrão) |
| A08 — Integridade | Dados validados na borda (Zod em toda entrada) | actions + formulários |
| A09 — Logging | Rate limit registrado por IP; contexto nas actions | `src/lib/rate-limit.ts` |
| A10 — SSRF | Sem funcionalidade de fetch de URL arbitrária | — |

## Checklist de auditoria (faça você mesmo)

```bash
cd ../cap15-skillhub

# 1. Supply chain (A03)
npm audit                      # sem vulnerabilidades críticas
npm outdated                   # versões defasadas

# 2. Headers — depois do deploy, valide em:
#    https://securityheaders.com  (deve pontuar A/B)

# 3. Scanner de segurança local (A05/A07/A10)
#    OWASP ZAP: https://www.zaproxy.org
#    npx zaproxy -quickurl http://localhost:3000 -quickout zap.html

# 4. Testes de ataque manuais
#    - SQL injection: ' OR 1=1 --  no campo de busca (não deve vazar dados)
#    - XSS: <img src=x onerror=alert(1)> na descrição do serviço
#    - Forçar RBAC: excluir serviço alheio via DevTools (a action recusa)
```

## Critérios de aceite do capítulo

- [ ] `npm audit` sem vulnerabilidades críticas;
- [ ] Headers validados em securityheaders.com (HSTS, CSP, X-Frame-Options, nosniff);
- [ ] Rate limit: 11 tentativas de login errado em 15 min → bloqueio com mensagem;
- [ ] XSS neutralizado em qualquer campo de texto;
- [ ] SQL injection neutralizada (Prisma parametriza);
- [ ] SSRF: nenhuma rota consome URLs fornecidas pelo usuário;
- [ ] Logs de segurança com contexto (IP, ação, timestamp).

## Extensões do capítulo (desafios)

- [ ] **CSP restritiva**: remover `'unsafe-inline'` de `script-src` e ajustar
  até o site funcionar sem erros de console;
- [ ] **STRIDE**: fazer o threat modeling do SkillHub e priorizar riscos;
- [ ] **Rotação de segredos**: documentar o procedimento para trocar
  `AUTH_SECRET` sem derrubar sessões (auditoria de versão).
