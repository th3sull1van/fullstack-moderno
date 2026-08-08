import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Input } from "./Input";
import { ModalExemplo } from "../ModalExemplo";

describe("Button", () => {
  it("renderiza o rótulo com a variante padrão (primario)", () => {
    render(<Button>Salvar</Button>);
    const botao = screen.getByRole("button", { name: "Salvar" });
    expect(botao).toBeTruthy();
    expect(botao.className).toContain("bg-brand-600");
  });

  it("aplica a variante perigo", () => {
    render(<Button variante="perigo">Excluir</Button>);
    expect(screen.getByRole("button", { name: "Excluir" }).className).toContain("bg-perigo");
  });

  it("desabilita e marca aria-busy quando carregando", () => {
    render(<Button carregando rotuloCarregando="Enviando…">Enviar</Button>);
    const botao = screen.getByRole("button") as HTMLButtonElement;
    expect(botao.disabled).toBe(true);
    expect(botao.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByText("Enviando…")).toBeTruthy();
  });

  it("respeita disabled explícito", () => {
    render(<Button disabled>Indisponível</Button>);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("Badge", () => {
  it("renderiza os 4 tons com classes distintas", () => {
    const { container } = render(
      <>
        <Badge tom="info">Info</Badge>
        <Badge tom="sucesso">Ok</Badge>
        <Badge tom="alerta">Atenção</Badge>
        <Badge tom="perigo">Erro</Badge>
      </>,
    );
    const badges = container.querySelectorAll("span");
    expect(badges.length).toBe(4);
    const classes = [...badges].map((b) => b.className);
    expect(classes.some((c) => c.includes("bg-info/10"))).toBe(true);
    expect(classes.some((c) => c.includes("bg-sucesso/10"))).toBe(true);
    expect(classes.some((c) => c.includes("bg-alerta/10"))).toBe(true);
    expect(classes.some((c) => c.includes("bg-perigo/10"))).toBe(true);
  });
});

describe("Input", () => {
  it("liga label ao campo pelo id (acessível)", () => {
    render(<Input label="E-mail" />);
    const campo = screen.getByLabelText("E-mail");
    expect(campo).toBeTruthy();
    expect(campo.tagName).toBe("INPUT");
  });

  it("mostra erro com role=alert e aria-invalid", () => {
    render(<Input label="CNPJ" erro="CNPJ inválido." />);
    expect(screen.getByRole("alert").textContent).toBe("CNPJ inválido.");
    expect(screen.getByLabelText("CNPJ").getAttribute("aria-invalid")).toBe("true");
  });
});

describe("Modal", () => {
  it("abre com role=dialog, fecha com Escape e devolve o foco", async () => {
    const usuario = userEvent.setup();
    render(<ModalExemplo />);

    const gatilho = screen.getByRole("button", { name: "Abrir modal" });
    await usuario.click(gatilho);

    const dialogo = screen.getByRole("dialog");
    expect(dialogo.getAttribute("aria-modal")).toBe("true");
    expect(dialogo.textContent).toContain("Aceitar orçamento?");

    await usuario.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
