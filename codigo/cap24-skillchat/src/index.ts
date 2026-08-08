/**
 * Demo do pipeline RAG (sem rede): indexa 4 serviços e responde uma pergunta
 * usando embeddings falsos determinísticos. Rode: `npm run dev`.
 */
import { FakeEmbeddings } from "./embeddings.ts";
import { RepositorioVetorial, responder } from "./rag.ts";

const repo = new RepositorioVetorial(new FakeEmbeddings([
  "serviço", "design", "site", "app", "marketing", "fotografia",
]));

await repo.indexar("s1", "Ana", "Serviço de design de site com identidade visual");
await repo.indexar("s2", "Bia", "Desenvolvimento de aplicativo móvel");
await repo.indexar("s3", "Caio", "Fotografia de produtos para e-commerce");
await repo.indexar("s4", "Duda", "Gestão de marketing para pequenas empresas");

const pergunta = "preciso de um site novo para minha loja";
const trechos = await repo.consultar(pergunta, 2);

console.log(`Pergunta: ${pergunta}\n`);
for (const t of trechos) {
  console.log(`  [${t.fonte}] ${t.texto}`);
}

const resposta = await responder(repo, pergunta, {
  topK: 2,
  gerar: async (_system, usuario) =>
    `(LLM de exemplo) Busquei os trechos relevantes e respondo com base neles.\n` +
    `Contexto enviado: ${usuario.length} caracteres em ${trechos.length} trechos.`,
});

console.log(`\nResposta: ${resposta.texto}`);
