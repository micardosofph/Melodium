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

function carregarCardOfensiva() {
    // Busca os elementos do card pelo ID que criamos no HTML
    const valorOfensivaEl = document.getElementById('valor-ofensiva');
    const textoOfensivaEl = document.getElementById('texto-ofensiva');

    // Se a página não tiver esses elementos (ex: em outra tela), a função para aqui
    if (!valorOfensivaEl || !textoOfensivaEl) return;

    // Busca o usuário logado
    const usuarioSalvo = JSON.parse(localStorage.getItem('usuarioMelodium'));

    // 1. Cenário: Nenhum usuário logado
    if (!usuarioSalvo || !usuarioSalvo.id_usuario) {
        valorOfensivaEl.textContent = "-";
        textoOfensivaEl.textContent = "Faça login para ver sua ofensiva.";
        return;
    }

    // Pega os dias do usuário (se for nulo, assume 0)
    const dias = usuarioSalvo.ofensiva || 0;

    // 2. Cenário: Usuário logado, mas ofensiva é zero
    if (dias === 0) {
        valorOfensivaEl.textContent = "0 Dias";
        textoOfensivaEl.textContent = "Inicie sua rotina musical hoje!";
    } 
    // 3. Cenário: Usuário logado com ofensiva ativa
    else {
        // Usa um pequeno truque (dias > 1 ? 's' : '') para não escrever "1 Dias"
        valorOfensivaEl.textContent = `${dias} Dia${dias > 1 ? 's' : ''}`;
        textoOfensivaEl.textContent = "Ofensiva de Prática Atual";
    }
}

carregarCardOfensiva();