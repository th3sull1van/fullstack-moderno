/** Minúsculas + remove acentos (NFD) — mesma técnica do capítulo 11. */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
