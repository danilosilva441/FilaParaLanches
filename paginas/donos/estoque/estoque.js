/* ============================================================
   ESTOQUE - CRUD de produtos + alerta de reposição
   Lê/escreve localStorage: 'estoqueProdutos'
   Depende de: js/global.js (FilaHelpers)
   ============================================================ */

const CHAVE_ESTOQUE = 'estoqueProdutos';

// ---------- ESTOQUE INICIAL (semente) ----------
const ESTOQUE_INICIAL = [
  { codigo: 'L01', nome: 'X-Burger',         categoria: 'lanches',    preco: 18.00, quantidade: 30, minimo: 10 },
  { codigo: 'L02', nome: 'X-Salada',         categoria: 'lanches',    preco: 20.00, quantidade: 8,  minimo: 10 },
  { codigo: 'L03', nome: 'X-Bacon',          categoria: 'lanches',    preco: 24.00, quantidade: 25, minimo: 10 },
  { codigo: 'P01', nome: 'Batata Frita',     categoria: 'porcoes',    preco: 16.00, quantidade: 0,  minimo: 5  },
  { codigo: 'B01', nome: 'Refrigerante Lata',categoria: 'bebidas',    preco: 7.00,  quantidade: 60, minimo: 20 },
  { codigo: 'S01', nome: 'Milk Shake',       categoria: 'sobremesas', preco: 14.00, quantidade: 15, minimo: 5  }
];

// ---------- PERSISTÊNCIA ----------
function carregarEstoque() {
  let lista = JSON.parse(localStorage.getItem(CHAVE_ESTOQUE) || 'null');
  if (!lista) {
    lista = ESTOQUE_INICIAL;
    localStorage.setItem(CHAVE_ESTOQUE, JSON.stringify(lista));
  }
  return lista;
}

function salvarEstoque(lista) {
  localStorage.setItem(CHAVE_ESTOQUE, JSON.stringify(lista));
}

// ---------- HELPERS ----------
function situacaoDe(produto) {
  if (produto.quantidade === 0) return 'zerado';
  if (produto.quantidade < produto.minimo) return 'baixo';
  return 'ok';
}

function rotuloSituacao(situacao) {
  return {
    ok: 'OK',
    baixo: 'Estoque baixo',
    zerado: 'Zerado'
  }[situacao];
}

function rotuloCategoria(cat) {
  return {
    lanches: 'Lanches',
    porcoes: 'Porções',
    bebidas: 'Bebidas',
    sobremesas: 'Sobremesas'
  }[cat] || cat;
}

function gerarCodigo(categoria) {
  const prefixos = { lanches: 'L', porcoes: 'P', bebidas: 'B', sobremesas: 'S' };
  const prefixo = prefixos[categoria] || 'X';
  const lista = carregarEstoque();

  const numeros = lista
    .filter(p => p.codigo.startsWith(prefixo))
    .map(p => parseInt(p.codigo.slice(1), 10) || 0);

  const proximo = (numeros.length ? Math.max(...numeros) : 0) + 1;
  return prefixo + String(proximo).padStart(2, '0');
}

// ============================================================
// FILTRAGEM
// ============================================================
function aplicarFiltros() {
  const termo = document.getElementById('busca-estoque').value.trim().toLowerCase();
  const categoria = document.getElementById('filtro-categoria').value;
  const situacao = document.getElementById('filtro-situacao').value;

  return carregarEstoque().filter(p => {
    const bateTermo = !termo ||
      p.nome.toLowerCase().includes(termo) ||
      p.codigo.toLowerCase().includes(termo);

    const bateCategoria = !categoria || p.categoria === categoria;
    const bateSituacao = !situacao || situacaoDe(p) === situacao;

    return bateTermo && bateCategoria && bateSituacao;
  });
}

// ============================================================
// RENDERIZAÇÃO DA TABELA PRINCIPAL
// ============================================================
function renderizarTabela(lista) {
  const tbody = document.getElementById('corpo-estoque');
  tbody.innerHTML = '';

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="8" style="text-align:center;color:#888;padding:1rem">
        Nenhum produto corresponde aos filtros.
      </td></tr>`;
    return;
  }

  lista.forEach(p => {
    const sit = situacaoDe(p);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.codigo}</strong></td>
      <td>${p.nome}</td>
      <td>${rotuloCategoria(p.categoria)}</td>
      <td>${FilaHelpers.formatarMoeda(p.preco)}</td>
      <td>${p.quantidade}</td>
      <td>${p.minimo}</td>
      <td><span class="situacao situacao-${sit}">${rotuloSituacao(sit)}</span></td>
      <td>
        <div class="acoes-tabela">
          <button class="btn-repor"   data-acao="repor"   data-codigo="${p.codigo}">+10</button>
          <button class="btn-editar"  data-acao="editar"  data-codigo="${p.codigo}">✏️</button>
          <button class="btn-remover" data-acao="remover" data-codigo="${p.codigo}">🗑️</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
// RENDERIZAÇÃO DO ALERTA
// ============================================================
function renderizarAlerta() {
  const tbody = document.getElementById('corpo-alerta');
  tbody.innerHTML = '';

  const alertas = carregarEstoque().filter(p => situacaoDe(p) !== 'ok');

  alertas.forEach(p => {
    const sit = situacaoDe(p);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.codigo}</strong></td>
      <td>${p.nome}</td>
      <td>${p.quantidade}</td>
      <td>${p.minimo}</td>
      <td><span class="situacao situacao-${sit}">${rotuloSituacao(sit)}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
// RESUMO (chips)
// ============================================================
function renderizarResumo() {
  const lista = carregarEstoque();
  const baixos = lista.filter(p => situacaoDe(p) === 'baixo').length;
  const zerados = lista.filter(p => situacaoDe(p) === 'zerado').length;

  document.getElementById('resumo-total').textContent = `${lista.length} produtos`;
  document.getElementById('resumo-baixo').textContent = `${baixos} em alerta`;
  document.getElementById('resumo-zerado').textContent = `${zerados} zerados`;
}

// ============================================================
// RENDERIZA TUDO
// ============================================================
function renderizarTudo() {
  const filtrados = aplicarFiltros();
  renderizarTabela(filtrados);
  renderizarAlerta();
  renderizarResumo();
}

// ============================================================
// AÇÕES
// ============================================================
function reporProduto(codigo) {
  const lista = carregarEstoque();
  const p = lista.find(x => x.codigo === codigo);
  if (!p) return;

  p.quantidade += 10;
  salvarEstoque(lista);
  renderizarTudo();
  feedback(`+10 unidades de "${p.nome}". Novo estoque: ${p.quantidade}.`, 'sucesso');
}

function removerProduto(codigo) {
  const lista = carregarEstoque();
  const p = lista.find(x => x.codigo === codigo);
  if (!p) return;

  if (!confirm(`Remover "${p.nome}" (${p.codigo}) do estoque?`)) return;

  const nova = lista.filter(x => x.codigo !== codigo);
  salvarEstoque(nova);
  renderizarTudo();
  feedback(`Produto "${p.nome}" removido.`, 'sucesso');
}

function editarProduto(codigo) {
  const lista = carregarEstoque();
  const p = lista.find(x => x.codigo === codigo);
  if (!p) return;

  document.getElementById('codigo-edicao').value = p.codigo;
  document.getElementById('nome-produto-est').value = p.nome;
  document.getElementById('categoria-produto-est').value = p.categoria;
  document.getElementById('preco-produto-est').value = p.preco.toFixed(2);
  document.getElementById('quantidade-produto-est').value = p.quantidade;
  document.getElementById('estoque-minimo-est').value = p.minimo;

  document.getElementById('titulo-form-estoque').textContent =
    `Editando produto ${p.codigo}`;
  document.getElementById('legend-form-estoque').textContent =
    `Editando "${p.nome}"`;
  document.getElementById('btn-salvar-produto').textContent = 'Salvar alterações';
  document.getElementById('btn-cancelar-edicao').hidden = false;
  document.getElementById('form-produto').classList.add('editando');

  document.getElementById('form-produto').scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('nome-produto-est').focus();
}

function sairModoEdicao() {
  document.getElementById('form-produto').reset();
  document.getElementById('codigo-edicao').value = '';
  document.getElementById('titulo-form-estoque').textContent = 'Cadastrar novo produto';
  document.getElementById('legend-form-estoque').textContent = 'Dados do produto';
  document.getElementById('btn-salvar-produto').textContent = 'Cadastrar produto';
  document.getElementById('btn-cancelar-edicao').hidden = true;
  document.getElementById('form-produto').classList.remove('editando');
  document.getElementById('msg-form-produto').textContent = '';
  document.getElementById('msg-form-produto').className = 'form-msg';
}

function feedback(texto, tipo) {
  const msg = document.getElementById('msg-estoque');
  msg.textContent = texto;
  msg.className = `form-msg ${tipo}`;
  clearTimeout(feedback._t);
  feedback._t = setTimeout(() => {
    msg.textContent = '';
    msg.className = 'form-msg';
  }, 4000);
}

// ============================================================
// INICIALIZAÇÃO + EVENTOS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  renderizarTudo();

  // ---------- FILTROS EM TEMPO REAL ----------
  document.getElementById('busca-estoque').addEventListener('input', renderizarTudo);
  document.getElementById('filtro-categoria').addEventListener('change', renderizarTudo);
  document.getElementById('filtro-situacao').addEventListener('change', renderizarTudo);

  document.getElementById('btn-limpar-filtro').addEventListener('click', () => {
    document.getElementById('busca-estoque').value = '';
    document.getElementById('filtro-categoria').value = '';
    document.getElementById('filtro-situacao').value = '';
    renderizarTudo();
  });

  // ---------- AÇÕES DA TABELA (delegação) ----------
  document.getElementById('corpo-estoque').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-acao]');
    if (!btn) return;

    const acao = btn.dataset.acao;
    const codigo = btn.dataset.codigo;

    if (acao === 'repor')   reporProduto(codigo);
    if (acao === 'editar')  editarProduto(codigo);
    if (acao === 'remover') removerProduto(codigo);
  });

  // ---------- FORMULÁRIO: CADASTRO / EDIÇÃO ----------
  const form = document.getElementById('form-produto');
  const msgForm = document.getElementById('msg-form-produto');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const codigoEdicao = document.getElementById('codigo-edicao').value;
    const nome = document.getElementById('nome-produto-est').value.trim();
    const categoria = document.getElementById('categoria-produto-est').value;
    const preco = parseFloat(document.getElementById('preco-produto-est').value);
    const quantidade = parseInt(document.getElementById('quantidade-produto-est').value, 10);
    const minimo = parseInt(document.getElementById('estoque-minimo-est').value, 10);

    // Validações
    if (nome.length < 2) {
      return erroForm('O nome deve ter pelo menos 2 caracteres.');
    }
    if (!categoria) {
      return erroForm('Selecione a categoria.');
    }
    if (isNaN(preco) || preco < 0) {
      return erroForm('Informe um preço válido.');
    }
    if (isNaN(quantidade) || quantidade < 0) {
      return erroForm('Informe uma quantidade válida (≥ 0).');
    }
    if (isNaN(minimo) || minimo < 0) {
      return erroForm('Informe um estoque mínimo válido (≥ 0).');
    }

    const lista = carregarEstoque();

    if (codigoEdicao) {
      // ---------- EDIÇÃO ----------
      const p = lista.find(x => x.codigo === codigoEdicao);
      if (!p) {
        return erroForm(`Produto ${codigoEdicao} não encontrado.`);
      }

      p.nome = nome;
      p.categoria = categoria;
      p.preco = preco;
      p.quantidade = quantidade;
      p.minimo = minimo;

      salvarEstoque(lista);
      msgForm.textContent = `✅ Produto "${nome}" atualizado.`;
      msgForm.className = 'form-msg sucesso';

      sairModoEdicao();
      renderizarTudo();
    } else {
      // ---------- CADASTRO ----------
      const duplicado = lista.find(p => p.nome.toLowerCase() === nome.toLowerCase());
      if (duplicado) {
        return erroForm(`Já existe um produto com este nome (${duplicado.codigo}).`);
      }

      const codigo = gerarCodigo(categoria);
      lista.push({ codigo, nome, categoria, preco, quantidade, minimo });

      salvarEstoque(lista);
      msgForm.textContent = `✅ Produto cadastrado com código ${codigo}.`;
      msgForm.className = 'form-msg sucesso';

      form.reset();
      renderizarTudo();
    }
  });

  document.getElementById('btn-cancelar-edicao').addEventListener('click', sairModoEdicao);

  form.addEventListener('reset', () => {
    setTimeout(() => {
      msgForm.textContent = '';
      msgForm.className = 'form-msg';
    }, 0);
  });

  function erroForm(texto) {
    msgForm.textContent = `⚠️ ${texto}`;
    msgForm.className = 'form-msg erro';
  }
});