/**
 * Provedores de embedding.
 *
 * - `OpenAIEmbeddings`: produção (API real, via fetch — sem SDK, para manter
 *   as dependências mínimas e o código visível);
 * - `FakeEmbeddings`: determinístico e offline — usado nos testes para
 *   validar o pipeline inteiro sem rede nem custo.
 */

export interface ProvedorEmbedding {
  gerar(texto: string): Promise<number[]>;
  nome: string;
}

const DIMENSAO = 8; // produção usa 1536 (text-embedding-3-small)

export class OpenAIEmbeddings implements ProvedorEmbedding {
  nome = "openai";
  constructor(
    private readonly chave: string,
    private readonly modelo = "text-embedding-3-small",
  ) {}

  async gerar(texto: string): Promise<number[]> {
    const resposta = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.chave}`,
      },
      body: JSON.stringify({ model: this.modelo, input: texto }),
    });
    if (!resposta.ok) {
      throw new Error(`Embedding falhou: HTTP ${resposta.status}`);
    }
    const dados = (await resposta.json()) as {
      data: Array<{ embedding: number[] }>;
    };
    return dados.data[0].embedding;
  }
}

/**
 * Fake determinístico: mapeia palavras para vetores fixos e soma — textos
 * parecidos (palavras em comum) ficam com vetores parecidos. Suficiente para
 * testar a matemática da busca sem tocar em rede.
 */
export class FakeEmbeddings implements ProvedorEmbedding {
  nome = "fake";
  private readonly sementes: Record<string, number[]> = {};

  constructor(palavras: string[] = []) {
    for (const palavra of palavras) {
      this.sementes[palavra] = this.hash(palavra);
    }
  }

  async gerar(texto: string): Promise<number[]> {
    const vetor = new Array(DIMENSAO).fill(0);
    for (const palavra of texto.toLowerCase().split(/\W+/)) {
      if (!palavra) continue;
      const semente = this.sementes[palavra] ?? this.hash(palavra);
      for (let i = 0; i < DIMENSAO; i++) vetor[i] += semente[i];
    }
    return vetor;
  }

  private hash(palavra: string): number[] {
    const v = new Array(DIMENSAO).fill(0);
    for (let i = 0; i < palavra.length; i++) {
      v[i % DIMENSAO] += palavra.charCodeAt(i);
    }
    return v;
  }
}
