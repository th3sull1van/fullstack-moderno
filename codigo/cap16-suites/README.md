# cap16-suites — Suíte de testes do SkillHub

Projeto do **capítulo 16** do livro: a suíte de testes completa do SkillHub
(capítulo 15), organizada pela **pirâmide de testes**.

## Onde está cada camada

| Camada | Ferramenta | Onde | Como rodar |
|--------|-----------|------|------------|
| Unitário (lógica) | Vitest | `../cap15-skillhub/src/lib/*.test.ts` | `npm test` (no app) |
| E2E (fluxos do usuário) | Playwright | `../cap15-skillhub/e2e/fluxos.spec.ts` | `npm run test:e2e` (no app) |
| Integração (banco) | Vitest + Prisma | desafio do capítulo | precisa PostgreSQL de teste |

Os arquivos de configuração (`vitest.config.ts`, `playwright.config.ts`) e os
scripts (`test`, `test:e2e`, `test:coverage`) vivem no projeto do SkillHub —
é lá que `npm install && npm test` funciona. Esta pasta documenta a estratégia
e traz os modelos para as camadas mais avançadas.

## Estratégia (pirâmide)

1. **Unitários** (muitos, baratos): `formatarMoeda`, `validarEmail`, schemas
   Zod, roundtrip do argon2 — 23 testes, rodam em ~0,5s, sem banco;
2. **Integração** (alguns): repositório Prisma contra banco de teste
   (PostgreSQL em Docker) + Server Actions com sessão simulada;
3. **E2E** (poucos, críticos): cadastro → painel, anunciar → listagem, RBAC
   na contratação — via Playwright com locators acessíveis (`getByRole`,
   `getByLabel`), auto-wait, sem `sleep`.

## Rodando a suíte

```bash
cd ../cap15-skillhub
npm install
npm test                       # unitários (23 testes, ~0,5s)

# E2E — precisa do PostgreSQL com seed:
npm run db:migrate && npm run db:seed
npx playwright install chromium
npm run test:e2e               # o webServer sobe o app sozinho
```

## Cobertura

```bash
npm run test:coverage          # relatório de cobertura por arquivo
```

Cobertura é **ferramenta, não meta** (capítulo 16): use-a para achar lacunas,
não para inflar número. Os caminhos de erro (401/403) valem mais que 100% de
funções triviais.

## Modelos para as camadas avançadas

### Teste de integração de Server Action (com mocks de auth e cache)

```ts
// ex.: actions/servicos.integracao.test.ts (adaptar ao setup do projeto)
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "usuario-teste" } }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("criarServico (integração com banco real)", () => {
  beforeEach(async () => {
    // TRUNCATE nas tabelas + usuário de teste via Prisma
  });

  it("cria um serviço com dados válidos", async () => {
    const formData = new FormData();
    formData.set("titulo", "Aula de teste");
    formData.set("descricao", "Descrição com mais de vinte caracteres.");
    formData.set("precoCentavos", "5000");
    formData.set("categoria", "Aulas");

    const resultado = await criarServico({}, formData);
    expect(resultado).toEqual({ sucesso: true });
  });

  it("recusa usuário não autenticado", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);
    const resultado = await criarServico({}, new FormData());
    expect(resultado.sucesso).toBe(false);
  });
});
```

### Teste de carga (K6) — orçamento de performance

```js
// k6/busca.js
import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<300"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get("http://localhost:3000/servicos?busca=aula");
  check(res, { "status 200": (r) => r.status === 200 });
}
```

## Critérios de aceite do capítulo

- [ ] `npm test` verde (unitários de lógica);
- [ ] `npm run test:e2e` verde com banco de teste (3 fluxos: cadastro, anúncio, RBAC);
- [ ] Cobertura ≥ 70% nas funções de negócio (`formatarMoeda`, `validarEmail`, schemas);
- [ ] CI executando unit + build + E2E (veja `cap18-pipeline/`);
- [ ] Teste de regressão do RBAC: não-dono recebe erro na exclusão.
