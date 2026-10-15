const API_BASE_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.getElementById('mobile-guide');
  const widget = document.getElementById('integration-widget');
  const trigger = document.getElementById('integration-trigger');
  const popover = document.getElementById('integration-popover');
  const closeButton = document.getElementById('close-integration');
  const refreshButton = document.getElementById('refresh-integration');
  let refreshTimer;

  async function loadSignupSummary() {
    const count = document.getElementById('landing-signup-count');
    const message = document.getElementById('landing-signup-message');
    if (!count || !message) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`, { signal: controller.signal });
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }

      const payload = await response.json();
      const total = Array.isArray(payload) ? payload.length : 0;
      count.textContent = String(total);
      message.textContent = total === 0
        ? 'Ainda não há cadastros. Seja a primeira pessoa!'
        : `${total} ${total === 1 ? 'pessoa cadastrada' : 'pessoas cadastradas'} no banco de dados.`;
    } catch (error) {
      console.error('Erro ao consultar o total de cadastros:', error);
      count.textContent = '—';
      message.textContent = error.status === 503
        ? 'Banco de dados indisponível. Ligue o MySQL para ver os cadastros.'
        : 'Java ou banco de dados indisponível. Ligue os serviços para ver os cadastros.';
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  loadSignupSummary();

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

  function renderProfiles(users, emptyMessage = 'Nenhum perfil salvo no banco ainda. Seja a primeira pessoa do estande.') {
    const list = document.getElementById('landing-profile-list');
    if (!list) return;
    list.replaceChildren();

    if (!users.length) {
      const empty = document.createElement('li');
      empty.className = 'integration-empty';
      empty.textContent = emptyMessage;
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
      email.textContent = user.email || 'Perfil da feira';
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
    status.textContent = 'Consultando os cadastros no MySQL...';
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
      status.textContent = `${users.length} cadastro(s) carregado(s) do MySQL pela API Java.`;
      dot.classList.add('is-online');
    } catch (error) {
      console.error('Erro ao consultar cadastros do MySQL:', error);
      renderProfiles([], 'Não foi possível consultar o diário. Ligue o MySQL e o backend Java e tente novamente.');
      status.textContent = 'Banco de dados ou backend indisponível. Ligue o MySQL e o backend Java.';
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
