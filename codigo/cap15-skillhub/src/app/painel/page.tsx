import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatarMoeda } from "@/lib/utils";
import { FormularioDeServico } from "@/components/formulario-servico";
import { BotaoExcluir } from "@/components/botao-excluir";

export const metadata = {
  title: "Meu painel",
};

export default async function PaginaPainel() {
  const sessao = await auth();
  const usuarioId = sessao!.user!.id;

  const [meusServicos, pedidosRecebidos, meusPedidos] = await Promise.all([
    prisma.servico.findMany({
      where: { donoId: usuarioId },
      orderBy: { criadoEm: "desc" },
      include: { pedidos: { select: { id: true } } },
    }),
    prisma.pedido.findMany({
      where: { servico: { donoId: usuarioId } },
      orderBy: { criadoEm: "desc" },
      include: {
        servico: { select: { titulo: true } },
        cliente: { select: { nome: true, email: true } },
      },
      take: 20,
    }),
    prisma.pedido.findMany({
      where: { clienteId: usuarioId },
      orderBy: { criadoEm: "desc" },
      include: {
        servico: { select: { titulo: true, id: true } },
      },
      take: 20,
    }),
  ]);

  return (
    <div>
      <h1>Painel de {sessao!.user!.name ?? sessao!.user!.email}</h1>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Publicar novo serviço</h2>
        <FormularioDeServico />
      </section>

      <section style={{ marginTop: "2.5rem" }}>
        <h2>Meus anúncios ({meusServicos.length})</h2>
        {meusServicos.length === 0 ? (
          <p className="vazio">Você ainda não anunciou nada.</p>
        ) : (
          <div className="grade">
            {meusServicos.map((servico) => (
              <div key={servico.id} className="cartao">
                <span className="tag">{servico.categoria}</span>
                <h3>{servico.titulo}</h3>
                <p className="aviso">
                  {servico.pedidos.length} pedido
                  {servico.pedidos.length === 1 ? "" : "s"}
                </p>
                <p className="preco">{formatarMoeda(servico.precoCentavos)}</p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link
                    href={`/servicos/${servico.id}`}
                    className="botao pequeno"
                  >
                    Ver
                  </Link>
                  <BotaoExcluir servicoId={servico.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: "2.5rem" }}>
        <h2>Pedidos recebidos ({pedidosRecebidos.length})</h2>
        {pedidosRecebidos.length === 0 ? (
          <p className="vazio">Nenhum pedido recebido ainda.</p>
        ) : (
          <ul className="grade" style={{ listStyle: "none", padding: 0 }}>
            {pedidosRecebidos.map((pedido) => (
              <li key={pedido.id} className="cartao">
                <h3>{pedido.servico.titulo}</h3>
                <p>
                  Solicitado por {pedido.cliente.nome} ({pedido.cliente.email})
                </p>
                <p className="aviso">
                  {new Date(pedido.criadoEm).toLocaleString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: "2.5rem" }}>
        <h2>Meus pedidos ({meusPedidos.length})</h2>
        {meusPedidos.length === 0 ? (
          <p className="vazio">Você ainda não contratou nenhum serviço.</p>
        ) : (
          <ul className="grade" style={{ listStyle: "none", padding: 0 }}>
            {meusPedidos.map((pedido) => (
              <li key={pedido.id} className="cartao">
                <Link href={`/servicos/${pedido.servico.id}`}>
                  <h3>{pedido.servico.titulo}</h3>
                </Link>
                <p className="aviso">
                  {new Date(pedido.criadoEm).toLocaleString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
