import { COLUNAS, type ColunaId, type Tarefa as TipoTarefa } from "../tipos";

type Props = {
  tarefa: TipoTarefa;
  aoMover: (id: string, destino: ColunaId) => void;
  aoExcluir: (id: string) => void;
};

export function Tarefa({ tarefa, aoMover, aoExcluir }: Props) {
  const indiceAtual = COLUNAS.findIndex((c) => c.id === tarefa.coluna);
  const anterior = COLUNAS[indiceAtual - 1];
  const proxima = COLUNAS[indiceAtual + 1];

  return (
    <li className="tarefa" aria-label={`Tarefa: ${tarefa.titulo}`}>
      <span className="tarefa__titulo">{tarefa.titulo}</span>
      <span className="tarefa__acoes">
        {anterior && (
          <button
            type="button"
            className="tarefa__botao"
            onClick={() => aoMover(tarefa.id, anterior.id)}
            aria-label={`Mover "${tarefa.titulo}" para ${anterior.titulo}`}
          >
            ←
          </button>
        )}
        {proxima && (
          <button
            type="button"
            className="tarefa__botao"
            onClick={() => aoMover(tarefa.id, proxima.id)}
            aria-label={`Mover "${tarefa.titulo}" para ${proxima.titulo}`}
          >
            →
          </button>
        )}
        <button
          type="button"
          className="tarefa__botao tarefa__botao--excluir"
          onClick={() => aoExcluir(tarefa.id)}
          aria-label={`Excluir "${tarefa.titulo}"`}
        >
          ✕
        </button>
      </span>
    </li>
  );
}
