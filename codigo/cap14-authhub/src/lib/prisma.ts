import { PrismaClient } from "@prisma/client";

// Singleton: evita múltiplas conexões em dev (hot reload) e em testes.
const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalParaPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "test" ? [] : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalParaPrisma.prisma = prisma;
