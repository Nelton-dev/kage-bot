# Kage-Bot

## 1. Descrição

Kage-Bot é um bot de WhatsApp desenvolvido em Node.js, utilizando a biblioteca Baileys.

O projeto possui uma arquitetura modular, permitindo adicionar novos comandos sem concentrar toda a lógica num único ficheiro.

O objetivo é criar um bot de entretenimento com funcionalidades relacionadas com animes, filmes, séries e outras categorias futuras.

## 2. Ambiente de desenvolvimento

- Plataforma: Android com Termux
- Linguagem: JavaScript
- Runtime: Node.js
- WhatsApp: Baileys (@whiskeysockets/baileys)
- Logs: pino
- QR Code: qrcode-terminal
- Requisições HTTP: axios
- APIs de anime: AniList GraphQL
- Tradução: MyMemory Translation API
- Processamento de mídia: FFmpeg, quando necessário

## 3. Estrutura do projeto

kage-bot/
├── index.js
├── package.json
├── auth/
├── assets/
│   └── kage-banner.png
├── commands/
│   ├── menu.js
│   ├── ping.js
│   ├── anime.js
│   ├── temporada.js
│   ├── topanime.js
│   └── animealeatorio.js
└── docs/
    ├── PROJECT.md
    ├── COMMANDS.md
    ├── ROADMAP.md
    └── CHANGELOG.md

A estrutura acima representa a organização prevista. Os ficheiros devem ser confirmados no dispositivo antes de assumir que todos existem.

## 4. Arquitetura dos comandos

Os comandos ficam dentro da pasta commands/.

O carregador em index.js identifica os módulos JavaScript e disponibiliza os comandos registados.

Os módulos exportam propriedades como:

- name: nome principal do comando
- description: descrição
- aliases: nomes alternativos
- execute: função que executa o comando

O contexto de execução pode incluir:

- kage: cliente do WhatsApp
- jid: destinatário da mensagem
- msg: mensagem original
- q: texto fornecido pelo utilizador
- args: argumentos separados
- comando: comando identificado
- prefix: prefixo utilizado
- nomeBot: nome do bot
- isGroup: indica se a mensagem veio de um grupo

Os parâmetros exatos dependem da implementação atual de index.js.

## 5. APIs externas

### AniList

Endpoint GraphQL:
https://graphql.anilist.co

Utilizado para pesquisar animes, consultar temporadas, obter rankings e recomendar títulos.

### MyMemory

Endpoint:
https://api.mymemory.translated.net/get

Utilizado para tentar traduzir descrições para português.

A tradução pode falhar devido a limites ou indisponibilidade do serviço. O bot deve preservar uma alternativa para apresentar a descrição original.

## 6. Regras de desenvolvimento

- Manter os comandos independentes e modulares.
- Evitar dependências desnecessárias.
- Preferir serviços gratuitos durante o desenvolvimento.
- Testar cada funcionalidade antes de avançar.
- Evitar expor credenciais e dados de autenticação.
- Atualizar a documentação após mudanças importantes.
- Não substituir funcionalidades existentes sem verificar o impacto.

## 7. Segurança

A pasta auth/ contém dados de autenticação do WhatsApp.

Nunca publicar a sessão, credenciais, tokens ou outros dados privados num repositório público.

O ficheiro .gitignore deve excluir, no mínimo, os dados de autenticação e os ficheiros locais sensíveis.
