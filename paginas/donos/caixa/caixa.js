/* ============================================================
   CAIXA - abertura, pagamentos, totais e fechamento
   Lê/escreve localStorage: 'pedidos', 'caixaSessao'
   Depende de: js/global.js (FilaHelpers)
   ============================================================ */

// ---------- ESTADO PERSISTENTE ----------
function carregarPedidos() {
  return JSON.parse(localStorage.getItem('pedidos') || '[]');
}

function salvarPedidos(pedidos) {
  localStorage.setItem('pedidos', JSON.stringify(pedidos));
}

function carregarCaixa() {
  return JSON.parse(localStorage.getItem('caixaSessao') || 'null');
}

function salvarCaixa(caixa) {
  localStorage.setItem('caixaSessao', JSON.stringify(caixa));
}

// ---------- HELPERS ----------
function totalDoPedido(pedido) {
  return pedido.itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0);
}

function horaFormatada(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit'
  });
}

function nomesItens(pedido) {
  return pedido.itens.map(i => `${i.quantidade}x ${i.nome}`).join(', ');
}

// ============================================================
// RENDERIZAÇÃO DO ESTADO DO CAIXA
// ============================================================
function renderizarEstadoCaixa() {
  const caixa = carregarCaixa();
  const badge = document.getElementById('status-caixa');
  const secaoAbertura = document.getElementById('abertura-caixa');

  if (caixa && caixa.aberto) {
    badge.textContent = `🟢 Caixa aberto por ${caixa.funcionario} — troco inicial ${FilaHelpers.formatarMoeda(caixa.valorInicial)}`;
    badge.className = 'badge badge-aberto';
    secaoAbertura.style.display = 'none';
  } else {
    badge.textContent = '🔴 Caixa fechado';
    badge.className = 'badge badge-fechado';
    secaoAbertura.style.display = '';
  }
}

// ============================================================
// TABELA DE PEDIDOS
// ============================================================
function renderizarPedidos() {
  const tbody = document.getElementById('corpo-pedidos');
  const pedidos = carregarPedidos();

  tbody.innerHTML = '';

  if (pedidos.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="6" style="text-align:center;color:#888;padding:1rem">
        Nenhum pedido na fila.
      </td></tr>`;
    return;
  }

  pedidos
    .slice()
    .sort((a, b) => a.numero - b.numero)
    .forEach(pedido => {
      const tr = document.createElement('tr');
      const total = totalDoPedido(pedido);
      const pago = pedido.pago === true;

      if (pago) tr.classList.add('linha-paga');

      tr.innerHTML = `
        <td><strong>${String(pedido.numero).padStart(3, '0')}</strong></td>
        <td>${horaFormatada(pedido.criadoEm)}</td>
        <td>${nomesItens(pedido)}</td>
        <td><strong>${FilaHelpers.formatarMoeda(total)}</strong></td>
        <td>${pago ? (pedido.formaPagamento || '—') : '—'}</td>
        <td>
          <span class="status-cell status-${pago ? 'pago' : pedido.status}">
            ${pago ? 'Pago' : pedido.status}
          </span>
        </td>
      `;
      tbody.appendChild(tr);
    });
}

// ============================================================
// RESUMO DO CAIXA
// ============================================================
function renderizarResumo() {
  const caixa = carregarCaixa();
  const pedidos = carregarPedidos();

  const totais = {
    dinheiro: 0,
    cartao: 0,
    pix: 0
  };

  pedidos.forEach(p => {
    if (p.pago && p.formaPagamento) {
      totais[p.formaPagamento] = (totais[p.formaPagamento] || 0) +
        totalDoPedido(p);
    }
  });

  const trocoInicial = caixa ? caixa.valorInicial : 0;
  const totalDia = totais.dinheiro + totais.cartao + totais.pix;
  const emDinheiro = trocoInicial + totais.dinheiro;

  const tbody = document.getElementById('corpo-resumo-caixa');
  tbody.innerHTML = `
    <tr><td>Troco inicial</td>
        <td>${FilaHelpers.formatarMoeda(trocoInicial)}</td></tr>
    <tr><td>Vendas em dinheiro</td>
        <td>${FilaHelpers.formatarMoeda(totais.dinheiro)}</td></tr>
    <tr><td>Vendas em cartão</td>
        <td>${FilaHelpers.formatarMoeda(totais.cartao)}</td></tr>
    <tr><td>Vendas em pix</td>
        <td>${FilaHelpers.formatarMoeda(totais.pix)}</td></tr>
    <tr><td><strong>Total vendido no dia</strong></td>
        <td><strong>${FilaHelpers.formatarMoeda(totalDia)}</strong></td></tr>
    <tr><td><strong>Dinheiro em caixa (troco + vendas em dinheiro)</strong></td>
        <td><strong>${FilaHelpers.formatarMoeda(emDinheiro)}</strong></td></tr>
  `;
}

// ============================================================
// INICIALIZAÇÃO + EVENTOS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  renderizarEstadoCaixa();
  renderizarPedidos();
  renderizarResumo();

  // ---------- ABERTURA ----------
  const formAbertura = document.getElementById('form-abertura');
  formAbertura.addEventListener('submit', (e) => {
    e.preventDefault();

    const valor = parseFloat(document.getElementById('valor-inicial').value);
    const funcionario = document.getElementById('funcionario-caixa').value.trim();
    const observacao = document.getElementById('observacao-abertura').value.trim();
    const msg = document.getElementById('msg-abertura');

    if (isNaN(valor) || valor < 0) {
      msg.textContent = 'Informe um valor inicial válido.';
      msg.className = 'form-msg erro';
      return;
    }
    if (!funcionario) {
      msg.textContent = 'Informe o funcionário responsável.';
      msg.className = 'form-msg erro';
      return;
    }

    salvarCaixa({
      aberto: true,
      valorInicial: valor,
      funcionario,
      observacao,
      abertoEm: new Date().toISOString()
    });

    msg.textContent = '✅ Caixa aberto com sucesso!';
    msg.className = 'form-msg sucesso';

    renderizarEstadoCaixa();
    renderizarResumo();
    formAbertura.reset();
  });

  // ---------- ATUALIZAR LISTA ----------
  document.getElementById('btn-atualizar').addEventListener('click', () => {
    renderizarPedidos();
    renderizarResumo();
    document.getElementById('msg-pedidos').textContent =
      '🔄 Lista atualizada.';
    document.getElementById('msg-pedidos').className = 'form-msg sucesso';
  });

  // ---------- PRÉVIA DE TROCO ----------
  const campoNroPag = document.getElementById('nro-pedido-pag');
  const campoValor = document.getElementById('valor-pag');
  const trocoInfo = document.getElementById('troco-info');

  function atualizarTroco() {
    const numero = Number(campoNroPag.value);
    const pago = parseFloat(campoValor.value);

    if (!numero || isNaN(pago)) {
      trocoInfo.textContent = '';
      trocoInfo.className = 'troco-info';
      return;
    }

    const pedido = carregarPedidos().find(p => p.numero === numero);

    if (!pedido) {
      trocoInfo.textContent = `Pedido ${numero} não encontrado.`;
      trocoInfo.className = 'troco-info insuficiente';
      return;
    }

    const total = totalDoPedido(pedido);
    const troco = pago - total;

    if (troco < 0) {
      trocoInfo.textContent = `Valor insuficiente. Faltam ${FilaHelpers.formatarMoeda(-troco)}.`;
      trocoInfo.className = 'troco-info insuficiente';
    } else {
      trocoInfo.textContent = `Troco: ${FilaHelpers.formatarMoeda(troco)}`;
      trocoInfo.className = 'troco-info suficiente';
    }
  }

  campoNroPag.addEventListener('input', atualizarTroco);
  campoValor.addEventListener('input', atualizarTroco);

  // ---------- REGISTRAR PAGAMENTO ----------
  const formPag = document.getElementById('form-pagamento');
  formPag.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = document.getElementById('msg-pagamento');
    const numero = Number(campoNroPag.value);
    const valorRecebido = parseFloat(campoValor.value);
    const forma = formPag.querySelector('input[name="pagamento"]:checked');

    if (!numero || numero < 1) {
      msg.textContent = 'Informe um número de pedido válido.';
      msg.className = 'form-msg erro';
      return;
    }

    if (isNaN(valorRecebido) || valorRecebido < 0) {
      msg.textContent = 'Informe um valor recebido válido.';
      msg.className = 'form-msg erro';
      return;
    }

    if (!forma) {
      msg.textContent = 'Selecione uma forma de pagamento.';
      msg.className = 'form-msg erro';
      return;
    }

    const pedidos = carregarPedidos();
    const pedido = pedidos.find(p => p.numero === numero);

    if (!pedido) {
      msg.textContent = `Pedido ${numero} não encontrado.`;
      msg.className = 'form-msg erro';
      return;
    }

    if (pedido.pago) {
      msg.textContent = 'Este pedido já foi pago.';
      msg.className = 'form-msg erro';
      return;
    }

    const total = totalDoPedido(pedido);

    if (forma.value === 'dinheiro' && valorRecebido < total) {
      msg.textContent = `Valor insuficiente. Total: ${FilaHelpers.formatarMoeda(total)}.`;
      msg.className = 'form-msg erro';
      return;
    }

    // Marca pago
    pedido.pago = true;
    pedido.formaPagamento = forma.value;
    pedido.valorRecebido = valorRecebido;
    pedido.pagoEm = new Date().toISOString();

    salvarPedidos(pedidos);

    const troco = valorRecebido - total;
    msg.textContent =
      `✅ Pagamento registrado! Total ${FilaHelpers.formatarMoeda(total)}.` +
      (forma.value === 'dinheiro' && troco > 0
        ? ` Troco: ${FilaHelpers.formatarMoeda(troco)}.`
        : '');
    msg.className = 'form-msg sucesso';

    formPag.reset();
    trocoInfo.textContent = '';
    trocoInfo.className = 'troco-info';

    renderizarPedidos();
    renderizarResumo();
  });

  // ---------- LIMPAR PAGAMENTO ----------
  document.getElementById('btn-limpar-pag').addEventListener('click', () => {
    setTimeout(() => {
      document.getElementById('msg-pagamento').textContent = '';
      document.getElementById('msg-pagamento').className = 'form-msg';
      trocoInfo.textContent = '';
      trocoInfo.className = 'troco-info';
    }, 0);
  });

  // ---------- FECHAR CAIXA ----------
  document.getElementById('btn-fechar-caixa').addEventListener('click', () => {
    const caixa = carregarCaixa();
    const msg = document.getElementById('msg-fechamento');

    if (!caixa || !caixa.aberto) {
      msg.textContent = 'O caixa já está fechado.';
      msg.className = 'form-msg erro';
      return;
    }

    const pedidos = carregarPedidos();
    const pendentes = pedidos.filter(p => !p.pago);

    if (pendentes.length > 0) {
      msg.textContent = `Existem ${pendentes.length} pedido(s) sem pagamento. Registre todos antes de fechar.`;
      msg.className = 'form-msg erro';
      return;
    }

    if (!confirm('Confirma o fechamento do caixa? Os pedidos pagos serão arquivados.')) return;

    // "Arquiva": guarda histórico e limpa sessão
    const historico = JSON.parse(localStorage.getItem('caixaHistorico') || '[]');
    historico.push({
      ...caixa,
      fechadoEm: new Date().toISOString(),
      pedidosPagos: pedidos.filter(p => p.pago)
    });
    localStorage.setItem('caixaHistorico', JSON.stringify(historico));

    localStorage.removeItem('caixaSessao');
    localStorage.setItem('pedidos', JSON.stringify([]));

    msg.textContent = '✅ Caixa fechado. Pedidos arquivados no histórico.';
    msg.className = 'form-msg sucesso';

    renderizarEstadoCaixa();
    renderizarPedidos();
    renderizarResumo();
  });
});