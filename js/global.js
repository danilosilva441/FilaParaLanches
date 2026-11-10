/* ==========================================================
   FilaParaLanches - global.js
   Comportamento comum a TODAS as páginas + funções auxiliares
   ========================================================== */

/* ---------- Funções auxiliares de validação ---------- */
function marcarErro(campo, areaMsg, texto) {
    campo.classList.add("erro");
    areaMsg.textContent = texto;
    areaMsg.classList.add("erro-msg");
    campo.focus();
}

function limparEstado(campo, areaMsg) {
    campo.classList.remove("erro");
    areaMsg.className = "form-msg";
}

document.addEventListener("DOMContentLoaded", function () {

    /* ---------- Menu responsivo (evento de clique) ---------- */
    const botaoMenu = document.getElementById("menu-toggle");
    const menu = document.getElementById("menu-principal");

    if (botaoMenu && menu) {
        botaoMenu.addEventListener("click", function () {
            const aberto = menu.classList.toggle("aberto");
            botaoMenu.setAttribute("aria-expanded", aberto);
        });
    }

    /* ---------- Destaque do link da página atual ---------- */
    const paginaAtual = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("nav a").forEach(function (link) {
        const destino = link.getAttribute("href").split("/").pop();
        if (destino === paginaAtual) {
            link.classList.add("ativo");
        }
    });
});