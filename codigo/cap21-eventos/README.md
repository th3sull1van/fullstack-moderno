# cap21-eventos — Arquitetura de eventos (referência)

Implementação de referência do projeto do capítulo 21: trabalho **assíncrono**
com filas (Redis + BullMQ), com o foco didático nos dois conceitos que
separam "fila que funciona" de "fila que corrompe dados": **idempotência** e
**retry com backoff**.

## O que existe aqui

| Arquivo | Papel |
|---|---|
| `src/processador.ts` | **Lógica pura**: processa a tarefa com idempotência (armazenamento injetado) e retorna `feito/repetido/erro` — testável sem Redis |
| `src/fila.ts` | Fila BullMQ de produção (jobId = chave de idempotência, `attempts: 5`, backoff exponencial) |
| `src/worker.ts` | Worker que consome e delega à lógica pura; erro → não confirma → BullMQ devolve à fila |
| `src/processador.test.ts` | 7 testes: idempotência, retry sem duplicação, falha/erro, relatório |
| `docker-compose.yml` | Redis local para rodar o fluxo real |

## Como rodar

```bash
npm install
npm test                    # 7 testes offline (lógica pura)
npm run typecheck
docker compose up -d        # sobe o Redis
npm run dev:worker          # terminal 1: consome
npm run dev:produtor        # terminal 2: publica tarefas de exemplo
```

## Por que idempotência é o coração do capítulo

Em filas, a **mesma mensagem pode ser entregue duas vezes** (timeout de ack,
reprocessamento após falha). Sem idempotência, um e-mail de "compra
confirmada" seria enviado em dobro. A solução tem três camadas:

1. **`jobId` na fila** — o BullMQ não enfileira duplicados *ativos*;
2. **Chave de idempotência no processador** — o resultado é registrado antes
   de terminar; repetição devolve o resultado anterior sem re-executar;
3. **Retry com backoff exponencial** — falha transitória não descarta a
   tarefa, e a idempotência garante que o retry não duplique efeitos.

Em produção, o `Armazenamento` é uma tabela
`tarefas_processadas(chave PRIMARY KEY, resultado JSON)` no PostgreSQL.

## Conexão com o livro

- SkillHub (cap. 15) → filas para e-mails e relatórios (cap. 21);
- Observabilidade (cap. 22) → logs do worker com `chaveIdempotencia` para
  rastrear retries;
- O diagrama produtor → fila → consumidor da Figura 21.x do livro.
