const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'menu',
    description: "Exibe a lista de comandos disponíveis.",
    category: 'Gerais',
    icon: '📜',

    async execute({ kage, jid, msg, prefix = '.' }) {
        const pastaComandos = __dirname;

        const caminhoBanner = path.join(
            __dirname,
            '..',
            'assets',
            'kage-banner.png'
        );

        const exemplos = {
            anime: '<título>',
            ani: '<título>',
            hentai: '<título>'
        };

        let comandos = [];

        try {
            const ficheiros = fs.readdirSync(pastaComandos)
                .filter(arquivo =>
                    arquivo.endsWith('.js') &&
                    arquivo !== 'menu.js' &&
                    !arquivo.endsWith('.bak')
                );

            for (const ficheiro of ficheiros) {
                try {
                    const caminho = path.join(pastaComandos, ficheiro);
                    const comando = require(caminho);

                    if (
                        !comando.name ||
                        typeof comando.execute !== 'function'
                    ) {
                        continue;
                    }

                    comandos.push({
                        name: comando.name,
                        description:
                            comando.description ||
                            'Sem descrição disponível.',
                        aliases: Array.isArray(comando.aliases)
                            ? comando.aliases
                            : [],
                        category: comando.category || 'Outros',
                        icon: comando.icon || '🔹'
                    });
                } catch (erro) {
                    console.error(
                        `Erro ao carregar ${ficheiro}:`,
                        erro.message
                    );
                }
            }

            comandos.push({
                name: 'menu',
                description: this.description,
                aliases: [],
                category: this.category,
                icon: this.icon
            });

            // Evita apresentar o mesmo comando mais de uma vez.
            const nomes = new Set();

            comandos = comandos
                .sort((a, b) => a.name.localeCompare(b.name))
                .filter(comando => {
                    const nome = comando.name.toLowerCase();

                    if (nomes.has(nome)) return false;

                    nomes.add(nome);
                    return true;
                });

        } catch (erro) {
            console.error(
                'Erro ao ler a pasta de comandos:',
                erro.message
            );
        }

        // Agrupa automaticamente os comandos pelas categorias.
        const categorias = new Map();

        for (const comando of comandos) {
            if (!categorias.has(comando.category)) {
                categorias.set(comando.category, []);
            }

            categorias.get(comando.category).push(comando);
        }

        // Mantém Gerais e Animes no início.
        const prioridade = ['Gerais', 'Animes'];

        const nomesCategorias = [...categorias.keys()].sort((a, b) => {
            const posA = prioridade.indexOf(a);
            const posB = prioridade.indexOf(b);

            if (posA !== -1 || posB !== -1) {
                if (posA === -1) return 1;
                if (posB === -1) return -1;
                return posA - posB;
            }

            return a.localeCompare(b);
        });

        function formatarComando(comando) {
            const argumento = exemplos[comando.name]
                ? ` ${exemplos[comando.name]}`
                : '';

            const aliases = comando.aliases.length
                ? ` | ${comando.aliases.map(
                    alias => `${prefix}${alias}`
                ).join(', ')}`
                : '';

            return [
                `┃ ${comando.icon} ${prefix}${comando.name}${argumento}${aliases}`,
                `┃   └ ${comando.description}`
            ].join('\n');
        }

        const linhas = [
            '╭━━━〔 🥷 KAGE-BOT 〕━━━╮',
            '┃',
            '┃ 影 THE SHADOW BOT',
            '┃'
        ];

        for (const categoria of nomesCategorias) {
            const lista = categorias.get(categoria);

            if (!lista.length) continue;

            let iconeCategoria = '🔰';

            if (categoria === 'Gerais') iconeCategoria = '⚙️';
            if (categoria === 'Animes') iconeCategoria = '🎌';
            if (categoria === 'Pesquisa') iconeCategoria = '🔎';

          linhas.push(
    `┃ ${iconeCategoria} ${categoria.toUpperCase()}`
);

for (const comando of lista) {
    linhas.push(...formatarComando(comando).split('\n'));
}

linhas.push('┃');
        }

        linhas.push(
            '┃ 🌑 Explore o mundo dos animes.',
            '┃ ⚙️ Mais funcionalidades a caminho!',
            '┃',
            '╰━━━━━━━━━━━━━━━━━━━━━━╯'
        );

        const textoMenu = linhas.join('\n');

        try {
            if (fs.existsSync(caminhoBanner)) {
                await kage.sendMessage(
                    jid,
                    {
                        image: fs.readFileSync(caminhoBanner),
                        caption: textoMenu
                    },
                    { quoted: msg }
                );
            } else {
                await kage.sendMessage(
                    jid,
                    { text: textoMenu },
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
                text: textoMenu
            });
        }
    }
};
