// Schemas de validação (Zod). Toda entrada externa passa por aqui ANTES de
// tocar o banco — o navegador pode enviar qualquer coisa, inclusive dados
// manipulados (capítulo 15 e 19 do livro).

import { z } from "zod";

export const CATEGORIAS = [
  "Aulas",
  "Design",
  "Tecnologia",
  "Consertos",
  "Consultoria",
  "Artes",
] as const;

export const schemaServico = z.object({
  titulo: z.string().trim().min(3, "Título precisa de pelo menos 3 caracteres").max(80),
  descricao: z.string().trim().min(20, "Descreva o serviço em pelo menos 20 caracteres").max(1000),
  precoCentavos: z.coerce
    .number({ message: "Preço deve ser um número" })
    .int("Preço deve ser um valor inteiro (em centavos)")
    .positive("Preço deve ser maior que zero"),
  categoria: z.enum(CATEGORIAS, { message: "Categoria inválida" }),
});

export const schemaCadastro = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(80),
  email: z.string().trim().email("E-mail inválido").max(160),
  senha: z.string().min(8, "A senha precisa de pelo menos 8 caracteres").max(128),
});

export const schemaLogin = z.object({
  email: z.string().trim().email("E-mail inválido"),
  senha: z.string().min(1, "Informe a senha"),
});

export type DadosServico = z.infer<typeof schemaServico>;
export type EstadoServico =
  | { sucesso: true }
  | { sucesso: false; erro: string }
  | Record<string, never>;
