# cap07-kanban — Quadro Kanban (React + TypeScript)

Quadro Kanban com **três colunas** (A fazer, Em andamento, Concluído),
**criar/mover/excluir tarefas**, persistência em `localStorage` e acessibilidade —
projeto do capítulo 7 (React) do livro *Full Stack Moderno*. Sem backend:
o estado é local ao navegador (no cap. 15 o mesmo conceito vira produto com
banco de dados).

## O que o projeto ensina

- **Estado tipado e imutável**: `Tarefa { id, titulo, coluna, criadaEm }`;
  mover é *substituir* o estado, nunca mutar (`map`/`filter`/spread);
- **Lifting state up**: o estado vive no `App` e desce por props;
- **Hook próprio `useLocalStorage`**: leitura preguiçosa + escrita via efeito;
- **Componentes pequenos e reutilizáveis**: `Quadro` → `Coluna` → `Tarefa`
  (+ `FormNovaTarefa`);
- **Acessibilidade**: botões reais com `aria-label`, `label` ligada ao input,
  `role="alert"` no erro, `aria-invalid`.

## Como rodar

```bash
npm install
npm run dev     # http://localhost:5173
```

## Testes

```bash
npm test            # 7 testes de componente (Testing Library + jsdom)
npm run typecheck   # tsc --noEmit (strict)
npm run build       # typecheck + build de produção
```

## Estrutura

```
src/
  App.tsx                  # Quadro: estado + handlers (lifting state up)
  tipos.ts                 # Tarefa, ColunaId, estado inicial
  hooks/useLocalStorage.ts # hook de persistência
  componentes/
    FormNovaTarefa.tsx     # formulário controlado + validação (role=alert)
    Coluna.tsx             # coluna com contagem e destaque visual
    Tarefa.tsx             # cartão com botões acessíveis de mover/excluir
  App.test.tsx             # testes de componente
```

## Desafios do capítulo (para você)

- **Drag and drop** entre colunas (HTML5 drag & drop) preservando a ordem;
- **Tema claro/escuro** com `useTema` persistindo no `localStorage`;
- **Desfazer (undo)** com histórico de estados;
- **Busca com debounce** (reutilize a ideia do cap. 4).

## Critérios de aceite (cap. 7)

| Critério | Status |
|----------|--------|
| Criar, mover e excluir tarefas com estado tipado | ✅ testado |
| Colunas com contagem de itens e destaque visual | ✅ testado |
| Formulário controlado com validação mínima | ✅ testado |
| Persistência em `localStorage` via hook próprio | ✅ testado |
| Componentes pequenos e reutilizáveis | ✅ estrutura |
| Bootstrap com Vite (`react-ts`) | ✅ Vite 8 |
| Acessível: botões, labels, `role="alert"` | ✅ testado |
