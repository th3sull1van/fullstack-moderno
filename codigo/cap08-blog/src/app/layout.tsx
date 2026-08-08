import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Diário Full Stack",
    template: "%s · Diário Full Stack",
  },
  description:
    "Blog em MDX com ISR — projeto do capítulo 8 (Next.js) do livro Full Stack Moderno.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="site__cabecalho">
          <Link href="/blog" className="site__logo">
            📓 Diário Full Stack
          </Link>
          <nav aria-label="Principal">
            <Link href="/blog">Posts</Link>
          </nav>
        </header>
        {children}
        <footer className="site__rodape">
          <p>Escrito em MDX · pré-renderizado com ISR · deploy na Vercel</p>
        </footer>
      </body>
    </html>
  );
}
