import { describe, expect, it } from "vitest";
import { campo, validar } from "./valida.js";

describe("Campo.obrigatorio", () => {
  it("reprova string vazia e espaços em branco", () => {
    expect(campo("nome").obrigatorio().validar("")).toBe(
      'O campo "nome" é obrigatório',
    );
    expect(campo("nome").obrigatorio().validar("   ")).not.toBeNull();
  });

  it("aceita valor preenchido", () => {
    expect(campo("nome").obrigatorio().validar("Ana")).toBeNull();
  });
});

describe("Campo.minimo e maximo", () => {
  it("respeita o mínimo de caracteres", () => {
    const c = campo("nome").minimo(3);
    expect(c.validar("ab")).toBe("Mínimo de 3 caracteres");
    expect(c.validar("abc")).toBeNull();
  });

  it("respeita o máximo de caracteres", () => {
    const c = campo("bio").maximo(5);
    expect(c.validar("123456")).toBe("Máximo de 5 caracteres");
    expect(c.validar("12345")).toBeNull();
  });
});

describe("Campo.email", () => {
  it("aceita e-mails válidos", () => {
    const c = campo("email").email();
    expect(c.validar("ana@exemplo.com")).toBeNull();
    expect(c.validar("joao.silva+tag@dominio.org.br")).toBeNull();
  });

  it("reprova e-mails inválidos", () => {
    const c = campo("email").email();
    expect(c.validar("ana@")).toBe("E-mail inválido");
    expect(c.validar("sem-arroba.com")).toBe("E-mail inválido");
    expect(c.validar("dois@@arroba.com")).toBe("E-mail inválido");
  });
});

describe("Campo.regex (genérico)", () => {
  it("valida um CEP brasileiro com mensagem personalizada", () => {
    const c = campo("cep").regex(/^\d{5}-?\d{3}$/, "CEP inválido (formato 00000-000)");
    expect(c.validar("01310-100")).toBeNull();
    expect(c.validar("abc")).toBe("CEP inválido (formato 00000-000)");
  });
});

describe("validar (formulário completo)", () => {
  it("retorna valido=true quando tudo passa", () => {
    const resultado = validar(
      {
        nome: campo("nome").obrigatorio().minimo(3).maximo(80),
        email: campo("email").obrigatorio().email(),
      },
      { nome: "Ana Souza", email: "ana@exemplo.com" },
    );
    expect(resultado.valido).toBe(true);
    expect(resultado.erros).toEqual({});
  });

  it("retorna erros tipados por campo", () => {
    const resultado = validar(
      {
        nome: campo("nome").obrigatorio().minimo(3),
        email: campo("email").obrigatorio().email(),
      },
      { nome: "An", email: "invalido" },
    );
    expect(resultado.valido).toBe(false);
    expect(resultado.erros.nome).toBe("Mínimo de 3 caracteres");
    expect(resultado.erros.email).toBe("E-mail inválido");
  });

  it("trata campos ausentes como vazios (obrigatório reprova)", () => {
    // O cast documenta o contrato: valores precisam cobrir o schema; em runtime,
    // campos faltando viram string vazia e reprovam em obrigatorio().
    const resultado = validar(
      { nome: campo("nome").obrigatorio() },
      {} as { nome: string },
    );
    expect(resultado.valido).toBe(false);
    expect(resultado.erros.nome).toBe('O campo "nome" é obrigatório');
  });

  it("interrompe no primeiro erro de cada campo (ordem das regras)", () => {
    const c = campo("usuario").obrigatorio().minimo(3).email();
    // vazio: reprova no obrigatorio antes de chegar no email
    expect(c.validar("")).toBe('O campo "usuario" é obrigatório');
    // preenchido mas inválido: passa obrigatorio/minimo, reprova no email
    expect(c.validar("ab")).toBe("Mínimo de 3 caracteres");
  });
});

describe("integração: formulário de contato do portfólio (cap. 1)", () => {
  it("valida o formulário completo com CEP e mensagem opcional", () => {
    const schema = {
      nome: campo("nome").obrigatorio().minimo(3).maximo(80),
      email: campo("email").obrigatorio().email(),
      cep: campo("cep").regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
    };
    expect(
      validar(schema, { nome: "Carlos", email: "carlos@dev.com", cep: "01310100" })
        .valido,
    ).toBe(true);
    expect(
      validar(schema, { nome: "Carlos", email: "carlos@dev.com", cep: "x" }).erros
        .cep,
    ).toBe("CEP inválido");
  });
});
