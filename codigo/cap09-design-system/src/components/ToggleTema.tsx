"use client";

import { useEffect, useState } from "react";

/** Alterna a classe .dark no <html> e persiste a escolha no localStorage. */
export function ToggleTema() {
  const [escuro, setEscuro] = useState(false);

  useEffect(() => {
    setEscuro(document.documentElement.classList.contains("dark"));
  }, []);

  function alternar() {
    const proximo = !escuro;
    setEscuro(proximo);
    document.documentElement.classList.toggle("dark", proximo);
    try {
      localStorage.setItem("orcaui:tema", proximo ? "escuro" : "claro");
    } catch {
      // storage indisponível — o tema segue funcionando na sessão
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={escuro}
      className="cursor-pointer rounded-md border border-neutro-200 px-3 py-1.5 text-xs font-medium text-neutro-700 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-neutro-700 dark:text-neutro-200 dark:hover:text-brand-500"
    >
      {escuro ? "☀️ Claro" : "🌙 Escuro"}
    </button>
  );
}
