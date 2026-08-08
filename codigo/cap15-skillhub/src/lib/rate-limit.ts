// Rate limiter de janela deslizante (capítulo 19 — A07/A09).
//
// Implementação em memória: suficiente para uma instância e para estudo.
// Em produção com várias instâncias, troque o armazenamento por Redis
// (capítulo 21) — a interface é a mesma.

type Janela = { contador: number; reiniciaEm: number };

const janelas = new Map<string, Janela>();

// Limpa entradas expiradas periodicamente para não vazar memória.
setInterval(() => {
  const agora = Date.now();
  for (const [chave, janela] of janelas) {
    if (janela.reiniciaEm <= agora) janelas.delete(chave);
  }
}, 60_000).unref();

export function permitido(
  chave: string,
  limite: number,
  janelaMs: number,
): { ok: boolean; tentativasRestantes: number } {
  const agora = Date.now();
  const atual = janelas.get(chave);

  if (!atual || atual.reiniciaEm <= agora) {
    janelas.set(chave, { contador: 1, reiniciaEm: agora + janelaMs });
    return { ok: true, tentativasRestantes: limite - 1 };
  }

  if (atual.contador >= limite) {
    return { ok: false, tentativasRestantes: 0 };
  }

  atual.contador += 1;
  return { ok: true, tentativasRestantes: limite - atual.contador };
}

export function reiniciar(chave: string): void {
  janelas.delete(chave);
}
