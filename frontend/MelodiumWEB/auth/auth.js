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
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const submitButton = form.querySelector('button');
      const textOriginal = submitButton.textContent;
      submitButton.textContent = 'Carregando...';
      submitButton.disabled = true;

      try {
        if (form.id === 'signupForm') {
          const nome = form.querySelector('#userNameInput').value;
          const email = form.querySelector('#signupEmailInput').value;
          const senha = form.querySelector('#signupPasswordInput').value;

          const resposta = await fetch('http://localhost:8080/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              nome: nome, 
              email: email, 
              senha_hash: senha 
            })
          });

          if (resposta.ok) {
            alert('Conta criada com sucesso! Faça login para entrar.');
            form.reset();
            switchAuthMode('login'); 
          } else {
            alert('Erro ao criar conta. Verifique os dados.');
          }

        } else if (form.id === 'loginForm') {
          const email = form.querySelector('#userEmailInput').value;
          const senha = form.querySelector('#userPasswordInput').value;

          const resposta = await fetch('http://localhost:8080/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: email, 
              senha_hash: senha 
            })
          });

          if (resposta.ok) {
            const usuarioLogado = await resposta.json();
            alert(`Bem-vindo, ${usuarioLogado.nome}!`);
            
            localStorage.setItem('usuarioMelodium', JSON.stringify(usuarioLogado));
            
            
            window.location.href = '../landingPage/landingPage.html'; 
          } else {
            alert('E-mail ou senha inválidos!');
          }
        }
      } catch (erro) {
        console.error('Erro:', erro);
        alert('Erro ao conectar com o servidor. O Java está rodando?');
      } finally {
        submitButton.textContent = textOriginal;
        submitButton.disabled = false;
      }
    });
  });

  switchAuthMode(initialMode);
});