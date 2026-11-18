/* ============================================================
   COZINHA - kanban de pedidos com avanço de status
   Lê/escreve localStorage: 'pedidos'
   Depende de: js/global.js (FilaHelpers)
   ============================================================ */

const ORDEM_STATUS = ['recebido', 'preparo', 'pronto', 'entregue'];

const NOMES_STATUS = {
  recebido: 'Recebido',
  preparo:  'Em preparo',
  pronto:   'Pronto',
  entregue: 'Entregue'
};

const BOTAO_AVANCAR = {
  recebido: 'Iniciar preparo →',
  preparo:  'Marcar pronto →',
  pronto:   'Entregue ✓',
  entregue: null
};

// ---------- PERSISTÊNCIA ----------
function carregarPedidos() {
  return JSON.parse(localStorage.getItem('pedidos') || '[]');
}

function salvarPedidos(pedidos) {
  localStorage.setItem('pedidos', JSON.stringify(pedidos));
}

// ---------- HELPERS ----------
function horaFormatada(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit'
  });
}

function nomesItens(pedido) {
  return pedido.itens
    .map(i => `${i.quantidade}x ${i.nome}`)
    .join('<br>');
}

function proximoStatus(statusAtual) {
  const idx = ORDEM_STATUS.indexOf(statusAtual);
  if (idx === -1 || idx === ORDEM_STATUS.length - 1) return null;
  return ORDEM_STATUS[idx + 1];
}

// ============================================================
// RENDERIZAÇÃO DO KANBAN
// ============================================================
function renderizarKanban() {
  const pedidos = carregarPedidos();

  // Limpa as 4 colunas
  ORDEM_STATUS.forEach(st => {
    document.getElementById(`col-${st}`).innerHTML = '';
  });

  // Contadores
  const total = pedidos.filter(p => p.status !== 'entregue').length;
  document.getElementById('contador-fila').textContent =
    `${total} pedido(s) na fila`;

  if (pedidos.length === 0) {
    ORDEM_STATUS.forEach(st => {
      const col = document.getElementById(`col-${st}`);
      col.innerHTML = '<p style="text-align:center;color:#bbb;font-style:italic;font-size:.85rem;padding:1rem 0">Nenhum pedido</p>';
    });
    return;
  }

  // Distribui por status
  pedidos
    .slice()
    .sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm)) // mais antigo primeiro
    .forEach(pedido => {
      const status = ORDEM_STATUS.includes(pedido.status)
        ? pedido.status
        : 'recebido';

      const coluna = document.getElementById(`col-${status}`);
      if (!coluna) return;

      coluna.appendChild(criarCartao(pedido));
    });
}

function criarCartao(pedido) {
  const cartao = document.createElement('article');
  cartao.className = 'cartao-pedido';
  cartao.dataset.numero = pedido.numero;
  cartao.dataset.status = pedido.status;

  const proximo = proximoStatus(pedido.status);
  const rotulo = BOTAO_AVANCAR[pedido.status];
  const classeExtra = pedido.status === 'pronto' ? 'verde' : '';

  cartao.innerHTML = `
    <header>
      <span class="numero">Pedido #${String(pedido.numero).padStart(3, '0')}</span>
      <span class="hora">${horaFormatada(pedido.criadoEm)}</span>
    </header>
    <div class="itens">${nomesItens(pedido)}</div>
    ${pedido.pago ? '<span class="pago-tag">💰 Pago</span>' : ''}
    ${proximo
      ? `<div class="acoes">
           <button type="button"
                   class="avancar ${classeExtra}"
                   data-numero="${pedido.numero}"
                   data-proximo="${proximo}">
             ${rotulo}
           </button>
         </div>`
      : ''}
  `;

  return cartao;
}

// ============================================================
// AÇÃO: AVANÇAR STATUS
// ============================================================
function avancarStatus(numero, novoStatus) {
  const pedidos = carregarPedidos();
  const pedido = pedidos.find(p => p.numero === Number(numero));

  if (!pedido) return;

  pedido.status = novoStatus;

  if (novoStatus === 'pronto') {
    pedido.prontoEm = new Date().toISOString();
  }
  if (novoStatus === 'entregue') {
    pedido.entregueEm = new Date().toISOString();
  }

  salvarPedidos(pedidos);
  renderizarKanban();

  // Pequena animação de feedback
  const msg = document.getElementById('msg-status');
  msg.textContent =
    `✅ Pedido #${String(numero).padStart(3, '0')} → ${NOMES_STATUS[novoStatus]}`;
  msg.className = 'form-msg sucesso';
}

// ============================================================
// INICIALIZAÇÃO + EVENTOS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  renderizarKanban();

  // Auto-refresh a cada 5s (para ver pedidos novos criados em outra aba)
  setInterval(renderizarKanban, 5000);

  // ---------- BOTÃO ATUALIZAR ----------
  document.getElementById('btn-atualizar').addEventListener('click', () => {
    renderizarKanban();
    const msg = document.getElementById('msg-status');
    msg.textContent = '🔄 Fila atualizada.';
    msg.className = 'form-msg sucesso';
  });

  // ---------- DELEGAÇÃO: BOTÕES "AVANÇAR" ----------
  document.getElementById('kanban').addEventListener('click', (e) => {
    const btn = e.target.closest('button.avancar');
    if (!btn) return;

    avancarStatus(btn.dataset.numero, btn.dataset.proximo);
  });

  // ---------- FORMULÁRIO MANUAL ----------
  const form = document.getElementById('form-status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const numero = Number(document.getElementById('nro-pedido-coz').value);
    const novoStatus = document.getElementById('novo-status').value;
    const msg = document.getElementById('msg-status');

    if (!numero || numero < 1) {
      msg.textContent = 'Informe um número de pedido válido.';
      msg.className = 'form-msg erro';
      return;
    }

    if (!novoStatus) {
      msg.textContent = 'Selecione o novo status.';
      msg.className = 'form-msg erro';
      return;
    }

    const pedidos = carregarPedidos();
    const pedido = pedidos.find(p => p.numero === numero);

    if (!pedido) {
      msg.textContent = `Pedido #${numero} não encontrado.`;
      msg.className = 'form-msg erro';
      return;
    }

    if (pedido.status === novoStatus) {
      msg.textContent =
        `O pedido #${numero} já está com status "${NOMES_STATUS[novoStatus]}".`;
      msg.className = 'form-msg erro';
      return;
    }

    avancarStatus(numero, novoStatus);
    form.reset();
  });
});