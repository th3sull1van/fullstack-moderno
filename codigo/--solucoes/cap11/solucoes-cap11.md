# Soluções — Capítulo 11: HTTP, REST e APIs

## Exercício 1 — Os 5 métodos HTTP e sua ação REST

| Método | Ação REST | Uso |
|---|---|---|
| `GET` | Ler | Buscar recurso(s), sem efeito colateral |
| `POST` | Criar | Criar recurso novo (corpo com dados) |
| `PUT` | Substituir | Atualizar recurso inteiro (idempotente) |
| `PATCH` | Atualizar parcial | Modificar apenas campos enviados |
| `DELETE` | Remover | Apagar recurso |

## Exercício 2 — `401`, `403`, `404`

- **401 Unauthorized**: você **não se identificou** (token ausente/inválido) —
  "quem é você?";
- **403 Forbidden**: você se identificou, mas **não tem permissão** — "você não
  pode fazer isso";
- **404 Not Found**: o recurso **não existe** (ou você não deve saber que
  existe — por isso APIs às vezes respondem 404 no lugar de 403 em rotas
  sensíveis).

## Exercício 3 — Tabela REST do recurso `usuarios`

| Método | Rota | Ação |
|---|---|---|
| `GET` | `/usuarios` | Listar |
| `GET` | `/usuarios/:id` | Buscar um |
| `POST` | `/usuarios` | Criar |
| `PUT` | `/usuarios/:id` | Substituir |
| `PATCH` | `/usuarios/:id` | Atualizar parcial |
| `DELETE` | `/usuarios/:id` | Remover |

## Exercício 4 — Rota Fastify com 404

```ts
app.get<{ Params: { id: string } }>("/produtos/:id", async (req, reply) => {
  const produto = await repositorio.buscarPorId(Number(req.params.id));

  if (!produto) {
    return reply.code(404).send({ erro: "Produto não encontrado" });
  }
  return reply.send(produto);
});
```

## Exercício 5 — Paginação e versionamento

- **Paginação** (`?pagina=1&limite=20` + `X-Total-Count`): evita respostas
  gigantes, protege o banco e melhora o tempo de resposta — necessária em
  qualquer lista que pode crescer.
- **Versionamento** (`/api/v1/...` ou header): permite **evoluir o contrato**
  sem quebrar clientes existentes — necessária quando a API tem consumidores
  fora do seu controle (apps, terceiros).

## Exercício 6 — `Content-Type: application/json`

Informa ao receptor que o **corpo está em JSON** — e como interpretá-lo
(qual parser usar). Sem ele (ou com valor errado), o cliente pode tentar
parsear como texto/form e falhar. Na resposta, ele também ativa a
serialização automática no Fastify.
