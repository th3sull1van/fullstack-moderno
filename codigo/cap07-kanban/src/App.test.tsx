import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";

function colunaPorTitulo(titulo: string) {
  return screen.getByRole("region", { name: titulo });
}

describe("Quadro Kanban — renderização", () => {
  it("mostra as 3 colunas com contagem inicial", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Quadro Kanban" })).toBeTruthy();
    expect(colunaPorTitulo("A fazer")).toBeTruthy();
    expect(colunaPorTitulo("Em andamento")).toBeTruthy();
    expect(colunaPorTitulo("Concluído")).toBeTruthy();
    expect(within(colunaPorTitulo("A fazer")).getByText("1")).toBeTruthy();
  });
});

describe("Quadro Kanban — criar tarefa", () => {
  it("adiciona tarefa na coluna 'A fazer' e atualiza a contagem", async () => {
    const usuario = userEvent.setup();
    render(<App />);

    await usuario.type(screen.getByLabelText("Nova tarefa"), "Revisar pull request");
    await usuario.click(screen.getByRole("button", { name: "Adicionar" }));

    const afazer = colunaPorTitulo("A fazer");
    expect(within(afazer).getByText("Revisar pull request")).toBeTruthy();
    expect(within(afazer).getByText("2")).toBeTruthy(); // 1 inicial + 1 nova
  });

  it("valida título curto e exibe erro com role=alert", async () => {
    const usuario = userEvent.setup();
    render(<App />);

    await usuario.type(screen.getByLabelText("Nova tarefa"), "ab");
    await usuario.click(screen.getByRole("button", { name: "Adicionar" }));

    const alerta = screen.getByRole("alert");
    expect(alerta.textContent).toContain("pelo menos 3 caracteres");
    // nada foi adicionado
    expect(within(colunaPorTitulo("A fazer")).getByText("1")).toBeTruthy();
  });
});

describe("Quadro Kanban — mover e excluir", () => {
  it("move tarefa de 'A fazer' para 'Em andamento'", async () => {
    const usuario = userEvent.setup();
    render(<App />);

    const mover = screen.getByRole("button", {
      name: /Mover "Estudar o capítulo 7 \(React\)" para Em andamento/,
    });
    await usuario.click(mover);

    expect(within(colunaPorTitulo("Em andamento")).getByText("Estudar o capítulo 7 (React)")).toBeTruthy();
    expect(within(colunaPorTitulo("A fazer")).queryByText("Estudar o capítulo 7 (React)")).toBeNull();
  });

  it("exclui tarefa e atualiza a contagem", async () => {
    const usuario = userEvent.setup();
    render(<App />);

    await usuario.click(
      screen.getByRole("button", { name: 'Excluir "Estudar o capítulo 7 (React)"' }),
    );

    expect(screen.queryByText("Estudar o capítulo 7 (React)")).toBeNull();
    expect(within(colunaPorTitulo("A fazer")).queryByText("1")).toBeNull();
  });
});

describe("Quadro Kanban — persistência", () => {
  it("persiste no localStorage e restaura ao re-renderizar", async () => {
    const usuario = userEvent.setup();
    const { unmount } = render(<App />);

    await usuario.type(screen.getByLabelText("Nova tarefa"), "Tarefa persistente");
    await usuario.click(screen.getByRole("button", { name: "Adicionar" }));

    const salvo = JSON.parse(
      window.localStorage.getItem("kanban:estado:v1") ?? "{}",
    ) as { tarefas: { titulo: string }[] };
    expect(salvo.tarefas.some((t) => t.titulo === "Tarefa persistente")).toBe(true);

    unmount();
    render(<App />);
    expect(screen.getByText("Tarefa persistente")).toBeTruthy();
  });
});
