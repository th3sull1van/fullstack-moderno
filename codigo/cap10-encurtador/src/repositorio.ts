/**
 * Persistência do encurtador: um arquivo JSON (urls.json) contendo o mapa
 * código → URL. Para um produto real troque por Redis/PostgreSQL (capítulos
 * 12 e 21 do livro); aqui o arquivo mantém o projeto 100% Node nativo.
 */

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { codificar } from "./base62.js";

export type UrlRegistrada = {
  codigo: string;
  url: string;
  criadoEm: string; // ISO 8601
  acessos: number;
};

export class Repositorio {
  private urls: Map<string, UrlRegistrada> = new Map();
  private proximoId = 1;

  constructor(private readonly caminhoArquivo: string) {}

  /** Carrega o arquivo (se existir) e restaura o contador de IDs. */
  async carregar(): Promise<void> {
    try {
      const conteudo = await readFile(this.caminhoArquivo, "utf8");
      const dados = JSON.parse(conteudo) as {
        proximoId: number;
        urls: UrlRegistrada[];
      };
      this.proximoId = dados.proximoId ?? 1;
      for (const u of dados.urls ?? []) this.urls.set(u.codigo, u);
    } catch (erro) {
      if ((erro as NodeJS.ErrnoException).code !== "ENOENT") throw erro;
      // arquivo ainda não existe: começa vazio
    }
  }

  /** Grava o arquivo de forma atômica (escreve em .tmp e renomeia). */
  private async salvar(): Promise<void> {
    await mkdir(dirname(this.caminhoArquivo), { recursive: true });
    const temporario = `${this.caminhoArquivo}.tmp`;
    const payload = JSON.stringify(
      { proximoId: this.proximoId, urls: [...this.urls.values()] },
      null,
      2,
    );
    await writeFile(temporario, payload, "utf8");
    await rename(temporario, this.caminhoArquivo);
  }

  /** Registra uma URL nova e devolve o registro criado. */
  async criar(url: string): Promise<UrlRegistrada> {
    const registro: UrlRegistrada = {
      codigo: codificar(this.proximoId),
      url,
      criadoEm: new Date().toISOString(),
      acessos: 0,
    };
    this.proximoId += 1;
    this.urls.set(registro.codigo, registro);
    await this.salvar();
    return registro;
  }

  /** Busca por código sem incrementar contador (para estatísticas). */
  obter(codigo: string): UrlRegistrada | undefined {
    return this.urls.get(codigo);
  }

  /** Registra um acesso e devolve a URL original (ou undefined). */
  async registrarAcesso(codigo: string): Promise<string | undefined> {
    const registro = this.urls.get(codigo);
    if (!registro) return undefined;
    registro.acessos += 1;
    await this.salvar();
    return registro.url;
  }

  /** Estatísticas de todas as URLs (para o endpoint de analytics). */
  listar(): UrlRegistrada[] {
    return [...this.urls.values()].sort((a, b) => a.codigo.localeCompare(b.codigo));
  }
}

/** Caminho padrão do arquivo de dados (configurável via URLS_FILE). */
export function caminhoPadrao(): string {
  return process.env.URLS_FILE ?? join(process.cwd(), "urls.json");
}
