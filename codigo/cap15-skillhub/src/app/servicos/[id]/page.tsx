import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { formatarMoeda } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { BotaoContratar } from "@/components/botao-contratar";

type Params = { id: string };

// Metadata dinâmica por serviço — vira <title> e descrição do SEO.
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const servico = await prisma.servico.findUnique({ where: { id } });
  if (!servico) return { title: "Serviço não encontrado" };
  return {
    title: servico.titulo,
    description: servico.descricao.slice(0, 160),
  };
}

export default async function PaginaDetalhe({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const sessao = await auth();

  const servico = await prisma.servico.findUnique({
    where: { id },
    include: { dono: { select: { nome: true, email: true } } },
  });

  if (!servico) notFound();

  const ehDono = sessao?.user?.id === servico.donoId;
  const logado = Boolean(sessao?.user);

  return (
    <article>
      <p className="tag">{servico.categoria}</p>
      <h1>{servico.titulo}</h1>
      <p className="aviso">
        Anunciado por <strong>{servico.dono.nome}</strong>
      </p>

      <p style={{ fontSize: "1.05rem" }}>{servico.descricao}</p>

      <p className="preco" style={{ fontSize: "1.4rem" }}>
        {formatarMoeda(servico.precoCentavos)}
      </p>

      <BotaoContratar servicoId={servico.id} ehDono={ehDono} logado={logado} />

      <p className="aviso" style={{ marginTop: "1.5rem" }}>
        Dúvidas? Entre em contato com {servico.dono.email}
      </p>
    </article>
  );
}
