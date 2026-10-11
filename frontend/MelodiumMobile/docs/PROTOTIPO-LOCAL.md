# Protótipo local: prática e evolução

O app funciona sem conta. Home, Progresso e Perfil leem a mesma fonte de dados local.

## O que fica salvo

- Sessões concluídas: identificador, título, instrumento, duração em segundos e data de conclusão.
- Sessão em andamento: tempo acumulado e estado do cronômetro.
- Nomes dos vídeos, associados ao identificador do vídeo na biblioteca do aparelho.
- Conclusão ou dispensa do guia inicial.
- Foto de perfil escolhida no aparelho. Ao removê-la, o avatar volta para o padrão verde com “Me”.

Esses dados ficam no AsyncStorage, na chave versionada `@melodium/local-data/v1`. Os arquivos de vídeo ficam no álbum **Melodium - Evolução** da biblioteca de mídia. Limpar os dados ou desinstalar o app remove o histórico e os títulos locais; não há sincronização entre aparelhos.

## Regras do cronômetro

- Só sessões **salvas** entram nos totais, dias praticados e sequência.
- O cronômetro continua ao navegar para afinador/metrônomo dentro do app.
- Ao colocar o app em segundo plano, a sessão é pausada e persistida.
- Durante a execução, um checkpoint é salvo a cada 15 segundos. Após encerramento inesperado, a sessão volta pausada no último checkpoint, sem contar o período em que o app ficou fechado. No máximo o intervalo desde o último checkpoint pode se perder nesse caso.
- O histórico manual recebe a data atual e aceita de 1 segundo a 24 horas.
- A sequência considera dias consecutivos do calendário local, terminando hoje ou ontem. O gráfico mostra os últimos sete dias.

## Vídeos

Depois de gravar, o usuário escolhe o nome e confirma o salvamento. O título identifica o vídeo dentro do Melodium; o nome físico do arquivo pode continuar sendo gerado pela câmera. Falhas de salvamento mantêm o trecho na tela para tentar novamente. Sair sem confirmar pede confirmação.

Apagar exige confirmação no app e, quando necessário, autorização do sistema. Isso exclui o arquivo da biblioteca de mídia, não apenas um atalho do Melodium. A operação é restrita a vídeos do álbum do app. Cancelar mantém o vídeo.

## Organização

- `practiceModel.js`: tempo, formatação e estatísticas, sem dependências nativas.
- `practiceRepository.js`: validação, leitura, fila de gravações e proteção contra duplicação. Só publica sucesso após a escrita; dados inválidos existentes não são sobrescritos.
- `localData.js`: integração React, AsyncStorage e ciclo de vida do aplicativo.
- `evolutionVideos.js`: biblioteca de mídia Expo SDK 57, paginação e metadados locais.
- `profilePhoto.js`: seleção e cópia da foto para o armazenamento permanente do app.
- `HomeTour.js`: guia sobre a própria Home. Pode ser pulado e reaberto no cartão Guia Melodium.

## Verificação

Execute `npm.cmd test` para os testes de persistência, falhas, duração, sequência e concorrência. Para validar interfaces e permissões, use o development build no aparelho com `npm.cmd run start:usb`, ou `npm.cmd run start:light` na rede local.

Trilhas e Conceitos estão desabilitados e marcados como Em breve. A área Social continua sendo uma demonstração visual, sem publicação ou contas reais.
