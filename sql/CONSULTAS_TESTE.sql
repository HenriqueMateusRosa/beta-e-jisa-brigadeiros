-- Consultas seguras para verificar cadastros e pedidos
SELECT id,nome,preco,ativo FROM produtos ORDER BY id;
SELECT p.id,c.nome AS cliente,p.total,p.status,p.criado_em FROM pedidos p JOIN clientes c ON c.id=p.cliente_id ORDER BY p.id DESC LIMIT 10;
SELECT i.pedido_id,pr.nome,i.quantidade,i.preco_unitario FROM itens_pedido i JOIN produtos pr ON pr.id=i.produto_id ORDER BY i.pedido_id DESC;
