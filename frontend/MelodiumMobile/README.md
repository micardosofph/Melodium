# Melodium Mobile

Aplicativo móvel em React Native + Expo para prática musical com metrônomo e afinador.

## Requisitos

Antes de rodar o projeto, tenha instalado:

- Node.js 20.x ou compatível
- npm ou yarn
- Android Studio + Android SDK
- JDK 17
- Expo CLI (opcional, mas pode ser usado via `npx expo`)

## Estrutura principal

- `App.js` — navegação principal
- `src/screens/HomeScreen.js` — tela inicial
- `src/screens/MetronomeScreen.js` — metrônomo
- `src/screens/TunerScreen.js` — afinador
- `src/components/ComingSoonPopup.js` — popup de em breve
- `assets/` — imagens, sons e recursos do app

## 1) Clonar e instalar dependências

Na pasta do projeto:

```bash
cd MelodiumMobile
npm install
```

Se preferir usar yarn:

```bash
cd MelodiumMobile
yarn install
```

## 2) Configurar Android SDK

O projeto usa Android native, então o SDK precisa estar disponível.

### Verifique o Java

No Windows PowerShell:

```powershell
java -version
```

Se a versão estiver diferente da esperada, ajuste a variável `JAVA_HOME`.

### Configurar `JAVA_HOME`

Exemplo no Windows:

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
```

### Configurar `ANDROID_HOME` / `ANDROID_SDK_ROOT`

Exemplo:

```powershell
$env:ANDROID_SDK_ROOT = "C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk"
$env:ANDROID_HOME = "C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk"
$env:Path = "$env:ANDROID_SDK_ROOT\platform-tools;$env:ANDROID_SDK_ROOT\emulator;$env:ANDROID_SDK_ROOT\tools;$env:Path"
```

Também é comum criar um arquivo `android/local.properties` com o caminho do SDK:

```properties
sdk.dir=C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk
```

## 3) Rodar em desenvolvimento

### Iniciar o Metro Bundler

```bash
npm start
```

ou

```bash
npx expo start
```

### Abrir no Android

Com um emulador já aberto ou um dispositivo Android conectado:

```bash
npm run android
```

ou

```bash
npx expo run:android
```

## 4) Build de desenvolvimento Android

Para gerar um build Android local:

```bash
npx expo run:android
```

Se for usar desenvolvimento nativo com EAS ou build local mais avançado, também pode ser necessário:

```bash
npx expo prebuild
```

## 5) Solução de problemas comuns

### Erro: `SDK location not found`

Verifique se o arquivo `android/local.properties` existe e contém o caminho correto do SDK.

Exemplo:

```properties
sdk.dir=C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk
```

### Erro: `JAVA_HOME not set` / Java mismatch

Configure `JAVA_HOME` para JDK 17 e reinicie o terminal.

### Problemas de native modules / build antigo

Quando algo no Android fica inconsistente, limpe os artefatos:

```bash
cd android
./gradlew clean
cd ..
```

Depois rode novamente:

```bash
npm run android
```

### Erro de áudio / módulo nativo

O app usa `expo-audio`, e o projeto já foi ajustado para evitar conflitos com `expo-av`. Se o build ou runtime ainda tiver problema, rode a limpeza e reconstrua o app.

## 6) Scripts úteis

```bash
npm start
npm run android
npx expo start --web
```

## 7) Observações importantes

- Este projeto foi configurado para Expo SDK 57.
- O app tem foco em metrônomo e afinador.
- Para rodar corretamente em Android, o ambiente Java + Android SDK precisa estar consistente.

## 8) Dicas de desenvolvimento

- Sempre rode o projeto a partir da raiz da pasta `MelodiumMobile`.
- Se o Metro não atualizar corretamente, reinicie com `npx expo start --clear`.
- Mantenha o emulador ou dispositivo Android ligado antes de rodar `npm run android`.

---