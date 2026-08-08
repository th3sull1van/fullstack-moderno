# Soluções — Capítulo 6: TypeScript

## Exercício 1 — JavaScript vs TypeScript

TypeScript é um **superconjunto tipado** de JavaScript. Na compilação
(`tsc`), os tipos são **apagados** (*type erasure*) e o que roda é JavaScript
puro — por isso o TypeScript roda em qualquer runtime de JS. O ganho é
estático: o compilador (e o editor) verificam os tipos **antes** de executar.

## Exercício 2 — `strictNullChecks`

Liga a verificação de `null`/`undefined` nos tipos: uma variável `string` não
pode receber `null` sem que o compilador reclame. É o que elimina a classe de
bugs "Cannot read properties of null" em produção — por isso `strict: true`
(que inclui essa opção) é o padrão obrigatório em projetos novos.

## Exercício 3 — Interface `Produto` + array tipado

```ts
interface Produto {
  id: number;
  nome: string;
  preco: number;
  emEstoque: boolean;
}

const produtos: Produto[] = [
  { id: 1, nome: "Teclado", preco: 299.9, emEstoque: true },
  { id: 2, nome: "Mouse", preco: 129.9, emEstoque: false },
];
```

## Exercício 4 — Union + narrowing

```ts
type FormaDePagamento = "pix" | "cartao" | "boleto";

function descreverForma(forma: FormaDePagamento): string {
  switch (forma) {
    case "pix":
      return "Crédito imediato, sem taxa";
    case "cartao":
      return "Parcelamento disponível";
    case "boleto":
      return "Compensa em 1–2 dias úteis";
  }
}
```
O `switch` faz o *narrowing*: dentro de cada `case`, o TypeScript sabe qual
literal é — e cobra que todos os casos sejam tratados.

## Exercício 5 — Generic `duplicar`

```ts
function duplicar<T>(lista: T[]): T[] {
  return lista.map((item) => item); // cópia com mesmos valores
}

// Se a intenção é *dobrar valores numéricos*:
function duplicarNumeros(lista: number[]): number[] {
  return lista.map((n) => n * 2);
}
```
O generic preserva o tipo de entrada na saída: `duplicar([1, 2])` devolve
`number[]`, `duplicar(["a"])` devolve `string[]`.

## Exercício 6 — `interface` vs `type`

- **`interface`**: contratos que se **estendem** — `extends`, `implements`,
  *declaration merging* (reabrir e adicionar propriedades). Escolha para
  objetos/classes e APIs públicas.
- **`type`**: **composição** — unions (`A | B`), intersecções (`A & B`),
  tipos utilitários, tuplas nomeadas, literals. Escolha para qualquer coisa que
  não seja um objeto "contrato".

Os dois coexistem; o importante é a consistência dentro do time.
