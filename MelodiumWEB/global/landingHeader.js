/**
 * Componente do Cabeçalho Reutilizável (Melodium)
 * Responsável pelo carregamento assíncrono do header.html e controle dos menus.
 */
(function () {
  const PLACEHOLDER_ID = 'header-placeholder';

  // Configura o evento de clique no overlay escuro para fechar o menu mobile
  function attachOverlayCloseEvent() {
    const headerOverlayEl = document.querySelector('.headerOverlay');
    if (!headerOverlayEl) return;

    // Evita que o evento de clique seja registrado várias vezes na memória
    if (headerOverlayEl.__mlAttached) return;
    headerOverlayEl.__mlAttached = true;

    headerOverlayEl.addEventListener('click', () => {
      const openMenuImgEl = document.querySelector('.openMenuImage');
      const closeMenuImgEl = document.querySelector('.closeMenuImage');
      const navBarEl = document.querySelector('.navbar');
      const navBarContainerEl = document.querySelector('.nav-links-container');
      const navBarActionsEl = document.querySelector('.nav-actions');

      // Restaura o ícone do hambúrguer e remove o 'X'
      if (openMenuImgEl) openMenuImgEl.classList.add('active');
      if (closeMenuImgEl) closeMenuImgEl.classList.remove('active');

      // Fecha os painéis e esconde o overlay
      if (navBarEl) navBarEl.classList.remove('active');
      if (navBarContainerEl) navBarContainerEl.classList.remove('active');
      if (navBarActionsEl) navBarActionsEl.classList.remove('active');
      headerOverlayEl.classList.remove('active');
    });
  }

  // Função global de controle do botão Hambúrguer (Mobile)
  window.menuButton = function menuButton() {
    const headerOverlayEl = document.querySelector('.headerOverlay');
    const openMenuImgEl = document.querySelector('.openMenuImage');
    const closeMenuImgEl = document.querySelector('.closeMenuImage');
    const navBarEl = document.querySelector('.navbar');
    const navBarContainerEl = document.querySelector('.nav-links-container');
    const navBarActionsEl = document.querySelector('.nav-actions');

    // Alterna o estado ativo de cada elemento de forma simultânea
    openMenuImgEl?.classList.toggle('active');
    closeMenuImgEl?.classList.toggle('active');
    navBarEl?.classList.toggle('active');
    navBarContainerEl?.classList.toggle('active');
    navBarActionsEl?.classList.toggle('active');
    headerOverlayEl?.classList.toggle('active');
  };

  // Carrega dinamicamente o arquivo header.html
  async function injectHeaderComponent() {
    const targetPlaceholderEl = document.getElementById(PLACEHOLDER_ID);
    if (!targetPlaceholderEl) return;

    const headerRequestUrls = [
      new URL('../global/header.html', window.location.href).toString(),
      '../global/header.html'
    ];

    for (const headerRequestUrl of headerRequestUrls) {
      try {
        const response = await fetch(headerRequestUrl, { cache: 'no-store' });
        if (!response.ok) continue;

        const htmlTemplate = await response.text();
        targetPlaceholderEl.innerHTML = htmlTemplate;
        attachOverlayCloseEvent();
        console.log('[HeaderComponent] Cabeçalho carregado com sucesso!');
        return;
      } catch (error) {
        console.warn('[HeaderComponent] Tentativa falhou:', headerRequestUrl, error);
      }
    }

    console.error('[HeaderComponent] Erro de injeção: não foi possível carregar header.html');
  }

  // Dispara a montagem do componente assim que o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', injectHeaderComponent);
})();

