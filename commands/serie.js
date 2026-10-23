const tmdb = require('../lib/tmdb');

module.exports = {
    name: 'serie',
    aliases: ['tvshow'],
    description: 'Pesquisa séries de televisão.',
    category: 'Séries',
    icon: '📺',

    async execute({ kage, jid, q, msg }) {
        if (!q || !q.trim()) {
            return kage.sendMessage(jid, {
                text: '📺 Indica o nome da série.\n\nExemplo: .serie Breaking Bad'
            }, { quoted: msg });
        }

        try {
            await kage.sendMessage(jid, {
                text: '🔎 A pesquisar a série...'
            });

            const serie = await tmdb.pesquisar('serie', q.trim());

            if (!serie) {
                return kage.sendMessage(jid, {
                    text: `❌ Não encontrei a série "${q}".`
                }, { quoted: msg });
            }

            const [detalhes, generos] = await Promise.all([
                tmdb.detalhesSerie(serie.id),
                tmdb.obterGeneros('tv')
            ]);

            const anoInicio = serie.data
                ? serie.data.slice(0, 4)
                : '?';

            const anoFim = detalhes.dataFinal
                ? detalhes.dataFinal.slice(0, 4)
                : null;

            const periodo = detalhes.estado === 'Ended' && anoFim
                ? `${anoInicio}–${anoFim}`
                : `${anoInicio}${detalhes.estado === 'Returning Series' ? '–Presente' : ''}`;

            const classificacao = Number.isFinite(serie.classificacao)
                && serie.votos > 0
                ? `${serie.classificacao.toFixed(1)}/10`
                : 'Sem classificação';

            const listaGeneros = serie.generos
                .map(id => generos[id])
                .filter(Boolean)
                .join(', ') || 'Não informados';

            const legenda = [
                `📺 *${serie.titulo}* (${periodo})`,
                '',
                `⭐ *Classificação:* ${classificacao}`,
                `🎭 *Géneros:* ${listaGeneros}`,
                `📚 *Temporadas:* ${detalhes.temporadas ?? 'Não informado'}`,
                `🎞️ *Episódios:* ${detalhes.episodios ?? 'Não informado'}`,
                `📌 *Estado:* ${detalhes.estado || 'Não informado'}`,
                '',
                '📖 *Sinopse:*',
                serie.descricao,
                '',
                '📺 Dados fornecidos pelo TMDB.'
            ].join('\n');

            if (serie.cartaz) {
                await kage.sendMessage(jid, {
                    image: { url: serie.cartaz },
                    caption: legenda
                }, { quoted: msg });
            } else {
                await kage.sendMessage(jid, {
                    text: legenda
                }, { quoted: msg });
            }
        } catch (erro) {
            console.error('Erro no comando serie:', erro.message);

            await kage.sendMessage(jid, {
                text: '❌ Não foi possível pesquisar a série. Verifica a configuração da API e a ligação à internet.'
            }, { quoted: msg });
        }
    }
};
