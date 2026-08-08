import { describe, it, expect } from "vitest";

import { formatarMoeda, validarEmail } from "./utils";

// O Intl usa espaço não separável (U+00A0) entre "R$" e o valor — tipografia
// correta em pt-BR. Normalizamos para espaço comum nas comparações.
function normalizar(valor: string): string {
  return valor.replace(/\u00a0/g, " ");
}

describe("formatarMoeda", () => {
  it("formata centavos como reais", () => {
    expect(normalizar(formatarMoeda(9000))).toBe("R$ 90,00");
  });

  it("lida com centavos", () => {
    expect(normalizar(formatarMoeda(12345))).toBe("R$ 123,45");
  });

  it("formata valor pequeno com zeros", () => {
    expect(normalizar(formatarMoeda(5))).toBe("R$ 0,05");
  });

  it("formata valores grandes com separador de milhar", () => {
    expect(normalizar(formatarMoeda(123456789))).toBe("R$ 1.234.567,89");
  });
});

describe("validarEmail", () => {
  it("aceita e-mails válidos", () => {
    expect(validarEmail("ana@exemplo.com")).toBe(true);
    expect(validarEmail("nome.sobrenome@dominio.com.br")).toBe(true);
  });

  it("rejeita e-mails sem arroba", () => {
    expect(validarEmail("anaexemplo.com")).toBe(false);
  });

  it("rejeita e-mails sem domínio", () => {
    expect(validarEmail("ana@exemplo")).toBe(false);
  });

  it("rejeita e-mails com espaços", () => {
    expect(validarEmail("ana @exemplo.com")).toBe(false);
  });

  it("rejeita strings vazias", () => {
    expect(validarEmail("")).toBe(false);
  });
});
