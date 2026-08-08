import Fastify, { type FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./lib/prisma.js";
import { normalizar } from "./lib/normalizar.js";

const schemaAutor = z.object({
  nome: z.string().trim().min(1).max(200),
  nacionalidade: z.string().trim().max(100).optional(),
});

const schemaLivro = z.object({
  titulo: z.string().trim().min(1).max(300),
  anoPublicacao: z.number().int().min(-3000).max(2026),
  isbn: z.string().trim().min(5).max(20),
  autorId: z.string().trim().min(1),
});

const schemaEmprestimo = z.object({
  livroId: z.string().trim().min(1),
  leitorId: z.string().trim().min(1),
});

export async function criarApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  app.setErrorHandler((erro, _req, reply) => {
    if (erro instanceof z.ZodError) {
      return reply.status(422).send({
        erro: "Validação falhou",
        detalhes: erro.issues.map((i) => ({
          campo: i.path.join(".") || "body",
          mensagem: i.message,
        })),
      });
    }
    app.log.error(erro);
    return reply.status(500).send({ erro: "Erro interno" });
  });

  // ---------------------------------------------------------------------------
  // Autores
  // ---------------------------------------------------------------------------
  app.get("/autores", async () => {
    const autores = await prisma.autor.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, nacionalidade: true, _count: { select: { livros: true } } },
    });
    return { total: autores.length, autores };
  });

  app.get("/autores/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const autor = await prisma.autor.findUnique({
      where: { id },
      include: { livros: { select: { id: true, titulo: true, anoPublicacao: true, isbn: true } } },
    });
    if (!autor) return reply.status(404).send({ erro: "Autor não encontrado" });
    return autor;
  });

  app.post("/autores", async (req, reply) => {
    const dados = schemaAutor.parse(req.body);
    const autor = await prisma.autor.create({
      data: { ...dados, nomeNormalizado: normalizar(dados.nome) },
    });
    return reply.status(201).send(autor);
  });

  app.put("/autores/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const dados = schemaAutor.parse(req.body);
    const existe = await prisma.autor.findUnique({ where: { id } });
    if (!existe) return reply.status(404).send({ erro: "Autor não encontrado" });
    const autor = await prisma.autor.update({
      where: { id },
      data: { ...dados, nomeNormalizado: normalizar(dados.nome) },
    });
    return autor;
  });

  app.delete("/autores/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      await prisma.autor.delete({ where: { id } });
    } catch {
      return reply
        .status(409)
        .send({ erro: "Autor possui livros — exclua ou mova os livros antes" });
    }
    return reply.status(204).send();
  });

  // ---------------------------------------------------------------------------
  // Livros + busca (contém, case/accent-insensitive via coluna normalizada)
  // ---------------------------------------------------------------------------
  app.get("/livros", async (req) => {
    const { q, disponivel, limite = 20, offset = 0 } = req.query as {
      q?: string;
      disponivel?: string;
      limite?: number;
      offset?: number;
    };

    const where = {
      ...(q ? { OR: [
        { tituloNormalizado: { contains: normalizar(q) } },
        { autor: { nomeNormalizado: { contains: normalizar(q) } } },
      ] } : {}),
      ...(disponivel === "true" ? { disponivel: true } : {}),
      ...(disponivel === "false" ? { disponivel: false } : {}),
    };

    const [livros, total] = await Promise.all([
      prisma.livro.findMany({
        where,
        include: { autor: { select: { id: true, nome: true } } },
        orderBy: { titulo: "asc" },
        skip: offset,
        take: limite,
      }),
      prisma.livro.count({ where }),
    ]);
    return { total, limite, offset, livros };
  });

  app.get("/livros/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const livro = await prisma.livro.findUnique({
      where: { id },
      include: { autor: true, emprestimos: { orderBy: { dataEmprestimo: "desc" } } },
    });
    if (!livro) return reply.status(404).send({ erro: "Livro não encontrado" });
    return livro;
  });

  app.post("/livros", async (req, reply) => {
    const dados = schemaLivro.parse(req.body);
    const autorExiste = await prisma.autor.findUnique({ where: { id: dados.autorId } });
    if (!autorExiste) return reply.status(422).send({ erro: "autorId não existe" });

    const isbnExiste = await prisma.livro.findUnique({ where: { isbn: dados.isbn } });
    if (isbnExiste) return reply.status(409).send({ erro: "ISBN já cadastrado" });

    const livro = await prisma.livro.create({
      data: { ...dados, tituloNormalizado: normalizar(dados.titulo) },
    });
    return reply.status(201).send(livro);
  });

  app.put("/livros/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const dados = schemaLivro.parse(req.body);
    const existe = await prisma.livro.findUnique({ where: { id } });
    if (!existe) return reply.status(404).send({ erro: "Livro não encontrado" });
    const livro = await prisma.livro.update({
      where: { id },
      data: { ...dados, tituloNormalizado: normalizar(dados.titulo) },
    });
    return livro;
  });

  app.delete("/livros/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      await prisma.livro.delete({ where: { id } });
    } catch {
      return reply
        .status(409)
        .send({ erro: "Livro possui empréstimos — não é possível excluir" });
    }
    return reply.status(204).send();
  });

  // ---------------------------------------------------------------------------
  // Empréstimos — transação: criar empréstimo + marcar livro indisponível
  // ---------------------------------------------------------------------------
  app.post("/emprestimos", async (req, reply) => {
    const dados = schemaEmprestimo.parse(req.body);

    const livro = await prisma.livro.findUnique({ where: { id: dados.livroId } });
    if (!livro) return reply.status(404).send({ erro: "Livro não encontrado" });
    const leitor = await prisma.leitor.findUnique({ where: { id: dados.leitorId } });
    if (!leitor) return reply.status(404).send({ erro: "Leitor não encontrado" });
    if (!livro.disponivel) {
      return reply.status(409).send({ erro: "Livro já emprestado" });
    }

    // Transação: ou os dois passos acontecem, ou nenhum.
    const emprestimo = await prisma.$transaction(async (tx) => {
      await tx.livro.update({
        where: { id: dados.livroId },
        data: { disponivel: false },
      });
      return tx.emprestimo.create({
        data: { livroId: dados.livroId, leitorId: dados.leitorId },
        include: {
          livro: { include: { autor: { select: { nome: true } } } },
          leitor: { select: { id: true, nome: true } },
        },
      });
    });
    return reply.status(201).send(emprestimo);
  });

  /** Devolução: seta dataDevolucao e devolve o livro ao acervo. */
  app.post("/emprestimos/:id/devolucao", async (req, reply) => {
    const { id } = req.params as { id: string };
    const emprestimo = await prisma.emprestimo.findUnique({ where: { id } });
    if (!emprestimo) return reply.status(404).send({ erro: "Empréstimo não encontrado" });
    if (emprestimo.dataDevolucao) {
      return reply.status(409).send({ erro: "Empréstimo já devolvido" });
    }

    const atualizado = await prisma.$transaction(async (tx) => {
      await tx.livro.update({
        where: { id: emprestimo.livroId },
        data: { disponivel: true },
      });
      return tx.emprestimo.update({
        where: { id },
        data: { dataDevolucao: new Date() },
      });
    });
    return atualizado;
  });

  /** Livros emprestados — UM `include` (sem N+1), com autor e leitor embutidos. */
  app.get("/emprestimos/ativos", async () => {
    const emprestimos = await prisma.emprestimo.findMany({
      where: { dataDevolucao: null },
      include: {
        livro: { include: { autor: { select: { id: true, nome: true } } } },
        leitor: { select: { id: true, nome: true, email: true } },
      },
      orderBy: { dataEmprestimo: "desc" },
    });
    return { total: emprestimos.length, emprestimos };
  });

  /** Atrasados: regra de data calculada NO BANCO (desafio sênior do capítulo). */
  app.get("/emprestimos/atrasados", async () => {
    const limite = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000); // 15 dias
    const emprestimos = await prisma.emprestimo.findMany({
      where: { dataDevolucao: null, dataEmprestimo: { lt: limite } },
      include: {
        livro: { select: { id: true, titulo: true } },
        leitor: { select: { id: true, nome: true, email: true } },
      },
      orderBy: { dataEmprestimo: "asc" },
    });
    return { prazoDias: 15, total: emprestimos.length, emprestimos };
  });

  return app;
}
