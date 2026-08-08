import { describe, it, expect } from "vitest";

import {
  schemaServico,
  schemaCadastro,
  schemaLogin,
} from "./validacoes";

describe("schemaServico", () => {
  const valido = {
    titulo: "Aula de React",
    descricao: "Sessão individual de 1 hora com material incluso e exercícios.",
    precoCentavos: 9000,
    categoria: "Aulas",
  };

  it("aceita um serviço válido", () => {
    const resultado = schemaServico.safeParse(valido);
    expect(resultado.success).toBe(true);
  });

  it("rejeita título curto demais", () => {
    const resultado = schemaServico.safeParse({ ...valido, titulo: "ab" });
    expect(resultado.success).toBe(false);
  });

  it("rejeita preço não positivo", () => {
    expect(schemaServico.safeParse({ ...valido, precoCentavos: 0 }).success).toBe(false);
    expect(schemaServico.safeParse({ ...valido, precoCentavos: -10 }).success).toBe(false);
  });

  it("rejeita categoria inexistente", () => {
    const resultado = schemaServico.safeParse({ ...valido, categoria: "Inexistente" });
    expect(resultado.success).toBe(false);
  });

  it("converte preço em string para número (z.coerce)", () => {
    const resultado = schemaServico.safeParse({ ...valido, precoCentavos: "9000" });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.precoCentavos).toBe(9000);
    }
  });
});

describe("schemaCadastro", () => {
  it("aceita dados válidos", () => {
    const resultado = schemaCadastro.safeParse({
      nome: "Ana Souza",
      email: "ana@exemplo.com",
      senha: "senha-forte-123",
    });
    expect(resultado.success).toBe(true);
  });

  it("rejeita senha curta", () => {
    const resultado = schemaCadastro.safeParse({
      nome: "Ana",
      email: "ana@exemplo.com",
      senha: "1234567",
    });
    expect(resultado.success).toBe(false);
  });

  it("rejeita e-mail inválido", () => {
    const resultado = schemaCadastro.safeParse({
      nome: "Ana",
      email: "nao-e-email",
      senha: "senha-forte-123",
    });
    expect(resultado.success).toBe(false);
  });
});

describe("schemaLogin", () => {
  it("aceita e-mail e senha", () => {
    expect(
      schemaLogin.safeParse({ email: "ana@exemplo.com", senha: "x" }).success,
    ).toBe(true);
  });

  it("rejeita e-mail inválido", () => {
    expect(schemaLogin.safeParse({ email: "x", senha: "x" }).success).toBe(false);
  });

  it("rejeita senha vazia", () => {
    expect(
      schemaLogin.safeParse({ email: "ana@exemplo.com", senha: "" }).success,
    ).toBe(false);
  });
});
