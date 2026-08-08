// Utilitários de formatação e validação do SkillHub.
// Preços são armazenados em centavos (inteiro) para evitar erros de ponto
// flutuante — a formatação acontece apenas na exibição.

export function formatarMoeda(centavos: number): string {
  const valor = centavos / 100;
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function validarEmail(email: string): boolean {
  // Validação pragmática: algo@algo.algo
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
