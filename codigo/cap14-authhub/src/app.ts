import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import helmet from "@fastify/helmet";
import cookie from "@fastify/cookie";
import { z } from "zod";
import { prisma } from "./lib/prisma.js";
import { config } from "./lib/segredos.js";
import { hashSenha, validarForcaSenha, verificarSenha } from "./lib/senhas.js";
import {
  emitirAccessToken,
  expiraEm,
  gerarRefreshToken,
  PAPEIS,
  sha256,
  verificarAccessToken,
  type Papel,
  type TokenAcesso,
} from "./lib/tokens.js";
import { RateLimiter } from "./lib/rate-limit.js";

// Request com o usuário injetado pelo middleware exigeAuth.
type ReqComUsuario = FastifyRequest & { usuario: TokenAcesso | null };

// ---------------------------------------------------------------------------
// Validações (Zod) — respostas 422 com erros por campo
// ---------------------------------------------------------------------------
const schemaCadastro = z.object({
  nome: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(120),
  email: z.string().trim().email("E-mail inválido").max(200),
  senha: z.string().min(1, "Senha é obrigatória"),
});

const schemaLogin = z.object({
  email: z.string().trim().min(1, "E-mail é obrigatório"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

function detalhesZod(erro: z.ZodError): { campo: string; mensagem: string }[] {
  return erro.issues.map((i) => ({
    campo: i.path.join(".") || "body",
    mensagem: i.message,
  }));
}

/** Converte o papel do banco (string) no tipo fechado Papel — default deny. */
function papelSeguro(papel: string): Papel {
  return (PAPEIS as readonly string[]).includes(papel)
    ? (papel as Papel)
    : "USUARIO";
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export async function criarApp(opcoes: { limiter?: RateLimiter } = {}): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  // Headers de segurança (o capítulo 19 aprofunda; aqui já entra desde o início)
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: { defaultSrc: ["'self'"] },
    },
  });
  await app.register(cookie);

  const loginLimiter =
    opcoes.limiter ?? new RateLimiter(5, 60_000); // 5 tentativas/min por IP

  app.setErrorHandler((erro, _req, reply) => {
    if (erro instanceof z.ZodError) {
      return reply.status(422).send({ erro: "Validação falhou", detalhes: detalhesZod(erro) });
    }
    app.log.error(erro);
    return reply.status(500).send({ erro: "Erro interno" });
  });

  /** Lê o access token do header `Authorization: Bearer ...`. */
  function extrairBearer(req: FastifyRequest): string | null {
    const autorizacao = req.headers.authorization;
    if (typeof autorizacao !== "string" || !autorizacao.startsWith("Bearer ")) {
      return null;
    }
    return autorizacao.slice("Bearer ".length);
  }

  /** Middleware de autenticação: injeta o usuário no request ou responde 401. */
  async function exigeAuth(req: FastifyRequest, reply: FastifyReply) {
    const token = extrairBearer(req);
    if (!token) return reply.status(401).send({ erro: "Não autenticado" });
    try {
      (req as ReqComUsuario).usuario = verificarAccessToken(token);
    } catch {
      return reply.status(401).send({ erro: "Token inválido ou expirado" });
    }
  }

  /** RBAC: além de autenticar, exige um papel mínimo (403 se insuficiente). */
  function exigePapel(...papeis: Papel[]) {
    return async (req: FastifyRequest, reply: FastifyReply) => {
      await exigeAuth(req, reply);
      if (reply.sent) return;
      const usuario = (req as ReqComUsuario).usuario;
      if (!usuario) return;
      if (!papeis.includes(usuario.papel)) {
        return reply.status(403).send({ erro: "Acesso negado: papel insuficiente" });
      }
    };
  }

  // -------------------------------------------------------------------------
  // Cadastro
  // -------------------------------------------------------------------------
  app.post("/cadastro", async (req, reply) => {
    const corpo = schemaCadastro.parse(req.body);
    const erroSenha = validarForcaSenha(corpo.senha);
    if (erroSenha) {
      return reply.status(422).send({
        erro: "Validação falhou",
        detalhes: [{ campo: "senha", mensagem: erroSenha }],
      });
    }

    const jaExiste = await prisma.usuario.findUnique({ where: { email: corpo.email } });
    if (jaExiste) {
      return reply.status(409).send({ erro: "Este e-mail já está cadastrado" });
    }

    const usuario = await prisma.usuario.create({
      data: {
        nome: corpo.nome,
        email: corpo.email,
        senhaHash: await hashSenha(corpo.senha),
        papel: "USUARIO",
      },
      select: { id: true, nome: true, email: true, papel: true, criadoEm: true },
    });
    return reply.status(201).send(usuario);
  });

  // -------------------------------------------------------------------------
  // Login — JWT access (15min) + refresh rotativo (7d) em cookie httpOnly
  // -------------------------------------------------------------------------
  app.post("/login", async (req, reply) => {
    const ip = req.ip ?? "desconhecido";
    if (!loginLimiter.registrar(ip)) {
      return reply
        .status(429)
        .header("Retry-After", loginLimiter.segundosRestantes(ip))
        .send({ erro: "Muitas tentativas. Aguarde um minuto." });
    }

    const corpo = schemaLogin.parse(req.body);
    const usuario = await prisma.usuario.findUnique({ where: { email: corpo.email } });

    // Mensagem idêntica para e-mail inexistente OU senha errada (anti-enumeração)
    const senhaOk =
      usuario !== null && (await verificarSenha(usuario.senhaHash, corpo.senha));
    if (!usuario || !senhaOk) {
      return reply.status(401).send({ erro: "Credenciais inválidas" });
    }

    const refresh = gerarRefreshToken();
    await prisma.refreshToken.create({
      data: {
        hash: refresh.hash,
        familia: refresh.familia,
        expiraEm: expiraEm(config.refreshTtlDias),
        usuarioId: usuario.id,
      },
    });

    reply.setCookie(config.cookieNome, refresh.token, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: "lax",
      path: "/",
      maxAge: config.refreshTtlDias * 24 * 60 * 60,
    });

    return reply.send({
      accessToken: emitirAccessToken({
        id: usuario.id,
        papel: papelSeguro(usuario.papel),
      }),
      refreshToken: refresh.token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: papelSeguro(usuario.papel),
      },
    });
  });

  // -------------------------------------------------------------------------
  // Refresh — rotação: cada uso gera um par novo; reuse revoga a família
  // -------------------------------------------------------------------------
  app.post("/refresh", async (req, reply) => {
    const corpo = z
      .object({ refreshToken: z.string().min(1) })
      .safeParse(req.body ?? {});
    let token: string;
    if (corpo.success) {
      token = corpo.data.refreshToken;
    } else {
      const doCookie = req.cookies?.[config.cookieNome];
      if (!doCookie) return reply.status(401).send({ erro: "Refresh token ausente" });
      token = doCookie;
    }

    const registro = await prisma.refreshToken.findUnique({ where: { hash: sha256(token) } });
    if (!registro) return reply.status(401).send({ erro: "Refresh token inválido" });

    // REUSE: token já usado sendo apresentado de novo → ataque → revoga a família
    if (registro.usadoEm !== null || registro.revogadoEm !== null) {
      await prisma.refreshToken.updateMany({
        where: { familia: registro.familia, revogadoEm: null },
        data: { revogadoEm: new Date() },
      });
      return reply.status(401).send({ erro: "Refresh token reutilizado — sessão revogada" });
    }

    if (registro.expiraEm < new Date()) {
      return reply.status(401).send({ erro: "Refresh token expirado" });
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: registro.usuarioId } });
    if (!usuario) return reply.status(401).send({ erro: "Usuário não encontrado" });

    // Rotação: marca o atual como usado e emite um novo da mesma família
    await prisma.refreshToken.update({
      where: { id: registro.id },
      data: { usadoEm: new Date() },
    });
    const novo = gerarRefreshToken();
    await prisma.refreshToken.create({
      data: {
        hash: novo.hash,
        familia: registro.familia,
        expiraEm: expiraEm(config.refreshTtlDias),
        usuarioId: usuario.id,
      },
    });

    reply.setCookie(config.cookieNome, novo.token, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: "lax",
      path: "/",
      maxAge: config.refreshTtlDias * 24 * 60 * 60,
    });

    return reply.send({
      accessToken: emitirAccessToken({
        id: usuario.id,
        papel: papelSeguro(usuario.papel),
      }),
      refreshToken: novo.token,
    });
  });

  // -------------------------------------------------------------------------
  // Logout — revoga o refresh token (lista negra no banco)
  // -------------------------------------------------------------------------
  app.post("/logout", async (req, reply) => {
    const doCookie = req.cookies?.[config.cookieNome];
    const doBody = (req.body as { refreshToken?: string } | undefined)?.refreshToken;
    const token = doBody ?? doCookie;
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { hash: sha256(token), revogadoEm: null },
        data: { revogadoEm: new Date() },
      });
    }
    reply.clearCookie(config.cookieNome, { path: "/" });
    return reply.status(204).send();
  });

  // -------------------------------------------------------------------------
  // Rotas protegidas
  // -------------------------------------------------------------------------
  app.get("/me", { preHandler: exigeAuth }, async (req) => {
    const usuario = await prisma.usuario.findUnique({
      where: { id: (req as ReqComUsuario).usuario!.sub },
      select: { id: true, nome: true, email: true, papel: true, criadoEm: true },
    });
    if (!usuario) throw new Error("usuário removido");
    return usuario;
  });

  app.get(
    "/admin",
    { preHandler: exigePapel("ADMIN", "MODERADOR") },
    async () => ({ ok: true, area: "restrita a moderadores e admins" }),
  );

  app.get(
    "/admin/usuarios",
    { preHandler: exigePapel("ADMIN") },
    async () => {
      const usuarios = await prisma.usuario.findMany({
        select: { id: true, nome: true, email: true, papel: true },
      });
      return { total: usuarios.length, usuarios };
    },
  );

  return app;
}
