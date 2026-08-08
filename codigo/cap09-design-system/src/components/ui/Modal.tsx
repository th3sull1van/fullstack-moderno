"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: ReactNode;
};

/**
 * Modal acessível: role="dialog" + aria-modal, fecha com Escape, devolve o
 * foco ao gatilho ao fechar. (Focus trap completo é o desafio do capítulo.)
 */
export function Modal({ aberto, aoFechar, titulo, children }: Props) {
  const gatilhoAnterior = useRef<HTMLElement | null>(null);
  const refDialogo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    gatilhoAnterior.current = document.activeElement as HTMLElement;

    function aoTeclado(evento: KeyboardEvent) {
      if (evento.key === "Escape") aoFechar();
    }
    document.addEventListener("keydown", aoTeclado);
    refDialogo.current?.focus();

    return () => {
      document.removeEventListener("keydown", aoTeclado);
      gatilhoAnterior.current?.focus();
    };
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutro-900/60 p-4 backdrop-blur-sm"
      onClick={aoFechar}
    >
      <div
        ref={refDialogo}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-flutuante dark:bg-neutro-900"
      >
        <header className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar modal"
            className="cursor-pointer rounded-md px-2 py-1 text-neutro-500 hover:bg-neutro-100 dark:hover:bg-neutro-700"
          >
            ✕
          </button>
        </header>
        <div className="text-sm text-neutro-700 dark:text-neutro-200">{children}</div>
      </div>
    </div>
  );
}
