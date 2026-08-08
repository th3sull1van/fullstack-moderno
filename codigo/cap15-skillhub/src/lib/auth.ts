// Configuração do Auth.js (v5) com provider de credenciais.
// A sessão é um JWT assinado (cookie httpOnly). A senha é verificada com
// argon2id — nunca compare senhas em texto puro (capítulo 14 do livro).

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verify } from "@node-rs/argon2";

import { prisma } from "@/lib/prisma";
import { schemaLogin } from "@/lib/validacoes";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credenciais) {
        const parsed = schemaLogin.safeParse(credenciais);
        if (!parsed.success) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!usuario) return null;

        const senhaOk = await verify(usuario.senhaHash, parsed.data.senha);
        if (!senhaOk) return null;

        return { id: usuario.id, name: usuario.nome, email: usuario.email };
      },
    }),
  ],
  callbacks: {
    // Propaga o id do usuário do token para a sessão.
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
