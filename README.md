# Melodium

O Melodium é uma plataforma criada para ajudar músicos a transformar prática em constância. O projeto reúne registro de sessões, acompanhamento de progresso, diário musical e ferramentas de apoio ao estudo em experiências para Android e web.

[Baixar o Melodium 1.2.1 para Android](https://github.com/micardosofph/Melodium/releases/download/v1.2.1/Melodium-1.2.1.apk) · [Notas da versão](https://github.com/micardosofph/Melodium/releases/tag/v1.2.1) · [Conhecer o Melodium na web](https://micardosofph.github.io/Melodium/)

> O APK é distribuído diretamente pelo GitHub e requer Android 7 ou superior. Durante a instalação, o Android pode solicitar autorização para instalar aplicativos provenientes do navegador ou do gerenciador de arquivos utilizado.

## Visão geral

A proposta do Melodium é concentrar em um só lugar o que normalmente fica espalhado durante os estudos de música: tempo praticado, frequência, registros pessoais, vídeos de evolução e ferramentas como metrônomo e afinador.

O repositório possui três partes principais:

| Componente | Papel no projeto | Tecnologias principais |
| --- | --- | --- |
| [Aplicativo mobile](frontend/MelodiumMobile/) | Experiência principal para registrar e acompanhar a prática musical no Android | React Native, Expo SDK 57 e AsyncStorage |
| [Experiência web](frontend/MelodiumWEB/) | Site público, painel e ferramentas musicais acessíveis pelo navegador | HTML, CSS e JavaScript |
| [Backend](backend/) | API experimental de usuários e ofensiva utilizada pela experiência web local | Java 17, Spring Boot e MySQL |

Atualmente, o aplicativo mobile segue uma abordagem **local-first**: perfil, preferências, práticas, diário, fotos e vídeos permanecem no próprio aparelho. A API do backend faz parte da versão web e ainda não é responsável pela autenticação ou sincronização dos dados do aplicativo.

## Principais recursos

### Aplicativo Android

- Onboarding com nome e lembrete diário configurável.
- Cronômetro de prática e registro manual de sessões anteriores.
- Histórico com tempo total, quantidade de práticas, sequência de dias e gráficos de progresso.
- Diário musical com texto e fotos da câmera ou da galeria.
- Gravação, reprodução e organização de vídeos de evolução.
- Metrônomo com som, vibração e ajuste de andamento.
- Afinador em tempo real pelo microfone.
- Perfil personalizável, guia interativo e central de ajuda.
- Verificação de novas versões publicadas nas Releases do GitHub.

### Experiência web

- Landing page responsiva com apresentação do projeto.
- Painel de acompanhamento e integração local com a API.
- Metrônomo, afinador e dicionário inverso de acordes.
- Lista de tarefas, rotinas de estudo e páginas de apoio.
- Áreas conceituais de comunidade, acessibilidade e diário de bordo.

## Estrutura do repositório

```text
Melodium/
├── backend/                    # API Spring Boot e persistência MySQL
├── frontend/
│   ├── MelodiumMobile/         # Aplicativo React Native + Expo
│   └── MelodiumWEB/            # Site e ferramentas web
├── index.html                  # Entrada do GitHub Pages
└── README.md
```

## Executando o projeto

### Aplicativo mobile

O Expo SDK 57 requer Node.js 22.13 ou superior. Na pasta do aplicativo:

```powershell
cd frontend\MelodiumMobile
npm.cmd ci
npm.cmd run start:light
```

O afinador utiliza um módulo nativo de áudio, portanto o projeto deve ser aberto pelo development build do Melodium, e não pelo Expo Go. Alterações em dependências nativas, permissões ou plugins exigem a geração de um novo APK.

Para validar o projeto:

```powershell
npm.cmd test
npx.cmd expo-doctor
```

As instruções completas de desenvolvimento e geração de APK estão no [README do aplicativo mobile](frontend/MelodiumMobile/README.md).

### Experiência web

Sirva a raiz do repositório com o Live Server do VS Code ou outro servidor HTTP estático e abra `index.html`. Esse arquivo redireciona para a landing page em `frontend/MelodiumWEB/landingPage/`.

Sem uma API local ativa, as páginas públicas e ferramentas continuam acessíveis, mas recursos que consultam usuários ou ofensiva podem indicar que o servidor está indisponível.

### Backend

Pré-requisitos: Java 17 e MySQL. Configure a conexão local em `backend/src/main/resources/application.properties` sem publicar credenciais reais e, dentro de `backend`, execute:

```powershell
.\mvnw.cmd spring-boot:run
```

A API fica disponível por padrão em `http://localhost:8080`, com os endpoints de usuários sob `/usuarios`.

## Distribuição Android

As versões instaláveis são publicadas na página de [Releases do Melodium](https://github.com/micardosofph/Melodium/releases). Para gerar um APK final assinado, pessoas autorizadas no projeto Expo podem executar:

```powershell
cd frontend\MelodiumMobile
npx.cmd eas-cli@latest build --platform android --profile production-apk
```

Todas as atualizações destinadas aos mesmos usuários devem manter o identificador `com.melodium.mobile` e a mesma chave de assinatura Android.

## Sobre o projeto

O Melodium nasceu como projeto interdisciplinar e Trabalho de Conclusão de Curso de Desenvolvimento de Sistemas na ETEC Bento Quirino. Seu objetivo é explorar como tecnologia, organização e feedback visual podem tornar o estudo musical mais consistente, consciente e motivador.

O projeto continua em desenvolvimento e pode receber ajustes de experiência, novas ferramentas e integração entre as plataformas.
