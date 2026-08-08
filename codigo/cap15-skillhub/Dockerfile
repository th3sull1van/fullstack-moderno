# ============================================================================
# Dockerfile do SkillHub — multi-stage (capítulo 17 do livro).
#   target dev  -> desenvolvimento com hot-reload
#   target prod -> produção standalone, usuário não-root, imagem mínima
# ============================================================================

# ---------- Estágio base: dependências ----------
FROM node:24-alpine AS base
WORKDIR /app
ENV NODE_ENV=development

# ---------- Estágio dev: hot-reload ----------
FROM base AS dev
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---------- Estágio build: compila a aplicação ----------
FROM base AS build
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

# ---------- Estágio prod: apenas o necessário ----------
FROM node:24-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

# Usuário não-root (princípio do menor privilégio)
RUN addgroup -S app && adduser -S app -G app

# Artefatos do build standalone (gerado por output: "standalone")
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# Prisma Client e CLI são necessários em runtime para migrate deploy
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/prisma ./prisma

USER app
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Migrações aplicadas antes de subir (tolerante a banco ainda inicializando)
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
