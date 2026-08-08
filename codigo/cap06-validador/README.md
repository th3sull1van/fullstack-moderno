# cap06-validador — `valida.ts`

Biblioteca de validação de formulários **encadeável e tipada**, projeto do
capítulo 6 (TypeScript) do livro *Full Stack Moderno*.

## O que ela faz

- Regras encadeáveis: `campo("nome").obrigatorio().minimo(3).maximo(80)`;
- Resultado tipado: `{ valido: boolean; erros: Record<string, string> }` — as
  chaves de `erros` espelham os campos validados (tipagem via generic);
- Regras prontas: `obrigatorio()`, `minimo(n)`, `maximo(n)`, `email()`,
  `regex(re, mensagem?)` — e é trivial adicionar novas;
- Cada regra é uma função pura `(valor) => erro | null`; o encadeamento apenas
  acumula regras e `validar()` devolve o **primeiro** erro de cada campo.

## Uso

```ts
import { campo, validar } from "./valida.js";

const schema = {
  nome: campo("nome").obrigatorio().minimo(3).maximo(80),
  email: campo("email").obrigatorio().email(),
  cep: campo("cep").regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
};

const resultado = validar(schema, { nome: "Ana", email: "ana@exemplo.com", cep: "01310-100" });
// { valido: true, erros: {} }
```

## Como rodar

```bash
npm install
npm test          # 10 testes Vitest
npm run typecheck # tsc --noEmit (strict: true)
npm run build     # emite dist/ + declarações .d.ts
```

## Critérios de aceite (cap. 6)

| Critério | Onde |
|----------|------|
| `strict: true` e `tsc --noEmit` sem erros | `tsconfig.json` + `npm run typecheck` |
| API encadeável | `Campo` em `src/valida.ts` |
| Resultado tipado | `Resultado<T>` em `src/valida.ts` |
| Generic no validador de regex e nos campos | `regex<T>` e `validar<T>`/`Schema<T>` |
| 6+ testes unitários | `src/valida.test.ts` (10 testes) |
| Integração com o formulário de contato do portfólio | teste `integração` no fim da suíte |
