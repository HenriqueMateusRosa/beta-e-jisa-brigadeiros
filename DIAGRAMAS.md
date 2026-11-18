# Diagramas da solução

## Arquitetura
```mermaid
flowchart LR
  A[Cliente navegador] --> B[Interface HTML CSS JS]
  B --> C[API Flask]
  C --> D[(PostgreSQL Supabase)]
  C --> E[WhatsApp após registro]
  F[Administrador] --> G[Painel admin]
  G --> C
```

## Modelo de dados
```mermaid
erDiagram
  CLIENTES ||--o{ PEDIDOS : realiza
  PEDIDOS ||--|{ ITENS_PEDIDO : contem
  PRODUTOS ||--o{ ITENS_PEDIDO : compoe
  CLIENTES { bigint id PK
    text nome
    text telefone
    text endereco }
  PEDIDOS { bigint id PK
    bigint cliente_id FK
    text status
    numeric total
    text observacao }
  PRODUTOS { bigint id PK
    text nome
    numeric preco
    boolean ativo }
  ITENS_PEDIDO { bigint id PK
    bigint pedido_id FK
    bigint produto_id FK
    int quantidade
    numeric preco_unitario }
```

## Padrão de organização
A aplicação utiliza separação entre interface (HTML/CSS/JS), rotas e regras (Flask) e persistência (PostgreSQL). **Não é MVC formalmente separado em módulos**; pode ser refatorada futuramente.
