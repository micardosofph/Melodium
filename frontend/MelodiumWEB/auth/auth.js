document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const errorModal = document.getElementById('modalErroCadastro');
  const errorTitle = document.getElementById('tituloErroCadastro');
  const errorMessage = document.getElementById('mensagemErroCadastro');
  const closeErrorModal = document.getElementById('fecharModalErroCadastro');

  function showCadastroError(title, message) {
    if (!errorModal || !errorTitle || !errorMessage) return;
    errorTitle.textContent = title;
    errorMessage.textContent = message;
    errorModal.style.display = 'flex';
    closeErrorModal?.focus();
  }

  closeErrorModal?.addEventListener('click', () => {
    errorModal.style.display = 'none';
  });

  errorModal?.addEventListener('click', (event) => {
    if (event.target === errorModal) errorModal.style.display = 'none';
  });

  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitButton = signupForm.querySelector('button');
      const textOriginal = submitButton.textContent;
      submitButton.textContent = 'Salvando cadastro...';
      submitButton.disabled = true;

      try {
        const nome = signupForm.querySelector('#userNameInput').value.trim();
        const email = signupForm.querySelector('#signupEmailInput').value.trim();

        const resposta = await fetch('http://localhost:8080/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, email })
        });

        if (resposta.ok) {
          const usuarioCriado = await resposta.json();
          localStorage.setItem('usuarioMelodium', JSON.stringify(usuarioCriado));
          document.getElementById('mensagemSucessoModal').textContent = `Bem-vindo à demonstração, ${usuarioCriado.nome}!`;
          document.getElementById('modalSucesso').style.display = 'flex';
        } else if (resposta.status === 400) {
          showCadastroError('E-mail já cadastrado', 'Este e-mail já foi usado em um cadastro. Tente outro e-mail.');
        } else {
          showCadastroError('Conexão indisponível', 'Não foi possível salvar o cadastro. Verifique se o backend Java e o banco MySQL estão ligados e tente novamente.');
        }
      } catch (erro) {
        console.error('Erro ao salvar cadastro:', erro);
        showCadastroError('Conexão indisponível', 'Não foi possível salvar o cadastro. Verifique se o backend Java e o banco MySQL estão ligados e tente novamente.');
      } finally {
        submitButton.textContent = textOriginal;
        submitButton.disabled = false;
      }
    });
  }
});

function continuarParaSite() {
  window.location.href = '../landingPage/landingPage.html';
}
