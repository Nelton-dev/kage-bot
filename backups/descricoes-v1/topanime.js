const axios = require('axios');

const ANILIST_API = 'https://graphql.anilist.co';

module.exports = {
    name: 'topanime',
    aliases: ["top"],
    description: 'Mostra os 10 animes mais bem classificados.',


    category: 'Animes',

    icon: '🏆',
    async execute({ kage, jid }) {
        try {
            await kage.sendMessage(jid, {
                text: '🏆 A consultar o ranking dos melhores animes...'
            });

            // Pedimos os 10 animes melhor classificados no AniList.
            const consulta = `
                query {
                    Page(page: 1, perPage: 10) {
                        media(
                            type: ANIME,
                            sort: SCORE_DESC,
                            isAdult: false,
                            averageScore_greater: 0
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
                    query: consulta
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
                    text: '❌ Não foi possível encontrar animes para o ranking.'
                });
            }

            const medalhas = ['🥇', '🥈', '🥉'];

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

                const posicao =
                    medalhas[indice] || `🔹 ${indice + 1}.`;

                const pontuacao =
                    anime.averageScore != null
                        ? `${anime.averageScore}/100`
                        : 'Sem classificação';

                const episodios =
                    anime.episodes != null
                        ? anime.episodes
                        : 'Não informado';

                const estado =
                    estados[anime.status] ||
                    'Desconhecido';

                return [
                    `${posicao} *${titulo}*`,
                    `⭐ Classificação: ${pontuacao}`,
                    `🎞️ Episódios: ${episodios}`,
                    `📌 Estado: ${estado}`,
                    `🔗 ${anime.siteUrl}`
                ].join('\n');
            });

            const mensagem = [
                '🏆 *TOP 10 ANIMES*',
                '',
                ...lista,
                '',
                '_Classificações fornecidas pelo AniList._'
            ].join('\n\n');

            await kage.sendMessage(jid, {
                text: mensagem
            });

        } catch (erro) {
            console.error(
                'Erro no comando topanime:',
                erro.response?.data || erro.message
            );

            await kage.sendMessage(jid, {
                text: '❌ Não consegui carregar o ranking. Verifica a ligação à internet e tenta novamente.'
            });
        }
    }
};
