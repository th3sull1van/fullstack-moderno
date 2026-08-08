/**
 * Domínio da CineAPI: tipos do recurso filme e o "algoritmo útil do capítulo" —
 * busca por similaridade simples com normalização (minúsculas + sem acentos).
 */

export const GENEROS = [
  "acao",
  "aventura",
  "animacao",
  "comedia",
  "documentario",
  "drama",
  "ficcao-cientifica",
  "romance",
  "suspense",
  "terror",
] as const;

export type Genero = (typeof GENEROS)[number];

export type Filme = {
  id: string;
  titulo: string;
  genero: Genero;
  ano: number; // 1888–2026 (primeiro filme da história: Roundhay Garden Scene, 1888)
  diretor: string;
  duracaoMin: number;
};

export type NovoFilme = Omit<Filme, "id">;

/**
 * Normaliza texto para busca: minúsculas + remove acentos (NFD + strip).
 * É a base de autocomplete e busca case-insensitive em português.
 * Ex.: "AÇÃO" → "acao"; "Anéis" → "aneis".
 */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Constantes de validação (contrato do capítulo 11). */
export const ANO_MINIMO = 1888;
export const ANO_MAXIMO = 2026;

export function eGenero(valor: unknown): valor is Genero {
  return typeof valor === "string" && (GENEROS as readonly string[]).includes(valor);
}
