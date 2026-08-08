# Soluções — Capítulo 7: React

## Exercício 1 — Props vs estado

- **Props**: dados que o **pai passa para o filho** — imutáveis do ponto de
  vista de quem recebe. São a "interface pública" do componente.
- **Estado** (`useState`): dados **internos** que o componente gerencia e que,
  quando mudam, disparam re-renderização.

Regra: o que é do componente → estado; o que vem de fora → prop.

## Exercício 2 — Por que estado imutável?

O React compara referências para decidir o que re-renderizar. Se você **muta**
o estado (`arr.push(x)`), a referência não muda e o React pode não detectar a
mudança — além de criar bugs sutis de estado compartilhado. Sempre crie um
**novo** valor:

```tsx
setItens((anterior) => [...anterior, novoItem]);   // ✅ novo array
// setItens((anterior) => { anterior.push(novoItem); return anterior; }) ❌ muta
```

## Exercício 3 — Componente `Lista`

```tsx
function Lista({ itens }: { itens: string[] }) {
  return (
    <ul>
      {itens.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
```
A `key` deve ser **estável e única** entre irmãos (o texto do item serve aqui;
para listas editáveis, use `id`).

## Exercício 4 — Array de dependências do `useEffect`

O array diz ao React **quando** re-executar o efeito: só quando um dos valores
mudar. Loop infinito clássico: efeito que **atualiza estado** e depende desse
mesmo estado sem condição de parada:

```tsx
useEffect(() => {
  setContador(contador + 1); // muda o estado → re-render → efeito roda de novo…
}, [contador]);              // …que muda o contador → efeito roda de novo → …
```
Correção: dependência vazia (se roda uma vez) ou reestruturar para não
atualizar estado dentro do efeito.

## Exercício 5 — Lifting state up

Quando dois irmãos precisam do mesmo dado, o estado **sobe** para o pai
comum e desce via props:

```tsx
function App() {
  const [busca, setBusca] = useState("");

  return (
    <>
      <CampoBusca valor={busca} onChange={setBusca} />
      <ListaFiltrada filtro={busca} />
    </>
  );
}
```
O pai é a **única fonte de verdade**; ambos os filhos reagem à mesma mudança.

## Exercício 6 — As duas regras dos hooks

1. **Chame hooks só no nível superior** — nunca dentro de loops, condicionais
   ou funções aninhadas (a ordem das chamadas precisa ser estável entre renders);
2. **Chame hooks só em componentes React ou hooks customizados** — nunca em
   funções JavaScript comuns.

Elas existem porque o React usa a **ordem das chamadas** para associar cada
hook ao componente entre renders.
