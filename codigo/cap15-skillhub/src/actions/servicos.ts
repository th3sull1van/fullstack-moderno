"use server";

// Server Actions de serviços (capítulo 15).
// Regras de segurança aplicadas AQUI, no servidor:
//   1. autentica (auth())
//   2. valida com Zod
//   3. autoriza (RBAC: só o dono edita/exclui)
//   4. age e revalida o cache

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { schemaServico } from "@/lib/validacoes";
import type { EstadoServico } from "@/lib/validacoes";

function primeiraMensagemDeErro(erro: { issues: { message: string }[] }): string {
  return erro.issues[0]?.message ?? "Dados inválidos.";
}

export async function criarServico(
  _prev: EstadoServico,
  formData: FormData,
): Promise<EstadoServico> {
  const sessao = await auth();
  if (!sessao?.user) {
    return { sucesso: false, erro: "Faça login para anunciar um serviço." };
  }

  const parsed = schemaServico.safeParse({
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao"),
    precoCentavos: formData.get("precoCentavos"),
    categoria: formData.get("categoria"),
  });

  if (!parsed.success) {
    return { sucesso: false, erro: primeiraMensagemDeErro(parsed.error) };
  }

  await prisma.servico.create({
    data: { ...parsed.data, donoId: sessao.user.id },
  });

  revalidatePath("/servicos");
  revalidatePath("/painel");
  return { sucesso: true };
}

export type ResultadoExclusao = { sucesso: boolean; erro?: string };

export async function excluirServico(id: string): Promise<ResultadoExclusao> {
  const sessao = await auth();
  if (!sessao?.user) {
    return { sucesso: false, erro: "Faça login." };
  }

  const servico = await prisma.servico.findUnique({ where: { id } });
  if (!servico) {
    return { sucesso: false, erro: "Serviço não encontrado." };
  }

  // RBAC: apenas o dono pode excluir — nunca confie no cliente.
  if (servico.donoId !== sessao.user.id) {
    return { sucesso: false, erro: "Você não tem permissão para excluir este serviço." };
  }

  await prisma.servico.delete({ where: { id } });
  revalidatePath("/servicos");
  revalidatePath("/painel");
  return { sucesso: true };
}

export type ResultadoContratacao = { sucesso: boolean; erro?: string };

export async function contratarServico(servicoId: string): Promise<ResultadoContratacao> {
  const sessao = await auth();
  if (!sessao?.user) {
    return { sucesso: false, erro: "Faça login para contratar." };
  }

  const servico = await prisma.servico.findUnique({ where: { id: servicoId } });
  if (!servico) {
    return { sucesso: false, erro: "Serviço não encontrado." };
  }

  // Você não pode contratar o seu próprio serviço.
  if (servico.donoId === sessao.user.id) {
    return { sucesso: false, erro: "Você não pode contratar o seu próprio serviço." };
  }

  await prisma.pedido.create({
    data: { servicoId, clienteId: sessao.user.id },
  });

  revalidatePath(`/servicos/${servicoId}`);
  revalidatePath("/painel");
  return { sucesso: true };
}
