import { PrismaClient } from "@prisma/client";

const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * `log: ["query"]` em dev revela o N+1: se a listagem de empréstimos emitir
 * 1 query + N queries de autor, você tem o anti-padrão. O endpoint usa
 * `include` justamente para manter UMA query.
 */
export const prisma =
  globalParaPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "test" ? [] : ["query", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalParaPrisma.prisma = prisma;
