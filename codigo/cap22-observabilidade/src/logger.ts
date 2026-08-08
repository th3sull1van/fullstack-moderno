/**
 * Logs estruturados (JSON) com contexto obrigatório.
 *
 * Regra do capítulo 22: todo log carrega `requestId` e `servico` — sem isso
 * não há como correlacionar uma requisição entre serviços. Campos sensíveis
 * (token, senha, cartão) são mascarados por `redact`.
 */
import { pino, type Logger } from "pino";

export interface Contexto {
  requestId: string;
  servico: string;
  [chave: string]: unknown;
}

export function criarLogger(contexto: Contexto): Logger {
  return pino({
    level: process.env.LOG_LEVEL ?? "info",
    base: { servico: contexto.servico }, // em todo log
    redact: {
      paths: [
        "senha",
        "token",
        "authorization",
        "*.cartao",
        "*.cvv",
        "dados.*",
      ],
      censor: "[REDIGIDO]",
    },
    timestamp: pino.stdTimeFunctions.isoTime, // ISO 8601
    formatters: {
      // nível como texto, não número
      level: (label) => ({ nivel: label }),
    },
  }).child({ requestId: contexto.requestId });
}

/**
 * Captura os logs em um stream próprio (para testes): devolve o logger e uma
 * função que lê os registros já parseados.
 */
export function criarLoggerParaTeste(contexto: Contexto) {
  const registros: unknown[] = [];
  const stream = {
    write(linha: string) {
      registros.push(JSON.parse(linha));
      return true;
    },
  };
  const logger = pino(
    {
      level: "info",
      base: { servico: contexto.servico },
      redact: {
        paths: ["senha", "token", "authorization"],
        censor: "[REDIGIDO]",
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: { level: (label) => ({ nivel: label }) },
    },
    stream,
  ).child({ requestId: contexto.requestId });
  return { logger, registros };
}
