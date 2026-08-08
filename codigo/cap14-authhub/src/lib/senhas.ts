import { hash, verify } from "@node-rs/argon2";

/** Parâmetros recomendados pela OWASP para argon2id. */
const OPCOES = {
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashSenha(senha: string): Promise<string> {
  return hash(senha, OPCOES);
}

export function verificarSenha(hashArmazenado: string, senha: string): Promise<boolean> {
  try {
    return verify(hashArmazenado, senha, OPCOES);
  } catch {
    return Promise.resolve(false);
  }
}

/** Política de senha forte do capítulo 14. */
export function validarForcaSenha(senha: string): string | null {
  if (senha.length < 8) return "A senha deve ter pelo menos 8 caracteres";
  if (!/[A-Z]/.test(senha)) return "A senha deve ter pelo menos uma letra maiúscula";
  if (!/[a-z]/.test(senha)) return "A senha deve ter pelo menos uma letra minúscula";
  if (!/[0-9]/.test(senha)) return "A senha deve ter pelo menos um número";
  return null;
}
