# Beta & Jisa Brigadeiros — Projeto Integrador II

## Executar
1. Abra a pasta no VS Code.
2. Crie `.env` a partir de `.env.example` e configure `DATABASE_URL` do Supabase e `BETA_ADMIN_TOKEN` longo e aleatório. **Não envie o .env ao GitHub.**
3. `python -m pip install -r requirements.txt`
4. `python app.py`
5. Acesse **http://127.0.0.1:5000**. O Flask serve o front-end diretamente, então não é necessário Vite para demonstrar.
6. Painel administrativo: **http://127.0.0.1:5000/admin**.
7. Testes automatizados: `python -m unittest discover -s tests -v`.

## Banco
Tabelas existentes no Supabase: produtos, clientes, pedidos, itens_pedido. Não execute `--init-db` nem recrie as tabelas.

## Funcionalidades
Catálogo por categorias, cards com adicionar e consulta via WhatsApp, carrinho com total e exclusão, registro de pedidos, validação de preço no servidor, painel de pedidos e cadastro/edição de produtos, PostgreSQL remoto.

## Segurança
Este é um protótipo acadêmico. A rota administrativa utiliza token compartilhado, não autenticação de usuários. Não publicar como loja real sem proteção contra abuso, autenticação adequada, privacidade/LGPD e deploy HTTPS.

## Entrega acadêmica
Inclua link do repositório Git, vídeo narrado, documentação e cinco testes reais preenchidos no modelo de feedback. Não inclua o arquivo `.env`, dados pessoais reais de clientes ou credenciais.
