"use client";

// Formulário de login: um form HTML comum cuja action é a Server Action
// "entrar" — o Next.js serializa os campos e envia para o servidor.

import { entrar } from "@/actions/autenticacao";

export function FormularioLogin({ retorno }: { retorno?: string }) {
  return (
    <form action={entrar} className="formulario">
      <input type="hidden" name="retorno" value={retorno ?? ""} />
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
        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <button className="botao primario" type="submit">
        Entrar
      </button>
    </form>
  );
}
