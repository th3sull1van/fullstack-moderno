import type { HTMLAttributes } from "react";

export type TomBadge = "info" | "sucesso" | "alerta" | "perigo";

type Props = HTMLAttributes<HTMLSpanElement> & {
  tom?: TomBadge;
};

const TONS: Record<TomBadge, string> = {
  info: "bg-info/10 text-info border-info/30",
  sucesso: "bg-sucesso/10 text-sucesso border-sucesso/30",
  alerta: "bg-alerta/10 text-alerta border-alerta/30",
  perigo: "bg-perigo/10 text-perigo border-perigo/30",
};

/** Selo de status com 4 tons — o texto deve ser legível (contraste WCAG AA). */
export function Badge({ tom = "info", children, ...resto }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TONS[tom]}`}
      {...resto}
    >
      {children}
    </span>
  );
}
