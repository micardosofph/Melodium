# Banco local do Melodium

O projeto usa MySQL real em desenvolvimento. O H2 existe apenas no escopo dos testes automatizados e nunca substitui o MySQL ao iniciar a aplicação.

## Configuração por computador

Cada integrante instala o MySQL Server, cria o banco `melodium` e o usuário `melodium_app`. Depois, configura estas variáveis uma única vez no Windows:

```powershell
[Environment]::SetEnvironmentVariable('MELODIUM_DB_USERNAME', 'melodium_app', 'User')
[Environment]::SetEnvironmentVariable('MELODIUM_DB_PASSWORD', 'SENHA_LOCAL', 'User')
```

Feche e abra novamente o terminal após configurar as variáveis. A URL já possui um padrão local, mas pode ser substituída quando necessário:

```powershell
[Environment]::SetEnvironmentVariable('MELODIUM_DB_URL', 'jdbc:mysql://localhost:3306/melodium?useTimezone=true&serverTimezone=UTC', 'User')
```

As credenciais não devem ser gravadas no Git. Cada máquina mantém suas próprias variáveis, enquanto todos usam o mesmo `application.properties`.

## Uso diário nesta máquina

Na pasta `backend`, inicie o banco com:

```powershell
.\start-mysql.cmd
```

Depois, inicie o Java normalmente:

```powershell
.\mvnw.cmd spring-boot:run
```

Para desligar o banco:

```powershell
.\stop-mysql.cmd
```

Sem o MySQL ativo ou sem credenciais válidas, o backend não inicia e nenhum cadastro pode ser criado.

## Dados compartilhados

Dois bancos locais têm estruturas iguais, mas dados separados. Para os dois integrantes visualizarem os mesmos usuários em tempo real, configurem `MELODIUM_DB_URL`, `MELODIUM_DB_USERNAME` e `MELODIUM_DB_PASSWORD` apontando para um MySQL remoto compartilhado.
