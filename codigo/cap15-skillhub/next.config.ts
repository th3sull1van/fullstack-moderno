import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output standalone (capítulo 17): gera .next/standalone com apenas o
  // necessário para rodar em produção — base da imagem Docker multi-stage.
  output: "standalone",

  // Headers de segurança (capítulo 19 — OWASP A02/A04/A08).
  // Valide em https://securityheaders.com depois do deploy.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // HSTS: força HTTPS (ajuste max-age para produção)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Bloqueia clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Impede MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Controla a informação enviada no header Referer
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions: limites de APIs do navegador
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // CSP: scripts/estilos apenas do próprio domínio e inline (React).
          // Ajuste conforme o que seu site realmente carrega (capítulo 19).
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "connect-src 'self'",
              "font-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
