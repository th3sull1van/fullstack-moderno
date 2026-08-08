/**
 * Validação de URL: aceita apenas http/https com hostname presente.
 * Rejeita protocolos exóticos (javascript:, file: etc.).
 */
export function validarUrl(texto: string): string | null {
  if (typeof texto !== "string" || texto.trim() === "") return null;
  try {
    const url = new URL(texto.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.hostname === "") return null;
    return url.toString();
  } catch {
    return null;
  }
}
