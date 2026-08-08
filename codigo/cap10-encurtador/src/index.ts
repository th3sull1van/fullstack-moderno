import { criarServidor } from "./servidor.js";
import { caminhoPadrao, Repositorio } from "./repositorio.js";

const PORTA = Number(process.env.PORT ?? 3000);
const baseUrl = `http://localhost:${PORTA}`;

const repositorio = new Repositorio(caminhoPadrao());
await repositorio.carregar();

const servidor = criarServidor(repositorio, baseUrl);
servidor.listen(PORTA, () => {
  console.log(`🚀 Encurtador rodando em ${baseUrl}`);
  console.log(`   POST /encurtar  → cria URL curta`);
  console.log(`   GET  /:codigo   → redireciona (302)`);
  console.log(`   GET  /estatisticas/:codigo → analytics`);
});
