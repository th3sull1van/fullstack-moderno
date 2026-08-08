import { test, expect } from "@playwright/test";

test("página de documentação em tema claro", async ({ page }) => {
  await page.goto("/design-system");
  await expect(
    page.getByRole("heading", { name: /orça/ }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/design-system-claro.png", fullPage: true });
});

test("página de documentação em tema escuro", async ({ page }) => {
  await page.goto("/design-system");
  await page.evaluate(() => {
    localStorage.setItem("orcaui:tema", "escuro");
    document.documentElement.classList.add("dark");
  });
  await page.reload();
  await page.getByRole("button", { name: /Claro/ }).waitFor();
  await page.screenshot({ path: "test-results/design-system-escuro.png", fullPage: true });
});

test("modal abre e fecha (interação real)", async ({ page }) => {
  await page.goto("/design-system");
  await page.getByRole("button", { name: "Abrir modal" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
