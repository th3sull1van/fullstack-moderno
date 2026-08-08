"use client";

// Botão de excluir com confirmação. A autorização (RBAC) é verificada na
// Server Action — este componente nunca decide nada sozinho.

import { useState, useTransition } from "react";

import { excluirServico, type ResultadoExclusao } from "@/actions/servicos";

export function BotaoExcluir({ servicoId }: { servicoId: string }) {
  const [pendente, startTransition] = useTransition();
  const [resultado, setResultado] = useState<ResultadoExclusao | null>(null);

  function excluir() {
    if (!window.confirm("Excluir este serviço? Essa ação não pode ser desfeita.")) {
      return;
    }
    setResultado(null);
    startTransition(async () => {
      const r = await excluirServico(servicoId);
      setResultado(r);
      if (r.sucesso) {
        // Recarrega a listagem/painel para refletir a exclusão.
        window.location.reload();
      }
    });
  }

  return (
    <span>
      <button
        className="botao pequeno perigo"
        onClick={excluir}
        disabled={pendente}
      >
        {pendente ? "Excluindo…" : "Excluir"}
      </button>
      {resultado && !resultado.sucesso && (
        <span className="erro" role="alert">
          {" "}
          {resultado.erro}
        </span>
      )}
    </span>
  );
}
