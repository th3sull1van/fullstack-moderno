import Link from "next/link";

import { auth } from "@/lib/auth";
import { sair } from "@/actions/autenticacao";

// Server Component: lê a sessão no servidor e renderiza a navegação
// de acordo — sem flash de "logado/deslogado" no cliente.
export async function Header() {
  const sessao = await auth();

  return (
    <header className="cabecalho">
      <div className="cabecalho-inner">
        <Link href="/" className="logo">
          Skill<span>Hub</span>
        </Link>
        <nav className="nav">
          <Link href="/servicos">Serviços</Link>
          {sessao?.user ? (
            <>
              <Link href="/painel">Painel</Link>
              <form action={sair}>
                <button className="botao pequeno" type="submit">
                  Sair ({sessao.user.name ?? sessao.user.email})
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="botao primario pequeno">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
