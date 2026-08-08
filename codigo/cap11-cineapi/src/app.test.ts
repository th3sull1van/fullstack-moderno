import { describe, expect, it } from "vitest";
import { criarApp } from "./app.js";

const app = await criarApp({ semear: true });

describe("GET /filmes — listagem, filtros e paginação", () => {
  it("lista com 200 e total no header X-Total-Count", async () => {
    const res = await app.inject({ method: "GET", url: "/filmes?limite=5" });
    expect(res.statusCode).toBe(200);
    const corpo = res.json() as { id: string; titulo: string }[];
    expect(corpo).toHaveLength(5);
    expect(res.headers["x-total-count"]).toBe("20");
    expect(corpo[0]).toHaveProperty("id");
    expect(corpo[0]).toHaveProperty("titulo");
  });

  it("filtra por gênero", async () => {
    const res = await app.inject({ method: "GET", url: "/filmes?genero=animacao" });
    const corpo = res.json() as { genero: string }[];
    expect(res.statusCode).toBe(200);
    expect(corpo.length).toBeGreaterThan(0);
    expect(corpo.every((f) => f.genero === "animacao")).toBe(true);
  });

  it("filtra por ano", async () => {
    const res = await app.inject({ method: "GET", url: "/filmes?ano=1994" });
    const corpo = res.json() as { ano: number }[];
    expect(corpo.length).toBeGreaterThan(0);
    expect(corpo.every((f) => f.ano === 1994)).toBe(true);
  });

  it("busca por ?q= ignorando acentos e caixa", async () => {
    const res = await app.inject({ method: "GET", url: "/filmes?q=ANEIS" });
    const corpo = res.json() as { titulo: string }[];
    expect(res.statusCode).toBe(200);
    expect(corpo.length).toBeGreaterThan(0);
    expect(corpo.every((f) => f.titulo.includes("Anéis"))).toBe(true);
  });

  it("pagina com limite/offset e total correto", async () => {
    const pagina1 = await app.inject({ method: "GET", url: "/filmes?limite=3&offset=0" });
    const pagina2 = await app.inject({ method: "GET", url: "/filmes?limite=3&offset=3" });
    const p1 = pagina1.json() as { id: string }[];
    const p2 = pagina2.json() as { id: string }[];
    expect(p1).toHaveLength(3);
    expect(p2).toHaveLength(3);
    expect(p1[0]!.id).not.toBe(p2[0]!.id);
    expect(pagina2.headers["x-total-count"]).toBe("20");
  });
});

describe("CRUD completo", () => {
  let id: string;

  it("POST cria com 201", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/filmes",
      payload: {
        titulo: "Parasita",
        genero: "drama",
        ano: 2019,
        diretor: "Bong Joon-ho",
        duracaoMin: 132,
      },
    });
    expect(res.statusCode).toBe(201);
    const corpo = res.json() as { id: string; titulo: string };
    expect(corpo.titulo).toBe("Parasita");
    id = corpo.id;
  });

  it("POST duplicado devolve 409", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/filmes",
      payload: {
        titulo: "parasita",
        genero: "drama",
        ano: 2019,
        diretor: "Bong Joon-ho",
        duracaoMin: 132,
      },
    });
    expect(res.statusCode).toBe(409);
  });

  it("POST inválido devolve 422 com erros por campo", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/filmes",
      payload: {
        titulo: "",
        genero: "existencial",
        ano: 1800,
        diretor: "X",
        duracaoMin: 0,
      },
    });
    expect(res.statusCode).toBe(422);
    const corpo = res.json() as { erro: string; detalhes: { campo: string }[] };
    expect(corpo.erro).toBe("Validação falhou");
    expect(corpo.detalhes.length).toBeGreaterThanOrEqual(3);
    expect(corpo.detalhes.some((d) => d.campo === "ano")).toBe(true);
  });

  it("GET /filmes/:id devolve 200 e 404", async () => {
    const ok = await app.inject({ method: "GET", url: `/filmes/${id}` });
    expect(ok.statusCode).toBe(200);
    expect((ok.json() as { titulo: string }).titulo).toBe("Parasita");

    const naoEncontrado = await app.inject({ method: "GET", url: "/filmes/id-inexistente" });
    expect(naoEncontrado.statusCode).toBe(404);
  });

  it("PUT substitui por inteiro (idempotente)", async () => {
    const res = await app.inject({
      method: "PUT",
      url: `/filmes/${id}`,
      payload: {
        titulo: "Parasita (Remasterizado)",
        genero: "drama",
        ano: 2019,
        diretor: "Bong Joon-ho",
        duracaoMin: 132,
      },
    });
    expect(res.statusCode).toBe(200);
    expect((res.json() as { titulo: string }).titulo).toBe("Parasita (Remasterizado)");

    // repetir é seguro (idempotência)
    const repetido = await app.inject({
      method: "PUT",
      url: `/filmes/${id}`,
      payload: {
        titulo: "Parasita (Remasterizado)",
        genero: "drama",
        ano: 2019,
        diretor: "Bong Joon-ho",
        duracaoMin: 132,
      },
    });
    expect(repetido.statusCode).toBe(200);

    const sumiu = await app.inject({
      method: "PUT",
      url: "/filmes/id-inexistente",
      payload: {
        titulo: "X",
        genero: "drama",
        ano: 2019,
        diretor: "Y",
        duracaoMin: 90,
      },
    });
    expect(sumiu.statusCode).toBe(404);
  });

  it("PATCH atualiza parcialmente", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: `/filmes/${id}`,
      payload: { duracaoMin: 140 },
    });
    expect(res.statusCode).toBe(200);
    expect((res.json() as { duracaoMin: number }).duracaoMin).toBe(140);
  });

  it("DELETE devolve 204 e depois 404", async () => {
    const ok = await app.inject({ method: "DELETE", url: `/filmes/${id}` });
    expect(ok.statusCode).toBe(204);

    const sumiu = await app.inject({ method: "DELETE", url: `/filmes/${id}` });
    expect(sumiu.statusCode).toBe(404);
  });
});

describe("GET /docs — documentação OpenAPI", () => {
  it("serve o Swagger UI", async () => {
    const res = await app.inject({ method: "GET", url: "/docs" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain("swagger");
  });

  it("expõe o JSON da especificação", async () => {
    const res = await app.inject({ method: "GET", url: "/docs/json" });
    expect(res.statusCode).toBe(200);
    const spec = res.json() as { info: { title: string }; paths: Record<string, unknown> };
    expect(spec.info.title).toBe("CineAPI");
    expect(Object.keys(spec.paths)).toContain("/filmes");
  });
});
