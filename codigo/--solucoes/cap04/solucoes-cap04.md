# Soluções — Capítulo 4: JavaScript Moderno

## Exercício 1 — `const`, `let` e `var`

- **`const`**: valor não pode ser reatribuído (o padrão — use sempre por padrão);
- **`let`**: permite reatribuição, com escopo de bloco;
- **`var`**: escopo de função e *hoisting* confuso — evite.

Exemplo em que `let` é necessário (contador que muda):
```js
for (let i = 0; i < 3; i++) {
  console.log(i); // 0, 1, 2
}
// com var, `i` vazaria para fora do bloco
```

## Exercício 2 — `===` vs `==`

`==` faz **coerção implícita** (converte os lados antes de comparar); `===`
compara **valor e tipo** — sempre prefira `===`.

Surpresa clássica do `==`:
```js
0 == ""        // true  (!)
0 == false     // true  (!)
null == undefined // true
"1" == 1       // true
```
Com `===`, todos os casos acima são `false`, que é o que se espera.

## Exercício 3 — `map`, `filter` e `reduce`

```js
const nums = [1, 2, 3, 4, 5];

const dobrados = nums.map((n) => n * 2);        // [2, 4, 6, 8, 10]
const pares    = nums.filter((n) => n % 2 === 0); // [2, 4]
const total    = nums.reduce((acc, n) => acc + n, 0); // 15
```

## Exercício 4 — `evento.preventDefault()`

Cancela o **comportamento padrão** do evento. No `submit` de um formulário,
impede o recarregamento da página (o envio nativo), permitindo validar e enviar
via JavaScript:
```js
form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  // agora você decide o que fazer: validar, fetch, mostrar erro
});
```

## Exercício 5 — Promise e `async/await`

Uma **Promise** representa um valor que ainda não existe (operação assíncrona):
ela está *pendente* e resolve para *realizada* ou *rejeitada*. O `async/await`
é açúcar sintático sobre promises — código assíncrono com aparência de
sequencial, eliminando cadeias de `.then()`:
```js
async function carregarUsuario(id) {
  const resposta = await fetch(`/api/usuarios/${id}`);
  if (!resposta.ok) throw new Error("falhou");
  return resposta.json();
}
```

## Exercício 6 — Botão que adiciona item à lista

```html
<ul id="lista"></ul>
<button id="adicionar">Adicionar item</button>
```
```js
const lista = document.querySelector("#lista");
const botao = document.querySelector("#adicionar");

botao.addEventListener("click", () => {
  const item = document.createElement("li");
  item.textContent = `Item ${lista.children.length + 1}`;
  lista.appendChild(item);
});
```
Obs.: usar `textContent` (e não `innerHTML`) evita injeção de HTML — um gostinho
do capítulo 19 (XSS).
