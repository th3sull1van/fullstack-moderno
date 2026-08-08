import { describe, expect, it } from "vitest";
import { Registry } from "prom-client";
import { criarMetricas } from "./metricas.ts";

describe("métricas RED", () => {
  it("contabiliza requisições por rota e status (Rate)", async () => {
    const registry = new Registry();
    const m = criarMetricas(registry);

    m.registrar(200, "/servicos", 0.12);
    m.registrar(200, "/servicos", 0.2);
    m.registrar(404, "/nao-existe", 0.01);

    const texto = await m.texto();
    expect(texto).toContain('http_requests_total{rota="/servicos",status="200"} 2');
    expect(texto).toContain('http_requests_total{rota="/nao-existe",status="404"} 1');
  });

  it("contabiliza erros 5xx separadamente (Errors)", async () => {
    const registry = new Registry();
    const m = criarMetricas(registry);

    m.registrar(200, "/api", 0.1);
    m.registrar(503, "/api", 0.9);

    const texto = await m.texto();
    expect(texto).toContain('http_errors_total{rota="/api"} 1');
  });

  it("registra durações no histograma (Duration — p50/p95/p99)", async () => {
    const registry = new Registry();
    const m = criarMetricas(registry);

    for (let i = 0; i < 100; i++) {
      m.registrar(200, "/servicos", i / 100); // 0.01s..1.00s
    }

    const texto = await m.texto();
    expect(texto).toContain("http_request_duration_seconds_count");
    // 100 valores de 0.01s a 1.00s → todos ≤ 1s caem no bucket le="1"
    expect(texto).toContain('http_request_duration_seconds_bucket{le="1",rota="/servicos"} 100');
  });

  it("expõe a saturação de CPU (gauge)", async () => {
    const registry = new Registry();
    const m = criarMetricas(registry);

    m.definirCpu(0.83);

    const texto = await m.texto();
    expect(texto).toContain("cpu_uso 0.83");
  });
});
