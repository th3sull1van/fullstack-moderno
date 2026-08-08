/**
 * valida.ts — biblioteca de validação de formulários encadeável e tipada.
 *
 * Projeto do capítulo 6 (TypeScript) do livro Full Stack Moderno.
 *
 * Uso:
 *   const resultado = validar(
 *     {
 *       nome: v.campo("nome").obrigatorio().minimo(3).maximo(80),
 *       email: v.campo("email").obrigatorio().email(),
 *     },
 *     { nome: "Ana", email: "ana@exemplo.com" },
 *   );
 *   // resultado.valido === true
 *
 * Design: cada regra é uma função pura `(valor) => erro | null`. O encadeamento
 * apenas acumula regras; `validar` roda todas e devolve o PRIMEIRO erro de cada
 * campo, no formato tipado `Record<string, string>`.
 */

/** Uma regra recebe o valor e devolve a mensagem de erro — ou `null` se passou. */
export type Regra = (valor: string) => string | null;

/** Campo encadeável: acumula regras e as executa na ordem em que foram adicionadas. */
export class Campo {
  private regras: Regra[] = [];

  constructor(private readonly nome: string) {}

  /** Marca o campo como obrigatório (ignora espaços em branco). */
  obrigatorio(): this {
    this.regras.push((valor) =>
      valor.trim().length > 0 ? null : `O campo "${this.nome}" é obrigatório`,
    );
    return this;
  }

  /** Exige no mínimo `n` caracteres (após remover espaços das bordas). */
  minimo(n: number): this {
    this.regras.push((valor) =>
      valor.trim().length >= n ? null : `Mínimo de ${n} caracteres`,
    );
    return this;
  }

  /** Limita a no máximo `n` caracteres. */
  maximo(n: number): this {
    this.regras.push((valor) =>
      valor.length <= n ? null : `Máximo de ${n} caracteres`,
    );
    return this;
  }

  /** Valida um e-mail com a regex clássica (simples, sem regex gigante). */
  email(): this {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.regras.push((valor) => (re.test(valor.trim()) ? null : "E-mail inválido"));
    return this;
  }

  /**
   * Valida contra uma regex fornecida pelo chamador. Genérica sobre o tipo da
   * mensagem para manter o retorno do encadeamento tipado em `this`.
   */
  regex<T extends string>(re: RegExp, mensagem: T = "Formato inválido" as T): this {
    this.regras.push((valor) => (re.test(valor.trim()) ? null : mensagem));
    return this;
  }

  /** Executa as regras em ordem; devolve o primeiro erro ou `null`. */
  validar(valor: string): string | null {
    for (const regra of this.regras) {
      const erro = regra(valor);
      if (erro !== null) return erro;
    }
    return null;
  }
}

/** Resultado tipado por campo: as chaves espelham o objeto de campos passado. */
export type Resultado<T extends Record<string, string>> = {
  valido: boolean;
  erros: Partial<Record<keyof T, string>>;
};

/** Descreve um schema de validação: nome do campo → validador encadeado. */
export type Schema<T extends Record<string, string>> = {
  [K in keyof T]: Campo;
};

/**
 * Valida um objeto inteiro de valores. Os campos ausentes são tratados como
 * string vazia (assim `obrigatorio()` os reprova). O resultado é tipado: as
 * chaves de `erros` correspondem às chaves do objeto validado.
 */
export function validar<T extends Record<string, string>>(
  schema: Schema<T>,
  valores: T,
): Resultado<T> {
  const erros: Resultado<T>["erros"] = {};
  for (const nome of Object.keys(schema) as (keyof T)[]) {
    const campo = schema[nome];
    const valor = valores[nome] ?? "";
    const erro = campo.validar(valor);
    if (erro !== null) erros[nome] = erro;
  }
  return { valido: Object.keys(erros).length === 0, erros };
}

/** Atalho: cria um campo já ligado ao nome usado nas chaves do resultado. */
export function campo(nome: string): Campo {
  return new Campo(nome);
}
