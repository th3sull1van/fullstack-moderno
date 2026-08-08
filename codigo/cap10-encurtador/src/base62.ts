/**
 * base62 — o coração do encurtador.
 *
 * Converte um ID numérico em uma string curta e legível usando o alfabeto
 * a-z A-Z 0-9 (62 símbolos). Com 6 caracteres cabem 62^6 ≈ 56 bilhões de URLs.
 */

export const ALFABETO =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const BASE = ALFABETO.length; // 62

/** Converte um ID numérico em código curto. Ex.: 1 → "b", 62 → "ba". */
export function codificar(id: number): string {
  if (!Number.isSafeInteger(id) || id < 0) {
    throw new RangeError(`id inválido: ${id}`);
  }
  let resto = id;
  let saida = "";
  do {
    const digito = ALFABETO[resto % BASE];
    if (digito === undefined) throw new Error("alfabeto corrompido");
    saida = digito + saida;
    resto = Math.floor(resto / BASE);
  } while (resto > 0);
  return saida;
}

/** Converte um código curto de volta em ID numérico. */
export function decodificar(codigo: string): number {
  let id = 0;
  for (const char of codigo) {
    const digito = ALFABETO.indexOf(char);
    if (digito === -1) {
      throw new RangeError(`caractere fora do alfabeto base62: "${char}"`);
    }
    id = id * BASE + digito;
  }
  return id;
}
