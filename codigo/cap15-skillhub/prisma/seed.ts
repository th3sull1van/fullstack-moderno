// Seed do SkillHub — cria um usuário de demonstração e 15 serviços reais.
// Execução: npm run db:seed  (usa o script definido em package.json "prisma.seed")

import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const prisma = new PrismaClient();

const CATEGORIAS = [
  "Aulas",
  "Design",
  "Tecnologia",
  "Consertos",
  "Consultoria",
  "Artes",
] as const;

const SERVICOS = [
  {
    titulo: "Aula particular de React",
    descricao:
      "Sessões individuais (1h) para dominar componentes, hooks e estado. Material incluso e exercícios corrigidos.",
    precoCentavos: 9000,
    categoria: "Aulas",
  },
  {
    titulo: "Aula de violão para iniciantes",
    descricao:
      "Do zero ao primeiro repertório: acordes, ritmo e leitura de cifras. Em casa ou online.",
    precoCentavos: 7000,
    categoria: "Aulas",
  },
  {
    titulo: "Aula de inglês conversação",
    descricao:
      "Foco em conversação para entrevistas e reuniões de trabalho. Nível B1+ recomendado.",
    precoCentavos: 11000,
    categoria: "Aulas",
  },
  {
    titulo: "Identidade visual completa",
    descricao:
      "Logotipo, paleta, tipografia e aplicações. Entrega em até 10 dias com 2 rodadas de ajustes.",
    precoCentavos: 24000,
    categoria: "Design",
  },
  {
    titulo: "Design de interface (UI) para app",
    descricao:
      "Prototipagem em Figma de até 12 telas, com sistema de componentes e handoff para o time.",
    precoCentavos: 32000,
    categoria: "Design",
  },
  {
    titulo: "Edição de vídeo para redes sociais",
    descricao:
      "Cortes, legendas automáticas e capa para Reels/TikTok. Entrega de 3 vídeos por semana.",
    precoCentavos: 15000,
    categoria: "Design",
  },
  {
    titulo: "Criação de site institucional",
    descricao:
      "Site responsivo em Next.js com SEO básico, formulário de contato e deploy em produção.",
    precoCentavos: 45000,
    categoria: "Tecnologia",
  },
  {
    titulo: "Configuração de e-commerce",
    descricao:
      "Loja virtual completa: catálogo, carrinho, checkout e integração de pagamento.",
    precoCentavos: 60000,
    categoria: "Tecnologia",
  },
  {
    titulo: "Automação de relatórios",
    descricao:
      "Script que consolida planilhas e gera relatório mensal em PDF enviado por e-mail.",
    precoCentavos: 18000,
    categoria: "Tecnologia",
  },
  {
    titulo: "Conserto de computador e notebook",
    descricao:
      "Diagnóstico, limpeza, troca de peças e instalação de sistema. Atendimento em domicílio.",
    precoCentavos: 12000,
    categoria: "Consertos",
  },
  {
    titulo: "Conserto de celular",
    descricao:
      "Troca de tela, bateria e conector de carga. Orçamento sem compromisso.",
    precoCentavos: 10000,
    categoria: "Consertos",
  },
  {
    titulo: "Chaveiro e fechaduras",
    descricao:
      "Abertura de portas, troca de fechaduras e cópias de chave com garantia.",
    precoCentavos: 8000,
    categoria: "Consertos",
  },
  {
    titulo: "Consultoria de carreira em TI",
    descricao:
      "Sessão de 1h para revisar currículo, plano de estudos e estratégia de entrevistas.",
    precoCentavos: 20000,
    categoria: "Consultoria",
  },
  {
    titulo: "Consultoria financeira pessoal",
    descricao:
      "Organização de orçamento, planejamento de metas e análise de investimentos.",
    precoCentavos: 16000,
    categoria: "Consultoria",
  },
  {
    titulo: "Ilustração digital personalizada",
    descricao:
      "Ilustração única para presente, avatar ou campanha. Estilos variados, entrega em 7 dias.",
    precoCentavos: 14000,
    categoria: "Artes",
  },
] as const;

async function main() {
  console.log("→ Removendo dados existentes (seed idempotente)...");
  await prisma.pedido.deleteMany();
  await prisma.servico.deleteMany();
  await prisma.usuario.deleteMany();

  console.log("→ Criando usuário de demonstração...");
  const senhaHash = await hash("senha-forte-123");
  const ana = await prisma.usuario.create({
    data: {
      nome: "Ana Souza",
      email: "ana@exemplo.com",
      senhaHash,
    },
  });

  console.log(`→ Criando ${SERVICOS.length} serviços...`);
  // Metade dos serviços pertence à Ana; o restante a um segundo usuário,
  // para demonstrar o RBAC (apenas o dono edita/exclui).
  const bruno = await prisma.usuario.create({
    data: {
      nome: "Bruno Lima",
      email: "bruno@exemplo.com",
      senhaHash,
    },
  });

  for (const [i, servico] of SERVICOS.entries()) {
    await prisma.servico.create({
      data: {
        ...servico,
        donoId: i % 2 === 0 ? ana.id : bruno.id,
      },
    });
  }

  console.log("→ Seed concluído!");
  console.log("  Login de demonstração: ana@exemplo.com / senha-forte-123");
  console.log("  (Bruno: bruno@exemplo.com / senha-forte-123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
