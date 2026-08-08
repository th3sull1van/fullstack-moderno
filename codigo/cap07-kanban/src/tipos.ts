/** Colunas fixas do quadro (3). */
export type ColunaId = "afazer" | "andamento" | "concluido";

export const COLUNAS: { id: ColunaId; titulo: string }[] = [
  { id: "afazer", titulo: "A fazer" },
  { id: "andamento", titulo: "Em andamento" },
  { id: "concluido", titulo: "Concluído" },
];

export type Tarefa = {
  id: string;
  titulo: string;
  coluna: ColunaId;
  criadaEm: number; // timestamp — usado como ordem
};

export type EstadoKanban = {
  tarefas: Tarefa[];
};

export const ESTADO_INICIAL: EstadoKanban = {
  tarefas: [
    { id: "t-1", titulo: "Estudar o capítulo 7 (React)", coluna: "afazer", criadaEm: 3 },
    { id: "t-2", titulo: "Montar o esqueleto do quadro", coluna: "andamento", criadaEm: 2 },
    { id: "t-3", titulo: "Instalar Node e o Vite", coluna: "concluido", criadaEm: 1 },
  ],
};
