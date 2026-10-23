const axios = require('axios');

const ANILIST_API = 'https://graphql.anilist.co';

// Descobre a estação do ano atual.
function obterTemporada(data = new Date()) {
    const mes = data.getMonth() + 1;

    if (mes >= 1 && mes <= 3) return 'WINTER';
    if (mes >= 4 && mes <= 6) return 'SPRING';
    if (mes >= 7 && mes <= 9) return 'SUMMER';

    return 'FALL';
}

// Traduz os nomes das estações para português.
function nomeTemporada(temporada) {
    const nomes = {
        WINTER: 'Inverno',
        SPRING: 'Primavera',
        SUMMER: 'Verão',
        FALL: 'Outono'
    };

    return nomes[temporada] || temporada;
}

module.exports = {
    name: 'temporada',
    aliases: ["season"],
    description: 'Mostra os animes da temporada atual.',


    category: 'Animes',

    icon: '🍿',
    async execute({ kage, jid }) {
        try {
            const agora = new Date();
            const temporada = obterTemporada(agora);
            const ano = agora.getFullYear();

            await kage.sendMessage(jid, {
                text: `🔎 A procurar os animes da temporada de ${nomeTemporada(temporada)} de ${ano}...`
            });

            const consulta = `
                query ($temporada: MediaSeason, $ano: Int) {
                    Page(page: 1, perPage: 5) {
                        media(
                            season: $temporada,
                            seasonYear: $ano,
                            type: ANIME,
                            sort: POPULARITY_DESC
                            isAdult: false
                        ) {
                            title {
                                romaji
                                english
                            }
                            episodes
                            averageScore
                            status
                            siteUrl
                        }
                    }
                }
            `;

            const resposta = await axios.post(
                ANILIST_API,
                {
                    query: consulta,
                    variables: {
                        temporada,
                        ano
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    timeout: 20000
                }
            );

            const animes = resposta.data?.data?.Page?.media || [];

            if (animes.length === 0) {
                return kage.sendMessage(jid, {
                    text: `😕 Não encontrei animes para a temporada de ${nomeTemporada(temporada)} de ${ano}.`
                });
            }

            const estados = {
                FINISHED: 'Concluído',
                RELEASING: 'Em exibição',
                NOT_YET_RELEASED: 'Ainda não estreou',
                CANCELLED: 'Cancelado',
                HIATUS: 'Em pausa'
            };

            const lista = animes.map((anime, indice) => {
                const titulo =
                    anime.title.english ||
                    anime.title.romaji ||
                    'Título desconhecido';

                const episodios =
                    anime.episodes ?? 'Por confirmar';

                const classificacao =
                    anime.averageScore != null
                        ? `${anime.averageScore}/100`
                        : 'Sem classificação';

                const estado =
                    estados[anime.status] ||
                    'Estado desconhecido';

                return [
                    `*${indice + 1}. ${titulo}*`,
                    `⭐ Classificação: ${classificacao}`,
                    `🎞️ Episódios: ${episodios}`,
                    `📌 Estado: ${estado}`,
                    `🔗 ${anime.siteUrl}`
                ].join('\n');
            });

            const mensagem = [
                `🍿 *ANIMES DA TEMPORADA*`,
                `📅 ${nomeTemporada(temporada)} de ${ano}`,
                '',
                ...lista,
                '',
                '_Dados fornecidos pelo AniList._'
            ].join('\n\n');

            await kage.sendMessage(jid, {
                text: mensagem
            });

        } catch (erro) {
            console.error(
                'Erro no comando temporada:',
                erro.response?.data || erro.message
            );

            await kage.sendMessage(jid, {
                text: '❌ Não consegui carregar os animes da temporada. Tenta novamente dentro de alguns instantes.'
            });
        }
    }
};
