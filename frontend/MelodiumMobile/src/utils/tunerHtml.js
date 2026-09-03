export const pitchyHtml = `
<!DOCTYPE html>
<html>
  <head>
    <!-- Importando o Pitchy direto da web -->
    <script src="https://unpkg.com/pitchy@4.0.0/dist/pitchy.js"></script>
  </head>
  <body>
    <script>
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
           // Aqui entrará a lógica completa do áudio e do pitchy
           
           // Quando a nota for detectada, envia para o React Native:
           // window.ReactNativeWebView.postMessage(frequencia);
        })
        .catch(err => console.error("Erro no microfone HTML: ", err));
    </script>
  </body>
</html>
`;