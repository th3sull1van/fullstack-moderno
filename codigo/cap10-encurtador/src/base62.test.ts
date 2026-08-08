import { describe, expect, it } from "vitest";
import { codificar, decodificar } from "./base62.js";

describe("base62", () => {
  it("codifica IDs pequenos no padrão esperado pelo livro", () => {
    expect(codificar(0)).toBe("a");
    expect(codificar(1)).toBe("b");
    expect(codificar(61)).toBe("9");
    expect(codificar(62)).toBe("ba");
    expect(codificar(62 ** 2)).toBe("baa");
  });

  it("decodifica e faz roundtrip", () => {
    for (const id of [0, 1, 61, 62, 3844, 123456, 2 ** 31]) {
      expect(decodificar(codificar(id))).toBe(id);
    }
  });

  it("6 caracteres comportam mais de 56 bilhões de URLs", () => {
    // 62^6 = 56.800.235.584 → cabe em um safe integer
    expect(62 ** 6).toBeGreaterThan(56_000_000_000);
    const codigo = codificar(62 ** 6 - 1);
    expect(codigo.length).toBe(6);
    expect(decodificar(codigo)).toBe(62 ** 6 - 1);
  });

  it("rejeita entrada inválida", () => {
    expect(() => decodificar("a!b")).toThrow(RangeError);
    expect(() => codificar(-1)).toThrow(RangeError);
    expect(() => codificar(1.5)).toThrow(RangeError);
  });
});
