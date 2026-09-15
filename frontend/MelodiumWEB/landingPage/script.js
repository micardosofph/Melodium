function menuButton() {
    const headerOverlay = document.querySelector(".headerOverlay");
    const openMenuImage = document.querySelector(".openMenuImage");
    const closeMenuImage = document.querySelector(".closeMenuImage");
    const navBar = document.querySelector(".navbar");
    const navBarLinksContainer = document.querySelector(".nav-links-container");
    const navBarActions = document.querySelector(".nav-actions");

    openMenuImage.classList.toggle('active');
    closeMenuImage.classList.toggle('active');
    navBar.classList.toggle('active');

    if (navBarLinksContainer) navBarLinksContainer.classList.toggle('active');
    if (navBarActions) navBarActions.classList.toggle('active');
    if (headerOverlay) headerOverlay.classList.toggle('active');
}

(function attachHeaderOverlayClose() {
    const headerOverlay = document.querySelector(".headerOverlay");
    if (!headerOverlay) return;

    headerOverlay.addEventListener("click", () => {
        const openMenuImage = document.querySelector(".openMenuImage");
        const closeMenuImage = document.querySelector(".closeMenuImage");
        const navBar = document.querySelector(".navbar");
        const navBarLinksContainer = document.querySelector(".nav-links-container");
        const navBarActions = document.querySelector(".nav-actions");

        if (openMenuImage) openMenuImage.classList.add('active');
        if (closeMenuImage) closeMenuImage.classList.remove('active');

        if (navBar) navBar.classList.remove('active');
        if (navBarLinksContainer) navBarLinksContainer.classList.remove('active');
        if (navBarActions) navBarActions.classList.remove('active');
        headerOverlay.classList.remove('active');
    });
})();

const usuarioSalvo = JSON.parse(localStorage.getItem('usuarioMelodium'));

if (usuarioSalvo) {
    console.log(`Ofensiva atual de ${usuarioSalvo.nome}: ${usuarioSalvo.ofensiva || 0} dias 🔥`);
}

async function registrarTreinoDoDia() {
    if (!usuarioSalvo || !usuarioSalvo.id_usuario) {
        alert('Faça login para salvar seu progresso!');
        return;
    }

    try {
        const resposta = await fetch(`http://localhost:8080/usuarios/${usuarioSalvo.id_usuario}/ofensiva`, {
            method: 'POST'
        });

        if (resposta.ok) {
            const usuarioAtualizado = await resposta.json();
            
            localStorage.setItem('usuarioMelodium', JSON.stringify(usuarioAtualizado));

            alert(`🔥 Parabéns! Sua ofensiva agora é de ${usuarioAtualizado.ofensiva} dia(s) seguidos!`);
        } else {
            alert('Não foi possível registrar a atividade.');
        }
    } catch (erro) {
        console.error('Erro ao atualizar ofensiva:', erro);
    }
}
async function testarOfensiva() {
    const usuarioSalvo = JSON.parse(localStorage.getItem('usuarioMelodium'));

    if (!usuarioSalvo || !usuarioSalvo.id_usuario) {
        console.warn('Nenhum usuário logado no localStorage para testar a ofensiva.');
        return;
    }

    try {
        const resposta = await fetch(`http://localhost:8080/usuarios/${usuarioSalvo.id_usuario}/ofensiva`, {
            method: 'POST'
        });

        if (resposta.ok) {
            const usuarioAtualizado = await resposta.json();
            
            localStorage.setItem('usuarioMelodium', JSON.stringify(usuarioAtualizado));

            let containerTeste = document.getElementById('teste-ofensiva-container');
            if (!containerTeste) {
                containerTeste = document.createElement('div');
                containerTeste.id = 'teste-ofensiva-container';
                containerTeste.style.marginTop = '20px';
                containerTeste.style.padding = '10px';
                containerTeste.style.borderTop = '1px solid #ccc';
                document.body.appendChild(containerTeste);
            }

            containerTeste.innerHTML = `
                <h3 style="color: #2e7d32; margin: 0 0 5px 0;">Teste de Ofensiva - Melodium Web</h3>
                <p style="margin: 0; font-size: 16px;">
                    🔥 <strong>Ofensiva Atual:</strong> ${usuarioAtualizado.ofensiva} dia(s) sequenciais
                </p>
                <small style="color: #666;">Última atividade registrada: ${usuarioAtualizado.ultimaAtividade || 'Hoje'}</small>
            `;
        } else {
            console.error('Erro na resposta da API de ofensiva.');
        }
    } catch (erro) {
        console.error('Erro ao conectar com o endpoint de ofensiva:', erro);
    }
}

testarOfensiva();
