# Soluções — Capítulo 17: Docker

## Exercício 1 — Imagem, contêiner e volume

- **Imagem**: o "molde" imutável (sistema + dependências + código) — o
  `Dockerfile` a constrói;
- **Contêiner**: uma **execução** da imagem — processo isolado; a mesma
  imagem roda N contêineres;
- **Volume**: armazenamento **persistente** fora do filesystem do contêiner —
  dados do banco sobrevivem ao `docker rm`.

## Exercício 2 — Multi-stage

Um `Dockerfile` com **várias etapas**: a primeira compila (Node inteiro,
devDependencies), a última só **copia o artefato** para uma imagem enxuta
(geralmente `distroless`/alpine). O ganho: imagem de produção **muito menor**
e com **menos superfície de ataque** (sem compilador, sem devDependencies).

## Exercício 3 — `docker-compose.yml` Node + PostgreSQL

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: dev123
      POSTGRES_DB: appdb
    volumes:
      - dbdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 3s
      retries: 10

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://app:dev123@db:5432/appdb
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy

volumes:
  dbdata:
```

## Exercício 4 — Health check e por que `depends_on` não basta

`depends_on` só garante a **ordem de criação** — o PostgreSQL pode estar
"rodando" mas ainda **inicializando** (não aceitando conexões). O
**healthcheck** (`pg_isready`) torna a dependência funcional: com
`condition: service_healthy`, o app só sobe quando o banco **responde de
verdade**. Sem isso, o app conecta cedo demais e crasha.

## Exercício 5 — Três comandos de inspeção

```bash
docker ps                    # contêineres rodando (e seus status/portas)
docker logs <container>      # logs do processo
docker inspect <container>   # detalhes completos: rede, volumes, health, env
```
(Também úteis: `docker compose ps` e `docker stats` para recursos.)
