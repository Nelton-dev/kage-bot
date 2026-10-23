const fs = require('fs');
const path = require('path');

const MENU_ID = 'KAGE_MENU:';

/**
 * Carrega os comandos disponíveis na pasta commands.
 */
function carregarLista() {
    const ficheiros = fs.readdirSync(__dirname)
        .filter(f => f.endsWith('.js') && !f.endsWith('.bak'));

    const mapa = new Map();

    for (const ficheiro of ficheiros) {
        try {
            const cmd = require(path.join(__dirname, ficheiro));

            if (!cmd.name || typeof cmd.execute !== 'function') {
                continue;
            }

            const nome = cmd.name.toLowerCase();

            // Evita comandos duplicados.
            if (mapa.has(nome)) continue;

            mapa.set(nome, {
                name: nome,
                description: cmd.description || 'Sem descrição.',
                category: cmd.category || 'Outros',
                icon: cmd.icon || '🔹'
            });
        } catch (err) {
            console.error(
                `Erro ao carregar ${ficheiro}:`,
                err.message
            );
        }
    }

    return [...mapa.values()].sort((a, b) =>
        a.name.localeCompare(b.name)
    );
}

/**
 * Organiza as categorias pela ordem definida.
 */
function categoriasDisponiveis(lista) {
    const ordem = [
    'Gerais',
    'Animes',
    'Filmes',
    'Séries',
    'Pesquisa',
    'Outros'
];
    const nomes = [...new Set(lista.map(c => c.category))];

    return nomes.sort((a, b) => {
        const pa = ordem.indexOf(a);
        const pb = ordem.indexOf(b);

        if (pa !== -1 || pb !== -1) {
            if (pa === -1) return 1;
            if (pb === -1) return -1;

            return pa - pb;
        }

        return a.localeCompare(b);
    });
}

/**
 * Devolve o ícone de cada categoria.
 */
function iconeCategoria(nome) {
    return {
        Gerais: '⚙️',
        Animes: '🎌',
        Filmes: '🎬',
        Séries: '📺',
        Pesquisa: '🔎',
        Outros: '🔰'
    }[nome] || '📂';
}

/**
 * Normaliza texto para permitir comparações
 * sem diferenças entre maiúsculas e acentos.
 */
function normalizar(texto) {
    return String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}

/**
 * Cria o menu principal.
 * Envia o banner com o menu na legenda.
 * Se o banner falhar, envia apenas o texto.
 */
async function mostrarInicio({
    kage,
    jid,
    msg,
    prefix = '.'
}) {
    const lista = carregarLista();
    const categorias = categoriasDisponiveis(lista);

    const descricoes = {
    Gerais: 'Ferramentas essenciais do bot',
    Animes: 'Descobre o teu próximo anime',
    Filmes: 'Pesquisa filmes e descobre novas histórias',
    Séries: 'Explora séries, temporadas e episódios',
    Pesquisa: 'Pesquisa e consultas especializadas',
    Outros: 'Outras funcionalidades'
};
    const linhas = categorias.flatMap(categoria => {
        const quantidade = lista.filter(
            c => c.category === categoria
        ).length;

        return [
            `${iconeCategoria(categoria)} ${categoria.toUpperCase()}`,
            `   ${descricoes[categoria] || 'Outras funcionalidades'}`,
            `   📦 ${quantidade} comando(s)`,
            ''
        ];
    });

    const texto = [
        '🥷 K A G E - B O T',
        '━━━━━━━━━━━━━━━━━━━━',
        '⚡ THE SHADOW ASSISTANT',
        '',
        '「 BEM-VINDO, SHINOBI 」',
        'O teu arsenal está pronto.',
        '',
        '┏━━ 📚 CATEGORIAS ━━┓',
        '',
        ...linhas,
        '┗━━━━━━━━━━━━━━━━━━┛',
        '',
        '💬 NAVEGAÇÃO',
        'Escreve o nome de uma categoria.',
        '',
        'Exemplo: Animes',
        `⚙️ Prefixo: ${prefix}`,
        '',
        '━━━━━━━━━━━━━━━━━━━━',
        '「 Escolhe a tua próxima missão 」'
    ].join('\n');

    const banner = path.join(
        __dirname,
        '..',
        'assets',
        'kage-banner.png'
    );

    try {
        if (fs.existsSync(banner)) {
            await kage.sendMessage(
                jid,
                {
                    image: fs.readFileSync(banner),
                    caption: texto
                },
                { quoted: msg }
            );

            return;
        }
    } catch (err) {
        console.error(
            'Erro ao enviar o banner:',
            err.message
        );
    }

    // Alternativa caso a imagem não exista ou falhe.
    await kage.sendMessage(
        jid,
        { text: texto },
        { quoted: msg }
    );
}

/**
 * Mostra os comandos de uma categoria em texto.
 */
async function mostrarCategoria({
    kage,
    jid,
    msg,
    categoria,
    prefix = '.'
}) {
    const lista = carregarLista().filter(
        c => normalizar(c.category) === normalizar(categoria)
    );

    if (!lista.length) {
        await kage.sendMessage(
            jid,
            {
                text:
                    '🥷 KAGE-BOT\n\n' +
                    '❌ Categoria não encontrada.\n\n' +
                    '↩️ Escreve Menu para voltar.'
            },
            { quoted: msg }
        );

        return;
    }

    const linhas = lista.map((cmd, index) => {
        const separador = index < lista.length - 1
            ? '\n────────────────────'
            : '';

        return [
            `${cmd.icon} ${cmd.name.toUpperCase()}`,
            `   Comando: ${prefix}${cmd.name}`,
            `   ${cmd.description}${separador}`
        ].join('\n');
    });

    const texto = [
        `${iconeCategoria(categoria)} KAGE-BOT`,
        `「 ${categoria.toUpperCase()} 」`,
        '━━━━━━━━━━━━━━━━━━━━',
        '',
        '📚 ARSENAL DISPONÍVEL',
        '',
        ...linhas,
        '',
        '━━━━━━━━━━━━━━━━━━━━',
        '💡 Escreve o comando para o executar.',
        '↩️ Escreve Menu para voltar.'
    ].join('\n');

    await kage.sendMessage(
        jid,
        { text: texto },
        { quoted: msg }
    );
}

/**
 * Exporta o comando e as funções de navegação.
 */
module.exports = {
    name: 'menu',
    description: 'Apresenta o menu do KAGE-BOT.',
    category: 'Gerais',
    icon: '📜',

    /**
     * Executado quando o utilizador escreve .menu.
     */
    async execute({
        kage,
        jid,
        msg,
        prefix = '.'
    }) {
        await mostrarInicio({
            kage,
            jid,
            msg,
            prefix
        });
    },

    /**
     * Trata mensagens como Menu, Animes, Pesquisa e Gerais.
     */
    async handleText({
        kage,
        jid,
        msg,
        texto,
        prefix = '.'
    }) {
        const entrada = normalizar(texto);

        if ([
            'menu',
            '.menu',
            'inicio'
        ].includes(entrada)) {
            await mostrarInicio({
                kage,
                jid,
                msg,
                prefix
            });

            return true;
        }

        const lista = carregarLista();
        const categorias = categoriasDisponiveis(lista);

        const categoria = categorias.find(
            c => normalizar(c) === entrada
        );

        if (categoria) {
            await mostrarCategoria({
                kage,
                jid,
                msg,
                categoria,
                prefix
            });

            return true;
        }

        return false;
    },

    /**
     * Mantém a compatibilidade com seleções interativas
     * caso sejam recebidas por outras partes do projeto.
     */
    async handleSelection({
        kage,
        jid,
        msg,
        selection,
        prefix = '.',
        comandos
    }) {
        if (selection === `${MENU_ID}HOME`) {
            await mostrarInicio({
                kage,
                jid,
                msg,
                prefix
            });

            return;
        }

        if (
            typeof selection === 'string' &&
            selection.startsWith(`${MENU_ID}CATEGORY:`)
        ) {
            const categoria = decodeURIComponent(
                selection.slice(`${MENU_ID}CATEGORY:`.length)
            );

            await mostrarCategoria({
                kage,
                jid,
                msg,
                categoria,
                prefix
            });

            return;
        }

        if (
            typeof selection === 'string' &&
            selection.startsWith(`${MENU_ID}COMMAND:`)
        ) {
            const nome = decodeURIComponent(
                selection.slice(`${MENU_ID}COMMAND:`.length)
            ).toLowerCase();

            const comando = comandos?.get(nome);

            if (!comando) {
                await kage.sendMessage(
                    jid,
                    {
                        text:
                            'Este comando já não está disponível.\n' +
                            `Envia ${prefix}menu para atualizar o menu.`
                    },
                    { quoted: msg }
                );

                return;
            }

            if (['anime', 'hentai'].includes(comando.name)) {
                await kage.sendMessage(
                    jid,
                    {
                        text:
                            `Para usar este comando, envia:\n` +
                            `${prefix}${comando.name} <título>\n\n` +
                            `Exemplo: ${prefix}${comando.name} Naruto`
                    },
                    { quoted: msg }
                );

                return;
            }

            await comando.execute({
                kage,
                jid,
                msg,
                q: '',
                args: [],
                comando: comando.name,
                prefix,
                nomeBot: 'KAGE-BOT',
                isGroup: jid.endsWith('@g.us')
            });

            return;
        }

        await kage.sendMessage(
            jid,
            {
                text:
                    'Opção inválida.\n' +
                    `Envia ${prefix}menu para reabrir o menu.`
            },
            { quoted: msg }
        );
    }
};
