import { PrismaClient } from "@prisma/client";
import { hashSenha } from "../src/lib/senhas.js";

const prisma = new PrismaClient();

const usuariosDemo = [
  {
    nome: "Administrador",
    email: "admin@authhub.dev",
    senha: "Admin-forte-123",
    papel: "ADMIN",
  },
  {
    nome: "Moderadora",
    email: "moderadora@authhub.dev",
    senha: "Moderadora-forte-123",
    papel: "MODERADOR",
  },
  {
    nome: "Usuária Comum",
    email: "usuario@authhub.dev",
    senha: "Usuario-forte-123",
    papel: "USUARIO",
  },
];

for (const demo of usuariosDemo) {
  const senhaHash = await hashSenha(demo.senha);
  await prisma.usuario.upsert({
    where: { email: demo.email },
    update: { senhaHash },
    create: {
      nome: demo.nome,
      email: demo.email,
      senhaHash,
      papel: demo.papel,
    },
  });
  console.log(`✔ usuário ${demo.email} (${demo.papel})`);
}

await prisma.$disconnect();
