import type { Metadata } from "next";

import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SkillHub — Marketplace de serviços",
    template: "%s · SkillHub",
  },
  description:
    "SkillHub: profissionais anunciam serviços e clientes fazem pedidos. Projeto do capítulo 15 de Full Stack Moderno.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <main className="container">{children}</main>
        <footer className="rodape">
          <p>
            SkillHub — projeto didático do livro{" "}
            <em>Full Stack Moderno</em> (capítulo 15)
          </p>
        </footer>
      </body>
    </html>
  );
}
