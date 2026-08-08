# cap24-skillchat — Assistente RAG de referência

Implementação de referência do projeto do capítulo 24: um assistente com
**RAG** (Retrieval-Augmented Generation) sobre os serviços anunciados no
SkillHub.

## O que o código mostra

| Arquivo | Conceito do capítulo |
|---|---|
| `src/vetor.ts` | Similaridade por cosseno e busca **top-k** (a matemática do pgvector) |
| `src/embeddings.ts` | Provedores de embedding: **OpenAI real** (fetch) e **Fake determinístico** (offline, para testes) |
| `src/rag.ts` | Pipeline completo: **indexação** (escrita) e **consulta** (pergunta) com repositório injetável |
| `src/prompt.ts` | Montagem do prompt: regras do sistema + documentos **demarcados como dado** (anti prompt injection) |

## Como rodar

```bash
npm install
npm test          # 11 testes offline (cosseno, top-k, pipeline, anti-injeção)
npm run typecheck
npm run dev       # demo sem rede (embeddings falsos)
```

## Indo para produção

1. Troque `FakeEmbeddings` por `OpenAIEmbeddings` (ou outro provedor) com a
   chave no `.env` (copie de `.env.example`);
2. Troque o repositório em memória pelo **pgvector**: `CREATE EXTENSION
   vector`, coluna `vetor vector(1536)` e `ORDER BY vetor <=> $1 LIMIT k`
   (distância cosseno — a mesma matemática de `vetor.ts`);
3. Use o Vercel AI SDK (`streamText`) para **streaming** (o `ai` já está nas
   dependências) e controle o custo com `topK`, `maxTokens` e estimativa de
   tokens (`estimarTokens`).

## Decisões pedagógicas (por quê assim?)

- **Embedding injetável**: o pipeline não depende de rede — os testes validam
  a *lógica* (recuperação, ordenação, montagem do prompt) que independe do
  provedor;
- **Prompt com marcações**: é a mitigação estrutural de prompt injection —
  instruções primeiro, conteúdo demarcado, regra anti-invenção explícita.
