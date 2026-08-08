-- ============================================================================
-- Seed — 5 clientes, 15 produtos (5 categorias), 20 pedidos
-- Rodar DEPOIS de schema.sql:  psql -f schema.sql -f seed.sql
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Categorias e produtos (preços em centavos)
-- ---------------------------------------------------------------------------
INSERT INTO categoria (nome) VALUES
  ('Eletrônicos'), ('Livros'), ('Casa e Cozinha'), ('Esporte'), ('Beleza');

INSERT INTO produto (nome, descricao, preco_centavos, estoque, categoria_id) VALUES
  ('Smartphone X200', 'Tela 6.7" 120Hz, 256GB',       249999, 12, (SELECT id FROM categoria WHERE nome='Eletrônicos')),
  ('Fone Bluetooth Pro', 'Cancelamento de ruído',      14999, 30, (SELECT id FROM categoria WHERE nome='Eletrônicos')),
  ('Notebook Ultra 14"', '16GB RAM, SSD 512GB',       499900,  5, (SELECT id FROM categoria WHERE nome='Eletrônicos')),
  ('Dom Casmurro',       'Machado de Assis, ed. anotada', 2990, 40, (SELECT id FROM categoria WHERE nome='Livros')),
  ('Clean Code',         'Robert C. Martin',              8990, 18, (SELECT id FROM categoria WHERE nome='Livros')),
  ('O Senhor dos Anéis', 'Edição única, capa dura',       7990, 22, (SELECT id FROM categoria WHERE nome='Livros')),
  ('Cafeteira Expresso', '15 bar, aço inox',             24990,  8, (SELECT id FROM categoria WHERE nome='Casa e Cozinha')),
  ('Liquidificador Turbo', '1000W, 5 velocidades',       13990, 15, (SELECT id FROM categoria WHERE nome='Casa e Cozinha')),
  ('Jogo de Panelas 5 peças', 'Antiaderente',            18990,  6, (SELECT id FROM categoria WHERE nome='Casa e Cozinha')),
  ('Bola de Futebol Oficial', 'Tamanho 5',                9990, 25, (SELECT id FROM categoria WHERE nome='Esporte')),
  ('Tênis de Corrida',    'Amortecimento leve',          34990, 10, (SELECT id FROM categoria WHERE nome='Esporte')),
  ('Halteres 10kg (par)', 'Ferro fundido emborrachado',  12990,  4, (SELECT id FROM categoria WHERE nome='Esporte')),
  ('Perfume Essence 100ml','Fragrância amadeirada',      19990, 14, (SELECT id FROM categoria WHERE nome='Beleza')),
  ('Kit Maquiagem 12 itens','Paleta completa',            8990, 20, (SELECT id FROM categoria WHERE nome='Beleza')),
  ('Shampoo Antiqueda 400ml','Para todos os tipos',       1990, 60, (SELECT id FROM categoria WHERE nome='Beleza'));

-- ---------------------------------------------------------------------------
-- Clientes
-- ---------------------------------------------------------------------------
INSERT INTO cliente (nome, email, telefone) VALUES
  ('Ana Souza',     'ana.souza@email.com',     '11 98888-0001'),
  ('Bruno Lima',    'bruno.lima@email.com',    '21 97777-0002'),
  ('Carla Mendes',  'carla.mendes@email.com',  '31 96666-0003'),
  ('Diego Rocha',   'diego.rocha@email.com',   '41 95555-0004'),
  ('Elisa Prado',   'elisa.prado@email.com',   '51 94444-0005');

INSERT INTO endereco (cliente_id, rua, numero, cidade, uf, cep, principal) VALUES
  ((SELECT id FROM cliente WHERE email='ana.souza@email.com'),  'Rua das Flores',    '120', 'São Paulo',   'SP', '01310-100', true),
  ((SELECT id FROM cliente WHERE email='bruno.lima@email.com'), 'Av. Atlântica',     '980', 'Rio de Janeiro','RJ','22021-001', true),
  ((SELECT id FROM cliente WHERE email='carla.mendes@email.com'),'Rua da Bahia',     '77',  'Belo Horizonte','MG','30160-010', true),
  ((SELECT id FROM cliente WHERE email='diego.rocha@email.com'),'Rua XV de Novembro','300','Curitiba',     'PR', '80020-310', true),
  ((SELECT id FROM cliente WHERE email='elisa.prado@email.com'),'Rua dos Andradas',  '15', 'Porto Alegre', 'RS', '90020-004', true);

-- ---------------------------------------------------------------------------
-- 20 pedidos espalhados por 8 meses (faturamento mensal variado)
-- ---------------------------------------------------------------------------
-- Ajuda: total_centavos é calculado pela view pedido_total.
INSERT INTO pedido (cliente_id, status, criado_em) VALUES
  ((SELECT id FROM cliente WHERE email='ana.souza@email.com'),   'entregue', now() - interval '230 days'),
  ((SELECT id FROM cliente WHERE email='bruno.lima@email.com'),  'entregue', now() - interval '210 days'),
  ((SELECT id FROM cliente WHERE email='carla.mendes@email.com'),'entregue', now() - interval '200 days'),
  ((SELECT id FROM cliente WHERE email='diego.rocha@email.com'), 'entregue', now() - interval '180 days'),
  ((SELECT id FROM cliente WHERE email='elisa.prado@email.com'), 'entregue', now() - interval '170 days'),
  ((SELECT id FROM cliente WHERE email='ana.souza@email.com'),   'entregue', now() - interval '150 days'),
  ((SELECT id FROM cliente WHERE email='bruno.lima@email.com'),  'entregue', now() - interval '140 days'),
  ((SELECT id FROM cliente WHERE email='carla.mendes@email.com'),'pago',     now() - interval '120 days'),
  ((SELECT id FROM cliente WHERE email='diego.rocha@email.com'), 'entregue', now() - interval '110 days'),
  ((SELECT id FROM cliente WHERE email='elisa.prado@email.com'), 'entregue', now() - interval '100 days'),
  ((SELECT id FROM cliente WHERE email='ana.souza@email.com'),   'pago',     now() - interval '80 days'),
  ((SELECT id FROM cliente WHERE email='bruno.lima@email.com'),  'entregue', now() - interval '70 days'),
  ((SELECT id FROM cliente WHERE email='carla.mendes@email.com'),'pago',     now() - interval '60 days'),
  ((SELECT id FROM cliente WHERE email='diego.rocha@email.com'), 'entregue', now() - interval '50 days'),
  ((SELECT id FROM cliente WHERE email='elisa.prado@email.com'), 'enviado',  now() - interval '45 days'),
  ((SELECT id FROM cliente WHERE email='ana.souza@email.com'),   'entregue', now() - interval '35 days'),
  ((SELECT id FROM cliente WHERE email='bruno.lima@email.com'),  'pago',     now() - interval '25 days'),
  ((SELECT id FROM cliente WHERE email='carla.mendes@email.com'),'enviado',  now() - interval '20 days'),
  ((SELECT id FROM cliente WHERE email='diego.rocha@email.com'), 'pendente', now() - interval '10 days'),
  ((SELECT id FROM cliente WHERE email='elisa.prado@email.com'), 'pendente', now() - interval '3 days');

-- Itens (1 a 3 por pedido) — preço snapshot igual ao catálogo atual.
-- Cada item casa com o pedido pela data de criação (determinístico).
INSERT INTO pedido_item (pedido_id, produto_id, quantidade, preco_unitario_centavos)
SELECT p.id, pr.id, itens.quantidade, pr.preco_centavos
FROM pedido p
JOIN (
  SELECT * FROM (VALUES
    (now() - interval '230 days', 'Smartphone X200', 1),
    (now() - interval '210 days', 'Fone Bluetooth Pro', 1),
    (now() - interval '200 days', 'Dom Casmurro', 2),
    (now() - interval '180 days', 'Tênis de Corrida', 1),
    (now() - interval '170 days', 'Perfume Essence 100ml', 1),
    (now() - interval '150 days', 'Notebook Ultra 14"', 1),
    (now() - interval '140 days', 'Cafeteira Expresso', 1),
    (now() - interval '120 days', 'Clean Code', 3),
    (now() - interval '110 days', 'Bola de Futebol Oficial', 2),
    (now() - interval '100 days', 'Kit Maquiagem 12 itens', 1),
    (now() - interval '80 days',  'Smartphone X200', 2),
    (now() - interval '70 days',  'O Senhor dos Anéis', 1),
    (now() - interval '60 days',  'Liquidificador Turbo', 1),
    (now() - interval '50 days',  'Halteres 10kg (par)', 1),
    (now() - interval '45 days',  'Fone Bluetooth Pro', 2),
    (now() - interval '35 days',  'Jogo de Panelas 5 peças', 1),
    (now() - interval '25 days',  'Shampoo Antiqueda 400ml', 4),
    (now() - interval '20 days',  'Tênis de Corrida', 1),
    (now() - interval '10 days',  'Perfume Essence 100ml', 2),
    (now() - interval '3 days',   'Smartphone X200', 1)
  ) AS t(criado_em, produto_nome, quantidade)
) itens ON itens.criado_em = p.criado_em
JOIN produto pr ON pr.nome = itens.produto_nome;

COMMIT;
