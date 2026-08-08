import { criarApp } from "./app.js";

const PORTA = Number(process.env.PORT ?? 3500);
const app = await criarApp();

try {
  await app.listen({ port: PORTA, host: "0.0.0.0" });
  console.log(`📚 API de biblioteca em http://localhost:${PORTA}`);
  console.log(`   /autores · /livros?q=... · /emprestimos/ativos · /emprestimos/atrasados`);
} catch (erro) {
  app.log.error(erro);
  process.exit(1);
}
