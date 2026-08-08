import { describe, expect, it } from "vitest";
import { criarLoggerParaTeste } from "./logger.ts";

describe("logger estruturado", () => {
  it("emite JSON com nível, timestamp ISO e requestId", () => {
    const { logger, registros } = criarLoggerParaTeste({
      requestId: "req-abc",
      servico: "skillhub",
    });

    logger.info({ pedidoId: 42 }, "pagamento recebido");

    expect(registros).toHaveLength(1);
    const r = registros[0] as Record<string, unknown>;
    expect(r.nivel).toBe("info");
    expect(r.msg).toBe("pagamento recebido");
    expect(r.requestId).toBe("req-abc");
    expect(r.servico).toBe("skillhub");
    expect(r.pedidoId).toBe(42);
    // timestamp ISO 8601 (contém T e Z ou offset)
    expect(String(r.time)).toMatch(/T|Z|:/);
  });

  it("correlaciona: mesmo requestId em logs diferentes", () => {
    const { logger, registros } = criarLoggerParaTeste({
      requestId: "req-1",
      servico: "skillhub",
    });

    logger.info("início");
    logger.error({ motivo: "timeout" }, "falhou");

    expect(registros.every((r) => (r as { requestId: string }).requestId === "req-1")).toBe(true);
  });

  it("REDIGE campos sensíveis (token, senha, authorization)", () => {
    const { logger, registros } = criarLoggerParaTeste({
      requestId: "req-2",
      servico: "skillhub",
    });

    logger.info({ email: "ana@exemplo.com", senha: "segredo123" }, "login");
    logger.info({ authorization: "Bearer abc.def" }, "header");

    const log = registros[0] as Record<string, unknown>;
    expect(log.senha).toBe("[REDIGIDO]");
    expect(log.email).toBe("ana@exemplo.com");
    const header = registros[1] as Record<string, unknown>;
    expect(header.authorization).toBe("[REDIGIDO]");
  });
});
