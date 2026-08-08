import { useEffect, useState } from "react";

/**
 * useLocalStorage — estado React persistido no localStorage.
 *
 * - Leitura preguiçosa (lazy init): só lê o storage na primeira renderização;
 * - Escrita via efeito: a UI reage primeiro, o storage sincroniza depois;
 * - Aceita atualizador funcional igual ao setState (imutabilidade garantida).
 */
export function useLocalStorage<T>(
  chave: string,
  valorInicial: T,
): [T, (valor: T | ((atual: T) => T)) => void] {
  const [valor, setValor] = useState<T>(() => {
    try {
      const bruto = window.localStorage.getItem(chave);
      return bruto !== null ? (JSON.parse(bruto) as T) : valorInicial;
    } catch {
      return valorInicial; // storage indisponível ou JSON corrompido
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
      // quota excedida / modo privado — falha silenciosa é aceitável aqui
    }
  }, [chave, valor]);

  return [valor, setValor];
}
