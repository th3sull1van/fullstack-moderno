# Soluções — Capítulo 21: Arquitetura e Escala

## Exercício 1 — Escala vertical, horizontal e assíncrona

- **Vertical**: máquina **maior** (mais CPU/RAM) — ex.: trocar o servidor de
  4 para 16 vCPUs. Simples, mas com teto e ponto único de falha;
- **Horizontal**: **mais máquinas** atrás de um load balancer — ex.: 3
  instâncias da API. Escala quase ilimitada, exige app **stateless**;
- **Assíncrona**: **filas/eventos** para trabalho que não precisa responder
  na hora — ex.: envio de e-mail processado por worker.

## Exercício 2 — Por que stateless é pré-requisito da escala horizontal

Se a sessão/dados moram **na memória de uma instância** (estado local), uma
requisição que cai em outra instância "perde" o usuário. Com N instâncias
atrás de um balanceador, qualquer uma precisa atender qualquer requisição:
o estado vai para **fora** (banco, Redis, JWT autocontido). Stateless =
qualquer instância serve qualquer request = escala horizontal de verdade.

## Exercício 3 — Fluxo de uma tarefa em fila

1. **Produtor** (a API) publica a tarefa na fila — ex.: `enviar-email`, com
   payload (destinatário, template);
2. **Fila** (Redis/BullMQ, SQS) segura a mensagem até ser consumida;
3. **Consumidor** (worker separado) pega a mensagem, processa e **confirma**
   (ack) — se falhar, a mensagem volta para retry.

A API responde na hora ("email agendado") e o trabalho pesado acontece em
paralelo, sem bloquear o request.

## Exercício 4 — Idempotência em filas e retries

Uma operação é **idempotente** quando executá-la 1 ou N vezes produz o mesmo
resultado. Em filas, o consumidor pode receber a **mesma mensagem duas vezes**
(reprocessamento, timeout de ack) — sem idempotência, um pagamento seria
cobrado em dobro. Soluções: chave de idempotência (ex.: `pedidoId`) com
unicidade no banco, ou verificação de estado antes de aplicar.

## Exercício 5 — Quando microsserviços se justificam (ou não)

- **Se justifica**: times independentes escalando e deployando por conta —
  ex.: serviço de pagamento com requisito de disponibilidade próprio;
- **Não se justifica**: app pequeno/médio, time único — o custo (rede,
  consistência distribuída, observabilidade, operação) supera o ganho; um
  **monólito modular** bem dividido resolve melhor. Microsserviço resolve
  problema **organizacional** (escala de times), não problema de código.
