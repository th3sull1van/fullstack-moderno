/**
 * Componente JSX customizado usável DENTRO dos artigos MDX — a prova de que
 * o MDX mistura Markdown com React (critério de aceite do capítulo 8).
 */
export function Dica({ children }: { children: React.ReactNode }) {
  return (
    <aside className="dica">
      <strong>💡 Dica do capítulo</strong>
      {children}
    </aside>
  );
}
