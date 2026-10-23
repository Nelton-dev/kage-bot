const axios = require('axios');

const ANILIST_API = 'https://graphql.anilist.co';
const TRANSLATION_API = 'https://api.mymemory.translated.net/get';

// Traduz a descrição para português.
async function traduzirDescricao(texto) {
    if (!texto) {
        return 'Descrição não disponível.';
    }

    // Retira as tags HTML e converte algumas entidades.
    const textoLimpo = texto
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

    try {
        // Dividimos o texto para evitar pedidos demasiado grandes.
        const partes = textoLimpo.match(/[\s\S]{1,450}/g) || [];
        const traducoes = [];

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
                traducoes.push(traducao);
            } else {
                traducoes.push(parte);
            }
        }

        return traducoes.join('');
    } catch (erro) {
        console.error('Erro na tradução:', erro.message);

        // Se a tradução falhar, o comando continua a funcionar.
        return textoLimpo;
    }
}

module.exports = {
    name: 'animealeatorio',
    aliases: ["aleatorio"],
    description: 'Recomenda um anime aleatório.',


    category: 'Animes',

    icon: '🎲',
    async execute({ kage, jid }) {
        try {
            await kage.sendMessage(jid, {
                text: '🎲 A sortear um anime para ti...'
            });

            /*
             * A API não possui um sorteio aleatório direto.
             * Por isso, escolhemos uma página aleatória e pedimos
             * animes populares dessa página.
             */
            const pagina = Math.floor(Math.random() * 50) + 1;

            const consulta = `
                query ($pagina: Int) {
                    Page(page: $pagina, perPage: 25) {
                        media(
                            type: ANIME,
                            sort: POPULARITY_DESC,
                            isAdult: false
                        ) {
                            id
                            title {
                                romaji
                                english
                            }
                            coverImage {
                                large
                            }
                            format
                            episodes
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
                        pagina
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
                    text: '❌ Não consegui encontrar um anime desta vez. Tenta novamente.'
                });
            }

            // Escolhe apenas um anime entre os resultados recebidos.
            const anime = animes[
                Math.floor(Math.random() * animes.length)
            ];

            const titulo =
                anime.title.english ||
                anime.title.romaji ||
                'Título desconhecido';

            const descricao = await traduzirDescricao(
                anime.description
            );

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
                RELEASING: 'Em exibição',
                NOT_YET_RELEASED: 'Ainda não estreou',
                CANCELLED: 'Cancelado',
                HIATUS: 'Em pausa'
            };

            const formato =
                formatos[anime.format] ||
                anime.format ||
                'Não informado';

            const estado =
                estados[anime.status] ||
                'Desconhecido';

            const pontuacao =
                anime.averageScore != null
                    ? `${anime.averageScore}/100`
                    : 'Sem classificação';

            const episodios =
                anime.episodes != null
                    ? anime.episodes
                    : 'Não informado';

            const generos =
                anime.genres?.length
                    ? anime.genres.join(', ')
                    : 'Não informados';

            const legenda = [
                '🎲 *A TUA RECOMENDAÇÃO ALEATÓRIA*',
                '',
                `🎌 *${titulo}*`,
                '',
                `📺 *Formato:* ${formato}`,
                `🎞️ *Episódios:* ${episodios}`,
                `⭐ *Classificação:* ${pontuacao}`,
                `📌 *Estado:* ${estado}`,
                `🎭 *Géneros:* ${generos}`,
                '',
                '📖 *Descrição:*',
                descricao,
                '',
                `🔗 ${anime.siteUrl}`,
                '',
                '💡 _Não gostaste? Usa .animealeatorio novamente!_'
            ].join('\n');

            // Envia a capa e as informações numa única mensagem.
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
                'Erro no comando animealeatorio:',
                erro.response?.data || erro.message
            );

            await kage.sendMessage(jid, {
                text: '❌ Não consegui sortear um anime. Verifica a ligação à internet e tenta novamente.'
            });
        }
    }
};
