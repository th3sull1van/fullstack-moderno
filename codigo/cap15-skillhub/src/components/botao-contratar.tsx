"use client";

// Componente client com interatividade pontual: chama a Server Action
// contratarServico via useTransition e exibe o resultado no mesmo lugar.
// A autorização é revalidada DENTRO da action — este botão é só a UI.

import { useState, useTransition } from "react";
import Link from "next/link";

import {
  contratarServico,
  type ResultadoContratacao,
} from "@/actions/servicos";

export function BotaoContratar({
  servicoId,
  ehDono,
  logado,
}: {
  servicoId: string;
  ehDono: boolean;
  logado: boolean;
}) {
  const [pendente, startTransition] = useTransition();
  const [resultado, setResultado] = useState<ResultadoContratacao | null>(null);

  if (ehDono) {
    return <p className="aviso">Este é o seu anúncio — você não pode contratá-lo.</p>;
  }

  if (!logado) {
    return (
      <Link href={`/login?retorno=/servicos/${servicoId}`} className="botao primario">
        Entre para contratar
      </Link>
    );
  }

  function contratar() {
    setResultado(null);
    startTransition(async () => {
      const r = await contratarServico(servicoId);
      setResultado(r);
    });
  }

  return (
    <div>
      <button
        className="botao primario"
        onClick={contratar}
        disabled={pendente}
      >
        {pendente ? "Contratando…" : "Contratar serviço"}
      </button>
      {resultado && !resultado.sucesso && (
        <p className="erro" role="alert">
          {resultado.erro}
        </p>
      )}
      {resultado?.sucesso && (
        <p className="ok" role="status">
          Pedido criado! Acompanhe em seu painel.
        </p>
      )}
    </div>
  );
}
