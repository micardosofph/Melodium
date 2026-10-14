const API_BASE_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.getElementById('mobile-guide');
  const widget = document.getElementById('integration-widget');
  const trigger = document.getElementById('integration-trigger');
  const popover = document.getElementById('integration-popover');
  const closeButton = document.getElementById('close-integration');
  const refreshButton = document.getElementById('refresh-integration');
  let refreshTimer;

  document.getElementById('open-mobile-guide')?.addEventListener('click', () => {
    if (typeof dialog?.showModal === 'function') dialog.showModal();
  });

  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  function setWidgetOpen(isOpen) {
    if (!popover || !trigger) return;
    popover.hidden = !isOpen;
    trigger.setAttribute('aria-expanded', String(isOpen));
    window.clearInterval(refreshTimer);
    if (isOpen) {
      loadStandProfiles();
      refreshTimer = window.setInterval(loadStandProfiles, 15000);
    }
  }

  function profileName(user) {
    return user.nome?.trim() || user.email?.split('@')[0] || `Visitante ${user.id_usuario || ''}`.trim();
  }

  function renderProfiles(users) {
    const list = document.getElementById('landing-profile-list');
    if (!list) return;
    list.replaceChildren();

    if (!users.length) {
      const empty = document.createElement('li');
      empty.className = 'integration-empty';
      empty.textContent = 'Nenhum perfil criado ainda. Seja a primeira pessoa do estande.';
      list.appendChild(empty);
      return;
    }

    users.forEach((user) => {
      const name = profileName(user);
      const item = document.createElement('li');
      item.className = 'stand-profile';
      const avatar = document.createElement('span');
      avatar.className = 'stand-profile-avatar';
      avatar.textContent = name.slice(0, 2).toUpperCase();
      const identity = document.createElement('div');
      const strong = document.createElement('strong');
      const email = document.createElement('small');
      strong.textContent = name;
      email.textContent = user.email || 'Perfil fictício da feira';
      identity.append(strong, email);
      const streak = document.createElement('span');
      streak.className = 'stand-profile-streak';
      const days = Number(user.ofensiva) || 0;
      streak.textContent = `${days} ${days === 1 ? 'dia' : 'dias'}`;
      item.append(avatar, identity, streak);
      list.appendChild(item);
    });
  }

  async function loadStandProfiles() {
    const status = document.getElementById('landing-integration-status');
    const dot = document.getElementById('landing-integration-dot');
    if (!status || !dot) return;
    status.textContent = 'Consultando o backend Java...';
    dot.className = 'integration-status-dot';
    if (refreshButton) refreshButton.disabled = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const users = Array.isArray(payload) ? payload : [];
      renderProfiles(users);
      status.textContent = `${users.length} perfil(is) recebido(s) ao vivo.`;
      dot.classList.add('is-online');
    } catch (error) {
      console.error('Erro ao consultar perfis do estande:', error);
      renderProfiles([]);
      status.textContent = 'Servidor indisponível. Ligue o backend na porta 8080.';
      dot.classList.add('is-offline');
    } finally {
      window.clearTimeout(timeoutId);
      if (refreshButton) refreshButton.disabled = false;
    }
  }

  trigger?.addEventListener('click', () => setWidgetOpen(Boolean(popover?.hidden)));
  closeButton?.addEventListener('click', () => setWidgetOpen(false));
  refreshButton?.addEventListener('click', loadStandProfiles);
  document.addEventListener('click', (event) => {
    if (!popover?.hidden && widget && !widget.contains(event.target)) setWidgetOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !popover?.hidden) setWidgetOpen(false);
  });
});
