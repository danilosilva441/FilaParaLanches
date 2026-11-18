/* ============================================================
   PRODUTOS - arrays, busca, carrinho e eventos
   Depende de: js/global.js (FilaHelpers)
   Integra com: ../acompanhamento/acompanhamento.html
   ============================================================ */

// ---------- ARRAY DE PRODUTOS (fonte de verdade) ----------
const PRODUTOS = [
    // Lanches
    { codigo: 'L01', nome: 'X-Burger', categoria: 'lanches', descricao: 'Pão, hambúrguer, queijo e molho da casa', preco: 18.00 },
    { codigo: 'L02', nome: 'X-Salada', categoria: 'lanches', descricao: 'Pão, hambúrguer, queijo, alface e tomate', preco: 20.00 },
    { codigo: 'L03', nome: 'X-Bacon', categoria: 'lanches', descricao: 'Pão, hambúrguer, queijo, bacon e cheddar', preco: 24.00 },
    { codigo: 'L04', nome: 'X-Tudo', categoria: 'lanches', descricao: 'Pão, dois hambúrgueres, presunto, ovo, bacon e salada', preco: 30.00 },
    { codigo: 'L05', nome: 'Hot Dog', categoria: 'lanches', descricao: 'Pão, salsicha, milho, batata palha e molhos', preco: 15.00 },
    // Porções
    { codigo: 'P01', nome: 'Batata Frita', categoria: 'porcoes', descricao: 'Porção de batata frita crocante com sal', preco: 16.00 },
    { codigo: 'P02', nome: 'Batata com Cheddar', categoria: 'porcoes', descricao: 'Batata frita coberta com cheddar e bacon', preco: 22.00 },
    { codigo: 'P03', nome: 'Frango a Passarinho', categoria: 'porcoes', descricao: 'Porção de frango empanado com alho e limão', preco: 28.00 },
    // Bebidas
    { codigo: 'B01', nome: 'Refrigerante Lata', categoria: 'bebidas', descricao: 'Lata de 350 ml - diversos sabores', preco: 7.00 },
    { codigo: 'B02', nome: 'Suco Natural', categoria: 'bebidas', descricao: 'Copo de 500 ml - laranja, limão ou maracujá', preco: 10.00 },
    { codigo: 'B03', nome: 'Água Mineral', categoria: 'bebidas', descricao: 'Garrafa de 500 ml, com ou sem gás', preco: 5.00 },
    // Sobremesas
    { codigo: 'S01', nome: 'Milk Shake', categoria: 'sobremesas', descricao: 'Copo de 400 ml - chocolate, morango ou baunilha', preco: 14.00 },
    { codigo: 'S02', nome: 'Petit Gateau', categoria: 'sobremesas', descricao: 'Bolo quente de chocolate com sorvete de creme', preco: 18.00 }
];

// ---------- CARRINHO (localStorage) ----------
function carregarCarrinho() {
    return JSON.parse(localStorage.getItem('carrinho') || '[]');
}

function salvarCarrinho(carrinho) {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function adicionarAoCarrinho(codigo) {
    // 🔒 Verificação de estoque
    const estoque = JSON.parse(localStorage.getItem('estoqueProdutos') || '[]');
    const itemEstoque = estoque.find(p => p.codigo === codigo);

    if (itemEstoque) {
        const carrinho = carregarCarrinho();
        const noCarrinho = carrinho.find(i => i.codigo === codigo)?.quantidade || 0;

        if (noCarrinho + 1 > itemEstoque.quantidade) {
            alert(`"${itemEstoque.nome}" está sem estoque suficiente (${itemEstoque.quantidade} disponível).`);
            return;
        }
    }

    const carrinho = carregarCarrinho();
    const item = carrinho.find(i => i.codigo === codigo);

    if (item) {
        item.quantidade += 1;
    } else {
        carrinho.push({ codigo, quantidade: 1 });
    }

    salvarCarrinho(carrinho);
    atualizarContadorCarrinho();
}

// ---------- CONTADOR FLUTUANTE COM BOTÃO FINALIZAR ----------
function atualizarContadorCarrinho() {
    const carrinho = carregarCarrinho();
    const total = carrinho.reduce((soma, item) => soma + item.quantidade, 0);

    let contador = document.querySelector('.contador-carrinho');

    if (!contador) {
        contador = document.createElement('div');
        contador.className = 'contador-carrinho';
        document.body.appendChild(contador);
    }

    if (total === 0) {
        contador.classList.add('vazio');
        contador.innerHTML = '';
        return;
    }

    contador.classList.remove('vazio');
    contador.innerHTML = `
    <span class="contador-texto">🛒 ${total} item(ns)</span>
    <button type="button" id="btn-finalizar" class="btn-finalizar">
      Finalizar pedido
    </button>
  `;

    contador.querySelector('#btn-finalizar')
        .addEventListener('click', finalizarPedido);
}

// ---------- FINALIZAR: carrinho vira pedido na fila ----------
function finalizarPedido() {
    const carrinho = carregarCarrinho();

    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    // 1) Lê pedidos existentes
    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');

    // 2) Calcula próximo número
    const proximoNumero = pedidos.length
        ? Math.max(...pedidos.map(p => p.numero)) + 1
        : 1;

    // 3) Converte itens do carrinho (código + qtd) em itens completos
    const itens = carrinho.map(item => {
        const prod = PRODUTOS.find(p => p.codigo === item.codigo);
        return {
            codigo: item.codigo,
            nome: prod.nome,
            quantidade: item.quantidade,
            preco: prod.preco
        };
    });

    const estoque = JSON.parse(localStorage.getItem('estoqueProdutos') || '[]');
    carrinho.forEach(item => {
        const p = estoque.find(x => x.codigo === item.codigo);
        if (p) {
            p.quantidade = Math.max(0, p.quantidade - item.quantidade);
        }
    });
    localStorage.setItem('estoqueProdutos', JSON.stringify(estoque));

    // 4) Cria o pedido na fila
    pedidos.push({
        numero: proximoNumero,
        status: 'recebido',
        criadoEm: new Date().toISOString(),
        itens
    });

    // 5) Persiste
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    localStorage.setItem('ultimoPedido', String(proximoNumero));
    localStorage.removeItem('carrinho');

    // 6) Redireciona para o acompanhamento
    // (o acompanhamento lê 'ultimoPedido' e já carrega o pedido)
    window.location.href = '../acompanhamento/acompanhamento.html';
}

// ---------- RENDERIZAÇÃO DOS CARDS ----------
function criarCard(produto) {
    const card = document.createElement('article');
    card.className = 'card-produto';
    card.dataset.codigo = produto.codigo;

    card.innerHTML = `
    <span class="codigo">${produto.codigo}</span>
    <h4>${produto.nome}</h4>
    <p class="descricao">${produto.descricao}</p>
    <p class="preco">${FilaHelpers.formatarMoeda(produto.preco)}</p>
    <div class="acoes">
      <button type="button" class="adicionar" data-codigo="${produto.codigo}">
        Adicionar
      </button>
      <button type="button" class="secundario detalhes" data-codigo="${produto.codigo}">
        Detalhes
      </button>
    </div>
  `;
    return card;
}

function renderizarProdutos(lista) {
    document.querySelectorAll('.categoria .grade-produtos').forEach(g => {
        g.innerHTML = '';
    });

    if (lista.length === 0) {
        const container = document.querySelector('.categoria .grade-produtos');
        if (container) {
            container.innerHTML = '<p class="sem-resultado">Nenhum produto encontrado. 🍔</p>';
        }
        return;
    }

    const grupos = lista.reduce((acc, p) => {
        (acc[p.categoria] = acc[p.categoria] || []).push(p);
        return acc;
    }, {});

    Object.entries(grupos).forEach(([cat, itens]) => {
        const secao = document.querySelector(`.categoria[data-categoria="${cat}"]`);
        if (!secao) return;
        const grade = secao.querySelector('.grade-produtos');
        itens.forEach(p => grade.appendChild(criarCard(p)));
    });
}

// ---------- FILTROS ----------
function aplicarFiltros() {
    const termo = document.getElementById('nome-produto').value.trim().toLowerCase();
    const categoria = document.getElementById('categoria-produto').value;
    const msg = document.getElementById('msg-busca');

    const resultado = PRODUTOS.filter(p => {
        const bateNome = p.nome.toLowerCase().includes(termo) ||
            p.descricao.toLowerCase().includes(termo);
        const bateCategoria = !categoria || p.categoria === categoria;
        return bateNome && bateCategoria;
    });

    renderizarProdutos(resultado);

    if (msg) {
        if (resultado.length === 0) {
            msg.textContent = 'Nenhum produto corresponde ao filtro.';
            msg.className = 'form-msg erro';
        } else {
            msg.textContent = `${resultado.length} produto(s) encontrado(s).`;
            msg.className = 'form-msg sucesso';
        }
    }
}

// ---------- INICIALIZAÇÃO ----------
document.addEventListener('DOMContentLoaded', () => {
    renderizarProdutos(PRODUTOS);
    atualizarContadorCarrinho();

    const form = document.getElementById('form-busca');
    const btnLimpar = document.getElementById('btn-limpar');
    const msg = document.getElementById('msg-busca');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        aplicarFiltros();
    });

    document.getElementById('nome-produto')
        .addEventListener('input', aplicarFiltros);

    document.getElementById('categoria-produto')
        .addEventListener('change', aplicarFiltros);

    btnLimpar.addEventListener('click', () => {
        setTimeout(() => {
            renderizarProdutos(PRODUTOS);
            if (msg) {
                msg.textContent = '';
                msg.className = 'form-msg';
            }
        }, 0);
    });

    // Delegação: botões Adicionar / Detalhes
    document.querySelector('main').addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const codigo = btn.dataset.codigo;

        if (btn.classList.contains('adicionar')) {
            adicionarAoCarrinho(codigo);
            const card = btn.closest('.card-produto');
            card.classList.add('adicionado');
            setTimeout(() => card.classList.remove('adicionado'), 600);
        }

        if (btn.classList.contains('detalhes')) {
            const p = PRODUTOS.find(x => x.codigo === codigo);
            alert(`${p.nome}\n\n${p.descricao}\n\nPreço: ${FilaHelpers.formatarMoeda(p.preco)}`);
        }
    });
});