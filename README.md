# FilaParaLanches 🍔

Sistema de lanchonete com fila digital de pedidos.

## Como executar
Abra `index.html` no navegador (não precisa de servidor).

## Contas de teste (senha: 123456)
- cliente@teste.com → Acompanhamento
- caixa@teste.com → Caixa
- cozinha@teste.com → Cozinha
- dono@teste.com → Estoque

## Páginas
- `index.html` — Home com formulário de promoção
- `paginas/clientes/produtos/` — Cardápio com busca + carrinho
- `paginas/clientes/acompanhamento/` — Consulta de pedido por número
- `paginas/clientes/login/` — Login com 4 tipos de acesso
- `paginas/contato/` — Formulário de contato completo
- `paginas/donos/caixa.html` — Abertura/pagamentos/fechamento
- `paginas/donos/cozinha.html` — Kanban de pedidos
- `paginas/donos/estoque.html` — CRUD de produtos

## Tecnologias
HTML5 · CSS3 (Grid/Flexbox) · JavaScript ES6+ · localStorage

## Roteiro de demo (5 min)
1. Produtos → adicione X-Bacon + Refri → Finalizar
2. Acompanhamento → status "Recebido"
3. Cozinha → avança status → "Pronto"
4. Caixa → registra pagamento → fecha caixa
5. Estoque → decremento automático
6. Login como dono → menu completo aparece