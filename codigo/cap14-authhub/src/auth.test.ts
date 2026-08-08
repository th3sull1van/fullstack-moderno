import { execFileSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { RateLimiter } from "./lib/rate-limit.js";

let dir: string;
let app: FastifyInstance;

type LoginResposta = {
  accessToken: string;
  refreshToken: string;
  usuario: { id: string; papel: string };
};

async function login(email: string, senha: string) {
  const res = await app.inject({
    method: "POST",
    url: "/login",
    payload: { email, senha },
  });
  return { status: res.statusCode, corpo: res.json() as LoginResposta };
}

beforeAll(async () => {
  // Banco SQLite novo + migrações aplicadas — DATABASE_URL precisa estar setado
  // ANTES de o PrismaClient ser instanciado (import dinâmico).
  dir = await mkdtemp(join(tmpdir(), "authhub-"));
  process.env.DATABASE_URL = `file:${join(dir, "test.db")}`;
  process.env.JWT_SECRET = "teste-secreto-com-48-bytes-pelo-menos-xxxxxxxx";
  process.env.NODE_ENV = "test";

  const cliPrisma = fileURLToPath(
    new URL("../node_modules/prisma/build/index.js", import.meta.url),
  );
  execFileSync(process.execPath, [cliPrisma, "migrate", "deploy"], {
    stdio: "pipe",
    env: process.env,
  });

  const { criarApp } = await import("./app.js");
  app = await criarApp();
});

afterAll(async () => {
  await app.close();
  const { prisma } = await import("./lib/prisma.js");
  await prisma.$disconnect();
  await rm(dir, { recursive: true, force: true });
});

describe("Cadastro", () => {
  it("cria usuário com 201 e não devolve a senha", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/cadastro",
      payload: { nome: "Ana Souza", email: "ana@authhub.dev", senha: "Senha-forte-123" },
    });
    expect(res.statusCode).toBe(201);
    const corpo = res.json() as { email: string; senhaHash?: string };
    expect(corpo.email).toBe("ana@authhub.dev");
    expect(corpo).not.toHaveProperty("senhaHash");
    expect(corpo).not.toHaveProperty("senha");
  });

  it("rejeita e-mail duplicado com 409", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/cadastro",
      payload: { nome: "Ana de Novo", email: "ana@authhub.dev", senha: "Senha-forte-123" },
    });
    expect(res.statusCode).toBe(409);
  });

  it("rejeita dados inválidos com 422 e erros por campo", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/cadastro",
      payload: { nome: "A", email: "nao-e-email", senha: "" },
    });
    expect(res.statusCode).toBe(422);
    const corpo = res.json() as { detalhes: { campo: string }[] };
    const campos = corpo.detalhes.map((d) => d.campo);
    expect(campos).toContain("nome");
    expect(campos).toContain("email");
    expect(campos).toContain("senha");
  });

  it("rejeita senha fraca (política de força) com 422", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/cadastro",
      payload: { nome: "Ana Souza", email: "forca@authhub.dev", senha: "fraca123" },
    });
    expect(res.statusCode).toBe(422);
    const corpo = res.json() as { detalhes: { campo: string; mensagem: string }[] };
    expect(corpo.detalhes[0]!.campo).toBe("senha");
    expect(corpo.detalhes[0]!.mensagem).toContain("maiúscula");
  });
});

describe("Login e access token", () => {
  it("faz login com 200 e devolve access + refresh", async () => {
    const { status, corpo } = await login("ana@authhub.dev", "Senha-forte-123");
    expect(status).toBe(200);
    expect(corpo.accessToken).toBeTruthy();
    expect(corpo.refreshToken).toBeTruthy();
  });

  it("responde 401 genérico para senha errada E e-mail inexistente", async () => {
    const senhaErrada = await login("ana@authhub.dev", "senha-errada");
    const emailInexistente = await login("ninguem@authhub.dev", "Senha-forte-123");
    expect(senhaErrada.status).toBe(401);
    expect(emailInexistente.status).toBe(401);
    expect(senhaErrada.corpo).toEqual(emailInexistente.corpo); // anti-enumeração
  });

  it("GET /me sem token → 401", async () => {
    const res = await app.inject({ method: "GET", url: "/me" });
    expect(res.statusCode).toBe(401);
  });

  it("GET /me com token → 200 e perfil", async () => {
    const { corpo } = await login("ana@authhub.dev", "Senha-forte-123");
    const res = await app.inject({
      method: "GET",
      url: "/me",
      headers: { authorization: `Bearer ${corpo.accessToken}` },
    });
    expect(res.statusCode).toBe(200);
    expect((res.json() as { email: string }).email).toBe("ana@authhub.dev");
  });

  it("GET /me com token adulterado → 401", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/me",
      headers: { authorization: "Bearer token-falsificado" },
    });
    expect(res.statusCode).toBe(401);
  });
});

describe("Refresh rotativo", () => {
  it("cada uso gera um par novo e o antigo não funciona mais", async () => {
    const { corpo } = await login("ana@authhub.dev", "Senha-forte-123");
    const primeiro = corpo.refreshToken;

    const rotacao1 = await app.inject({
      method: "POST",
      url: "/refresh",
      payload: { refreshToken: primeiro },
    });
    expect(rotacao1.statusCode).toBe(200);
    const par2 = rotacao1.json() as LoginResposta;
    expect(par2.refreshToken).not.toBe(primeiro);

    const rotacao2 = await app.inject({
      method: "POST",
      url: "/refresh",
      payload: { refreshToken: par2.refreshToken },
    });
    expect(rotacao2.statusCode).toBe(200);

    // token da PRIMEIRA rotação já foi usado → reuse → 401
    const reuse = await app.inject({
      method: "POST",
      url: "/refresh",
      payload: { refreshToken: primeiro },
    });
    expect(reuse.statusCode).toBe(401);
  });

  it("reuse revoga a família inteira (o par vigente também morre)", async () => {
    const { corpo } = await login("ana@authhub.dev", "Senha-forte-123");
    const primeiro = corpo.refreshToken;

    const rotacao = await app.inject({
      method: "POST",
      url: "/refresh",
      payload: { refreshToken: primeiro },
    });
    const vigente = (rotacao.json() as LoginResposta).refreshToken;

    // ataque: apresenta o token já usado
    await app.inject({ method: "POST", url: "/refresh", payload: { refreshToken: primeiro } });

    // o token vigente da MESMA família agora está revogado
    const depois = await app.inject({
      method: "POST",
      url: "/refresh",
      payload: { refreshToken: vigente },
    });
    expect(depois.statusCode).toBe(401);
  });
});

describe("Logout", () => {
  it("revoga o refresh token: /refresh depois do logout → 401", async () => {
    const { corpo } = await login("ana@authhub.dev", "Senha-forte-123");
    const out = await app.inject({
      method: "POST",
      url: "/logout",
      payload: { refreshToken: corpo.refreshToken },
    });
    expect(out.statusCode).toBe(204);

    const depois = await app.inject({
      method: "POST",
      url: "/refresh",
      payload: { refreshToken: corpo.refreshToken },
    });
    expect(depois.statusCode).toBe(401);
  });
});

describe("RBAC", () => {
  beforeAll(async () => {
    // cria usuário admin direto no banco
    const { PrismaClient } = await import("@prisma/client");
    const { hashSenha } = await import("./lib/senhas.js");
    const prisma = new PrismaClient();
    await prisma.usuario.upsert({
      where: { email: "admin@authhub.dev" },
      update: {},
      create: {
        nome: "Admin",
        email: "admin@authhub.dev",
        senhaHash: await hashSenha("Admin-forte-123"),
        papel: "ADMIN",
      },
    });
    await prisma.$disconnect();
  });

  it("usuário comum → 403 na rota de admin", async () => {
    const { corpo } = await login("ana@authhub.dev", "Senha-forte-123");
    const res = await app.inject({
      method: "GET",
      url: "/admin",
      headers: { authorization: `Bearer ${corpo.accessToken}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it("admin → 200 na rota de admin e na de listagem de usuários", async () => {
    const { corpo } = await login("admin@authhub.dev", "Admin-forte-123");
    const rota = await app.inject({
      method: "GET",
      url: "/admin",
      headers: { authorization: `Bearer ${corpo.accessToken}` },
    });
    expect(rota.statusCode).toBe(200);

    const lista = await app.inject({
      method: "GET",
      url: "/admin/usuarios",
      headers: { authorization: `Bearer ${corpo.accessToken}` },
    });
    expect(lista.statusCode).toBe(200);
    expect((lista.json() as { total: number }).total).toBeGreaterThanOrEqual(2);
  });
});

describe("Ataques (força bruta e headers)", () => {
  it("rate limit: 6ª tentativa em 1 minuto → 429", async () => {
    const app2 = await (await import("./app.js")).criarApp({
      limiter: new RateLimiter(5, 60_000),
    });
    const tentar = () =>
      app2.inject({
        method: "POST",
        url: "/login",
        payload: { email: "alvo@authhub.dev", senha: "senha-errada" },
      });

    for (let i = 0; i < 5; i++) {
      expect((await tentar()).statusCode).toBe(401);
    }
    const sexta = await tentar();
    expect(sexta.statusCode).toBe(429);
    expect(sexta.headers["retry-after"]).toBeTruthy();
    await app2.close();
  });

  it("responde com headers de segurança (helmet)", async () => {
    const res = await app.inject({ method: "GET", url: "/me" });
    expect(res.headers["content-security-policy"]).toBeTruthy();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });
});
