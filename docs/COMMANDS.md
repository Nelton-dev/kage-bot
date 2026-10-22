# Kage-Bot: Catálogo de comandos

Este documento regista os comandos conhecidos do projeto.

O prefixo atual é apresentado como ponto (.). Confirmar em index.js se for alterado.

## 1. Comandos gerais

### .ping

Verifica se o bot está a responder.

### .menu

Apresenta o menu de comandos.

A implementação prevista identifica os módulos existentes na pasta commands/ e pode apresentar o banner localizado em assets/kage-banner.png, caso o ficheiro exista.

## 2. Animes

### .anime <título>

Alias: .ani

Pesquisa um anime através da API AniList.

Pode apresentar informações como título, capa, pontuação, estado, número de episódios e descrição.

A descrição pode ser traduzida para português através do MyMemory.

Exemplo:

.anime Naruto

### .temporada

Aliases: season, animesatuais

Apresenta uma seleção de animes populares da temporada atual.

A temporada é determinada pela lógica de calendário implementada no comando.

### .topanime

Aliases: top, melhoresanimes

Apresenta uma lista dos animes mais bem classificados na AniList.

### .animealeatorio

Aliases: aleatorio, randomanime, anime random

Seleciona aleatoriamente um anime a partir de páginas de resultados populares da AniList.

A seleção não representa necessariamente todos os animes existentes na plataforma.

## 3. Comandos futuros

Os seguintes comandos ainda estão planeados e não devem ser considerados implementados até serem testados:

- Pesquisa de filmes.
- Pesquisa de séries.
- Pesquisa unificada de entretenimento.
- Novas categorias de comandos.

## 4. Como adicionar um comando

1. Criar um ficheiro JavaScript dentro de commands/.
2. Exportar name, description e execute.
3. Adicionar aliases, caso sejam necessários.
4. Confirmar os parâmetros recebidos pela função execute.
5. Verificar se o carregador de index.js reconhece o módulo.
6. Testar o comando no WhatsApp.
7. Atualizar este documento.

Exemplo estrutural:

module.exports = {
  name: 'exemplo',
  description: 'Descrição do comando.',
  aliases: [],
  async execute({ kage, jid, msg, q, args }) {
    await kage.sendMessage(jid, {
      text: 'Comando executado!'
    }, {
      quoted: msg
    });
  }
};

Este exemplo é apenas uma estrutura de referência. Os comandos reais devem seguir as convenções do projeto.
