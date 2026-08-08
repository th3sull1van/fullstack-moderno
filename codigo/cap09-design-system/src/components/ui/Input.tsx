import { useId, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /** Mensagem de erro — deixa o campo em estado inválido e liga ao aria. */
  erro?: string;
  /** Texto de ajuda abaixo do campo. */
  ajuda?: string;
};

/** Campo de texto do design system — sempre com label ligada (acessível). */
export function Input({ label, erro, ajuda, id, ...resto }: Props) {
  const gerado = useId();
  const idFinal = id ?? gerado;
  const idErro = erro ? `${idFinal}-erro` : undefined;
  const idAjuda = ajuda ? `${idFinal}-ajuda` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={idFinal} className="text-sm font-medium text-neutro-700 dark:text-neutro-200">
        {label}
      </label>
      <input
        id={idFinal}
        aria-invalid={erro ? true : undefined}
        aria-describedby={idErro ?? idAjuda}
        className={`rounded-md border bg-white px-3 py-2 text-sm text-neutro-900 transition-colors placeholder:text-neutro-500 dark:bg-neutro-900 dark:text-neutro-50 ${
          erro
            ? "border-perigo focus:border-perigo"
            : "border-neutro-200 hover:border-neutro-500 dark:border-neutro-700"
        }`}
        {...resto}
      />
      {erro ? (
        <p id={idErro} className="text-xs text-perigo" role="alert">
          {erro}
        </p>
      ) : ajuda ? (
        <p id={idAjuda} className="text-xs text-neutro-500">
          {ajuda}
        </p>
      ) : null}
    </div>
  );
}
