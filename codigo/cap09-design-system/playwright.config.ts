import { defineConfig, devices } from "@playwright/test";

/**
 * Testes visuais do OrçaUI: screenshots da página /design-system em
 * claro e escuro. Rode uma vez com `npx playwright install chromium`
 * e depois `npm run test:e2e`.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://localhost:3100/design-system",
    reuseExistingServer: true,
  },
});
