/* ==========================================================
   FilaParaLanches - login.js
   Validação do login e direcionamento por tipo de acesso
   ========================================================== */
document.addEventListener("DOMContentLoaded", function () {

    const formLogin = document.getElementById("form-login");
    const msgLogin = document.getElementById("msg-login");

    if (!formLogin || !msgLogin) return; // não está na página de login

    const campoUsuario = document.getElementById("usuario");
    const campoSenha = document.getElementById("senha");
    const campoTipo = document.getElementById("tipo-acesso");

    /* ---------- Array de objetos: destino de cada tipo ---------- */
    const destinosAcesso = [
        { tipo: "cliente", pagina: "./clientes/acompanhamento.html" },
        { tipo: "dono",    pagina: "./donos/estoque.html" },
        { tipo: "caixa",   pagina: "./donos/caixa.html" },
        { tipo: "cozinha", pagina: "./donos/cozinha.html" }
    ];

    formLogin.addEventListener("submit", function (evento) {
        evento.preventDefault();

        let valido = true;

        limparEstado(campoUsuario, msgLogin);
        limparEstado(campoSenha, msgLogin);
        limparEstado(campoTipo, msgLogin);

        if (campoUsuario.value.trim().length < 3) {
            marcarErro(campoUsuario, msgLogin, "O usuário deve ter pelo menos 3 caracteres.");
            valido = false;
        }
        if (campoSenha.value.length < 6) {
            marcarErro(campoSenha, msgLogin, "A senha deve ter pelo menos 6 caracteres.");
            valido = false;
        }
        if (campoTipo.value === "") {
            marcarErro(campoTipo, msgLogin, "Selecione o tipo de acesso.");
            valido = false;
        }

        if (!valido) return;

        const acesso = destinosAcesso.find(function (item) {
            return item.tipo === campoTipo.value;
        });

        msgLogin.textContent = "Login realizado! Abrindo sua área...";
        msgLogin.classList.add("sucesso");

        setTimeout(function () {
            window.location.href = acesso.pagina;
        }, 1200);
    });

    formLogin.addEventListener("reset", function () {
        [campoUsuario, campoSenha, campoTipo].forEach(function (campo) {
            campo.classList.remove("erro");
        });
        msgLogin.textContent = "";
        msgLogin.className = "form-msg";
    });
});