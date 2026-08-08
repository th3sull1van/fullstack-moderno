import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { criarServidor } from "./servidor.js";
import { Repositorio } from "./repositorio.js";

let dir: string;
let repositorio: Repositorio;
let base: string;
let servidor: ReturnType<typeof criarServidor>;

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "encurtador-"));
  repositorio = new Repositorio(join(dir, "urls.json"));
  await repositorio.carregar();
  servidor = criarServidor(repositorio, "http://localhost");
  await new Promise<void>((resolve) => servidor.listen(0, resolve));
  const { port } = servidor.address() as AddressInfo;
  base = `http://localhost:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    servidor.close((e) => (e ? reject(e) : resolve())),
  );
  await rm(dir, { recursive: true, force: true });
});

describe("POST /encurtar", () => {
  it("cria código curto e devolve 201", async () => {
    const resposta = await fetch(`${base}/encurtar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://developer.mozilla.org/pt-BR/" }),
    });
    expect(resposta.status).toBe(201);
    const corpo = (await resposta.json()) as {
      codigo: string;
      urlCurta: string;
      urlOriginal: string;
    };
    expect(corpo.codigo).toMatch(/^[a-zA-Z0-9]+$/);
    expect(corpo.urlOriginal).toBe("https://developer.mozilla.org/pt-BR/");
  });

  it("rejeita URL inválida com 400", async () => {
    for (const url of ["", "nao-e-url", "javascript:alert(1)", "ftp://x.com"]) {
      const resposta = await fetch(`${base}/encurtar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      expect(resposta.status).toBe(400);
    }
  });

  it("rejeita corpo não-JSON com 400", async () => {
    const resposta = await fetch(`${base}/encurtar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "isto não é json",
    });
    expect(resposta.status).toBe(400);
  });
});

describe("GET /:codigo", () => {
  it("redireciona com 302 para a URL original", async () => {
    const criada = (await (
      await fetch(`${base}/encurtar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://nextjs.org/docs" }),
      })
    ).json()) as { codigo: string };

    const resposta = await fetch(`${base}/${criada.codigo}`, {
      redirect: "manual",
    });
    expect(resposta.status).toBe(302);
    expect(resposta.headers.get("location")).toBe("https://nextjs.org/docs");
  });

  it("devolve 404 para código inexistente", async () => {
    const resposta = await fetch(`${base}/zzzz999`, { redirect: "manual" });
    expect(resposta.status).toBe(404);
  });
});

describe("GET /estatisticas/:codigo", () => {
  it("conta acessos após redirecionamentos", async () => {
    const criada = (await (
      await fetch(`${base}/encurtar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://react.dev" }),
      })
    ).json()) as { codigo: string };

    await fetch(`${base}/${criada.codigo}`, { redirect: "manual" });
    await fetch(`${base}/${criada.codigo}`, { redirect: "manual" });

    const stats = (await (
      await fetch(`${base}/estatisticas/${criada.codigo}`)
    ).json()) as { acessos: number; url: string };
    expect(stats.acessos).toBe(2);
    // URL normalizada (URL.toString adiciona a barra final)
    expect(stats.url).toBe("https://react.dev/");
  });
});
