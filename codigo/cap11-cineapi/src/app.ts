import Fastify, { type FastifyError, type FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import {
  ANO_MAXIMO,
  ANO_MINIMO,
  eGenero,
  GENEROS,
  type Filme,
  type NovoFilme,
} from "./filmes.js";
import { RepositorioFilmes } from "./repositorio.js";
import { FILMES_INICIAIS } from "./seed.js";

/** JSON Schema do corpo de filme — usado pelo Fastify (validação) e pelo Swagger (docs). */
const schemaNovoFilme = {
  type: "object",
  required: ["titulo", "genero", "ano", "diretor", "duracaoMin"],
  additionalProperties: false,
  properties: {
    titulo: { type: "string", minLength: 1, maxLength: 200, description: "Título (obrigatório)" },
    genero: { type: "string", enum: [...GENEROS], description: "Gênero em lista fechada" },
    ano: { type: "integer", minimum: ANO_MINIMO, maximum: ANO_MAXIMO, description: `Ano entre ${ANO_MINIMO} e ${ANO_MAXIMO}` },
    diretor: { type: "string", minLength: 1, maxLength: 200 },
    duracaoMin: { type: "integer", minimum: 1, maximum: 600 },
  },
} as const;

const schemaFilme = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    titulo: { type: "string" },
    genero: { type: "string" },
    ano: { type: "integer" },
    diretor: { type: "string" },
    duracaoMin: { type: "integer" },
  },
} as const;

export async function criarApp(
  opcoes: { semear?: boolean } = {},
): Promise<FastifyInstance> {
  // allErrors: true faz o Ajv reportar TODOS os campos inválidos de uma vez
  const app = Fastify({
    logger: false,
    ajv: { customOptions: { allErrors: true } },
  });
  const repositorio = new RepositorioFilmes();
  if (opcoes.semear !== false) repositorio.semear(FILMES_INICIAIS);

  // `await` é obrigatório: o swagger captura as rotas via onRoute, então o
  // plugin precisa carregar ANTES de as rotas serem registradas.
  await app.register(swagger, {
    openapi: {
      info: {
        title: "CineAPI",
        description:
          "Catálogo de filmes REST — projeto do capítulo 11 (HTTP, REST e APIs). Filtros, busca com normalização de acentos, paginação e CRUD completo.",
        version: "1.0.0",
      },
      tags: [{ name: "filmes", description: "Operações do catálogo" }],
    },
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  /** Converte erros de validação do Fastify em 422 com erros por campo (RFC-ish). */
  app.setErrorHandler((erro: FastifyError, _req, reply) => {
    if (erro.validation) {
      const erros = erro.validation.map((v) => ({
        campo: v.instancePath.replace(/^\//, "") || "body",
        mensagem: v.message ?? "valor inválido",
      }));
      return reply.status(422).send({ erro: "Validação falhou", detalhes: erros });
    }
    app.log.error(erro);
    return reply.status(500).send({ erro: "Erro interno" });
  });

  app.get(
    "/filmes",
    {
      schema: {
        tags: ["filmes"],
        summary: "Lista filmes com filtros, busca e paginação",
        querystring: {
          type: "object",
          properties: {
            genero: { type: "string", enum: [...GENEROS] },
            ano: { type: "integer", minimum: ANO_MINIMO, maximum: ANO_MAXIMO },
            q: { type: "string", description: "Busca por título/gênero (ignora acentos)" },
            limite: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            offset: { type: "integer", minimum: 0, default: 0 },
          },
        },
        response: {
          200: {
            type: "array",
            items: schemaFilme,
            headers: {
              "X-Total-Count": { type: "integer", description: "Total de resultados (para paginação)" },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const { genero, ano, q, limite = 10, offset = 0 } = req.query as {
        genero?: string;
        ano?: number;
        q?: string;
        limite?: number;
        offset?: number;
      };
      const { filmes, total } = repositorio.listar({
        genero,
        ano,
        q,
        limite,
        offset,
      });
      reply.header("X-Total-Count", total);
      return filmes;
    },
  );

  app.get(
    "/filmes/:id",
    {
      schema: {
        tags: ["filmes"],
        summary: "Obtém um filme pelo id",
        params: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
        response: { 200: schemaFilme, 404: { type: "object", properties: { erro: { type: "string" } } } },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const filme = repositorio.obter(id);
      if (!filme) return reply.status(404).send({ erro: "Filme não encontrado" });
      return filme;
    },
  );

  app.post(
    "/filmes",
    {
      schema: {
        tags: ["filmes"],
        summary: "Cria um filme (201) — 409 se o título já existir",
        body: schemaNovoFilme,
        response: { 201: schemaFilme, 409: { type: "object", properties: { erro: { type: "string" } } } },
      },
    },
    async (req, reply) => {
      const dados = req.body as NovoFilme;
      if (repositorio.existeTitulo(dados.titulo)) {
        return reply.status(409).send({ erro: "Já existe um filme com este título" });
      }
      const filme = repositorio.criar(dados);
      return reply.status(201).send(filme);
    },
  );

  app.put(
    "/filmes/:id",
    {
      schema: {
        tags: ["filmes"],
        summary: "Substitui um filme por inteiro (idempotente)",
        params: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
        body: schemaNovoFilme,
        response: {
          200: schemaFilme,
          404: { type: "object", properties: { erro: { type: "string" } } },
          409: { type: "object", properties: { erro: { type: "string" } } },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const dados = req.body as NovoFilme;
      if (repositorio.existeTitulo(dados.titulo, id)) {
        return reply.status(409).send({ erro: "Já existe um filme com este título" });
      }
      const filme = repositorio.substituir(id, dados);
      if (!filme) return reply.status(404).send({ erro: "Filme não encontrado" });
      return filme;
    },
  );

  app.patch(
    "/filmes/:id",
    {
      schema: {
        tags: ["filmes"],
        summary: "Atualiza parcialmente um filme",
        params: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
        body: { type: "object", properties: schemaNovoFilme.properties, additionalProperties: false },
        response: {
          200: schemaFilme,
          404: { type: "object", properties: { erro: { type: "string" } } },
          409: { type: "object", properties: { erro: { type: "string" } } },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const mudancas = req.body as Partial<NovoFilme>;
      if (mudancas.titulo && repositorio.existeTitulo(mudancas.titulo, id)) {
        return reply.status(409).send({ erro: "Já existe um filme com este título" });
      }
      const filme = repositorio.atualizarParcial(id, mudancas);
      if (!filme) return reply.status(404).send({ erro: "Filme não encontrado" });
      return filme;
    },
  );

  app.delete(
    "/filmes/:id",
    {
      schema: {
        tags: ["filmes"],
        summary: "Exclui um filme (204)",
        params: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
        response: { 204: { type: "null" }, 404: { type: "object", properties: { erro: { type: "string" } } } },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      if (!repositorio.excluir(id)) {
        return reply.status(404).send({ erro: "Filme não encontrado" });
      }
      return reply.status(204).send();
    },
  );

  return app;
}

export type { Filme };
export { eGenero };
