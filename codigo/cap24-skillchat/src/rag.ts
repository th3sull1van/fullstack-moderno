/**
 * Pipeline RAG completo: indexação (escrita) e consulta (pergunta).
 *
 * Na produção o banco vetorial é o pgvector (PostgreSQL + Prisma, como no
 * capítulo 24); aqui o repositório é em memória para o código ficar
 * autocontido e testável.
 */

import type { ProvedorEmbedding } from "./embeddings.ts";
import { montarPromptUsuario, montarSystemPrompt } from "./prompt.ts";
import { buscarTopK, type Documento } from "./vetor.ts";

export interface ItemIndexado {
  id: string;
  texto: string;
  fonte: string;
  vetor: number[];
}

export class RepositorioVetorial {
  private itens: ItemIndexado[] = [];

  constructor(private readonly embeddings: ProvedorEmbedding) {}

  /** Indexação: gera o embedding e guarda. (Escrita — cap. 24.) */
  async indexar(id: string, fonte: string, texto: string): Promise<void> {
    const vetor = await this.embeddings.gerar(texto);
    this.itens.push({ id, fonte, texto, vetor });
  }

  /** Consulta: embedding da pergunta → top-k mais próximos. */
  async consultar(pergunta: string, k: number): Promise<ItemIndexado[]> {
    const vetorPergunta = await this.embeddings.gerar(pergunta);
    const documentos: Documento[] = this.itens.map((i) => ({
      id: i.id,
      texto: i.texto,
      vetor: i.vetor,
    }));
    return buscarTopK(documentos, vetorPergunta, k).map((r) => ({
      id: r.documento.id,
      texto: r.documento.texto,
      fonte: this.itens.find((i) => i.id === r.documento.id)?.fonte ?? "",
      vetor: r.documento.vetor,
      pontuacao: r.pontuacao,
    }));
  }

  get tamanho(): number {
    return this.itens.length;
  }
}

export interface RespostaGerada {
  texto: string;
  trechosUsados: number;
}

/**
 * Orquestra a resposta: recupera os trechos e chama o LLM. A função de
 * geração é injetada para permitir testar sem rede (e trocar de provedor).
 */
export async function responder(
  repositorio: RepositorioVetorial,
  pergunta: string,
  opcoes: {
    topK: number;
    gerar: (system: string, usuario: string) => Promise<string>;
  },
): Promise<RespostaGerada> {
  const trechos = await repositorio.consultar(pergunta, opcoes.topK);
  if (trechos.length === 0) {
    return { texto: "Não encontrei nada relevante na base.", trechosUsados: 0 };
  }
  const usuario = montarPromptUsuario(
    pergunta,
    trechos.map((t) => ({ fonte: t.fonte, texto: t.texto })),
  );
  const texto = await opcoes.gerar(montarSystemPrompt(), usuario);
  return { texto, trechosUsados: trechos.length };
}
