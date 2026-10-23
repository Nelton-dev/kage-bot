# ⚔️ Kage Bot

Bot de WhatsApp desenvolvido em Node.js com Baileys, criado para
oferecer comandos interativos, pesquisas e outras funcionalidades
diretamente nas conversas do WhatsApp.

## 📌 Funcionalidades

### 🎬 Pesquisa de filmes

Comando:

`.filme <título>`

Permite pesquisar filmes através da API do The Movie Database (TMDB).

As informações disponíveis podem incluir:
- Título do filme
- Título original
- Sinopse
- Ano de lançamento
- Classificação
- Géneros
- Cartaz, quando disponível

### 📺 Pesquisa de séries

Comando:

`.serie <título>`

Permite pesquisar séries através da API do TMDB.

As informações disponíveis podem incluir:
- Título da série
- Título original
- Sinopse
- Ano de estreia
- Classificação
- Géneros
- Cartaz, quando disponível
- Número de temporadas
- Número de episódios
- Estado da série

### 🎌 Animes

O projeto possui uma categoria dedicada a funcionalidades
relacionadas com animes.

Consulta o menu do bot para conhecer os comandos disponíveis.

### ⚙️ Menu de comandos

O menu organiza os comandos por categorias, facilitando a
descoberta das funcionalidades disponíveis.

As categorias incluem:
- Gerais
- Animes
- Filmes
- Séries
- Pesquisa
- Outros

As categorias apresentadas dependem dos comandos existentes
e da configuração atual do projeto.

## 🛠️ Tecnologias

- Node.js: execução do bot.
- Baileys: comunicação com o WhatsApp.
- Axios: realização de pedidos HTTP.
- The Movie Database (TMDB): pesquisa de filmes e séries.
- PM2: gestão do processo do bot.
- Termux: ambiente de desenvolvimento e execução no Android.

## 📁 Estrutura do projeto

A estrutura principal inclui:

- `index.js`: ponto de entrada do bot.
- `commands/`: comandos carregados pelo sistema.
- `config/`: configurações dos serviços utilizados.
- `lib/`: funções auxiliares e integrações externas.
- `backups/`: cópias de segurança locais, quando existentes.

A estrutura pode evoluir à medida que novas funcionalidades
forem adicionadas.

## 🔑 Configuração da API do TMDB

A pesquisa de filmes e séries utiliza uma chave de API do TMDB.

### 1. Obter uma chave

Cria uma conta no TMDB e solicita uma chave de API através
das opções de configuração da tua conta.

Site oficial: https://www.themoviedb.org/

### 2. Configurar a chave

Na raiz do projeto, cria ou edita o ficheiro `.env`:

```env
TMDB_API_KEY=TUA_CHAVE_API```


📈 Desenvolvimento
O projeto encontra-se em desenvolvimento. Novas funcionalidades, melhorias e correções poderão ser adicionadas progressivamente.
Consulta o histórico do Git para acompanhar as alterações.

⚖️ Créditos
Este projeto utiliza a API do TMDB para obter informações sobre filmes e séries.
O Kage Bot não é afiliado ao TMDB.
Os dados fornecidos pelo TMDB estão sujeitos aos respetivos termos de utilização.
