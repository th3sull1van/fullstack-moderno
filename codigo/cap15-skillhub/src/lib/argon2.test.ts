import { describe, it, expect } from "vitest";
import { hash, verify } from "@node-rs/argon2";

// Roundtrip do hash: senha correta passa, senha errada falha.
// Não toca o banco — só a primitiva criptográfica usada no cadastro/login.
describe("argon2 (hash de senha)", () => {
  it("verifica a senha correta", async () => {
    const senhaHash = await hash("senha-forte-123");
    expect(await verify(senhaHash, "senha-forte-123")).toBe(true);
  });

  it("rejeita a senha errada", async () => {
    const senhaHash = await hash("senha-forte-123");
    expect(await verify(senhaHash, "senha-errada")).toBe(false);
  });

  it("gera hashes diferentes para o mesmo texto (salt aleatório)", async () => {
    const a = await hash("mesma-senha");
    const b = await hash("mesma-senha");
    expect(a).not.toBe(b);
  });
});
