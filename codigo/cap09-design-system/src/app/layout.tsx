import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrçaUI — Design System",
  description:
    "Design system do OrçaFácil com Tailwind v4 — projeto do capítulo 9 do livro Full Stack Moderno.",
};

/** Aplica o tema ANTES da hidratação (sem flash de tema incorreto — FOUC). */
const scriptTema = `
(function () {
  try {
    var tema = localStorage.getItem("orcaui:tema");
    if (tema === "escuro" || (!tema && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>
        <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
          <Link href="/design-system" className="font-mono text-lg font-bold tracking-tight">
            orça<span className="text-brand-500">ui</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/design-system" className="text-neutro-500 hover:text-neutro-900 dark:hover:text-neutro-50">
              Componentes
            </Link>
            <ToggleTema />
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}

// Componente client separado (arquivo abaixo) para o botão de alternância
import { ToggleTema } from "@/components/ToggleTema";
