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

  function highlightActiveNavLink() {
    const currentPathname = window.location.pathname.replace(/\/+$/, '') || '/';
    const navLinks = document.querySelectorAll('.nav-links a');
    let activeLink = null;

    navLinks.forEach((link) => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });

    const landingPagePath = new URL('../landingPage/landingPage.html', window.location.href).pathname.replace(/\/+$/, '');
    if (currentPathname === landingPagePath) {
      const navbarBottom = document.querySelector('.navbar')?.getBoundingClientRect().bottom || 90;
      const activationLine = navbarBottom + 18;
      const sectionLinks = Array.from(navLinks).map((link) => {
        const linkUrl = new URL(link.getAttribute('href') || '', window.location.href);
        if (linkUrl.pathname.replace(/\/+$/, '') !== landingPagePath || !linkUrl.hash) return null;
        const section = document.getElementById(decodeURIComponent(linkUrl.hash.slice(1)));
        return section ? { link, section } : null;
      }).filter(Boolean).sort((a, b) => a.section.getBoundingClientRect().top - b.section.getBoundingClientRect().top);

      for (const candidate of sectionLinks) {
        if (candidate.section.getBoundingClientRect().top <= activationLine) activeLink = candidate.link;
      }

      const reachedPageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (reachedPageBottom && sectionLinks.length) activeLink = sectionLinks[sectionLinks.length - 1].link;
    } else {
      const routeSections = [
        ['/dashboard/dashboard.html', '#painel-web'],
        ['/accessibility/accessibility.html', '#acessibilidade'],
        ['/tools/tools.html', '#ferramentas-web'],
        ['/metronome/metronome.html', '#ferramentas-web'],
        ['/tuner/tuner.html', '#ferramentas-web'],
        ['/chordsDictionary/index.html', '#ferramentas-web']
      ];
      const routeSection = routeSections.find(([path]) => currentPathname.endsWith(path));
      if (routeSection) {
        activeLink = Array.from(navLinks).find((link) => {
          const linkUrl = new URL(link.getAttribute('href') || '', window.location.href);
          return linkUrl.hash === routeSection[1];
        }) || null;
      }
    }

    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'location');
    }
  }

  let activeNavFrame = 0;
  function scheduleActiveNavUpdate() {
    if (activeNavFrame) return;
    activeNavFrame = window.requestAnimationFrame(() => {
      activeNavFrame = 0;
      highlightActiveNavLink();
    });
  }

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
        highlightActiveNavLink();
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
  window.addEventListener('hashchange', highlightActiveNavLink);
  window.addEventListener('scroll', scheduleActiveNavUpdate, { passive: true });
  window.addEventListener('resize', scheduleActiveNavUpdate);
})();

function abrirModalEmBreve() {
    document.getElementById('modalEmBreve').style.display = 'flex';
}

function fecharModalEmBreve() {
    document.getElementById('modalEmBreve').style.display = 'none';
}

window.mostrarAvisoMelodium = function (titulo, mensagem) {
    let modal = document.getElementById('modalAvisoMelodium');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalAvisoMelodium';
        modal.className = 'modal-em-breve-overlay';
        modal.setAttribute('role', 'alertdialog');
        modal.setAttribute('aria-modal', 'true');

        const card = document.createElement('div');
        card.className = 'modal-em-breve-content border-main';
        const heading = document.createElement('h3');
        heading.id = 'modalAvisoMelodiumTitulo';
        heading.style.marginTop = '0';
        heading.style.color = '#333';
        const text = document.createElement('p');
        text.id = 'modalAvisoMelodiumMensagem';
        modal.setAttribute('aria-labelledby', heading.id);
        modal.setAttribute('aria-describedby', text.id);
        const closeButton = document.createElement('button');
        closeButton.className = 'btn-fechar-modal';
        closeButton.type = 'button';
        closeButton.textContent = 'Entendi';
        closeButton.addEventListener('click', () => { modal.style.display = 'none'; });
        modal.addEventListener('click', (event) => {
            if (event.target === modal) modal.style.display = 'none';
        });

        card.append(heading, text, closeButton);
        modal.appendChild(card);
        document.body.appendChild(modal);
    }

    modal.querySelector('h3').textContent = titulo;
    modal.querySelector('p').textContent = mensagem;
    modal.style.display = 'flex';
    modal.querySelector('button').focus();
};

