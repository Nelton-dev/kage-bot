const tmdb = require('../lib/tmdb');

module.exports = {
    name: 'filme',
    aliases: ['movie'],
    description: 'Pesquisa filmes por título.',
    category: 'Filmes',
    icon: '🎬',

    async execute({ kage, jid, q, msg }) {
        if (!q || !q.trim()) {
            return kage.sendMessage(jid, {
                text: '🎬 Indica o nome do filme.\n\nExemplo: .filme Interstellar'
            }, { quoted: msg });
        }

        try {
            await kage.sendMessage(jid, {
                text: '🔎 A pesquisar o filme...'
            });

            const filme = await tmdb.pesquisar('filme', q.trim());

            if (!filme) {
                return kage.sendMessage(jid, {
                    text: `❌ Não encontrei o filme "${q}".`
                }, { quoted: msg });
            }

            const generos = await tmdb.obterGeneros('movie');

            const ano = filme.data
                ? filme.data.slice(0, 4)
                : 'Desconhecido';

            const classificacao = Number.isFinite(filme.classificacao)
                && filme.votos > 0
                ? `${filme.classificacao.toFixed(1)}/10`
                : 'Sem classificação';

            const listaGeneros = filme.generos
                .map(id => generos[id])
                .filter(Boolean)
                .join(', ') || 'Não informados';

            const legenda = [
                `🎬 *${filme.titulo}* (${ano})`,
                '',
                `⭐ *Classificação:* ${classificacao}`,
                `🎭 *Géneros:* ${listaGeneros}`,
                '',
                '📖 *Sinopse:*',
                filme.descricao,
                '',
                '🎞️ Dados fornecidos pelo TMDB.'
            ].join('\n');

            if (filme.cartaz) {
                await kage.sendMessage(jid, {
                    image: { url: filme.cartaz },
                    caption: legenda
                }, { quoted: msg });
            } else {
                await kage.sendMessage(jid, {
                    text: legenda
                }, { quoted: msg });
            }
        } catch (erro) {
            console.error('Erro no comando filme:', erro.message);

            await kage.sendMessage(jid, {
                text: '❌ Não foi possível pesquisar o filme. Verifica a configuração da API e a ligação à internet.'
            }, { quoted: msg });
        }
    }
};
