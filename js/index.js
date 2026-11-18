// ============ FORMULÁRIO DE PROMOÇÃO ============
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-promocao');
  if (!form) return;

  const campoEmail = document.getElementById('email-promocao');
  const mensagem = document.getElementById('msg-promocao');

  // ---- Validação em tempo real ----
  campoEmail.addEventListener('blur', () => {
    const valido = FilaHelpers.emailValido(campoEmail.value);
    FilaHelpers.marcarCampo(campoEmail, valido);
  });

  campoEmail.addEventListener('input', () => {
    if (campoEmail.classList.contains('invalido')) {
      const ok = FilaHelpers.emailValido(campoEmail.value);
      FilaHelpers.marcarCampo(campoEmail, ok);
    }
  });

  // ---- Envio ----
  form.addEventListener('submit', (evento) => {
    evento.preventDefault(); // intercepta o envio

    const email = campoEmail.value.trim();

    if (!email) {
      mostrarMensagem('Por favor, informe seu e-mail.', 'erro');
      campoEmail.focus();
      return;
    }

    if (!FilaHelpers.emailValido(email)) {
      mostrarMensagem('E-mail inválido. Exemplo: nome@dominio.com', 'erro');
      campoEmail.focus();
      return;
    }

    // Simula cadastro (em um sistema real, envie via fetch para o backend)
    const inscritos = JSON.parse(localStorage.getItem('promocoes') || '[]');

    if (inscritos.includes(email.toLowerCase())) {
      mostrarMensagem('Este e-mail já está cadastrado! 🎉', 'erro');
      return;
    }

    inscritos.push(email.toLowerCase());
    localStorage.setItem('promocoes', JSON.stringify(inscritos));

    mostrarMensagem('Cadastro realizado com sucesso! 🎉', 'sucesso');
    form.reset();
    campoEmail.classList.remove('valido', 'invalido');
  });

  function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = `form-msg ${tipo}`;
  }
});