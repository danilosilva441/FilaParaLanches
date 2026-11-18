/* ============================================================
   LOGIN - validação, sessão simulada e redirecionamento por tipo
   Lê/escreve localStorage: 'sessaoUsuario'
   Depende de: js/global.js (FilaHelpers)
   ============================================================ */

// ---------- CONTAS SIMULADAS ----------
// Em produção isso viria do backend. Aqui, validamos localmente.
const CONTAS_DEMO = {
  'cliente@teste.com': {
    senha: '123456',
    nome: 'Cliente Demo',
    tipo: 'cliente'
  },
  'caixa@teste.com': {
    senha: '123456',
    nome: 'Maria Caixa',
    tipo: 'caixa'
  },
  'cozinha@teste.com': {
    senha: '123456',
    nome: 'João Cozinha',
    tipo: 'cozinha'
  },
  'dono@teste.com': {
    senha: '123456',
    nome: 'Sr. Dono',
    tipo: 'dono'
  }
};

// ---------- DESTINOS POR TIPO ----------
const ROTAS_POR_TIPO = {
  cliente: '../clientes/acompanhamento/acompanhamento.html',
  caixa: '../donos/caixa/caixa.html',
  cozinha: '../donos/cozinha/cozinha.html',
  dono: '../donos/estoque/estoque.html'
};

const ROTULO_TIPO = {
  cliente: 'Cliente',
  caixa: 'Funcionário - Caixa',
  cozinha: 'Funcionário - Cozinha',
  dono: 'Dono'
};

// ---------- PERSISTÊNCIA DA SESSÃO ----------
function salvarSessao(dados, manter) {
  const sessao = {
    ...dados,
    logadoEm: new Date().toISOString(),
    expiraEm: manter
      ? Date.now() + 7 * 24 * 60 * 60 * 1000  // 7 dias
      : null // sessão temporária (dura enquanto a aba estiver aberta)
  };

  const storage = manter ? localStorage : sessionStorage;
  storage.setItem('sessaoUsuario', JSON.stringify(sessao));
}

function lerSessao() {
  const raw = localStorage.getItem('sessaoUsuario')
    || sessionStorage.getItem('sessaoUsuario');

  if (!raw) return null;

  try {
    const sessao = JSON.parse(raw);

    // Verifica expiração
    if (sessao.expiraEm && Date.now() > sessao.expiraEm) {
      localStorage.removeItem('sessaoUsuario');
      sessionStorage.removeItem('sessaoUsuario');
      return null;
    }

    return sessao;
  } catch {
    return null;
  }
}

function limparSessao() {
  localStorage.removeItem('sessaoUsuario');
  sessionStorage.removeItem('sessaoUsuario');
}

// ============================================================
// UI: MOSTRAR SESSÃO ATIVA
// ============================================================
function atualizarUISessao() {
  const sessao = lerSessao();
  const bloco = document.getElementById('sessao-ativa');
  const hr = document.getElementById('hr-sessao');
  const formSecao = document.getElementById('formulario-login');
  const info = document.getElementById('sessao-info');
  const btnIr = document.getElementById('btn-ir-area');

  if (!sessao) {
    bloco.classList.add('oculto');
    hr.classList.add('oculto');
    formSecao.classList.remove('oculto');
    return;
  }

  bloco.classList.remove('oculto');
  hr.classList.remove('oculto');
  formSecao.classList.add('oculto');

  const expira = sessao.expiraEm
    ? new Date(sessao.expiraEm).toLocaleString('pt-BR')
    : 'sessão da aba';

  info.innerHTML = `
    Olá, <strong>${sessao.nome}</strong>!<br>
    Você está logado como <strong>${ROTULO_TIPO[sessao.tipo]}</strong>.<br>
    <small>E-mail: ${sessao.email} · Expira: ${expira}</small>
  `;

  btnIr.onclick = () => {
    window.location.href = ROTAS_POR_TIPO[sessao.tipo] || '../../../index.html';
  };
}

// ============================================================
// VALIDADORES
// ============================================================
const validadores = {
  usuario(valor) {
    if (!valor.trim()) return 'Informe seu e-mail.';
    if (!FilaHelpers.emailValido(valor)) return 'E-mail inválido.';
    return null;
  },

  senha(valor) {
    if (!valor) return 'Informe sua senha.';
    if (valor.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    return null;
  },

  tipo(valor) {
    if (!valor) return 'Selecione o tipo de acesso.';
    return null;
  }
};

function validarCampo(campo, nomeValidador) {
  const erro = validadores[nomeValidador](campo.value);
  FilaHelpers.marcarCampo(campo, erro === null);
  return erro;
}

// ============================================================
// INICIALIZAÇÃO + EVENTOS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  atualizarUISessao();

  // ---------- BOTÃO SAIR ----------
  const btnSair = document.getElementById('btn-sair');
  if (btnSair) {
    btnSair.addEventListener('click', () => {
      if (!confirm('Deseja realmente sair?')) return;
      limparSessao();
      atualizarUISessao();
      const msg = document.getElementById('msg-login');
      msg.textContent = 'Você saiu da sua conta.';
      msg.className = 'form-msg';
    });
  }

  // ---------- TOGGLE DE SENHA ----------
  const campoSenha = document.getElementById('senha');
  const toggleSenha = document.getElementById('toggle-senha');

  function alternarSenha() {
    const tipo = campoSenha.type === 'password' ? 'text' : 'password';
    campoSenha.type = tipo;
    toggleSenha.textContent = tipo === 'password' ? '👁️' : '🙈';
    toggleSenha.setAttribute('aria-label',
      tipo === 'password' ? 'Mostrar senha' : 'Ocultar senha');
  }

  toggleSenha.addEventListener('click', alternarSenha);
  toggleSenha.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      alternarSenha();
    }
  });

  // ---------- FORMULÁRIO ----------
  const form = document.getElementById('form-login');
  const campoUsuario = document.getElementById('usuario');
  const campoTipo = document.getElementById('tipo-acesso');
  const msg = document.getElementById('msg-login');

  // Validação ao sair do campo
  campoUsuario.addEventListener('blur', () => validarCampo(campoUsuario, 'usuario'));
  campoSenha.addEventListener('blur', () => validarCampo(campoSenha, 'senha'));
  campoTipo.addEventListener('change', () => validarCampo(campoTipo, 'tipo'));

  // Remove vermelho ao corrigir
  [campoUsuario, campoSenha, campoTipo].forEach(el => {
    el.addEventListener('input', () => el.classList.remove('invalido'));
  });

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const erroUsuario = validarCampo(campoUsuario, 'usuario');
    const erroSenha = validarCampo(campoSenha, 'senha');
    const erroTipo = validarCampo(campoTipo, 'tipo');

    const primeiroErro = erroUsuario || erroSenha || erroTipo;
    if (primeiroErro) {
      mostrarErro(primeiroErro);
      if (erroUsuario) campoUsuario.focus();
      else if (erroSenha) campoSenha.focus();
      else campoTipo.focus();
      return;
    }

    const email = campoUsuario.value.trim().toLowerCase();
    const senhaDigitada = campoSenha.value;
    const tipoEscolhido = campoTipo.value;
    const manter = document.getElementById('manter-conectado').checked;

    // ---------- VALIDA CONTRA CONTAS DEMO ----------
    const conta = CONTAS_DEMO[email];

    if (!conta) {
      mostrarErro('E-mail não cadastrado. Use uma das contas de demonstração abaixo.');
      campoUsuario.focus();
      return;
    }

    if (conta.senha !== senhaDigitada) {
      mostrarErro('Senha incorreta. Tente novamente.');
      campoSenha.focus();
      return;
    }

    if (conta.tipo !== tipoEscolhido) {
      mostrarErro(
        `Este e-mail pertence ao tipo "${ROTULO_TIPO[conta.tipo]}", ` +
        `não a "${ROTULO_TIPO[tipoEscolhido]}".`
      );
      campoTipo.focus();
      return;
    }

    // ---------- LOGIN OK ----------
    salvarSessao({
      email,
      nome: conta.nome,
      tipo: conta.tipo
    }, manter);

    msg.textContent = `✅ Login realizado! Redirecionando para a área de ${ROTULO_TIPO[conta.tipo]}...`;
    msg.className = 'form-msg sucesso';

    const destino = ROTAS_POR_TIPO[conta.tipo];

    setTimeout(() => {
      window.location.href = destino;
    }, 1200);
  });

  // ---------- RESET ----------
  form.addEventListener('reset', () => {
    setTimeout(() => {
      msg.textContent = '';
      msg.className = 'form-msg';
      [campoUsuario, campoSenha, campoTipo].forEach(el =>
        el.classList.remove('valido', 'invalido'));
    }, 0);
  });

  function mostrarErro(texto) {
    msg.textContent = `⚠️ ${texto}`;
    msg.className = 'form-msg erro';
  }
});