/**
 * Rate limit com janela deslizante — implementado à mão (desafio do capítulo).
 * Cada chave (ex.: IP) guarda os timestamps das tentativas recentes; se a
 * contagem na janela ultrapassar o limite, a requisição é bloqueada.
 *
 * Em produção com múltiplas instâncias, mova o estado para Redis (cap. 21) —
 * a interface permanece a mesma.
 */
export class RateLimiter {
  private tentativas = new Map<string, number[]>();

  constructor(
    private readonly limite: number,
    private readonly janelaMs: number,
  ) {}

  /** Registra uma tentativa e devolve true se ainda dentro do limite. */
  registrar(chave: string, agora = Date.now()): boolean {
    const historico = (this.tentativas.get(chave) ?? []).filter(
      (t) => agora - t < this.janelaMs,
    );
    historico.push(agora);
    this.tentativas.set(chave, historico);
    if (historico.length > this.limite) {
      this.tentativas.delete(chave); // janela já estourou; próximo ciclo recomeça
      return false;
    }
    return true;
  }

  /** Segundos restantes até a janela liberar (para o header Retry-After). */
  segundosRestantes(chave: string, agora = Date.now()): number {
    const historico = (this.tentativas.get(chave) ?? []).filter(
      (t) => agora - t < this.janelaMs,
    );
    if (historico.length === 0) return 0;
    const maisAntigo = Math.min(...historico);
    return Math.max(1, Math.ceil((maisAntigo + this.janelaMs - agora) / 1000));
  }
}
