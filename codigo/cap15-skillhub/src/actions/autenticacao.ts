"use server";

// Server Actions de autenticação (capítulo 14/15).
// O código roda no servidor; o cliente nunca vê os hashes nem a lógica.

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { hash } from "@node-rs/argon2";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { schemaCadastro, schemaLogin } from "@/lib/validacoes";
import { permitido } from "@/lib/rate-limit";

export type EstadoAuth = { sucesso: boolean; erro?: string };

export async function entrar(formData: FormData): Promise<void> {
  const parsed = schemaLogin.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });
  if (!parsed.success) {
    redirect("/login?erro=credenciais");
  }

  // Rate limit por IP (capítulo 19 — A07): 10 tentativas por 15 minutos.
  const cabecalhos = await headers();
  const ip =
    cabecalhos.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconhecido";
  const limite = permitido(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!limite.ok) {
    redirect("/login?erro=limite");
  }

  // Se o usuário tentou acessar uma rota protegida, volta para ela após o login.
  const retorno = formData.get("retorno");
  const destino =
    typeof retorno === "string" && retorno.startsWith("/")
      ? retorno
      : "/painel";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      senha: parsed.data.senha,
      redirectTo: destino,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Credenciais inválidas — mensagem genérica (não revela se o e-mail existe).
      redirect(`/login?erro=credenciais${destino !== "/painel" ? `&retorno=${encodeURIComponent(destino)}` : ""}`);
    }
    throw error; // redirecionamento interno do NextAuth — não engolir
  }
}

export async function cadastrar(
  _prev: EstadoAuth,
  formData: FormData,
): Promise<EstadoAuth> {
  const parsed = schemaCadastro.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!parsed.success) {
    return { sucesso: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const email = parsed.data.email.toLowerCase();
  const jaExiste = await prisma.usuario.findUnique({ where: { email } });
  if (jaExiste) {
    return { sucesso: false, erro: "Este e-mail já está cadastrado." };
  }

  const senhaHash = await hash(parsed.data.senha);
  await prisma.usuario.create({
    data: { nome: parsed.data.nome, email, senhaHash },
  });

  // Loga automaticamente após o cadastro e vai para o painel.
  try {
    await signIn("credentials", {
      email,
      senha: parsed.data.senha,
      redirectTo: "/painel",
    });
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw error;
  }

  return { sucesso: true };
}

export async function sair(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
