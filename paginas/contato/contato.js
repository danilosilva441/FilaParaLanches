/* ============================================================
   CONTATO - validação completa do formulário + feedback
   Depende de: js/global.js (FilaHelpers)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-contato');
  if (!form) return;

  // ---------- REFERÊNCIAS DOS CAMPOS ----------
  const campoNome      = document.getElementById('nome');
  const campoEmail     = document.getElementById('email');
  const campoTelefone  = document.getElementById('telefone');
  const campoNasc      = document.getElementById('nascimento');
  const campoAssunto   = document.getElementById('assunto');
  const campoMensagem  = document.getElementById('mensagem');
  const campoAceite    = document.getElementById('aceite');
  const msgFeedback    = document.getElementById('msg-contato');
  const contadorMsg    = document.getElementById('contador-msg');

  // ============================================================
  // VALIDADORES
  // ============================================================
  const validadores = {
    nome(valor) {
      const v = valor.trim();
      if (!v) return 'Informe seu nome completo.';
      if (v.length < 3) return 'O nome deve ter ao menos 3 caracteres.';
      if (!v.includes(' ')) return 'Informe nome e sobrenome.';
      return null; // válido
    },

    email(valor) {
      const v = valor.trim();
      if (!v) return 'Informe seu e-mail.';
      if (!FilaHelpers.emailValido(v)) return 'E-mail inválido. Ex.: nome@dominio.com';
      return null;
    },

    telefone(valor) {
      const v = valor.trim();
      if (!v) return null; // opcional

      // Aceita (11) 91234-5678, 11912345678, etc.
      const digitos = v.replace(/\D/g, '');
      if (digitos.length < 10 || digitos.length > 11) {
        return 'Telefone deve ter 10 ou 11 dígitos (DDD + número).';
      }
      return null;
    },

    nascimento(valor) {
      if (!valor) return null; // opcional
      const data = new Date(valor + 'T00:00:00');
      const hoje = new Date();
      if (data > hoje) return 'Data de nascimento não pode estar no futuro.';

      const idade = hoje.getFullYear() - data.getFullYear();
      if (idade > 120) return 'Verifique a data de nascimento.';
      return null;
    },

    assunto(valor) {
      if (!valor) return 'Selecione um assunto.';
      return null;
    },

    mensagem(valor) {
      const v = valor.trim();
      if (!v) return 'Escreva sua mensagem.';
      if (v.length < 10) return 'A mensagem deve ter ao menos 10 caracteres.';
      return null;
    },

    aceite(checkbox) {
      if (!checkbox.checked) return 'É necessário autorizar o uso dos dados.';
      return null;
    }
  };

  // ============================================================
  // APLICA VALIDAÇÃO A UM CAMPO
  // ============================================================
  function validarCampo(campo, nomeValidador) {
    const erro = validadores[nomeValidador](campo.value);
    FilaHelpers.marcarCampo(campo, erro === null);
    return erro;
  }

  // ============================================================
  // MÁSCARA DE TELEFONE
  // ============================================================
  campoTelefone.addEventListener('input', () => {
    let v = campoTelefone.value.replace(/\D/g, '').slice(0, 11);

    if (v.length > 10) {
      // Celular: (11) 91234-5678
      v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (v.length > 6) {
      // Fixo: (11) 1234-5678
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    } else if (v.length > 0) {
      v = v.replace(/^(\d{0,2}).*/, '($1');
    }

    campoTelefone.value = v;
  });

  // ============================================================
  // CONTADOR DE CARACTERES DA MENSAGEM
  // ============================================================
  campoMensagem.addEventListener('input', () => {
    const len = campoMensagem.value.length;
    contadorMsg.textContent = `${len} / 1000`;
    contadorMsg.classList.toggle('limite', len >= 950);
  });

  // ============================================================
  // VALIDAÇÃO EM TEMPO REAL (ao sair do campo)
  // ============================================================
  campoNome.addEventListener('blur',      () => validarCampo(campoNome,     'nome'));
  campoEmail.addEventListener('blur',     () => validarCampo(campoEmail,    'email'));
  campoTelefone.addEventListener('blur',  () => validarCampo(campoTelefone, 'telefone'));
  campoNasc.addEventListener('blur',      () => validarCampo(campoNasc,     'nascimento'));
  campoAssunto.addEventListener('change', () => validarCampo(campoAssunto,  'assunto'));
  campoMensagem.addEventListener('blur',  () => validarCampo(campoMensagem, 'mensagem'));
  campoAceite.addEventListener('change',  () => validarCampo(campoAceite,   'aceite'));

  // Remove o vermelho assim que o usuário começa a corrigir
  ['nome', 'email', 'telefone', 'nascimento', 'assunto', 'mensagem'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      if (el.classList.contains('invalido')) {
        el.classList.remove('invalido');
      }
    });
  });

  campoAceite.addEventListener('change', () => {
    if (campoAceite.checked) {
      campoAceite.classList.remove('invalido');
    }
  });

  // ============================================================
  // SUBMIT
  // ============================================================
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Valida todos os campos de uma vez
    const erros = {
      nome:      validarCampo(campoNome,     'nome'),
      email:     validarCampo(campoEmail,    'email'),
      telefone:  validarCampo(campoTelefone, 'telefone'),
      nascimento: validarCampo(campoNasc,    'nascimento'),
      assunto:   validarCampo(campoAssunto,  'assunto'),
      mensagem:  validarCampo(campoMensagem, 'mensagem'),
      aceite:    validarCampo(campoAceite,   'aceite')
    };

    const primeiroErro = Object.values(erros).find(e => e !== null);

    if (primeiroErro) {
      mostrarMensagem(`⚠️ ${primeiroErro}`, 'erro');

      // Foca no primeiro campo inválido
      const ordem = ['nome', 'email', 'telefone', 'nascimento', 'assunto', 'mensagem', 'aceite'];
      for (const chave of ordem) {
        if (erros[chave]) {
          const el = chave === 'aceite'
            ? campoAceite
            : document.getElementById(chave);
          el.focus();
          break;
        }
      }
      return;
    }

    // ---------- SUCESSO ----------
    const mensagem = {
      id: Date.now(),
      nome: campoNome.value.trim(),
      email: campoEmail.value.trim(),
      telefone: campoTelefone.value.trim(),
      nascimento: campoNasc.value,
      assunto: campoAssunto.value,
      texto: campoMensagem.value.trim(),
      preferencia: form.querySelector('input[name="preferencia"]:checked').value,
      newsletter: document.getElementById('newsletter').checked,
      enviadoEm: new Date().toISOString()
    };

    // Persiste (simula envio ao backend)
    const mensagens = JSON.parse(localStorage.getItem('mensagensContato') || '[]');
    mensagens.push(mensagem);
    localStorage.setItem('mensagensContato', JSON.stringify(mensagens));

    mostrarMensagem(
      `✅ Mensagem enviada com sucesso, ${mensagem.nome.split(' ')[0]}! ` +
      `Responderemos por ${rotuloPreferencia(mensagem.preferencia)}.`,
      'sucesso'
    );

    form.reset();
    contadorMsg.textContent = '0 / 1000';

    document.querySelectorAll('#form-contato .valido, #form-contato .invalido')
      .forEach(el => el.classList.remove('valido', 'invalido'));
  });

  // ============================================================
  // RESET PERSONALIZADO
  // ============================================================
  document.getElementById('btn-limpar-contato').addEventListener('click', () => {
    setTimeout(() => {
      msgFeedback.textContent = '';
      msgFeedback.className = 'form-msg';
      contadorMsg.textContent = '0 / 1000';
      document.querySelectorAll('#form-contato .valido, #form-contato .invalido')
        .forEach(el => el.classList.remove('valido', 'invalido'));
    }, 0);
  });

  // ============================================================
  // HELPERS LOCAIS
  // ============================================================
  function mostrarMensagem(texto, tipo) {
    msgFeedback.textContent = texto;
    msgFeedback.className = `form-msg ${tipo}`;
    msgFeedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function rotuloPreferencia(valor) {
    return {
      email: 'e-mail',
      telefone: 'telefone',
      whatsapp: 'WhatsApp'
    }[valor] || 'e-mail';
  }
});