import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true, // auto-cleanup do Testing Library
    setupFiles: ["./src/test-setup.ts"],
    // só testes unitários — os e2e/*.spec.ts são do Playwright
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
