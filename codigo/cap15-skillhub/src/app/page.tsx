import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { formatarMoeda } from "@/lib/utils";

export const metadata = {
  title: "Bem-vindo ao SkillHub",
};

// Dinâmica de propósito: a vitrine sempre reflete o banco atual.
export const dynamic = "force-dynamic";

export default async function PaginaInicial() {
  // Serviços recentes como "vitrine" da home — Server Component lendo o banco.
  const recentes = await prisma.servico.findMany({
    orderBy: { criadoEm: "desc" },
    take: 3,
    include: { dono: { select: { nome: true } } },
  });

  return (
    <div className="hero">
      <h1>Encontre o profissional certo para o seu próximo projeto.</h1>
      <p>
        Aulas, design, tecnologia, consertos e muito mais — anuncie seu
        serviço ou contrate quem resolve.
      </p>
      <p style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
        <Link href="/servicos" className="botao primario">
          Explorar serviços
        </Link>
        <Link href="/cadastro" className="botao">
          Anunciar um serviço
        </Link>
      </p>

      <h2 style={{ marginTop: "2.5rem" }}>Recém-chegados</h2>
      <div className="grade">
        {recentes.map((servico) => (
          <Link
            key={servico.id}
            href={`/servicos/${servico.id}`}
            className="cartao"
            style={{ textDecoration: "none" }}
          >
            <span className="tag">{servico.categoria}</span>
            <h3>{servico.titulo}</h3>
            <p>{servico.dono.nome}</p>
            <p className="preco">{formatarMoeda(servico.precoCentavos)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
