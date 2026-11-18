/* ============================================================
   GLOBAL.JS — compartilhado por todas as páginas
   1) Menu mobile
   2) FilaHelpers
   3) Sessão + controle de acesso ao menu (com diagnóstico)
   ============================================================ */

// ============ 2) UTILITÁRIOS GLOBAIS ============
const FilaHelpers = {
    emailValido(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    },
    marcarCampo(campo, valido) {
        campo.classList.toggle('valido', valido);
        campo.classList.toggle('invalido', !valido);
    },
    formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },
    agoraFormatado() {
        return new Date().toLocaleString('pt-BR');
    },
    lerSessao() {
        const raw = localStorage.getItem('sessaoUsuario')
            || sessionStorage.getItem('sessaoUsuario');
        if (!raw) return null;
        try {
            const sessao = JSON.parse(raw);
            if (sessao.expiraEm && Date.now() > sessao.expiraEm) {
                localStorage.removeItem('sessaoUsuario');
                sessionStorage.removeItem('sessaoUsuario');
                return null;
            }
            return sessao;
        } catch {
            return null;
        }
    },
    limparSessao() {
        localStorage.removeItem('sessaoUsuario');
        sessionStorage.removeItem('sessaoUsuario');
    }
};


// ============ 1 + 3) TUDO NUM ÚNICO DOMContentLoaded ============
document.addEventListener('DOMContentLoaded', () => {

    // ---------- 1) MENU MOBILE ----------
    const botaoMenu = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu-principal');
    if (botaoMenu && menu) {
        botaoMenu.addEventListener('click', () => {
            const aberto = menu.classList.toggle('aberto');
            botaoMenu.setAttribute('aria-expanded', aberto);
            botaoMenu.textContent = aberto ? '✕' : '☰';
        });
    }

    // ---------- 3) SESSÃO ----------
    const sessao = FilaHelpers.lerSessao();

    // ---------- 3a) INDICADOR "OLÁ, X · SAIR" ----------
    if (sessao) {
        const header = document.querySelector('header');
        if (header) {
            const indicador = document.createElement('p');
            indicador.className = 'indicador-sessao';
            indicador.innerHTML = `👤 Olá, <strong>${sessao.nome}</strong> · <a href="#" id="link-sair-global">Sair</a>`;
            header.appendChild(indicador);
            document.getElementById('link-sair-global').addEventListener('click', (e) => {
                e.preventDefault();
                if (!confirm('Deseja sair?')) return;
                FilaHelpers.limparSessao();
                location.reload();
            });
        }
    }

    // ---------- 3b) CONTROLE DE ACESSO AO MENU ----------
    const ROTULOS_RESTRITOS = ['caixa', 'cozinha', 'estoque'];
    const TIPOS_AUTORIZADOS = ['dono', 'caixa', 'cozinha'];
    const autorizado = sessao && TIPOS_AUTORIZADOS.includes(sessao.tipo);

    // 👇 DIAGNÓSTICO
    console.log('%c[GLOBAL] Controle de acesso', 'color:#c62828;font-weight:bold');
    console.log('  Sessão:', sessao);
    console.log('  Autorizado?', autorizado);

    // Procura TODOS os links de navegação da página (menu e rodapé)
    document.querySelectorAll('nav a, footer a').forEach(link => {
        const texto = link.textContent.trim().toLowerCase();
        const href = (link.getAttribute('href') || '').toLowerCase();
        const li = link.closest('li');

        const ehRestrito =
            ROTULOS_RESTRITOS.some(r => texto === r) ||
            ROTULOS_RESTRITOS.some(r => href.includes(r));

        // Esconde os links de dono se não autorizado
        if (!autorizado && ehRestrito) {
            console.log('  🚫 Removendo (restrito):', link.textContent.trim(), '|', href);
            if (li) li.remove(); else link.remove();
            return;
        }

        // Esconde o link "Login" se já estiver logado
        if (sessao && texto === 'login') {
            console.log('  🚫 Removendo (já logado):', texto);
            if (li) li.remove(); else link.remove();
        }
    });
});