import Link from "next/link";

import { FormularioLogin } from "@/components/formulario-login";

export const metadata = {
  title: "Entrar",
};

type Busca = { erro?: string; retorno?: string };

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<Busca>;
}) {
  const params = await searchParams;

  return (
    <div style={{ maxWidth: 420 }}>
      <h1>Entrar no SkillHub</h1>
      {params.erro === "credenciais" && (
        <p className="erro" role="alert">
          E-mail ou senha inválidos. Verifique e tente novamente.
        </p>
      )}
      {params.erro === "limite" && (
        <p className="erro" role="alert">
          Muitas tentativas. Aguarde alguns minutos e tente novamente.
        </p>
      )}
      <FormularioLogin retorno={params.retorno} />
      <p style={{ marginTop: "1.2rem" }}>
        Novo por aqui? <Link href="/cadastro">Crie sua conta</Link> — leva menos
        de um minuto.
      </p>
      <p className="aviso">
        Conta de demonstração: <code>ana@exemplo.com</code> /{" "}
        <code>senha-forte-123</code>
      </p>
    </div>
  );
}
