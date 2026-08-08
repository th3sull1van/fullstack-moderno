import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { formatarMoeda } from "@/lib/utils";
import { CATEGORIAS } from "@/lib/validacoes";

export const metadata = {
  title: "Serviços",
};

const POR_PAGINA = 8;

type Busca = {
  busca?: string;
  categoria?: string;
  pagina?: string;
};

// searchParams é Promise no Next 16 — a página fica dinâmica automaticamente.
export default async function PaginaServicos({
  searchParams,
}: {
  searchParams: Promise<Busca>;
}) {
  const params = await searchParams;
  const busca = params.busca?.trim() ?? "";
  const categoria = params.categoria ?? "";
  const pagina = Math.max(1, Number(params.pagina) || 1);

  const where = {
    ...(busca
      ? {
          OR: [
            { titulo: { contains: busca, mode: "insensitive" as const } },
            { descricao: { contains: busca, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(categoria ? { categoria } : {}),
  };

  const [servicos, total] = await Promise.all([
    prisma.servico.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      skip: (pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
      include: { dono: { select: { nome: true } } },
    }),
    prisma.servico.count({ where }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const linkBase = (extra: Record<string, string>) => {
    const q = new URLSearchParams();
    if (busca) q.set("busca", busca);
    if (categoria) q.set("categoria", categoria);
    for (const [k, v] of Object.entries(extra)) {
      if (v) q.set(k, v);
    }
    const s = q.toString();
    return `/servicos${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <h1>Serviços</h1>

      {/* Filtros como formulário GET — a URL guarda o estado da busca */}
      <form className="filtros" method="get" action="/servicos">
        <input
          type="search"
          name="busca"
          placeholder="Buscar por título ou descrição"
          defaultValue={busca}
          aria-label="Buscar serviços"
        />
        <select name="categoria" defaultValue={categoria} aria-label="Filtrar por categoria">
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button className="botao primario" type="submit">
          Filtrar
        </button>
        {(busca || categoria) && (
          <Link className="botao pequeno" href="/servicos">
            Limpar
          </Link>
        )}
      </form>

      {servicos.length === 0 ? (
        <p className="vazio">
          Nenhum serviço encontrado. Tente outra busca ou categoria.
        </p>
      ) : (
        <>
          <p className="aviso" style={{ marginTop: "0.6rem" }}>
            {total} serviço{total === 1 ? "" : "s"} encontrado
            {total === 1 ? "" : "s"}
          </p>
          <div className="grade">
            {servicos.map((servico) => (
              <Link
                key={servico.id}
                href={`/servicos/${servico.id}`}
                className="cartao"
                style={{ textDecoration: "none" }}
              >
                <span className="tag">{servico.categoria}</span>
                <h2>{servico.titulo}</h2>
                <p>{servico.descricao.slice(0, 120)}…</p>
                <p className="aviso">por {servico.dono.nome}</p>
                <p className="preco">{formatarMoeda(servico.precoCentavos)}</p>
              </Link>
            ))}
          </div>

          <nav className="paginacao" aria-label="Paginação">
            {pagina > 1 && (
              <Link
                className="botao pequeno"
                href={linkBase({ pagina: String(pagina - 1) })}
              >
                ← Anterior
              </Link>
            )}
            <span className="atual">
              Página {pagina} de {totalPaginas}
            </span>
            {pagina < totalPaginas && (
              <Link
                className="botao pequeno"
                href={linkBase({ pagina: String(pagina + 1) })}
              >
                Próxima →
              </Link>
            )}
          </nav>
        </>
      )}
    </div>
  );
}
