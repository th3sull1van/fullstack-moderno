import { useLocalStorage } from "./hooks/useLocalStorage";
import { Coluna } from "./componentes/Coluna";
import { FormNovaTarefa } from "./componentes/FormNovaTarefa";
import { COLUNAS, ESTADO_INICIAL, type ColunaId, type EstadoKanban, type Tarefa } from "./tipos";

export function App() {
  const [estado, setEstado] = useLocalStorage<EstadoKanban>(
    "kanban:estado:v1",
    ESTADO_INICIAL,
  );

  function adicionarTarefa(titulo: string) {
    const tarefa: Tarefa = {
      id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      titulo,
      coluna: "afazer",
      criadaEm: Date.now(),
    };
    setEstado((atual) => ({ tarefas: [tarefa, ...atual.tarefas] }));
  }

  /** Mover é substituir o estado com a coluna atualizada (imutabilidade). */
  function moverTarefa(id: string, destino: ColunaId) {
    setEstado((atual) => ({
      tarefas: atual.tarefas.map((t) => (t.id === id ? { ...t, coluna: destino } : t)),
    }));
  }

  function excluirTarefa(id: string) {
    setEstado((atual) => ({
      tarefas: atual.tarefas.filter((t) => t.id !== id),
    }));
  }

  return (
    <main className="quadro">
      <header className="quadro__cabecalho">
        <h1>Quadro Kanban</h1>
        <p>Estado tipado, imutável e persistido no <code>localStorage</code>.</p>
      </header>

      <FormNovaTarefa aoCriar={adicionarTarefa} />

      <div className="quadro__colunas">
        {COLUNAS.map((coluna) => (
          <Coluna
            key={coluna.id}
            coluna={coluna}
            tarefas={estado.tarefas
              .filter((t) => t.coluna === coluna.id)
              .sort((a, b) => b.criadaEm - a.criadaEm)}
            aoMover={moverTarefa}
            aoExcluir={excluirTarefa}
          />
        ))}
      </div>
    </main>
  );
}
