# cap18-pipeline — CI/CD do SkillHub

Projeto do **capítulo 18** do livro: o pipeline de qualidade e entrega do
SkillHub. Os workflows vivem no repositório do app (capítulo 15) em
`.github/workflows/`; esta pasta documenta o desenho e os critérios.

## Workflows

| Workflow | Dispara | Faz |
|----------|---------|-----|
| `ci.yml` | push na `main` e todo PR | typecheck, testes unitários, build e E2E com PostgreSQL como serviço |
| `publish.yml` | push na `main` | build da imagem (target prod) + push no GHCR com tag por SHA |

## Fluxo de trabalho

```
push/PR ──► CI (typecheck · test · build · e2e com banco real)
                 │ verde?
                 ├─ não ──► PR bloqueado (branch protection)
                 └─ sim ──► main ──► Publish (GHCR, tag = SHA) ──► deploy
```

**CI verde é a porta de entrada do PR**: configure no GitHub
(Settings → Branches → protection rules) para exigir o check `quality` e
`e2e` antes do merge na `main`.

## Como aplicar ao seu repositório

1. Publique o SkillHub (capítulo 15) como repositório no GitHub;
2. Os workflows já estão em `.github/workflows/` — basta o push;
3. Ative o branch protection para `main` (checks obrigatórios);
4. Adicione badges ao README do app:

```markdown
[![CI](https://github.com/SEU-USUARIO/skillhub/actions/workflows/ci.yml/badge.svg)](https://github.com/SEU-USUARIO/skillhub/actions/workflows/ci.yml)
[![Publish](https://github.com/SEU-USUARIO/skillhub/actions/workflows/publish.yml/badge.svg)](https://github.com/SEU-USUARIO/skillhub/actions/workflows/publish.yml)
```

## Detalhes de segurança do pipeline

- Segredos via `secrets.*` — nunca literais no YAML (o `AUTH_SECRET` de CI é
  um valor descartável apenas para o job E2E);
- `permissions: { contents: read, packages: write }` no job de publish —
  princípio do menor privilégio;
- `cache: npm` acelera o `npm ci`; o Playwright instala só o Chromium.

## Critérios de aceite do capítulo

- [ ] PR com mudança simples → CI verde (typecheck, test, build);
- [ ] PR com mudança que quebra um teste → CI vermelho e merge bloqueado;
- [ ] E2E roda em CI contra PostgreSQL real (serviço com health check);
- [ ] Imagem publicada no GHCR com tag por SHA após merge na `main`;
- [ ] Badges de status no README;
- [ ] Histórico documentando uma correção real de pipeline.

## Extensões do capítulo (desafios)

- [ ] **Matrix**: rodar testes em Node 22 e 24;
- [ ] **Deploy condicional**: publicar só com tag semver (`v1.2.3`);
- [ ] **Notificação**: webhook do resultado no Discord/Slack;
- [ ] **Tempo de pipeline**: medir e reduzir em 50% com cache/paralelismo.
