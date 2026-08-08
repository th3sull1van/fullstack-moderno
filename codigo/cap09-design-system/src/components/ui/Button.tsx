import type { ButtonHTMLAttributes } from "react";

export type VarianteBotao = "primario" | "secundario" | "fantasma" | "perigo";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBotao;
  /** Estado de carregamento: desabilita e troca o rótulo. */
  carregando?: boolean;
  /** Rótulo exibido enquanto carrega. */
  rotuloCarregando?: string;
};

const ESTILOS: Record<VarianteBotao, string> = {
  primario:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-700 disabled:bg-neutro-200 disabled:text-neutro-500",
  secundario:
    "border border-brand-600 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 disabled:border-neutro-200 disabled:text-neutro-500",
  fantasma:
    "text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 disabled:text-neutro-500",
  perigo:
    "bg-perigo text-white hover:bg-red-700 active:bg-red-800 disabled:bg-neutro-200 disabled:text-neutro-500",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed";

/** Botão do design system OrçaUI — 4 variantes + estados. */
export function Button({
  variante = "primario",
  carregando = false,
  rotuloCarregando = "Carregando…",
  disabled,
  children,
  ...resto
}: Props) {
  return (
    <button
      type="button"
      className={`${BASE} ${ESTILOS[variante]}`}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...resto}
    >
      {carregando && (
        <span aria-hidden="true" className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {carregando ? rotuloCarregando : children}
    </button>
  );
}
