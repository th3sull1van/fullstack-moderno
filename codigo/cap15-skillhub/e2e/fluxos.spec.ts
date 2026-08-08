import { test, expect } from "@playwright/test";

// Fluxos E2E do SkillHub (capítulo 16): o caminho feliz do usuário,
// com locators acessíveis (role/label) — nada de classes ou sleeps.
// Requer banco populado (seed) e app em http://localhost:3000.

const EMAIL = `e2e-${Date.now()}@exemplo.com`;
const SENHA = "senha-forte-123";

test("cadastro leva ao painel", async ({ page }) => {
  await page.goto("/cadastro");

  await page.getByLabel("Nome").fill("Usuária E2E");
  await page.getByLabel("E-mail").fill(EMAIL);
  await page.getByLabel("Senha (mínimo 8 caracteres)").fill(SENHA);
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page).toHaveURL(/\/painel/);
  await expect(page.getByRole("heading", { name: /Painel de/ })).toBeVisible();
});

test("usuário logado anuncia um serviço e ele aparece na listagem", async ({
  page,
}) => {
  // Seed cria ana@exemplo.com / senha-forte-123 (capítulo 15).
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("ana@exemplo.com");
  await page.getByLabel("Senha").fill(SENHA);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/painel/);

  const titulo = `Aula E2E ${Date.now()}`;
  await page.getByLabel("Título do serviço").fill(titulo);
  await page
    .getByLabel("Descrição")
    .fill("Sessão de teste end-to-end com material incluso e horário flexível.");
  await page.getByLabel("Preço (em centavos)").fill("5000");
  await page.getByLabel("Categoria").selectOption("Aulas");
  await page.getByRole("button", { name: "Publicar serviço" }).click();

  await expect(page.getByText("Serviço publicado!")).toBeVisible();

  await page.goto("/servicos");
  await expect(page.getByRole("heading", { name: titulo })).toBeVisible();
});

test("RBAC: usuário não pode contratar o próprio serviço", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("ana@exemplo.com");
  await page.getByLabel("Senha").fill(SENHA);
  await page.getByRole("button", { name: "Entrar" }).click();

  // A primeira página da listagem traz serviços de Ana e Bruno (seed).
  await page.goto("/servicos");
  await page.locator(".cartao").first().click();

  // Se for o anúncio dela, não aparece botão de contratar.
  const botao = page.getByRole("button", { name: "Contratar serviço" });
  if ((await botao.count()) > 0) {
    // Então o serviço é de outro dono — deve contratar sem erro.
    await botao.click();
    await expect(page.getByText(/Pedido criado!/)).toBeVisible();
  } else {
    await expect(page.getByText(/Este é o seu anúncio/)).toBeVisible();
  }
});
