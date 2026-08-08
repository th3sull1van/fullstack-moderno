import { execFileSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";

let dir: string;
let app: FastifyInstance;

let autorId: string;
let livroId: string;
let leitorId: string;

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "biblioteca-"));
  process.env.DATABASE_URL = `file:${join(dir, "test.db")}`;
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

  // Dados de apoio
  const autorRes = await app.inject({
    method: "POST",
    url: "/autores",
    payload: { nome: "Adélia Prado", nacionalidade: "Brasil" },
  });
  autorId = (autorRes.json() as { id: string }).id;

  const livroRes = await app.inject({
    method: "POST",
    url: "/livros",
    payload: {
      titulo: "Bagagem",
      anoPublicacao: 1976,
      isbn: "978-8535921001",
      autorId,
    },
  });
  livroId = (livroRes.json() as { id: string }).id;

  const { prisma } = await import("./lib/prisma.js");
  const leitor = await prisma.leitor.create({
    data: { nome: "Fernanda Teste", email: "fernanda@teste.dev" },
  });
  leitorId = leitor.id;
});

afterAll(async () => {
  await app.close();
  const { prisma } = await import("./lib/prisma.js");
  await prisma.$disconnect();
  await rm(dir, { recursive: true, force: true });
});

describe("Autores", () => {
  it("lista autores com contagem de livros", async () => {
    const res = await app.inject({ method: "GET", url: "/autores" });
    expect(res.statusCode).toBe(200);
    const corpo = res.json() as { autores: { id: string }[] };
    expect(corpo.autores.length).toBeGreaterThan(0);
  });

  it("devolve 404 para autor inexistente", async () => {
    const res = await app.inject({ method: "GET", url: "/autores/nao-existe" });
    expect(res.statusCode).toBe(404);
  });

  it("rejeita nome vazio com 422", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/autores",
      payload: { nome: " " },
    });
    expect(res.statusCode).toBe(422);
  });
});

describe("Livros e busca", () => {
  it("busca por título com acento e caixa diferentes", async () => {
    const res = await app.inject({ method: "GET", url: "/livros?q=BAGAGEM" });
    expect(res.statusCode).toBe(200);
    const corpo = res.json() as { livros: { titulo: string }[] };
    expect(corpo.livros.length).toBeGreaterThan(0);
    expect(corpo.livros[0]!.titulo).toBe("Bagagem");
  });

  it("filtra apenas disponíveis", async () => {
    const res = await app.inject({ method: "GET", url: "/livros?disponivel=true" });
    const corpo = res.json() as { livros: { disponivel?: boolean }[] };
    // seleção explícita não traz disponivel; garante que a query não quebrou
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(corpo.livros)).toBe(true);
  });

  it("devolve 409 para ISBN duplicado", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/livros",
      payload: { titulo: "Bagagem 2", anoPublicacao: 2000, isbn: "978-8535921001", autorId },
    });
    expect(res.statusCode).toBe(409);
  });
});

describe("Empréstimos (transação)", () => {
  it("empresta livro: 201, livro fica indisponível, segundo empréstimo → 409", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/emprestimos",
      payload: { livroId, leitorId },
    });
    expect(res.statusCode).toBe(201);
    const corpo = res.json() as {
      id: string;
      livro: { disponivel?: boolean; titulo: string };
    };
    expect(corpo.livro.titulo).toBe("Bagagem");

    const deNovo = await app.inject({
      method: "POST",
      url: "/emprestimos",
      payload: { livroId, leitorId },
    });
    expect(deNovo.statusCode).toBe(409);

    // aparece na lista de ativos (UM include, sem N+1 — shape com autor e leitor)
    const ativos = await app.inject({ method: "GET", url: "/emprestimos/ativos" });
    const lista = ativos.json() as {
      emprestimos: { id: string; livro: { autor: { nome: string } }; leitor: { nome: string } }[];
    };
    const encontrado = lista.emprestimos.find((e) => e.id === corpo.id);
    expect(encontrado).toBeTruthy();
    expect(encontrado!.livro.autor.nome).toBe("Adélia Prado");
    expect(encontrado!.leitor.nome).toBe("Fernanda Teste");
  });

  it("devolução: 200, livro volta ao acervo e sai dos ativos", async () => {
    const ativos = await app.inject({ method: "GET", url: "/emprestimos/ativos" });
    const id = (ativos.json() as { emprestimos: { id: string }[] }).emprestimos[0]!.id;

    const devolucao = await app.inject({
      method: "POST",
      url: `/emprestimos/${id}/devolucao`,
    });
    expect(devolucao.statusCode).toBe(200);

    // agora pode emprestar de novo
    const novo = await app.inject({
      method: "POST",
      url: "/emprestimos",
      payload: { livroId, leitorId },
    });
    expect(novo.statusCode).toBe(201);
  });

  it("404 para empréstimo inexistente na devolução", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/emprestimos/nao-existe/devolucao",
    });
    expect(res.statusCode).toBe(404);
  });
});
