# Beta & Jisa Brigadeiros — PITE II

Sistema acadêmico de catálogo e registro de pedidos. Front-end original preservado, API Flask e banco SQLite.

## Como executar (Windows)
1. Instale Python 3.10+ e abra o terminal nesta pasta.
2. `py -m venv .venv`
3. `.venv\Scripts\activate`
4. `pip install -r requirements.txt`
5. `python app.py`
6. Acesse http://127.0.0.1:5000

Não use `npm run dev` para testar pedidos: ele inicia apenas o front-end.

## Endpoints
- `GET /api/produtos`: catálogo
- `POST /api/pedidos`: registra pedido; exemplo de corpo: `{"cliente":"Teste","telefone":"54999999999","endereco":"Retirada","itens":[{"produto_id":1,"quantidade":2}]}`
- `GET /api/admin/pedidos`: lista pedidos, exige cabeçalho `X-Admin-Token`
- `PATCH /api/admin/pedidos/1`: atualiza status
- `POST /api/admin/produtos`: cadastra produto
- `PATCH /api/admin/produtos/1`: edita/desativa produto

Para usar rotas administrativas, defina a variável de ambiente `BETA_ADMIN_TOKEN` com um segredo forte antes de iniciar. A interface administrativa gráfica ainda não está implementada; as rotas podem ser demonstradas via Postman.

## Arquivos de mídia ausentes
O HTML original referencia `img/` e `video/`, mas essas pastas não foram enviadas. Copie as imagens e o vídeo originais para os caminhos indicados no HTML.

## Limitações
Projeto didático, não pronto para produção: requer autenticação robusta, política de privacidade/LGPD, proteção antiabuso e implantação segura. O envio ao WhatsApp depende da confirmação manual do usuário.


## Versão PostgreSQL na nuvem
Veja README_NUVEM.md. Não use instruções antigas de SQLite.
