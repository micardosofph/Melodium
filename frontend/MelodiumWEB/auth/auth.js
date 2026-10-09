document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');

  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault(); 
      
      const submitButton = signupForm.querySelector('button');
      const textOriginal = submitButton.textContent;
      submitButton.textContent = 'A preparar ambiente...';
      submitButton.disabled = true;

      try {
        const nome = signupForm.querySelector('#userNameInput').value;
        const email = signupForm.querySelector('#signupEmailInput').value;
        const senhaPadrao = "visitante123"; 

        const resposta = await fetch('http://localhost:8080/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            nome: nome, 
            email: email, 
            senha_hash: senhaPadrao 
          })
        });

        if (resposta.ok) {
          const usuarioCriado = await resposta.json();
          
          localStorage.setItem('usuarioMelodium', JSON.stringify(usuarioCriado));
          
          document.getElementById('mensagemSucessoModal').textContent = `Bem-vindo à demonstração, ${usuarioCriado.nome}!`;
          
          document.getElementById('modalSucesso').style.display = 'flex';
          
        } else {
          alert('Este e-mail já visitou o projeto hoje! Tente outro nome.');
        }
      } catch (erro) {
        console.error('Erro:', erro);
        alert('Erro de conexão. Verifique se o servidor Spring Boot está ligado no terminal.');
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