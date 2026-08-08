import { criarApp } from "./app.js";

const PORTA = Number(process.env.PORT ?? 4000);
const app = await criarApp();

try {
  await app.listen({ port: PORTA, host: "0.0.0.0" });
  console.log(`🔐 AuthHub rodando em http://localhost:${PORTA}`);
  console.log(`   POST /cadastro  POST /login  POST /refresh  POST /logout`);
  console.log(`   GET  /me  ·  GET /admin  ·  GET /admin/usuarios`);
} catch (erro) {
  app.log.error(erro);
  process.exit(1);
}
