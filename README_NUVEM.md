# Banco de dados PostgreSQL na nuvem (Supabase)

1. Crie um projeto em https://supabase.com/dashboard.
2. Em **Connect**, copie a URI PostgreSQL apropriada para seu ambiente (pooler, se necessário).
3. No Windows PowerShell, configure `$env:DATABASE_URL="postgresql://..."` e `$env:BETA_ADMIN_TOKEN="..."`. Não compartilhe esses valores nem coloque no Git.
4. Instale `pip install -r requirements.txt`.
5. Execute **uma vez** `python app.py --init-db` para criar as tabelas e os quatro produtos iniciais.
6. Execute `python app.py` e acesse http://localhost:5000.

O site e a API podem rodar localmente, enquanto os dados ficam no Supabase. Para acesso público, hospede também a API em um serviço compatível com Flask, configurando as mesmas variáveis de ambiente.

**Segurança:** credenciais de banco apenas no servidor; nunca no JavaScript do navegador. Use senha forte e HTTPS em produção. O token administrativo atual é apenas um mecanismo simples para demonstração acadêmica, não um sistema completo de autenticação para produção.

**Importante:** o banco ainda não foi criado na sua conta Supabase; você precisa criar o projeto e configurar a conexão.
