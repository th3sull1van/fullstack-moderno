"use client";

import { useActionState } from "react";

import { cadastrar, type EstadoAuth } from "@/actions/autenticacao";

const estadoInicial: EstadoAuth = { sucesso: false };

export function FormularioCadastro() {
  const [estado, acao, pendente] = useActionState(cadastrar, estadoInicial);

  return (
    <form action={acao} className="formulario">
      <div className="campo">
        <label htmlFor="nome">Nome</label>
        <input id="nome" name="nome" autoComplete="name" required maxLength={80} />
      </div>
      <div className="campo">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="campo">
        <label htmlFor="senha">Senha (mínimo 8 caracteres)</label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <button className="botao primario" type="submit" disabled={pendente}>
        {pendente ? "Criando conta…" : "Criar conta"}
      </button>
      {estado.erro && (
        <p className="erro" role="alert">
          {estado.erro}
        </p>
      )}
    </form>
  );
}
