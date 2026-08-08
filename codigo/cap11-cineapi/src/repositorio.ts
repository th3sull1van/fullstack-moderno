import { randomUUID } from "node:crypto";
import { normalizar, type Filme, type NovoFilme } from "./filmes.js";

/**
 * Repositório em memória. Para produção, troque por PostgreSQL
 * (cap. 12/13) — a interface permanece: listar, buscar, criar, atualizar,
 * excluir.
 */
export class RepositorioFilmes {
  private filmes = new Map<string, Filme>();

  semear(lista: NovoFilme[]): void {
    for (const filme of lista) this.criar(filme);
  }

  criar(dados: NovoFilme): Filme {
    const filme: Filme = { ...dados, id: randomUUID() };
    this.filmes.set(filme.id, filme);
    return filme;
  }

  obter(id: string): Filme | undefined {
    return this.filmes.get(id);
  }

  substituir(id: string, dados: NovoFilme): Filme | undefined {
    const existente = this.filmes.get(id);
    if (!existente) return undefined;
    const atualizado: Filme = { ...dados, id };
    this.filmes.set(id, atualizado);
    return atualizado;
  }

  atualizarParcial(id: string, mudancas: Partial<NovoFilme>): Filme | undefined {
    const existente = this.filmes.get(id);
    if (!existente) return undefined;
    const atualizado: Filme = { ...existente, ...mudancas, id };
    this.filmes.set(id, atualizado);
    return atualizado;
  }

  excluir(id: string): boolean {
    return this.filmes.delete(id);
  }

  /** Busca por título/gênero com normalização de acentos (case-insensitive). */
  buscar(texto: string): Filme[] {
    const alvo = normalizar(texto);
    return [...this.filmes.values()].filter((f) =>
      normalizar(`${f.titulo} ${f.genero}`).includes(alvo),
    );
  }

  listar(
    opcoes: { genero?: string; ano?: number; q?: string; limite: number; offset: number },
  ): { filmes: Filme[]; total: number } {
    let resultado = [...this.filmes.values()];

    if (opcoes.genero) {
      resultado = resultado.filter((f) => f.genero === opcoes.genero);
    }
    if (opcoes.ano !== undefined) {
      resultado = resultado.filter((f) => f.ano === opcoes.ano);
    }
    if (opcoes.q) {
      const alvo = normalizar(opcoes.q);
      resultado = resultado.filter((f) =>
        normalizar(`${f.titulo} ${f.genero}`).includes(alvo),
      );
    }

    resultado.sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
    const total = resultado.length;
    const filmes = resultado.slice(opcoes.offset, opcoes.offset + opcoes.limite);
    return { filmes, total };
  }

  /** Duplicata: compara título normalizado (ignora acentos e caixa). */
  existeTitulo(titulo: string, ignorarId?: string): boolean {
    const alvo = normalizar(titulo);
    return [...this.filmes.values()].some(
      (f) => f.id !== ignorarId && normalizar(f.titulo) === alvo,
    );
  }
}
