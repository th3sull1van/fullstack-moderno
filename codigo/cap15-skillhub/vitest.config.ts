import { defineConfig } from "vitest/config";
import path from "node:path";

// Configuração do Vitest para testes de lógica pura (utils, validações).
// Os testes de componente/Server Action exigem mocks do Next/Auth.js —
// deixamos isso como desafio (capítulo 16 do livro), com a base pronta aqui.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
