/**
 * Processamento de tarefas — lógica pura, testável sem Redis.
 *
 * Os dois conceitos centrais do capítulo 21:
 * 1. **Idempotência**: processar a mesma tarefa 1 ou N vezes tem o mesmo
 *    efeito. Como o worker pode receber a mesma mensagem duas vezes (timeout
 *    de ack, reprocessamento), o resultado é guardado por `chaveIdempotencia`.
 * 2. **Retry com backoff**: falha transitória não descarta a tarefa.
 */

export type TipoTarefa = "email" | "relatorio";

export interface Tarefa {
  tipo: TipoTarefa;
  chaveIdempotencia: string;
  dados: Record<string, unknown>;
}

export interface Armazenamento {
  /** Retorna o resultado se a chave já foi processada (idempotência). */
  buscar(chave: string): Promise<unknown | null>;
  /** Registra o resultado processado. */
  salvar(chave: string, resultado: unknown): Promise<void>;
}

export interface Dependencias {
  armazenamento: Armazenamento;
  enviarEmail(destinatario: string, assunto: string): Promise<void>;
  gerarRelatorio(periodo: string): Promise<{ linhas: number }>;
}

export interface Resultado {
  status: "feito" | "repetido" | "erro";
  detalhe?: string;
}

export async function processarTarefa(
  tarefa: Tarefa,
  deps: Dependencias,
): Promise<Resultado> {
  // 1) Idempotência: já processada? Devolve o resultado anterior, sem
  //    repetir o efeito colateral (ex.: e-mail enviado duas vezes).
  const anterior = await deps.armazenamento.buscar(tarefa.chaveIdempotencia);
  if (anterior !== null) {
    return { status: "repetido", detalhe: "tarefa já processada" };
  }

  try {
    let resultado: unknown;
    if (tarefa.tipo === "email") {
      const { destinatario, assunto } = tarefa.dados as {
        destinatario: string;
        assunto: string;
      };
      await deps.enviarEmail(destinatario, assunto);
      resultado = { enviado: destinatario };
    } else {
      const { periodo } = tarefa.dados as { periodo: string };
      resultado = await deps.gerarRelatorio(periodo);
    }
    await deps.armazenamento.salvar(tarefa.chaveIdempotencia, resultado);
    return { status: "feito" };
  } catch (erro) {
    // 2) Erro: a mensagem NÃO é confirmada — o BullMQ a devolve à fila com
    //    backoff (ver worker.ts). Idempotência garante que o retry não
    //    duplique efeitos.
    return {
      status: "erro",
      detalhe: erro instanceof Error ? erro.message : "erro desconhecido",
    };
  }
}
