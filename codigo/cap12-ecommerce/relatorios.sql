-- ============================================================================
-- Relatórios do e-commerce (5 consultas exigidas pelo capítulo 12)
-- Use:  psql -f relatorios.sql  (ou rode cada bloco no psql)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Faturamento por mês  (date_trunc + GROUP BY)
-- ---------------------------------------------------------------------------
-- EXPLAIN ANALYZE: usa idx_pedido_criado_em → Index Only Scan (pedidos recentes)
EXPLAIN ANALYZE
SELECT
    date_trunc('month', p.criado_em)                AS mes,
    COUNT(DISTINCT p.id)                            AS pedidos,
    SUM(pt.total_centavos)                          AS faturamento_centavos,
    ROUND(SUM(pt.total_centavos) / 100.0, 2)        AS faturamento_reais
FROM pedido p
JOIN pedido_total pt ON pt.pedido_id = p.id
WHERE p.status <> 'cancelado'
GROUP BY date_trunc('month', p.criado_em)
ORDER BY mes DESC;

-- ---------------------------------------------------------------------------
-- 2) Ticket médio (só pedidos que geraram receita)
-- ---------------------------------------------------------------------------
SELECT
    ROUND(AVG(total_centavos) / 100.0, 2)  AS ticket_medio_reais,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_centavos) / 100.0, 2)
                                           AS ticket_mediano_reais,
    COUNT(*)                               AS pedidos_pagos
FROM pedido_total
WHERE status IN ('pago', 'enviado', 'entregue');

-- ---------------------------------------------------------------------------
-- 3) Top produtos (receita e quantidade) — usa idx_pedido_item_produto
-- ---------------------------------------------------------------------------
SELECT
    pr.nome,
    SUM(pi.quantidade)                                   AS unidades,
    SUM(pi.quantidade * pi.preco_unitario_centavos)      AS receita_centavos,
    ROUND(SUM(pi.quantidade * pi.preco_unitario_centavos) / 100.0, 2) AS receita_reais
FROM pedido_item pi
JOIN produto pr ON pr.id = pi.produto_id
JOIN pedido p ON p.id = pi.pedido_id
WHERE p.status <> 'cancelado'
GROUP BY pr.id, pr.nome
ORDER BY receita_centavos DESC
LIMIT 5;

-- ---------------------------------------------------------------------------
-- 4) Clientes inativos (sem pedido nos últimos 90 dias)
-- ---------------------------------------------------------------------------
SELECT
    c.id,
    c.nome,
    c.email,
    MAX(p.criado_em) AS ultimo_pedido
FROM cliente c
LEFT JOIN pedido p ON p.cliente_id = c.id AND p.status <> 'cancelado'
GROUP BY c.id, c.nome, c.email
HAVING MAX(p.criado_em) IS NULL
    OR MAX(p.criado_em) < now() - interval '90 days'
ORDER BY ultimo_pedido NULLS FIRST;

-- ---------------------------------------------------------------------------
-- 5) Estoque baixo (reposição sugerida)
-- ---------------------------------------------------------------------------
SELECT
    pr.nome,
    pr.estoque,
    c.nome AS categoria
FROM produto pr
JOIN categoria c ON c.id = pr.categoria_id
WHERE pr.ativo AND pr.estoque <= 5
ORDER BY pr.estoque ASC, pr.nome;
