const axios = require('axios');

// A configuração fica fora do código para não expor o token
// sempre que partilharmos ou atualizarmos o projeto.
const API_URL = process.env.KAGE_API_URL;
const API_TOKEN = process.env.KAGE_API_TOKEN;

module.exports = {
    name: 'hentai',
    aliases: ["hn"],
    description: 'Pesquisa títulos na API configurada.',

    category: 'Pesquisa',
    icon: '🔎',
    async execute({ kage, jid, msg, args }) {
        const pesquisa = args.join(' ').trim();

        // Sem um termo de pesquisa, não há nada para consultar.
        if (!pesquisa) {
            return kage.sendMessage(
                jid,
                {
                    text:
                        '⚠️ Indica o título que pretendes pesquisar.\n\n' +
                        'Exemplo: .hn nome do título'
                },
                { quoted: msg }
            );
        }

        // Evitamos fazer pedidos se a API ainda não estiver configurada.
        if (!API_URL || !API_TOKEN) {
            return kage.sendMessage(
                jid,
                {
                    text:
                        '⚠️ A API não está configurada.\n' +
                        'Verifica KAGE_API_URL e KAGE_API_TOKEN.'
                },
                { quoted: msg }
            );
        }

        try {
            await kage.sendMessage(
                jid,
                {
                    text: `🔎 A pesquisar por: ${pesquisa}`
                },
                { quoted: msg }
            );

            /*
             * O Axios trata da codificação dos parâmetros.
             * Assim, pesquisas com espaços e caracteres especiais
             * não estragam o endereço do pedido.
             */
            const { data } = await axios.get(
                `${API_URL.replace(/\/+$/, '')}/search`,
                {
                    params: {
                        q: pesquisa,
                        apitoken: API_TOKEN
                    },
                    timeout: 20000
                }
            );

            // A API pode responder corretamente, mas não encontrar resultados.
            if (!data?.success || !data.data?.itens?.length) {
                return kage.sendMessage(
                    jid,
                    {
                        text: '❌ Nenhum resultado encontrado para essa pesquisa.'
                    },
                    { quoted: msg }
                );
            }

            // Limitamos a lista para evitar mensagens demasiado compridas.
            const resultados = data.data.itens
                .filter(item => item && item.titulo && item.url)
                .slice(0, 10);

            if (resultados.length === 0) {
                return kage.sendMessage(
                    jid,
                    {
                        text: '❌ A API não devolveu resultados válidos.'
                    },
                    { quoted: msg }
                );
            }

            const linhas = resultados.map((item, indice) => {
                return (
                    `${indice + 1}. ${item.titulo}\n` +
                    `🔗 ${item.url}`
                );
            });

            const mensagem =
                `╭━━━〔 🥷 KAGE-BOT 〕━━━╮\n` +
                `┃\n` +
                `┃ 🔎 RESULTADOS DA PESQUISA\n` +
                `┃\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                `Pesquisa: ${pesquisa}\n` +
                `Resultados: ${resultados.length}\n\n` +
                `${linhas.join('\n\n')}`;

            await kage.sendMessage(
                jid,
                { text: mensagem },
                { quoted: msg }
            );

            console.log(
                `[KAGE-BOT] Pesquisa concluída: "${pesquisa}" ` +
                `(${resultados.length} resultados)`
            );

        } catch (erro) {
            // Registamos o erro no terminal para facilitar o diagnóstico,
            // sem enviar detalhes técnicos ou credenciais para o WhatsApp.
            const detalhe = erro.response?.status
                ? `HTTP ${erro.response.status}`
                : erro.code || erro.message;

            console.error(
                `[KAGE-BOT] Falha na pesquisa: ${detalhe}`
            );

            let mensagemErro =
                '❌ Não foi possível concluir a pesquisa.';

            if (erro.code === 'ECONNABORTED') {
                mensagemErro =
                    '⏱️ A API demorou demasiado tempo a responder. Tenta novamente.';
            } else if (erro.response?.status === 401 ||
                       erro.response?.status === 403) {
                mensagemErro =
                    '🔐 A API recusou o pedido. Verifica as credenciais.';
            } else if (erro.response?.status >= 500) {
                mensagemErro =
                    '🌐 O serviço da API parece estar indisponível.';
            }

            await kage.sendMessage(
                jid,
                { text: mensagemErro },
                { quoted: msg }
            );
        }
    }
};
