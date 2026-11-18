/* ============================================================
   ACOMPANHAMENTO - consulta de pedido por número
   Integra com: carrinho (produtos.js) + fila de pedidos
   Depende de: js/global.js (FilaHelpers)
   ============================================================ */

// ---------- PEDIDOS DE EXEMPLO (semente) ----------
// Em produção isso viria do backend. Aqui, simulamos persistência
// em localStorage para que caixa/cozinha possam interagir depois.
const PEDIDOS_INICIAIS = [
  {
    numero: 1,
    status: 'preparo',
    criadoEm: '2026-01-15T18:05:00',
    itens: [
      { codigo: 'L03', nome: 'X-Bacon',          quantidade: 1, preco: 24.00 },
      { codigo: 'B01', nome: 'Refrigerante Lata', quantidade: 1, preco:  7.00 }
    ]
  },
  {
    numero: 2,
    status: 'pronto',
    criadoEm: '2026-01-15T18:20:00',
    itens: [
      { codigo: 'L01', nome: 'X-Burger',      quantidade: 2, preco: 18.00 },
      { codigo: 'P01', nome: 'Batata Frita',  quantidade: 1, preco: 16.00 }
    ]
  }
];

// ---------- PERSISTÊNCIA ----------
function carregarPedidos() {
  let pedidos = JSON.parse(localStorage.getItem('pedidos') || 'null');

  if (!pedidos) {
    pedidos = PEDIDOS_INICIAIS;
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
  }
  return pedidos;
}

function buscarPedidoPorNumero(numero) {
  return carregarPedidos().find(p => p.numero === Number(numero));
}

// ---------- RENDERIZAÇÃO ----------
const ETAPAS = ['recebido', 'preparo', 'pronto', 'entregue'];

function renderizarStatus(pedido) {
  const secao = document.getElementById('status-pedido');
  secao.classList.remove('oculto');

  document.getElementById('numero-exibido').textContent = `nº ${pedido.numero}`;

  const nomesStatus = {
    recebido: 'Recebido',
    preparo:  'Em preparo',
    pronto:   'Pronto para retirada',
    entregue: 'Entregue'
  };

  document.getElementById('status-texto').textContent = nomesStatus[pedido.status] || '—';

  const indiceAtual = ETAPAS.indexOf(pedido.status);

  document.querySelectorAll('#linha-status li').forEach((li, idx) => {
    li.classList.remove('concluido', 'atual');

    if (idx < indiceAtual) {
      li.classList.add('concluido');
    } else if (idx === indiceAtual) {
      li.classList.add('atual');
    }

    // Preenche a hora de cada etapa (simulação baseada no criadoEm)
    const horaEl = li.querySelector('.hora');
    if (horaEl && idx <= indiceAtual) {
      const base = new Date(pedido.criadoEm);
      base.setMinutes(base.getMinutes() + idx * 5);
      horaEl.textContent = base.toLocaleTimeString('pt-BR', {
        hour: '2-digit', minute: '2-digit'
      });
    } else if (horaEl) {
      horaEl.textContent = '—';
    }
  });

  // Mensagem final
  const msg = document.getElementById('msg-retirada');
  if (pedido.status === 'pronto') {
    msg.textContent = '🔔 Seu pedido está pronto! Retire no balcão.';
    msg.className = 'form-msg sucesso';
  } else if (pedido.status === 'entregue') {
    msg.textContent = '✅ Pedido entregue. Obrigado pela preferência!';
    msg.className = 'form-msg sucesso';
  } else if (pedido.status === 'preparo') {
    msg.textContent = '👨‍🍳 Estamos preparando seu lanche...';
    msg.className = 'form-msg';
  } else {
    msg.textContent = '📥 Pedido recebido. Aguarde o preparo.';
    msg.className = 'form-msg';
  }

  renderizarResumo(pedido);
}

function renderizarResumo(pedido) {
  const secao = document.getElementById('resumo-pedido');
  secao.classList.remove('oculto');

  document.getElementById('caption-resumo').textContent =
    `Itens do pedido nº ${pedido.numero}`;

  const corpo = document.getElementById('corpo-resumo');
  corpo.innerHTML = '';

  let total = 0;

  pedido.itens.forEach(item => {
    const subtotal = item.preco * item.quantidade;
    total += subtotal;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.nome}</td>
      <td>${item.quantidade}</td>
      <td>${FilaHelpers.formatarMoeda(item.preco)}</td>
      <td>${FilaHelpers.formatarMoeda(subtotal)}</td>
    `;
    corpo.appendChild(tr);
  });

  const trTotal = document.createElement('tr');
  trTotal.innerHTML = `
    <td><strong>Total</strong></td>
    <td colspan="2"></td>
    <td><strong>${FilaHelpers.formatarMoeda(total)}</strong></td>
  `;
  corpo.appendChild(trTotal);
}

// ---------- CONSULTA ----------
function consultarPedido(numero) {
  const msg = document.getElementById('msg-consulta');
  const campo = document.getElementById('nro-pedido-acomp');

  if (!numero || Number(numero) < 1) {
    msg.textContent = 'Informe um número de pedido válido.';
    msg.className = 'form-msg erro';
    FilaHelpers.marcarCampo(campo, false);
    return;
  }

  const pedido = buscarPedidoPorNumero(numero);

  if (!pedido) {
    msg.textContent = `Pedido nº ${numero} não encontrado. Verifique o número.`;
    msg.className = 'form-msg erro';
    FilaHelpers.marcarCampo(campo, false);
    document.getElementById('status-pedido').classList.add('oculto');
    document.getElementById('resumo-pedido').classList.add('oculto');
    return;
  }

  FilaHelpers.marcarCampo(campo, true);
  msg.textContent = `Pedido encontrado!`;
  msg.className = 'form-msg sucesso';

  renderizarStatus(pedido);
  secaoScroll('status-pedido');
}

function secaoScroll(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------- INICIALIZAÇÃO ----------
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-consulta');
  const campo = document.getElementById('nro-pedido-acomp');
  const msg = document.getElementById('msg-consulta');

  // 1) Se houver pedido recém-criado (produtos → finalizar), usa o último
  const ultimoNumero = localStorage.getItem('ultimoPedido');
  if (ultimoNumero) {
    campo.value = ultimoNumero;
    consultarPedido(ultimoNumero);
  }

  // 2) Submit do formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    consultarPedido(campo.value.trim());
  });

  // 3) Validação em tempo real
  campo.addEventListener('input', () => {
    if (campo.classList.contains('invalido') && campo.value.trim()) {
      FilaHelpers.marcarCampo(campo, true);
    }
  });

  // 4) Reset
  document.getElementById('btn-limpar').addEventListener('click', () => {
    setTimeout(() => {
      msg.textContent = '';
      msg.className = 'form-msg';
      campo.classList.remove('valido', 'invalido');
      document.getElementById('status-pedido').classList.add('oculto');
      document.getElementById('resumo-pedido').classList.add('oculto');
    }, 0);
  });
});