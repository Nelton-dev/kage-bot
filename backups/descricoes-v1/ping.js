module.exports = {
    name: 'ping',
    description: 'Verifica se o KAGE-BOT está online.',

    category: 'Gerais',
    icon: '⚡',
    async execute({ kage, jid, msg }) {
        const inicio = Date.now();

        await kage.sendMessage(
            jid,
            {
                text: '🥷 KAGE-BOT está online!'
            },
            { quoted: msg }
        );

        const latencia = Date.now() - inicio;

        console.log(
            `⚡ Comando ping executado | ${latencia} ms`
        );
    }
};
