# Soluções — Capítulo 22: Observabilidade

## Exercício 1 — Logs, métricas e traces

- **Log**: evento **discreto** com contexto — `"pagamento falhou, pedido 123, status 422"`;
- **Métrica**: **número agregado** no tempo — `taxa_erro_pagamentos = 0,4%` (gráficos, alertas);
- **Trace**: **jornada de uma requisição** pelos serviços — quais spans, quanto
  tempo em cada (banco, fila, API externa).

Logs respondem "o que aconteceu?", métricas "o sistema está saudável?",
traces "onde demorou?".

## Exercício 2 — Logs JSON com contexto

`{ "nivel": "error", "mensagem": "pagamento falhou", "pedidoId": 123, "requestId": "abc" }`
é melhor que texto livre porque: ferramentas (ELK, Grafana) **estruturam e
filtram** por campo; o `requestId` **correlaciona** logs da mesma requisição
entre serviços; e busca por campo é exata, não regex frágil. Texto livre
impede agregação e correlação automáticas.

## Exercício 3 — As 4 métricas RED

1. **Rate** — requisições/segundo (volume, tendência);
2. **Errors** — % de erros (5xx, exceções);
3. **Duration** — latência (p50, p95, p99);
4. **Saturation/Utilização** — quão perto do limite (CPU, conexões, fila).

Juntas respondem: "está vindo tráfego? está falhando? está lento? está
saturado?" — o triângulo RED (Rate, Errors, Duration) + saturação.

## Exercício 4 — O que é um span e o que ele adiciona

Um **span** é uma unidade de trabalho dentro de um trace: nome, início/fim,
duração, atributos e **relação pai-filho** (timeline hierárquica). Além de um
log (que diz "aconteceu X"), o span diz **quanto tempo X levou** e **como X
se relaciona** com o resto da requisição — o que revela o gargalo (ex.: 900ms
de 1s gastos no banco).

## Exercício 5 — Alerta "bom" de pagamento

> **"taxa de erro de pagamento > 5% por 5 minutos"** (severidade P1, com
> runbook: checar status do gateway, fila de retry, último deploy).

É acionável porque: tem **métrica clara** (erro real, não sintoma), **janela
curta** (5 min — pega incidente sem alarmar com ruído), **limiar de negócio**
(5% de transações é impacto financeiro) e **runbook** (o plantão sabe o que
fazer). Alerta ruim: "CPU > 90%" sem contexto — alta incidência, baixa
capacidade de ação.
