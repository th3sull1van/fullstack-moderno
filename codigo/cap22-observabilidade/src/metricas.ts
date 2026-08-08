/**
 * Métricas RED (Rate, Errors, Duration) com prom-client.
 *
 * - Rate: `http_requests_total` (contador por rota/status)
 * - Errors: `http_errors_total` (contador de 5xx)
 * - Duration: `http_request_duration_seconds` (histograma: p50/p95/p99)
 * - Saturação: `cpu_uso` (gauge — o 4º sinal do capítulo 22)
 */
import { Counter, Gauge, Histogram, Registry } from "prom-client";

export interface Metricas {
  registrar(status: number, rota: string, segundos: number): void;
  definirCpu(fracao: number): void;
  /** Texto pronto para o endpoint /metrics do Prometheus. */
  texto(): Promise<string>;
}

export function criarMetricas(registry: Registry = new Registry()): Metricas {
  const requests = new Counter({
    name: "http_requests_total",
    help: "Total de requisições recebidas",
    labelNames: ["rota", "status"],
    registers: [registry],
  });

  const errors = new Counter({
    name: "http_errors_total",
    help: "Total de respostas com erro (5xx)",
    labelNames: ["rota"],
    registers: [registry],
  });

  const duracao = new Histogram({
    name: "http_request_duration_seconds",
    help: "Duração das requisições em segundos",
    labelNames: ["rota"],
    buckets: [0.05, 0.1, 0.3, 0.5, 1, 2.5, 5],
    registers: [registry],
  });

  const cpu = new Gauge({
    name: "cpu_uso",
    help: "Utilização de CPU (0–1)",
    registers: [registry],
  });

  return {
    registrar(status, rota, segundos) {
      requests.inc({ rota, status: String(status) });
      if (status >= 500) errors.inc({ rota });
      duracao.observe({ rota }, segundos);
    },
    definirCpu(fracao) {
      cpu.set(fracao);
    },
    async texto() {
      return registry.metrics();
    },
  };
}
