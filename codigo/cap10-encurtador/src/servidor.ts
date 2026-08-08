/**
 * Servidor HTTP do encurtador — sem framework, apenas node:http.
 *
 * Rotas:
 *   POST /encurtar           { url } → 201 { codigo, urlCurta, urlOriginal }
 *   GET  /:codigo            → 302 Location: <url original> (conta o acesso)
 *   GET  /estatisticas/:codigo → 200 { codigo, url, acessos }
 *   GET  /                    → lista todas as URLs (analytics)
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Repositorio } from "./repositorio.js";
import { validarUrl } from "./validar-url.js";

function lerBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let dados = "";
    req.on("data", (chunk: Buffer) => {
      dados += chunk.toString("utf8");
      if (dados.length > 10_000) {
        reject(new Error("corpo da requisição grande demais"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(dados));
    req.on("error", reject);
  });
}

function responder(
  res: ServerResponse,
  status: number,
  corpo: unknown,
  headers: Record<string, string> = {},
): void {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  res.end(JSON.stringify(corpo));
}

export function criarServidor(repositorio: Repositorio, baseUrl: string) {
  return createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", baseUrl);
    const caminho = url.pathname;

    try {
      // POST /encurtar — cria uma URL curta
      if (req.method === "POST" && caminho === "/encurtar") {
        const corpo = await lerBody(req);
        let entrada: { url?: unknown };
        try {
          entrada = JSON.parse(corpo) as { url?: unknown };
        } catch {
          return responder(res, 400, { erro: "Corpo deve ser JSON válido" });
        }
        const urlOriginal = validarUrl(
          typeof entrada.url === "string" ? entrada.url : "",
        );
        if (urlOriginal === null) {
          return responder(res, 400, {
            erro: "URL inválida: informe uma URL http(s) válida",
          });
        }
        const registro = await repositorio.criar(urlOriginal);
        return responder(res, 201, {
          codigo: registro.codigo,
          urlCurta: `${baseUrl}/${registro.codigo}`,
          urlOriginal: registro.url,
        });
      }

      // GET /estatisticas/:codigo — analytics de uma URL
      const matchEstatisticas = caminho.match(/^\/estatisticas\/([A-Za-z0-9]+)$/);
      if (req.method === "GET" && matchEstatisticas) {
        const registro = repositorio.obter(matchEstatisticas[1]!);
        if (!registro) return responder(res, 404, { erro: "Código não encontrado" });
        return responder(res, 200, {
          codigo: registro.codigo,
          url: registro.url,
          acessos: registro.acessos,
          criadoEm: registro.criadoEm,
        });
      }

      // GET / — lista todas as URLs (analytics simples)
      if (req.method === "GET" && caminho === "/") {
        return responder(res, 200, {
          total: repositorio.listar().length,
          urls: repositorio.listar(),
        });
      }

      // GET /:codigo — redireciona e conta o acesso
      const matchCodigo = caminho.match(/^\/([A-Za-z0-9]+)$/);
      if (req.method === "GET" && matchCodigo) {
        const destino = await repositorio.registrarAcesso(matchCodigo[1]!);
        if (!destino) return responder(res, 404, { erro: "Código não encontrado" });
        res.writeHead(302, { Location: destino });
        return res.end();
      }

      return responder(res, 404, { erro: "Rota não encontrada" });
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : "Erro interno";
      return responder(res, 500, { erro: mensagem });
    }
  });
}
