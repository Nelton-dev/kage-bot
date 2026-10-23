const axios = require('axios');

// API utilizada para pesquisar animes.
const ANILIST_API = 'https://graphql.anilist.co';

// API gratuita utilizada para traduzir as descrições.
const TRANSLATION_API = 'https://api.mymemory.translated.net/get';

// Traduz a descrição para português.
async function traduzirDescricao(texto) {
    if (!texto) {
        return 'Não existe uma descrição disponível para este anime.';
    }

    // Remove algumas tags HTML que podem aparecer na descrição.
    const textoLimpo = texto
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

    try {
        // A API limita o tamanho de cada texto enviado para tradução.
        // Por isso, dividimos a descrição em partes menores.
        const partes = textoLimpo.match(/[\s\S]{1,450}/g) || [];
        const partesTraduzidas = [];

        for (const parte of partes) {
            const resposta = await axios.get(TRANSLATION_API, {
                params: {
                    q: parte,
                    langpair: 'autodetect|pt'
                },
                timeout: 15000
            });

            const traducao = resposta.data?.responseData?.translatedText;

            if (
                resposta.data?.responseStatus === 200 &&
                traducao
            ) {
                partesTraduzidas.push(traducao);
            } else {
                // Se a tradução falhar, preservamos o texto original.
                partesTraduzidas.push(parte);
            }
        }

        return partesTraduzidas.join('');
    } catch (erro) {
        console.error('Erro ao traduzir descrição:', erro.message);

        return textoLimpo;
    }
}

module.exports = {
    name: 'anime',
    aliases: ["ani"],
    description: " Pesquisa um anime e apresenta informações em português.",


    category: 'Animes',

    icon: '🎌',
    async execute({ kage, jid, q }) {
        // Sem um nome, não há como saber qual anime pesquisar.
        if (!q || !q.trim()) {
            return kage.sendMessage(jid, {
                text: '❌ Indica o nome do anime.\n\nExemplo: .anime Naruto'
            });
        }

        try {
            await kage.sendMessage(jid, {
                text: '🔎 A pesquisar o anime e a preparar a descrição...'
            });

            // Procuramos apenas um resultado para evitar várias mensagens.
            const consulta = `
                query ($pesquisa: String) {
                    Page(page: 1, perPage: 1) {
                        media(search: $pesquisa, type: ANIME) {
                            id
                            title {
                                romaji
                                english
                                native
                            }
                            coverImage {
                                large
                            }
                            format
                            episodes
                            duration
                            averageScore
                            status
                            genres
                            description(asHtml: false)
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
                        pesquisa: q.trim()
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

            const anime = resposta.data?.data?.Page?.media?.[0];

            if (!anime) {
                return kage.sendMessage(jid, {
                    text: `❌ Não encontrei nenhum anime com o nome "${q}".`
                });
            }

            // Mantemos o título original, mas traduzimos a descrição.
            const titulo =
                anime.title.english ||
                anime.title.romaji ||
                anime.title.native ||
                'Anime sem título';

            const descricao = await traduzirDescricao(
                anime.description
            );

            // Traduzimos os valores técnicos para português.
            const formatos = {
                TV: 'Série de televisão',
                TV_SHORT: 'Série curta',
                MOVIE: 'Filme',
                SPECIAL: 'Especial',
                OVA: 'OVA',
                ONA: 'ONA',
                MUSIC: 'Vídeo musical'
            };

            const estados = {
                FINISHED: 'Concluído',
                RELEASING: 'Em lançamento',
                NOT_YET_RELEASED: 'Ainda não lançado',
                CANCELLED: 'Cancelado',
                HIATUS: 'Em pausa'
            };

            const formato =
                formatos[anime.format] || anime.format || 'Desconhecido';

            const estado =
                estados[anime.status] || anime.status || 'Desconhecido';

            const episodios =
                anime.episodes != null
                    ? anime.episodes
                    : 'Não informado';

            const duracao =
                anime.duration != null
                    ? `${anime.duration} minutos`
                    : 'Não informada';

            const pontuacao =
                anime.averageScore != null
                    ? `${anime.averageScore}/100`
                    : 'Sem classificação';

            const generos =
                anime.genres?.length
                    ? anime.genres.join(', ')
                    : 'Não informados';

            const legenda = [
                `🎌 *${titulo}*`,
                '',
                `📺 *Formato:* ${formato}`,
                `🎞️ *Episódios:* ${episodios}`,
                `⏱️ *Duração:* ${duracao}`,
                `⭐ *Classificação:* ${pontuacao}`,
                `📌 *Estado:* ${estado}`,
                `🎭 *Géneros:* ${generos}`,
                '',
                '📖 *Descrição:*',
                descricao,
                '',
                `🔗 ${anime.siteUrl}`
            ].join('\n');

            // Enviamos uma única mensagem com a capa e as informações.
            if (anime.coverImage?.large) {
                await kage.sendMessage(jid, {
                    image: {
                        url: anime.coverImage.large
                    },
                    caption: legenda
                });
            } else {
                await kage.sendMessage(jid, {
                    text: legenda
                });
            }

        } catch (erro) {
            console.error(
                'Erro no comando anime:',
                erro.response?.data || erro.message
            );

            await kage.sendMessage(jid, {
                text: '❌ Não foi possível pesquisar o anime. Verifica a ligação à internet e tenta novamente.'
            });
        }
    }
};
