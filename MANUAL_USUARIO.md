# Manual de uso — Beta & Jisa Brigadeiros

## Cliente
1. Acesse http://127.0.0.1:5000 (com o Flask rodando).
2. Navegue em Nossos Produtos, Brigadeiros, Caixas Gourmet e Bolos.
3. Escolha a quantidade e clique em **Adicionar**. Os produtos precisam estar cadastrados e ativos no Supabase.
4. Abra o carrinho, confira itens e total, remova itens se necessário.
5. Clique em **Finalizar pelo WhatsApp**, preencha nome, telefone, endereço e observações.
6. O sistema registra o pedido no banco e abre o WhatsApp para confirmação.

## Administrador
1. Abra http://127.0.0.1:5000/admin
2. Digite o valor de BETA_ADMIN_TOKEN que você definiu no seu .env. Nunca compartilhe esse token.
3. Clique em **Carregar dados**.
4. Confira pedidos e altere status para recebido, em produção, pronto, entregue ou cancelado.
5. Em Produtos, altere nomes, preços e disponibilidade, ou cadastre um novo item.
6. As imagens precisam existir na pasta img e o caminho deve corresponder ao cadastro.

## Observações
- O projeto é uma demonstração local: Flask e banco Supabase; para uso público é necessário hospedar o servidor e reforçar segurança.
- A consulta WhatsApp não registra pedido no banco; somente a finalização pelo carrinho o faz.
