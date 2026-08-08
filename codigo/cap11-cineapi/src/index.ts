import { criarApp } from "./app.js";

const PORTA = Number(process.env.PORT ?? 3333);

const app = await criarApp({ semear: true });

try {
  await app.listen({ port: PORTA, host: "0.0.0.0" });
  console.log(`🎬 CineAPI rodando em http://localhost:${PORTA}`);
  console.log(`   Docs (Swagger): http://localhost:${PORTA}/docs`);
} catch (erro) {
  app.log.error(erro);
  process.exit(1);
}
