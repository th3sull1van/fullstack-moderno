# cap10-encurtador — encurtador de URLs (base62)

Encurtador de URLs no estilo bit.ly, **sem framework** — apenas Node nativo
(`node:http`), projeto do capítulo 10 do livro *Full Stack Moderno*.

## Rotas

| Método | Rota | Comportamento |
|--------|------|---------------|
| `POST` | `/encurtar` | Recebe `{ "url": "..." }`, valida, gera código base62 e salva em `urls.json` → `201` |
| `GET` | `/:codigo` | Redireciona (302) para a URL original e conta o acesso |
| `GET` | `/estatisticas/:codigo` | Analytics: `{ codigo, url, acessos, criadoEm }` |
| `GET` | `/` | Lista todas as URLs encurtadas |

Erros: URL inválida → `400`; código inexistente → `404`; corpo não-JSON → `400`.

## Como rodar

```bash
npm install
npm run dev        # http://localhost:3000
# ou
npm start

# testar com curl
curl -X POST localhost:3000/encurtar -H "Content-Type: application/json" \
     -d '{"url":"https://nextjs.org/docs"}'
# → {"codigo":"b","urlCurta":"http://localhost:3000/b","urlOriginal":"https://nextjs.org/docs"}
curl -i localhost:3000/b          # 302 Location: https://nextjs.org/docs
curl localhost:3000/estatisticas/b # → {"codigo":"b","acessos":1,...}
```

## Testes

```bash
npm test            # base62 + integração do servidor HTTP (porta efêmera)
npm run typecheck   # tsc --noEmit (strict)
```

## Como funciona

1. `POST /encurtar` valida a URL (só `http`/`https`), pega o próximo ID
   sequencial e o converte em um código curto com o **algoritmo base62**
   (`src/base62.ts`): `1 → "b"`, `62 → "ba"`, `3844 → "baa"`...
2. O registro vai para `urls.json` (persistência simples; o arquivo é gravado
   de forma atômica — `.tmp` + `rename`).
3. `GET /:codigo` decodifica o código de volta em ID, redireciona com `302` e
   incrementa o contador de acessos.

Para produção, troque o JSON por PostgreSQL/Redis (caps. 12 e 21) e adicione
validação de domínios abusivos — a estrutura do repositório (`Repositorio`) já
isola essa troca.

## Critérios de aceite (cap. 10)

| Critério | Onde |
|----------|------|
| `POST /encurtar` valida, gera código e salva em `urls.json` | `src/servidor.ts` + `src/repositorio.ts` |
| `GET /:codigo` redireciona com 302 | `src/servidor.ts` |
| Algoritmo base62 (a–z A–Z 0–9) | `src/base62.ts` |
| Erros: URL inválida (400), código inexistente (404) | testes de integração |
| Contagem de acessos por URL | `registrarAcesso` + `/estatisticas/:codigo` |
| `tsc --noEmit` limpo e código comentado | `npm run typecheck` |
