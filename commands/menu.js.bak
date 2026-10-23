const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'menu',
    description: 'Apresenta os comandos disponíveis.',

    async execute({ kage, jid, msg, prefix = '.' }) {
        const pastaComandos = __dirname;
        const caminhoBanner = path.join(
            __dirname,
            '..',
            'assets',
            'kage-banner.png'
        );

        // Alguns comandos precisam de argumentos, como o nome de um anime.
        // Aqui definimos apenas como esses comandos aparecem no menu.
        const exemplos = {
            anime: '<título>',
            ani: '<título>'
        };

        const icones = {
            ping: '⚡',
            menu: '📜',
            anime: '🎌',
            temporada: '🍿',
            topanime: '🏆',
            animealeatorio: '🎲'
        };

        let comandos = [];

        try {
            // Lê todos os ficheiros JavaScript da pasta de comandos.
            const ficheiros = fs.readdirSync(pastaComandos)
                .filter(arquivo =>
                    arquivo.endsWith('.js') &&
                    arquivo !== 'menu.js'
                );

            for (const ficheiro of ficheiros) {
                try {
                    const caminho = path.join(pastaComandos, ficheiro);
                    const comando = require(caminho);

                    // Só incluímos módulos que tenham um nome de comando.
                    if (!comando.name) continue;

                    comandos.push({
                        name: comando.name,
                        description:
                            comando.description || 'Sem descrição disponível.',
                        aliases: comando.aliases || []
                    });
                } catch (erro) {
                    console.error(
                        `Erro ao carregar ${ficheiro}:`,
                        erro.message
                    );
                }
            }

            // O menu também é um comando, por isso adicionamo-lo à lista.
            comandos.push({
                name: 'menu',
                description: 'Apresenta os comandos disponíveis.',
                aliases: []
            });

            // Ordena alfabeticamente e evita nomes repetidos.
            const nomes = new Set();

            comandos = comandos
                .sort((a, b) => a.name.localeCompare(b.name))
                .filter(comando => {
                    if (nomes.has(comando.name)) return false;

                    nomes.add(comando.name);
                    return true;
                });

        } catch (erro) {
            console.error(
                'Erro ao ler a pasta de comandos:',
                erro.message
            );
        }

        // Organiza os comandos por categoria.
        const gerais = comandos.filter(comando =>
            ['ping', 'menu'].includes(comando.name)
        );

        const animes = comandos.filter(comando =>
            [
                'anime',
                'temporada',
                'topanime',
                'animealeatorio'
            ].includes(comando.name)
        );

        const outros = comandos.filter(comando =>
            !gerais.includes(comando) &&
            !animes.includes(comando)
        );

        // Formata cada comando com o respetivo ícone e descrição.
        function formatarComando(comando) {
            const icone = icones[comando.name] || '🔹';

            const argumento = exemplos[comando.name]
                ? ` ${exemplos[comando.name]}`
                : '';

            const aliases = comando.aliases.length
                ? ` | ${comando.aliases.map(a => `${prefix}${a}`).join(', ')}`
                : '';

            return `${icone} ${prefix}${comando.name}${argumento}${aliases}`;
        }

        const linhas = [
            '╭━━━〔 🥷 KAGE-BOT 〕━━━╮',
            '┃',
            '┃ 影  THE SHADOW BOT',
            '┃',
            '┃ ⚡ COMANDOS GERAIS',
            ...gerais.map(comando => `┃ ${formatarComando(comando)}`),
            ''
        ];

        if (animes.length > 0) {
            linhas.push(
                '┃ 🎌 MUNDO DOS ANIMES',
                ...animes.map(comando => `┃ ${formatarComando(comando)}`),
                ''
            );
        }

        if (outros.length > 0) {
            linhas.push(
                '┃ 🔰 OUTROS COMANDOS',
                ...outros.map(comando => `┃ ${formatarComando(comando)}`),
                ''
            );
        }

        linhas.push(
            '┃',
            '┃ 🌑 Explore o mundo dos animes.',
            '┃ ⚙️ Mais funcionalidades a caminho!',
            '┃',
            '╰━━━━━━━━━━━━━━━━━━━━━━╯'
        );

        const menu = linhas.join('\n');

        try {
            // Envia o banner com o menu como legenda.
            if (fs.existsSync(caminhoBanner)) {
                await kage.sendMessage(
                    jid,
                    {
                        image: fs.readFileSync(caminhoBanner),
                        caption: menu
                    },
                    { quoted: msg }
                );
            } else {
                // Se a imagem não estiver disponível, o menu continua funcional.
                await kage.sendMessage(
                    jid,
                    { text: menu },
                    { quoted: msg }
                );

                console.warn(
                    'Banner não encontrado:',
                    caminhoBanner
                );
            }
        } catch (erro) {
            console.error(
                'Erro ao enviar o menu:',
                erro.message
            );

            await kage.sendMessage(jid, {
                text: menu
            });
        }
    }
};
