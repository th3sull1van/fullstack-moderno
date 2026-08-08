import Link from "next/link";

import { FormularioCadastro } from "@/components/formulario-cadastro";

export const metadata = {
  title: "Criar conta",
};

export default function PaginaCadastro() {
  return (
    <div style={{ maxWidth: 420 }}>
      <h1>Criar sua conta</h1>
      <p className="aviso">
        Sua senha é armazenada com hash argon2id — nunca em texto puro.
      </p>
      <FormularioCadastro />
      <p style={{ marginTop: "1.2rem" }}>
        Já tem conta? <Link href="/login">Entrar</Link>
      </p>
    </div>
  );
}
