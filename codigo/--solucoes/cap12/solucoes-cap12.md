# Soluções — Capítulo 12: PostgreSQL e SQL

## Exercício 1 — ACID numa transferência bancária

- **Atomicity**: o `UPDATE` do débito e o do crédito são uma transação só —
  ou ambos acontecem, ou nenhum;
- **Consistency**: invariantes preservadas (a soma dos saldos não muda);
- **Isolation**: uma transferência em andamento não é vista "pela metade" por
  outra transação;
- **Durability**: depois do `COMMIT`, os dados sobrevivem a uma queda de energia.

```sql
BEGIN;
UPDATE contas SET saldo = saldo - 100 WHERE id = 1;
UPDATE contas SET saldo = saldo + 100 WHERE id = 2;
COMMIT;  -- ou ROLLBACK se qualquer passo falhar
```

## Exercício 2 — Tabela `pedido_itens`

```sql
CREATE TABLE pedido_itens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id   UUID NOT NULL REFERENCES pedidos(id),
  produto_id  UUID NOT NULL REFERENCES produtos(id),
  quantidade  INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unit  INTEGER NOT NULL CHECK (preco_unit >= 0),  -- centavos
  UNIQUE (pedido_id, produto_id)
);
```
`pedido_id`/`produto_id` são as chaves estrangeiras; a combinação é única (um
produto aparece uma vez por pedido).

## Exercício 3 — `JOIN` de 3 tabelas + agregação

```sql
SELECT
  c.nome AS cliente,
  COUNT(p.id)        AS total_pedidos,
  SUM(pi.quantidade * pi.preco_unit) AS total_gasto_centavos
FROM clientes c
JOIN pedidos p   ON p.cliente_id = c.id
JOIN pedido_itens pi ON pi.pedido_id = p.id
GROUP BY c.id, c.nome
ORDER BY total_gasto_centavos DESC;
```

## Exercício 4 — O que um índice faz / quando não criar

Um **índice** (B-tree por padrão) permite ao banco encontrar linhas por
`O(log n)` em vez de varrer a tabela inteira — acelera `WHERE`, `JOIN`,
`ORDER BY` em colunas indexadas.

**Não criar** quando: a tabela é pequena; a coluna tem baixa cardinalidade
(quase todos os valores iguais); ou a escrita domina (índice custa em todo
`INSERT`/`UPDATE`).

## Exercício 5 — Dinheiro como inteiro (centavos)

`FLOAT`/`DOUBLE` não representam decimais exatamente (erros de arredondamento
acumulam — R$ 0,1 + 0,2 ≠ 0,3 em binário). Armazenar **centavos como inteiro**
(`INTEGER`/`BIGINT`) é exato e rápido; o `NUMERIC(10,2)` do PostgreSQL também
é aceitável, mas o inteiro é o padrão mais simples e portável.

## Exercício 6 — `BEGIN` / `COMMIT` / `ROLLBACK`

Delimitam uma **transação**: `BEGIN` inicia, `COMMIT` confirma tudo de uma
vez, `ROLLBACK` desfaz tudo se algo falhar no meio. É o mecanismo que garante
atomicidade e isolamento do ACID.
