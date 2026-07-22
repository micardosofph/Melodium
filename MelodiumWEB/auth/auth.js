document.addEventListener('DOMContentLoaded', () => {
  const authTabs = Array.from(document.querySelectorAll('.auth-tab'));
  const authForms = Array.from(document.querySelectorAll('.auth-form'));
  const authTitle = document.getElementById('auth-title');
  const authCopy = document.querySelector('.auth-copy');

  function switchAuthMode(mode) {
    const normalizedMode = mode === 'signup' ? 'signup' : 'login';

    authTabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.mode === normalizedMode);
    });

    authForms.forEach((form) => {
      form.classList.toggle('active', form.id === `${normalizedMode}Form`);
    });

    if (authTitle) {
      authTitle.textContent = normalizedMode === 'signup'
        ? 'Crie sua conta e continue sua jornada.'
        : 'Acesse sua conta e retome sua rotina.';
    }

    if (authCopy) {
      authCopy.textContent = normalizedMode === 'signup'
        ? 'Cadastre-se para guardar seus ritmos, metas e progresso em um só lugar.'
        : 'Entre para continuar sua rotina, acompanhar seus treinos e explorar o universo Melodium.';
    }
  }

  const params = new URLSearchParams(window.location.search);
  const initialMode = params.get('mode') || 'login';

  authTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const nextMode = tab.dataset.mode;
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('mode', nextMode);
      window.history.replaceState({}, '', newUrl);
      switchAuthMode(nextMode);
    });
  });

  authForms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const submitButton = form.querySelector('button');
      if (submitButton) {
        submitButton.textContent = form.id === 'signupForm' ? 'Conta criada!' : 'Entrando...';
      }
    });
  });

  switchAuthMode(initialMode);
});
