import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { config } from "./segredos.js";

export const PAPEIS = ["USUARIO", "MODERADOR", "ADMIN"] as const;
export type Papel = (typeof PAPEIS)[number];

export type TokenAcesso = {
  sub: string; // id do usuário
  papel: Papel;
};

/** Gera um JWT de acesso (HS256 explícito — evita algorithm confusion). */
export function emitirAccessToken(usuario: { id: string; papel: Papel }): string {
  return jwt.sign({ sub: usuario.id, papel: usuario.papel }, config.jwtSecret, {
    expiresIn: config.accessTtl,
    algorithm: "HS256",
  });
}

/** Valida e devolve o payload — lança em token inválido/expirado. */
export function verificarAccessToken(token: string): TokenAcesso {
  const payload = jwt.verify(token, config.jwtSecret, {
    algorithms: ["HS256"], // só HS256, nunca o default ambíguo
  }) as jwt.JwtPayload;
  if (typeof payload.sub !== "string") throw new Error("token sem sub");
  return { sub: payload.sub, papel: payload.papel as Papel };
}

/** Refresh token: 48 bytes aleatórios; guardamos apenas o sha256. */
export function gerarRefreshToken(): { token: string; hash: string; familia: string } {
  const token = randomBytes(48).toString("hex");
  const familia = randomBytes(16).toString("hex");
  return { token, hash: sha256(token), familia };
}

export function sha256(texto: string): string {
  return createHash("sha256").update(texto).digest("hex");
}

export function expiraEm(dias: number): Date {
  return new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
}
