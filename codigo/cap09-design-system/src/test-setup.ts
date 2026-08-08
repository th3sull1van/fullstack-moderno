import { beforeEach } from "vitest";

/** Stub de Storage (ver cap07 — jsdom via vitest não expõe localStorage). */
class MemoriaStorage implements Storage {
  private dados = new Map<string, string>();
  get length(): number {
    return this.dados.size;
  }
  clear(): void {
    this.dados.clear();
  }
  getItem(chave: string): string | null {
    return this.dados.get(chave) ?? null;
  }
  key(indice: number): string | null {
    return [...this.dados.keys()][indice] ?? null;
  }
  removeItem(chave: string): void {
    this.dados.delete(chave);
  }
  setItem(chave: string, valor: string): void {
    this.dados.set(chave, String(valor));
  }
}

if (typeof window !== "undefined" && !window.localStorage) {
  Object.defineProperty(window, "localStorage", {
    value: new MemoriaStorage(),
    configurable: true,
  });
}

beforeEach(() => {
  window.localStorage?.clear();
});
