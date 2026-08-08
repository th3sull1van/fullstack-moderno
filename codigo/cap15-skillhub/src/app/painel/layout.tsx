import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

// Layout protegido (capítulo 15): chama auth() no topo e redireciona.
// Qualquer rota dentro de /painel herda esta proteção.
export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await auth();
  if (!sessao?.user) {
    redirect("/login");
  }
  return <>{children}</>;
}
