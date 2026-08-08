/**
 * Vetores e busca por similaridade (cosseno).
 * É a matemática por trás do pgvector: quanto maior o cosseno entre o vetor
 * da pergunta e o de um documento, mais relevante o documento.
 */

export type Vetor = number[];

export function cosseno(a: Vetor, b: Vetor): number {
  if (a.length !== b.length) {
    throw new Error("Vetores de dimensões diferentes");
  }
  let produto = 0;
  let normaA = 0;
  let normaB = 0;
  for (let i = 0; i < a.length; i++) {
    produto += a[i] * b[i];
    normaA += a[i] * a[i];
    normaB += b[i] * b[i];
  }
  if (normaA === 0 || normaB === 0) return 0;
  return produto / (Math.sqrt(normaA) * Math.sqrt(normaB));
}

export interface Documento {
  id: string;
  texto: string;
  vetor: Vetor;
}

/** Retorna os `k` documentos mais próximos da pergunta, com a pontuação. */
export function buscarTopK(
  documentos: Documento[],
  pergunta: Vetor,
  k: number,
): Array<{ documento: Documento; pontuacao: number }> {
  return documentos
    .map((documento) => ({
      documento,
      pontuacao: cosseno(pergunta, documento.vetor),
    }))
    .sort((a, b) => b.pontuacao - a.pontuacao)
    .slice(0, k);
}
