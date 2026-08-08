# cap22-observabilidade — Logs, métricas e o triângulo RED (referência)

Implementação de referência do projeto do capítulo 22: tornar o SkillHub
**observável** — logs estruturados em JSON, métricas RED e o caminho para
traces/alertas.

## O que existe aqui

| Arquivo | Conceito |
|---|---|
| `src/logger.ts` | **Logs JSON** com `requestId` e `servico` obrigatórios; campos sensíveis **redigidos** (`[REDIGIDO]`) |
| `src/metricas.ts` | **Métricas RED**: `http_requests_total` (Rate), `http_errors_total` (Errors), `http_request_duration_seconds` (Duration) + `cpu_uso` (saturação) |
| `*.test.ts` | 7 testes: formato JSON, correlação por requestId, redação, contadores, histograma (p95), gauge |

## Como rodar

```bash
npm install
npm test                    # 7 testes offline
npm run typecheck
```

## Como usar na API do SkillHub

```ts
import { criarLogger } from "./logger.ts";
import { criarMetricas } from "./metricas.ts";

const log = criarLogger({ requestId: crypto.randomUUID(), servico: "skillhub" });
const metricas = criarMetricas();

// em cada rota:
const inicio = performance.now();
log.info({ rota: "/servicos", metodo: "GET" }, "requisição");
// ... processa ...
metricas.registrar(200, "/servicos", (performance.now() - inicio) / 1000);

// endpoint /metrics (consumido pelo Prometheus):
// reply.type("text/plain").send(await metricas.texto());
```

## Alerta "bom" (exemplo do capítulo)

```
ALERT ErroPagamentoAlto
  IF rate(http_errors_total{rota="/api/pagamentos"}[5m]) > 0.05
  FOR 5m
  LABELS { severity = "P1" }
  ANNOTATIONS { runbook = "docs/runbook-pagamentos.md" }
```

É acionável porque: métrica de negócio (erro real), janela curta (5 min),
limiar de impacto (5%) e runbook.

## Conexão com o livro

- Logs → cap. 19 (não vaze dados sensíveis: `redact`) e cap. 15 (requestId nas
  Server Actions);
- Métricas → cap. 20 (performance medida) — o `http_request_duration_seconds`
  é a mesma duração que o Lighthouse mede no navegador;
- Traces/span → próxima camada (OpenTelemetry), discutida no capítulo 22.
