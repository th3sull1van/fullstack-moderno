/**
 * Worker (produção): consome a fila e delega à lógica pura.
 * A idempotência vive no `processador` (armazenamento) — o retry do BullMQ
 * nunca duplica efeitos.
 */
import { Worker, type Job } from "bullmq";
import { REDIS_URL } from "./fila.ts";
import { processarTarefa, type Tarefa } from "./processador.ts";

const armazenamento = {
  // Em produção: tabela `tarefas_processadas(chave, resultado)` no PostgreSQL.
  async buscar(chave: string) {
    return null;
  },
  async salvar(_chave: string, _resultado: unknown) {},
};

const worker = new Worker<Tarefa>(
  "skillhub-tarefas",
  async (job) => {
    const resultado = await processarTarefa(job.data, {
      armazenamento,
      async enviarEmail(destinatario, assunto) {
        // integração real com SES/Resend/qualquer provedor
        console.log(`[email] para ${destinatario}: ${assunto}`);
      },
      async gerarRelatorio(periodo) {
        return { linhas: 42 };
      },
    });

    if (resultado.status === "erro") {
      // lançar = não confirmar = BullMQ devolve à fila com backoff
      throw new Error(resultado.detalhe);
    }
    return resultado;
  },
  { connection: { url: REDIS_URL } },
);

worker.on("completed", (job: Job<Tarefa>) =>
  console.log(`ok: ${job.data.tipo} (${job.data.chaveIdempotencia})`),
);
worker.on("failed", (job: Job<Tarefa> | undefined, err: Error) =>
  console.error(`falhou: ${job?.data.tipo} — ${err.message}`),
);

console.log("Worker aguardando tarefas... (Ctrl+C para sair)");
