-- ============================================================================
-- E-commerce — schema completo (capítulo 12 do livro Full Stack Moderno)
-- PostgreSQL 18 · dinheiro em CENTAVOS (INT) · UUID · TIMESTAMPTZ
-- ============================================================================

BEGIN;

-- Extensão para gen_random_uuid() (PG 13+ já inclui; garantimos a função)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Clientes e endereços
-- ---------------------------------------------------------------------------
CREATE TABLE cliente (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        TEXT NOT NULL CHECK (length(nome) BETWEEN 2 AND 200),
    email       TEXT NOT NULL UNIQUE CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
    telefone    TEXT,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE endereco (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id   UUID NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
    rua          TEXT NOT NULL,
    numero       TEXT NOT NULL,
    complemento  TEXT,
    cidade       TEXT NOT NULL,
    uf           CHAR(2) NOT NULL CHECK (uf ~ '^[A-Z]{2}$'),
    cep          TEXT NOT NULL CHECK (cep ~ '^\d{5}-?\d{3}$'),
    principal    BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_endereco_cliente ON endereco(cliente_id);

-- ---------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------
CREATE TABLE categoria (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome     TEXT NOT NULL UNIQUE
);

CREATE TABLE produto (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome              TEXT NOT NULL CHECK (length(nome) >= 2),
    descricao         TEXT,
    preco_centavos    INTEGER NOT NULL CHECK (preco_centavos >= 0),  -- nunca FLOAT p/ dinheiro
    estoque           INTEGER NOT NULL CHECK (estoque >= 0) DEFAULT 0,
    categoria_id      UUID NOT NULL REFERENCES categoria(id) ON DELETE RESTRICT,
    ativo             BOOLEAN NOT NULL DEFAULT true,
    criado_em         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_produto_categoria ON produto(categoria_id);
CREATE INDEX idx_produto_nome ON produto(lower(nome));  -- busca case-insensitive

-- ---------------------------------------------------------------------------
-- Pedidos (pedido 1—N pedido_item)
-- ---------------------------------------------------------------------------
CREATE TABLE pedido (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id     UUID NOT NULL REFERENCES cliente(id) ON DELETE RESTRICT,
    status         TEXT NOT NULL DEFAULT 'pendente'
                   CHECK (status IN ('pendente','pago','enviado','entregue','cancelado')),
    criado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pedido_cliente ON pedido(cliente_id);
CREATE INDEX idx_pedido_criado_em ON pedido(criado_em);

-- preco_unitario_centavos é SNAPSHOT: congela o preço no momento da compra,
-- mesmo que o produto mude depois (faturamento histórico correto).
CREATE TABLE pedido_item (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id                UUID NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
    produto_id               UUID NOT NULL REFERENCES produto(id) ON DELETE RESTRICT,
    quantidade               INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario_centavos  INTEGER NOT NULL CHECK (preco_unitario_centavos >= 0),
    UNIQUE (pedido_id, produto_id)
);

CREATE INDEX idx_pedido_item_pedido ON pedido_item(pedido_id);
CREATE INDEX idx_pedido_item_produto ON pedido_item(produto_id);

-- ---------------------------------------------------------------------------
-- View de faturamento: total de cada pedido a partir dos itens (sempre atual)
-- ---------------------------------------------------------------------------
CREATE VIEW pedido_total AS
SELECT
    p.id                                    AS pedido_id,
    p.cliente_id,
    p.status,
    p.criado_em,
    COALESCE(SUM(pi.quantidade * pi.preco_unitario_centavos), 0) AS total_centavos
FROM pedido p
LEFT JOIN pedido_item pi ON pi.pedido_id = p.id
GROUP BY p.id;

COMMIT;
