/**
 * Fila BullMQ (produção). O produtor publica; o worker consome.
 * A fila vive no Redis (docker-compose.yml).
 */
import { Queue } from "bullmq";
import type { Tarefa } from "./processador.ts";

export const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

export const fila = new Queue<Tarefa>("skillhub-tarefas", {
  connection: { url: REDIS_URL },
  defaultJobOptions: {
    attempts: 5,               // retries máximos
    backoff: { type: "exponential", delay: 2000 }, // 2s, 4s, 8s, 16s...
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

export async function publicar(tarefa: Tarefa): Promise<string> {
  const job = await fila.add(tarefa.tipo, tarefa, {
    // deduplicação na fila: se já existe job ativo com o mesmo jobId,
    // não duplica (mais uma camada de idempotência)
    jobId: tarefa.chaveIdempotencia,
  });
  return job.id ?? "";
}

export async function fechar(): Promise<void> {
  await fila.close();
}
