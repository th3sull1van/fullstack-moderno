/** Configuração central de tokens e cookies (variáveis de ambiente). */

export const config = {
  jwtSecret: process.env.JWT_SECRET ?? "dev-only-secret-troque-em-producao",
  accessTtl: "15m", // access token: 15 minutos
  refreshTtlDias: 7, // refresh token: 7 dias
  cookieSecure: process.env.COOKIE_SECURE === "true",
  /** Nome do cookie httpOnly onde o refresh token vive. */
  cookieNome: "authhub_refresh",
} as const;
