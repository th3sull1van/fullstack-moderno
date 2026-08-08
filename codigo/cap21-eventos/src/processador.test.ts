import { describe, expect, it, vi } from "vitest";
import { processarTarefa, type Armazenamento, type Tarefa } from "./processador.ts";

function armazenamentoEmMemoria() {
  const mapa = new Map<string, unknown>();
  const armazenamento: Armazenamento = {
    async buscar(chave) {
      return mapa.has(chave) ? mapa.get(chave)! : null;
    },
    async salvar(chave, resultado) {
      mapa.set(chave, resultado);
    },
  };
  return { armazenamento, mapa };
}

function tarefaEmail(over = {}): Tarefa {
  return {
    tipo: "email",
    chaveIdempotencia: "email-123",
    dados: { destinatario: "ana@exemplo.com", assunto: "Oferta" },
    ...over,
  };
}

describe("processarTarefa — idempotência", () => {
  it("processa uma vez e registra o resultado", async () => {
    const { armazenamento, mapa } = armazenamentoEmMemoria();
    const enviarEmail = vi.fn().mockResolvedValue(undefined);

    const r = await processarTarefa(tarefaEmail(), {
      armazenamento,
      enviarEmail,
      gerarRelatorio: vi.fn(),
    });

    expect(r.status).toBe("feito");
    expect(enviarEmail).toHaveBeenCalledTimes(1);
    expect(mapa.has("email-123")).toBe(true);
  });

  it("a MESMA tarefa repetida NÃO reenvia o e-mail (o pesadelo da fila)", async () => {
    const { armazenamento } = armazenamentoEmMemoria();
    const enviarEmail = vi.fn().mockResolvedValue(undefined);

    // cenário: o worker recebeu a mensagem, processou, mas o ack se perdeu
    await processarTarefa(tarefaEmail(), { armazenamento, enviarEmail, gerarRelatorio: vi.fn() });
    const repetida = await processarTarefa(tarefaEmail(), {
      armazenamento,
      enviarEmail,
      gerarRelatorio: vi.fn(),
    });

    expect(repetida.status).toBe("repetido");
    expect(enviarEmail).toHaveBeenCalledTimes(1); // não duplicou!
  });

  it("duas tarefas DIFERENTES processam as duas", async () => {
    const { armazenamento } = armazenamentoEmMemoria();
    const enviarEmail = vi.fn().mockResolvedValue(undefined);

    await processarTarefa(tarefaEmail({ chaveIdempotencia: "email-1" }), {
      armazenamento,
      enviarEmail,
      gerarRelatorio: vi.fn(),
    });
    await processarTarefa(tarefaEmail({ chaveIdempotencia: "email-2" }), {
      armazenamento,
      enviarEmail,
      gerarRelatorio: vi.fn(),
    });

    expect(enviarEmail).toHaveBeenCalledTimes(2);
  });
});

describe("processarTarefa — retry e erros", () => {
  it("falha → status erro (o BullMQ devolve à fila com backoff)", async () => {
    const { armazenamento } = armazenamentoEmMemoria();
    const enviarEmail = vi.fn().mockRejectedValue(new Error("SMTP fora do ar"));

    const r = await processarTarefa(tarefaEmail(), {
      armazenamento,
      enviarEmail,
      gerarRelatorio: vi.fn(),
    });

    expect(r.status).toBe("erro");
    expect(r.detalhe).toContain("SMTP");
  });

  it("após a falha ser resolvida, o retry processa sem duplicar", async () => {
    const { armazenamento } = armazenamentoEmMemoria();
    // 1ª tentativa falha (não registra), 2ª tenta de novo e passa
    const enviarEmail = vi
      .fn()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce(undefined);

    const falha = await processarTarefa(tarefaEmail(), {
      armazenamento,
      enviarEmail,
      gerarRelatorio: vi.fn(),
    });
    const retry = await processarTarefa(tarefaEmail(), {
      armazenamento,
      enviarEmail,
      gerarRelatorio: vi.fn(),
    });

    expect(falha.status).toBe("erro");
    expect(retry.status).toBe("feito");
    expect(enviarEmail).toHaveBeenCalledTimes(2);
  });
});

describe("processarTarefa — relatório", () => {
  it("gera relatório e registra o resultado", async () => {
    const { armazenamento } = armazenamentoEmMemoria();
    const gerarRelatorio = vi.fn().mockResolvedValue({ linhas: 120 });

    const r = await processarTarefa(
      {
        tipo: "relatorio",
        chaveIdempotencia: "rel-2026-08",
        dados: { periodo: "2026-08" },
      },
      { armazenamento, enviarEmail: vi.fn(), gerarRelatorio },
    );

    expect(r.status).toBe("feito");
    expect(gerarRelatorio).toHaveBeenCalledWith("2026-08");
  });
});
