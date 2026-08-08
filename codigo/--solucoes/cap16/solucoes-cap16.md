# Soluções — Capítulo 16: Testes

## Exercício 1 — Pirâmide de testes

```
      /  E2E  \      poucos, lentos, caros — fluxos críticos
     / Integração \   médios — contratos, banco, API
    /   Unitários   \  muitos, rápidos, baratos — lógica isolada
```
Ela existe para maximizar **confiança por custo**: a base larga (unitários)
pega a maioria dos bugs rápido; o topo (E2E) garante que o todo funciona,
mas em quantidade pequena porque é lento e frágil.

## Exercício 2 — Testes unitários

```ts
// validar-email.ts
export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function formatarMoeda(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
```

```ts
// validar-email.test.ts
import { describe, expect, it } from "vitest";
import { formatarMoeda, validarEmail } from "./validar-email";

describe("validarEmail", () => {
  it("aceita e-mail simples", () => expect(validarEmail("ana@exemplo.com")).toBe(true));
  it("rejeita sem @", () => expect(validarEmail("anaexemplo.com")).toBe(false));
  it("rejeita sem domínio", () => expect(validarEmail("ana@")).toBe(false));
  it("rejeita vazio", () => expect(validarEmail("")).toBe(false));
});

describe("formatarMoeda", () => {
  // toLocaleString usa espaço não separável (U+00A0) — assert robusto:
  it("formata centavos em reais", () => {
    expect(formatarMoeda(1990)).toContain("19,90");
    expect(formatarMoeda(1990)).toContain("R$");
  });
});
```

## Exercício 3 — `toBe` vs `toEqual`

- **`toBe`** compara **referência** (primitivos por valor) — `expect(1 + 1).toBe(2)`;
- **`toEqual`** compara **estrutura** (recursivamente) — objetos e arrays:
  `expect({ a: 1 }).toEqual({ a: 1 })` passa, mesmo sendo instâncias diferentes.

## Exercício 4 — Teste de componente (botão com loading)

```tsx
// Botao.tsx
export function Botao({ pendente }: { pendente: boolean }) {
  return (
    <button type="submit" disabled={pendente}>
      {pendente ? "Carregando..." : "Salvar"}
    </button>
  );
}
```

```tsx
// Botao.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Botao } from "./Botao";

describe("Botao", () => {
  it("mostra Carregando... e desabilita enquanto pendente", () => {
    render(<Botao pendente />);
    const botao = screen.getByRole("button", { name: /carregando/i });
    expect(botao).toBeDisabled();
  });

  it("mostra Salvar quando não pendente", () => {
    render(<Botao pendente={false} />);
    expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
  });
});
```

## Exercício 5 — Locators por `role` vs `class`

`getByRole("button", { name: "Salvar" })` busca pelo **papel acessível** e
pelo **nome anunciado** — o que o usuário de leitor de tela realmente
encontra. `class` é detalhe de implementação: muda o estilo e o teste quebra
sem nada funcional ter mudado. Testes por `role` são **mais estáveis** e
**mais fiéis à experiência do usuário**.
