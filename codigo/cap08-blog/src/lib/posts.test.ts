import { describe, expect, it } from "vitest";
import { obterPost, obterTodosPosts, slugDeArquivo } from "./posts";

describe("slugDeArquivo", () => {
  it("remove a extensão .mdx", () => {
    expect(slugDeArquivo("ola-mundo.mdx")).toBe("ola-mundo");
    expect(slugDeArquivo("ola-mundo.md")).toBe("ola-mundo");
  });
});

describe("obterTodosPosts", () => {
  it("lê todos os .mdx do diretório de conteúdo", async () => {
    const posts = await obterTodosPosts();
    expect(posts.length).toBeGreaterThanOrEqual(3);
  });

  it("ordena do mais recente para o mais antigo pela data", async () => {
    const posts = await obterTodosPosts();
    const datas = posts.map((p) => p.data);
    const ordenadas = [...datas].sort().reverse();
    expect(datas).toEqual(ordenadas);
  });

  it("cada post tem frontmatter válido (titulo, data, resumo)", async () => {
    const posts = await obterTodosPosts();
    for (const post of posts) {
      expect(post.titulo.length).toBeGreaterThan(0);
      expect(post.data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(post.resumo.length).toBeGreaterThan(0);
      expect(post.conteudo.length).toBeGreaterThan(0);
    }
  });
});

describe("obterPost", () => {
  it("devolve o post com conteúdo pelo slug", async () => {
    const post = await obterPost("mdx-conteudo-com-poder-de-react");
    expect(post).not.toBeNull();
    expect(post!.titulo).toContain("MDX");
    expect(post!.conteudo).toContain("<Dica>");
  });

  it("devolve null para slug inexistente", async () => {
    expect(await obterPost("nao-existe")).toBeNull();
  });
});
