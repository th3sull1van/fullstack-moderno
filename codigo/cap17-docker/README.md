# cap17-docker — SkillHub dockerizado

Projeto do **capítulo 17** do livro: o ambiente de desenvolvimento do
SkillHub (capítulo 15) em contêineres.

## O que está aqui

| Arquivo | Papel |
|---------|-------|
| `docker-compose.yml` | Orquestra `db` (PostgreSQL 18) + `app` (build da imagem) |
| `../cap15-skillhub/Dockerfile` | Multi-stage: `dev` (hot-reload) e `prod` (standalone, não-root) |
| `../cap15-skillhub/.dockerignore` | Mantém o contexto de build enxuto |

## Como usar

```bash
# 1. Só o banco (para desenvolvimento local com npm run dev)
docker compose up -d db

# 2. Ambiente completo (banco + app em produção, build local)
docker compose up --build

# 3. Acompanhar logs
docker compose logs -f app
```

## Critérios de aceite do capítulo (como validar)

- [ ] `docker compose up -d db` + `npm run dev` no app → site 100% funcional;
- [ ] `docker compose up --build` → app sobe sozinho (migrações automáticas);
- [ ] Imagem de produção sem `latest`: rode `docker build --target prod -t skillhub:1.0.0 .`;
- [ ] Usuário não-root: `docker exec <app> whoami` retorna `app`;
- [ ] Dados persistem: `docker compose down` (sem `-v`) e `up` de novo mantém o banco;
- [ ] Sem segredos na imagem: `docker history skillhub:1.0.0` não expõe `.env`.

## Observações

- O Dockerfile de produção roda `prisma migrate deploy` antes de subir —
  health check do banco garante que o PostgreSQL já aceita conexões;
- Para desenvolvimento com hot-reload dentro do Docker, use o target `dev`
  com volume de código (exercício do capítulo);
- O `AUTH_SECRET` no compose é de desenvolvimento — em produção, injete via
  variável de ambiente do CI ou gerenciador de segredos (capítulos 18 e 19).
