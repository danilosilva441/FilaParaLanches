/* ==========================================================
   FilaParaLanches - index.js
   Validação do cadastro de promoções (página inicial)
   ========================================================== */
document.addEventListener("DOMContentLoaded", function () {

    const formPromo = document.getElementById("form-promocao");
    const msg = document.getElementById("msg-promocao");

    if (!formPromo || !msg) return; // não está na página inicial

    const campoEmail = document.getElementById("email-promocao");

    /* ---------- Estrutura de dados: array de objetos ---------- */
    let emailsCadastrados = [];

    formPromo.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const email = campoEmail.value.trim();
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        limparEstado(campoEmail, msg);

        if (email === "") {
            marcarErro(campoEmail, msg, "Digite o seu e-mail.");
            return;
        }
        if (!regexEmail.test(email)) {
            marcarErro(campoEmail, msg, "Formato inválido. Ex.: nome@dominio.com");
            return;
        }
        if (emailsCadastrados.some(function (item) { return item.email === email; })) {
            marcarErro(campoEmail, msg, "Este e-mail já está cadastrado!");
            return;
        }

        emailsCadastrados.push({ email: email, data: new Date().toLocaleString("pt-BR") });

        msg.textContent = "Cadastro realizado com sucesso! 🍔";
        msg.classList.add("sucesso");
        formPromo.reset();
        console.log("E-mails cadastrados:", emailsCadastrados);
    });

    campoEmail.addEventListener("input", function () {
        this.classList.remove("erro");
        msg.textContent = "";
        msg.className = "form-msg";
    });
});