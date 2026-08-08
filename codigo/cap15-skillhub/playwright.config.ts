import { defineConfig, devices } from "@playwright/test";

// Testes E2E do SkillHub (capítulo 16 do livro).
// Antes de rodar: npx playwright install --with-deps
// O app deve estar no ar em http://localhost:3000 (npm run dev) e o
// PostgreSQL populado (npm run db:migrate && npm run db:seed).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  // O Playwright sobe a aplicação sozinho (webServer) — nada de sleep ou
  // servidor manual. Requer PostgreSQL acessível via DATABASE_URL.
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    locale: "pt-BR",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
