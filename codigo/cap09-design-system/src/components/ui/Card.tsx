import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLElement> & {
  titulo?: string;
};

/** Cartão de superfície — usa o token de sombra do @theme. */
export function Card({ titulo, children, ...resto }: Props) {
  return (
    <section
      className="rounded-lg border border-neutro-200 bg-white p-5 shadow-painel dark:border-neutro-700 dark:bg-neutro-900"
      {...resto}
    >
      {titulo && (
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutro-500">
          {titulo}
        </h3>
      )}
      {children}
    </section>
  );
}
