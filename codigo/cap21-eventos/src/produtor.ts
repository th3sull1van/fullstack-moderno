/** Produtor de exemplo: publica tarefas na fila (rode com Redis ativo). */
import { fechar, publicar } from "./fila.ts";

await publicar({
  tipo: "email",
  chaveIdempotencia: "email-demo-1",
  dados: { destinatario: "ana@exemplo.com", assunto: "Bem-vinda ao SkillHub" },
});
console.log("email-demo-1 publicado");

await publicar({
  tipo: "relatorio",
  chaveIdempotencia: "rel-demo-1",
  dados: { periodo: "2026-08" },
});
console.log("rel-demo-1 publicado");

await fechar();
