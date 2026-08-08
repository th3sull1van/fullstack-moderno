"use client";

// Formulário de anúncio conectado à Server Action criarServico via
// useActionState (React 19): recebe estado de erro/sucesso e indicador de
// envio sem nenhum estado global no cliente.

import { useActionState } from "react";

import { criarServico } from "@/actions/servicos";
import { CATEGORIAS, type EstadoServico } from "@/lib/validacoes";

const estadoInicial: EstadoServico = {};

export function FormularioDeServico() {
  const [estado, acao, pendente] = useActionState(criarServico, estadoInicial);

  return (
    <form action={acao} className="formulario">
      <div className="campo">
        <label htmlFor="titulo">Título do serviço</label>
        <input
          id="titulo"
          name="titulo"
          placeholder="Ex.: Aula particular de React"
          required
          maxLength={80}
        />
      </div>

      <div className="campo">
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          name="descricao"
          placeholder="O que você entrega, em quanto tempo, o que está incluso…"
          required
          minLength={20}
          maxLength={1000}
        />
      </div>

      <div className="campo">
        <label htmlFor="precoCentavos">Preço (em centavos)</label>
        <input
          id="precoCentavos"
          name="precoCentavos"
          type="number"
          min={1}
          step={1}
          placeholder="Ex.: 9000 = R$ 90,00"
          required
        />
      </div>

      <div className="campo">
        <label htmlFor="categoria">Categoria</label>
        <select id="categoria" name="categoria" required defaultValue="">
          <option value="" disabled>
            Selecione…
          </option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <button className="botao primario" type="submit" disabled={pendente}>
          {pendente ? "Publicando…" : "Publicar serviço"}
        </button>
      </div>

      {estado && "erro" in estado && estado.erro && (
        <p className="erro" role="alert">
          {estado.erro}
        </p>
      )}
      {estado && "sucesso" in estado && estado.sucesso && (
        <p className="ok" role="status">
          Serviço publicado! Ele já aparece na listagem.
        </p>
      )}
    </form>
  );
}
