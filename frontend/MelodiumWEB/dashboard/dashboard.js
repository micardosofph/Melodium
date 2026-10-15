const API_BASE_URL = 'http://localhost:8080';

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('usuarioMelodium')); }
  catch (error) { console.warn('Dados locais do usuário inválidos:', error); return null; }
}

function renderStreak(user = getStoredUser()) {
  const value = document.getElementById('valor-ofensiva');
  const title = document.getElementById('texto-ofensiva');
  const detail = document.getElementById('detalhe-ofensiva');
  if (!value || !title || !detail) return;
  if (!user?.id_usuario) {
    value.textContent = '—';
    title.textContent = 'Sua ofensiva começa no primeiro treino.';
    detail.textContent = 'Cadastre um perfil para visualizar os dados retornados pelo servidor.';
    return;
  }
  const days = Number(user.ofensiva) || 0;
  value.textContent = String(days).padStart(2, '0');
  title.textContent = days === 1 ? 'dia seguido de prática' : 'dias seguidos de prática';
  detail.textContent = user.ultimaAtividade
    ? `Última atividade registrada: ${new Date(`${user.ultimaAtividade}T12:00:00`).toLocaleDateString('pt-BR')}.`
    : 'Nenhuma atividade registrada para este perfil.';
}

async function testIntegration() {
  const title = document.getElementById('status-integracao');
  const detail = document.getElementById('detalhe-integracao');
  const dot = document.getElementById('connection-dot');
  const list = document.getElementById('lista-usuarios');
  const button = document.getElementById('testar-integracao');
  const totalUsers = document.getElementById('total-usuarios');
  const updatedAt = document.getElementById('ultima-atualizacao');
  title.textContent = 'Verificando o banco de dados...';
  detail.textContent = 'Buscando os cadastros salvos no MySQL pela API Java.';
  dot.className = 'connection-dot';
  list.replaceChildren();
  button.disabled = true;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${API_BASE_URL}/usuarios`, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const users = Array.isArray(payload) ? payload : [];
    title.textContent = 'Cadastros do MySQL carregados';
    detail.textContent = `${users.length} cadastro(s) recebido(s) do banco pela API Java.`;
    dot.classList.add('is-online');
    totalUsers.textContent = String(users.length).padStart(2, '0');
    updatedAt.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (!users.length) {
      const empty = document.createElement('li');
      empty.className = 'user-list-empty';
      empty.textContent = 'Ainda não há cadastros salvos no banco. Use o botão acima para criar o primeiro.';
      list.appendChild(empty);
    }

    users.forEach((user, index) => {
      const name = user.nome?.trim() || user.email?.split('@')[0] || `Visitante ${user.id_usuario || ''}`.trim();
      const item = document.createElement('li');
      item.className = 'user-card';
      item.style.animationDelay = `${Math.min(index * 40, 320)}ms`;
      const avatar = document.createElement('span');
      avatar.className = 'user-avatar';
      avatar.textContent = name.slice(0, 2).toUpperCase();
      const identity = document.createElement('div');
      identity.className = 'user-identity';
      const strong = document.createElement('strong');
      strong.textContent = name;
      const email = document.createElement('small');
      email.textContent = user.email || 'Perfil da feira';
      identity.append(strong, email);
      const streak = document.createElement('span');
      streak.className = 'user-streak';
      const days = Number(user.ofensiva) || 0;
      streak.textContent = `${days} ${days === 1 ? 'dia' : 'dias'}`;
      item.append(avatar, identity, streak);
      list.appendChild(item);
    });
  } catch (error) {
    console.error('Erro ao carregar cadastros do MySQL:', error);
    title.textContent = 'Diário indisponível';
    detail.textContent = 'Não foi possível carregar os cadastros do banco. Ligue o MySQL e o backend Java e atualize.';
    dot.classList.add('is-offline');
    totalUsers.textContent = '—';
    updatedAt.textContent = '—';
    list.replaceChildren();
    const unavailable = document.createElement('li');
    unavailable.className = 'user-list-empty';
    unavailable.textContent = 'Os cadastros não foram carregados. Ligue o MySQL e o backend Java para consultar o diário.';
    list.appendChild(unavailable);
  } finally {
    window.clearTimeout(timeoutId);
    button.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.hero-card')?.classList.add('is-ready');
  renderStreak();
  testIntegration();
  document.getElementById('testar-integracao')?.addEventListener('click', testIntegration);
});
