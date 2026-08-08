// Singleton do Prisma Client.
// Em desenvolvimento, o hot-reload do Next.js recria os módulos a cada
// alteração; sem o singleton, cada recarga abriria uma nova conexão até
// estourar o limite do banco. O padrão globalThis é o recomendado pela
// documentação oficial do Prisma.

import { PrismaClient } from "@prisma/client";

const globalParaPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalParaPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = prisma;
}
