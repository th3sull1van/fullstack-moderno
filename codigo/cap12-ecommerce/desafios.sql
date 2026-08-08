-- ============================================================================
-- Desafios do capítulo 12 (opcionais — rodar DEPOIS do schema e do seed)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- D1) Trigger: decrementa o estoque automaticamente ao inserir um item
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION decrementar_estoque() RETURNS trigger AS $$
BEGIN
    UPDATE produto
       SET estoque = estoque - NEW.quantidade
     WHERE id = NEW.produto_id;

    -- Segurança: nunca deixar estoque negativo (race condition exige
    -- transação serializável ou SELECT ... FOR UPDATE — veja o exercício sênior)
    IF (SELECT estoque FROM produto WHERE id = NEW.produto_id) < 0 THEN
        RAISE EXCEPTION 'Estoque insuficiente para o produto %', NEW.produto_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_decrementar_estoque
    AFTER INSERT ON pedido_item
    FOR EACH ROW EXECUTE FUNCTION decrementar_estoque();

-- ---------------------------------------------------------------------------
-- D2) Full-text search em português (to_tsvector + índice GIN)
-- ---------------------------------------------------------------------------
ALTER TABLE produto ADD COLUMN busca tsvector
    GENERATED ALWAYS AS (to_tsvector('portuguese', nome || ' ' || coalesce(descricao, ''))) STORED;

CREATE INDEX idx_produto_busca ON produto USING GIN (busca);

-- Busca: "clean" deve achar "Clean Code" (stemming em português/inglês)
EXPLAIN ANALYZE
SELECT nome FROM produto
WHERE busca @@ plainto_tsquery('portuguese', 'clean')
ORDER BY ts_rank(busca, plainto_tsquery('portuguese', 'clean')) DESC;

-- ---------------------------------------------------------------------------
-- D3) Window function: total acumulado de vendas por mês
-- ---------------------------------------------------------------------------
SELECT
    date_trunc('month', p.criado_em)::date AS mes,
    SUM(pt.total_centavos)                 AS faturamento_mes,
    SUM(SUM(pt.total_centavos)) OVER (ORDER BY date_trunc('month', p.criado_em))
                                           AS acumulado_centavos
FROM pedido p
JOIN pedido_total pt ON pt.pedido_id = p.id
WHERE p.status <> 'cancelado'
GROUP BY date_trunc('month', p.criado_em)
ORDER BY mes;
