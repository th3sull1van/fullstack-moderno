# Soluções — Capítulo 10: Node.js

## Exercício 1 — O event loop

O Node roda em **uma única thread** com um *event loop*: operações de I/O
(arquivos, rede, banco) são **assíncronas** — a thread entrega a operação ao
sistema e segue para a próxima tarefa; quando o resultado chega, uma callback
é agendada. Por isso o Node não "trava" esperando um arquivo: ele espera *sem
ocupar a thread*, processando outros requests no meio tempo.

## Exercício 2 — Bloquear o event loop

Bloquear é ocupar a thread com trabalho síncrono pesado, impedindo o loop de
atender novos eventos:

```js
// ❌ bloqueia: cálculo síncrono gigante
const dados = [];
for (let i = 0; i < 1e9; i++) dados.push(i * i);

// ✅ assíncrono/streaming: processa em pedaços sem travar
```
Em produção: `fs.readFileSync` em rota de API, `JSON.parse` de payloads
enormes, loops densos — todos bloqueiam.

## Exercício 3 — CSV: ler, filtrar, escrever

```js
import { readFile, writeFile } from "node:fs/promises";

const entrada = await readFile("dados.csv", "utf8");
const linhas = entrada.trim().split("\n").slice(1); // pula cabeçalho

const filtradas = linhas.filter((linha) => linha.includes("ativo"));

await writeFile("ativos.csv", ["nome,status", ...filtradas].join("\n"));
```
`node:fs/promises` devolve promises — `await` sem callbacks.

## Exercício 4 — `node:crypto` e SHA-256

```js
import { createHash } from "node:crypto";

const hash = createHash("sha256").update("minha senha").digest("hex");
console.log(hash);
```
`node:crypto` cobre hashes, HMAC, geração de bytes aleatórios, cifras etc.
(Nota: para senhas de usuários use argon2/bcrypt com salt — capítulo 14 —
não SHA-256 puro.)

## Exercício 5 — `package.json` com módulos ES e scripts

```json
{
  "name": "meu-script",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/index.js",
    "check": "node --check src/index.js"
  }
}
```
`"type": "module"` habilita `import`/`export`; `npm run dev` roda com watch.

## Exercício 6 — `node --watch`

Reinicia o processo **automaticamente** quando um arquivo do projeto muda —
o "hot reload" nativo do Node, ideal para desenvolvimento: edite, salve, veja
o resultado sem rodar o comando de novo.
