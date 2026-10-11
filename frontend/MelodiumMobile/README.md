# Melodium Mobile

Aplicativo móvel em React Native + Expo para prática musical com metrônomo e afinador.

O protótipo da feira funciona sem conta: apresentação → boas-vindas → área de prática. Login e cadastro foram removidos da navegação. O perfil é demonstrativo, sem autenticação ou conexão com o backend; preferências e vídeos usam armazenamento local. Os dados de exemplo das telas não representam um histórico persistido. No menu do perfil, “Voltar à apresentação” reinicia apenas a navegação, sem apagar os registros locais.

## Desenvolvimento com pouca memória

Com o development build já instalado no celular, use:

```bash
npm run start:light
```

Esse comando inicia o Metro com um worker, reduzindo a concorrência e o consumo de memória. O primeiro carregamento pode demorar mais; alterações em JavaScript e estilos usam Fast Refresh, sem gerar outro APK. Computador e celular devem estar na mesma rede Wi-Fi.

Para usar USB no Windows, conecte o celular, ative a depuração USB e aceite a autorização. No PowerShell:

```powershell
$adb = Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe'
& $adb devices -l
# Continue quando seu celular aparecer com o estado "device".
& $adb reverse tcp:8081 tcp:8081
npm run start:usb
```

Abra o development build instalado e conecte ao servidor `http://127.0.0.1:8081`. O comando USB prioriza IPv4 somente neste processo para evitar que o Metro escute apenas em `::1`. O encaminhamento USB vale enquanto a conexão estiver ativa. Pare o Metro com Ctrl+C ao terminar.

`npm run android` compila o aplicativo nativo: reserve esse comando para a primeira instalação ou mudanças nativas. Ele não é necessário a cada alteração de tela. Um APK de preview/produção não substitui o development build neste fluxo.

O diagnóstico do computador, os problemas encontrados e os limites da validação estão em [docs/CHECKUP-2026-10-09.md](docs/CHECKUP-2026-10-09.md).

## Estrutura principal

- `App.js` — navegação principal
- `src/screens/HomeScreen.js` — tela inicial
- `src/screens/MetronomeScreen.js` — metrônomo
- `src/screens/TunerScreen.js` — afinador
- `src/components/ComingSoonPopup.js` — popup de em breve
- `assets/` — imagens, sons e recursos do app

## Desenvolvimento no Android sem instalar Android Studio

O afinador usa `react-native-live-audio-stream`, um módulo nativo que não vem no Expo Go. Por isso, o app precisa de um **development build** próprio. O EAS pode compilar esse app na nuvem; quem contribui não precisa instalar Android Studio, Android SDK ou Java.

### Primeira configuração (uma pessoa responsável pelo projeto)

1. Tenha uma conta Expo em [expo.dev](https://expo.dev/) e acesso ao projeto EAS configurado neste repositório.
2. Na pasta `MelodiumMobile`, instale as dependências:

   ```bash
   npm ci
   ```

3. Entre na conta Expo e gere o development build Android na nuvem:

   ```bash
   npx eas-cli@latest login
   npx eas-cli@latest build --platform android --profile development
   ```

   O perfil `development` já está configurado em `eas.json`. Na primeira execução, o EAS pode pedir para configurar/gerenciar a assinatura Android.
4. Ao terminar, copie o link do build fornecido pelo EAS ou abra-o no [dashboard do EAS](https://expo.dev/). Envie o link ao time. Cada pessoa instala o APK no Android; talvez seja necessário permitir a instalação de apps pelo navegador usado para baixá-lo.

### Cada pessoa desenvolvedora

1. Instale Node.js e Git. Não é necessário instalar Android Studio, Java ou Android SDK para este fluxo.
2. Clone o repositório, entre na pasta do app e instale as dependências:

   ```bash
   cd MelodiumMobile
   npm ci
   ```

3. Instale no celular o development build compartilhado pela pessoa responsável. Não instale o Expo Go para este projeto.
4. No computador, inicie o servidor JavaScript:

   ```bash
   npx expo start --dev-client
   ```

5. Deixe o computador e o celular na mesma rede Wi-Fi. Abra o app Melodium instalado e conecte-o ao servidor exibido pelo Expo (escaneando o QR code ou usando o launcher do development build). Se a rede bloquear a conexão local, tente:

   ```bash
   npx expo start --dev-client --tunnel
   ```

Depois da instalação inicial do development build, alterações comuns em JavaScript/React Native aparecem pelo Metro sem recompilar o APK. Gere e instale um novo development build quando mudar dependências com código nativo, configuração nativa do app ou a versão do SDK Expo.

> Quem executar `npx expo run:android` localmente ainda precisará do Android SDK e do ambiente nativo Android instalado. Esse comando é opcional no fluxo de desenvolvimento acima.

## Expo Go: vale a pena trocar?

**Não recomendamos trocar o afinador para Expo Go só para simplificar a instalação.** O ponto que impede o Expo Go é `react-native-live-audio-stream`, usado pelo afinador para receber blocos de áudio do microfone enquanto a pessoa toca. O `expo-audio` do SDK 57 está incluído no Expo Go e oferece gravação, mas sua API documentada salva uma gravação em arquivo; ela não oferece o mesmo fluxo de amostras PCM contínuas que o afinador atual consome.

Analisar arquivos gravados em vez do sinal contínuo acrescentaria atraso e exigiria reimplementar e validar a detecção de altura. Isso pode prejudicar a resposta em tempo real, então não é uma substituição equivalente nem uma melhoria garantida de precisão. Para manter um afinador responsivo, development build é a opção mais segura. Podemos reavaliar Expo Go se surgir uma API de áudio ao vivo adequada e ela passar por testes de latência e precisão em aparelhos reais.

## Gerar um APK instalável para testes ou distribuição direta

O perfil `preview` já gera um build de distribuição interna para testes:

```bash
npx eas-cli@latest build --platform android --profile preview
```

Para um APK de lançamento (sem ferramentas de desenvolvimento), use o perfil `production-apk`:

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile production-apk
```

Quando o build terminar, baixe o arquivo `.apk` no link/dashboard do EAS e compartilhe-o. Cada pessoa pode abri-lo no Android e instalar; o Android poderá solicitar autorização para instalar apps daquela origem. Um APK permite instalação direta, mas não atualiza automaticamente o app de todos: para uma nova versão, gere outro APK e distribua novamente.

O perfil `production-apk` herda a configuração de `production` e pede ao EAS um APK. Guarde as credenciais de assinatura gerenciadas pelo EAS e use sempre o mesmo identificador de app (`com.melodium.mobile`) e a mesma chave para que versões futuras possam atualizar a instalação existente. Para publicar na Google Play, prefira o perfil `production`, que gera um `.aab` por padrão; a Play Store usa esse formato para entregar a versão apropriada a cada dispositivo.

## Desenvolvimento local nativo (opcional)

Para compilar e instalar diretamente pelo computador, instale Android Studio com Android SDK, JDK compatível com a versão do React Native/Expo do projeto e configure o ambiente Android. Com um emulador aberto ou um celular conectado:

```bash
npm run android
```

Para iniciar apenas o servidor de desenvolvimento:

```bash
npm start
```

## Referências

- [Expo SDK 57 — Audio](https://docs.expo.dev/versions/v57.0.0/sdk/audio/)
- [Expo — Development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo — Compartilhar development builds com o time](https://docs.expo.dev/develop/development-builds/share-with-your-team/)
- [Expo — Distribuição interna com EAS](https://docs.expo.dev/build/internal-distribution/)
- [Expo — Gerar APK com EAS](https://docs.expo.dev/build-reference/apk/)

---
