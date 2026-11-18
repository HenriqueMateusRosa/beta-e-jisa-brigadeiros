# Projeto Integrador Transdisciplinar em Engenharia de Software II
## Beta & Jisa Brigadeiros — Sistema Web de Pedidos

### 1. Introdução
O projeto propõe digitalizar a recepção e o acompanhamento de pedidos de uma confeitaria artesanal, a partir de um site existente.

### 2. Problema
Pedidos recebidos por mensagens podem dificultar o registro estruturado de itens, quantidades, preços e status. A aplicação busca organizar essas informações.

### 3. Objetivos
**Geral:** desenvolver sistema web para catálogo e registro de pedidos. **Específicos:** modelar banco relacional; criar API; integrar front-end; documentar arquitetura; testar funções e usabilidade.

### 4. Requisitos funcionais
RF01 listar produtos; RF02 selecionar quantidade e adicionar ao carrinho; RF03 remover itens; RF04 calcular total; RF05 registrar pedido com identificação e endereço; RF06 consultar pedidos administrativamente; RF07 alterar status; RF08 cadastrar/editar/desativar produtos.

### 5. Requisitos não funcionais
RNF01 layout responsivo; RNF02 dados persistidos em PostgreSQL (Supabase); RNF03 validação de campos e preços no servidor; RNF04 rotas administrativas protegidas por token de demonstração; RNF05 separação entre interface, regras de negócio e dados.

### 6. Arquitetura
Front-end: HTML/CSS/JS (view). Flask: rotas/controllers e regras de negócio. PostgreSQL (Supabase): persistência/model. A implementação é inspirada na separação MVC, ainda simplificada em um único módulo Python.

### 7. Modelo de dados
PRODUTOS(id, nome, preco_centavos, imagem, ativo); PEDIDOS(id, cliente, telefone, endereco, observacao, total_centavos, status, criado_em); ITENS_PEDIDO(id, pedido_id, produto_id, nome_produto, quantidade, preco_unitario_centavos). Um pedido possui muitos itens; cada item referencia um produto. O valor unitário é registrado no momento da compra.

### 8. Fluxo principal
Cliente abre catálogo → adiciona itens → informa dados → servidor valida produtos e recalcula preços → pedido e itens são persistidos → sistema informa número do pedido → cliente pode abrir WhatsApp.

### 9. Plano de testes (preencher resultados reais)
| ID | Procedimento | Resultado esperado | Resultado observado | Situação |
|---|---|---|---|---|
| T01 | Abrir catálogo | Exibir quatro produtos iniciais | A preencher | Pendente |
| T02 | Adicionar duas unidades | Carrinho calcula subtotal | A preencher | Pendente |
| T03 | Remover item | Total é atualizado | A preencher | Pendente |
| T04 | Finalizar com dados válidos | Pedido recebe número e persiste | A preencher | Pendente |
| T05 | Enviar quantidade negativa via API | Erro HTTP 400 | A preencher | Pendente |
| T06 | Consultar admin sem token | Erro HTTP 401 | A preencher | Pendente |

### 10. Avaliação com cinco participantes
Aplicar o mesmo roteiro a cinco voluntários: localizar produto, adicionar duas unidades, retirar item e finalizar pedido de teste. Registrar tempo, dificuldades, comentários e sugestões sem inventar dados.

| Participante | Data | Conseguiu concluir? | Dificuldades | Sugestões |
|---|---|---|---|---|
| P1 | | | | |
| P2 | | | | |
| P3 | | | | |
| P4 | | | | |
| P5 | | | | |

### 11. Roteiro de vídeo (~5 minutos)
0:00–0:40 apresentação do problema; 0:40–1:30 objetivos e arquitetura; 1:30–3:20 demonstração do catálogo, carrinho e pedido; 3:20–4:15 banco de dados e API; 4:15–5:00 testes, conclusões e melhorias.

### 12. Conclusão (a completar após testes)
Descrever o que foi implementado, limitações verificadas e resultados reais dos cinco participantes.

### 13. Referências sugeridas para consulta
Documentação oficial Python, Flask, PostgreSQL (Supabase) e MDN Web Docs. Completar as referências bibliográficas com links, datas de acesso e formatação exigida pela instituição.
