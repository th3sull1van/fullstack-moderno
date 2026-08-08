import type { ColunaId, Tarefa as TipoTarefa } from "../tipos";
import { Tarefa } from "./Tarefa";

type Props = {
  coluna: { id: ColunaId; titulo: string };
  tarefas: TipoTarefa[];
  aoMover: (id: string, destino: ColunaId) => void;
  aoExcluir: (id: string) => void;
};

export function Coluna({ coluna, tarefas, aoMover, aoExcluir }: Props) {
  const vazia = tarefas.length === 0;

  return (
    <section className={`coluna coluna--${coluna.id}`} aria-label={coluna.titulo}>
      <header className="coluna__cabecalho">
        <h2>{coluna.titulo}</h2>
        <span className="coluna__contagem" aria-label={`${tarefas.length} tarefas`}>
          {tarefas.length}
        </span>
      </header>

      {vazia ? (
        <p className="coluna__vazia">Nenhuma tarefa aqui.</p>
      ) : (
        <ul className="coluna__lista">
          {tarefas.map((tarefa) => (
            <Tarefa key={tarefa.id} tarefa={tarefa} aoMover={aoMover} aoExcluir={aoExcluir} />
          ))}
        </ul>
      )}
    </section>
  );
}
