const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// ==========================================
// KAGE-BOT | CONFIGURAÇÕES
// ==========================================

const PREFIX = '.';
const COMMANDS_DIR = path.join(__dirname, 'commands');

let kage;
let reconnectTimer;
let isStarting = false;
let shouldReconnect = true;

// ==========================================
// CARREGAR COMANDOS
// ==========================================

function carregarComandos() {
    const comandos = new Map();

    if (!fs.existsSync(COMMANDS_DIR)) {
        fs.mkdirSync(COMMANDS_DIR, { recursive: true });
    }

    const ficheiros = fs.readdirSync(COMMANDS_DIR);

    for (const ficheiro of ficheiros) {
        if (!ficheiro.endsWith('.js')) continue;

        const caminho = path.join(COMMANDS_DIR, ficheiro);

        try {
            delete require.cache[require.resolve(caminho)];

            const comando = require(caminho);

            if (
                !comando.name ||
                typeof comando.execute !== 'function'
            ) {
                console.log(
                    `⚠️ Comando inválido: ${ficheiro}`
                );
                continue;
            }

            const nome = comando.name.toLowerCase();

            if (comandos.has(nome)) {
                console.log(
                    `⚠️ Comando duplicado ignorado: ${nome}`
                );
                continue;
            }

            comandos.set(nome, comando);

            // Registar aliases opcionais
            if (Array.isArray(comando.aliases)) {
                for (const alias of comando.aliases) {
                    const nomeAlias = alias.toLowerCase();

                    if (comandos.has(nomeAlias)) {
                        console.log(
                            `⚠️ Alias duplicado ignorado: ${nomeAlias}`
                        );
                        continue;
                    }

                    comandos.set(nomeAlias, comando);
                }
            }

            console.log(`📦 Comando carregado: ${nome}`);

        } catch (err) {
            console.error(
                `❌ Erro ao carregar ${ficheiro}:`,
                err.message
            );
        }
    }

    console.log(
        `✅ ${comandos.size} comandos/aliases registados.\n`
    );

    return comandos;
}

// ==========================================
// EXTRAIR TEXTO DA MENSAGEM
// ==========================================

function extrairTexto(mensagem) {
    const msg = mensagem.message;

    if (!msg) return '';

    return (
        msg.conversation ||
        msg.extendedTextMessage?.text ||
        msg.imageMessage?.caption ||
        msg.videoMessage?.caption ||
        msg.documentMessage?.caption ||
        msg.buttonsResponseMessage?.selectedButtonId ||
        msg.listResponseMessage?.singleSelectReply?.selectedRowId ||
        msg.templateButtonReplyMessage?.selectedId ||
        msg.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ||
        ''
    );
}

// ==========================================
// AGENDAR RECONEXÃO
// ==========================================

function agendarReconexao() {
    if (!shouldReconnect || reconnectTimer) return;

    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;

        iniciarKage().catch(err => {
            console.error(
                '❌ Erro ao reiniciar o KAGE-BOT:',
                err.message
            );
        });
    }, 3000);
}

// ==========================================
// INICIALIZAR KAGE-BOT
// ==========================================

async function iniciarKage() {
    if (isStarting || !shouldReconnect) return;

    isStarting = true;

    try {
        console.log(`
╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃       🥷 KAGE-BOT        ┃
┃    THE SHADOW ASSISTANT  ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`);

        const { state, saveCreds } =
            await useMultiFileAuthState(
                path.join(__dirname, 'auth')
            );

        const comandos = carregarComandos();

        const socket = makeWASocket({
            auth: state,
            logger: pino({ level: 'silent' }),
            browser: ['KAGE-BOT', 'Chrome', '1.0.0']
        });

        kage = socket;

        // Guardar alterações da autenticação
        socket.ev.on('creds.update', saveCreds);

        // ======================================
        // ESTADO DA LIGAÇÃO
        // ======================================

        socket.ev.on('connection.update', update => {
            const {
                connection,
                lastDisconnect,
                qr
            } = update;

            if (qr) {
                console.log(
                    '\n🥷 Digitaliza o QR code no WhatsApp:\n'
                );

                qrcode.generate(qr, { small: true });
            }

            if (connection === 'connecting') {
                console.log('🔄 A ligar ao WhatsApp...');
            }

            if (connection === 'open') {
                console.log(
                    '\n✅ KAGE-BOT conectado ao WhatsApp!'
                );
            }

            if (connection === 'close') {
                if (kage === socket) {
                    kage = null;
                }

                const statusCode =
                    lastDisconnect?.error?.output?.statusCode;

                if (
                    statusCode === DisconnectReason.loggedOut
                ) {
                    shouldReconnect = false;

                    console.log(
                        '\n❌ Sessão terminada pelo WhatsApp.'
                    );

                    console.log(
                        'Remove a sessão antiga apenas se pretenderes autenticar novamente.'
                    );

                } else {
                    console.log(
                        `⚠️ Ligação encerrada. Código: ${statusCode ?? 'desconhecido'}`
                    );

                    console.log(
                        '🔄 Será tentada uma nova ligação...'
                    );

                    agendarReconexao();
                }
            }
        });

        // ======================================
        // RECEBER MENSAGENS
        // ======================================

        socket.ev.on(
            'messages.upsert',
            async ({ messages, type }) => {

                if (type !== 'notify') return;

                for (const msg of messages) {
                    try {
                        if (!msg.message || msg.key.fromMe) {
                            continue;
                        }

                        const jid = msg.key.remoteJid;

                        if (
                            !jid ||
                            jid === 'status@broadcast' ||
                            jid.endsWith('@newsletter')
                        ) {
                            continue;
                        }

                       const texto = extrairTexto(msg).trim();

// Tratar categorias e navegação do menu textual.
const menu = require('./commands/menu');

const tratadoPeloMenu = await menu.handleText({
    kage: socket,
    jid,
    msg,
    texto,
    prefix: PREFIX
});

if (tratadoPeloMenu) {
    continue;
}
                        if (!texto.startsWith(PREFIX)) {
                            continue;
                        }

                        const conteudo = texto
                            .slice(PREFIX.length)
                            .trim();

                        if (!conteudo) continue;

                        const partes = conteudo.split(/\s+/);

                        const comandoNome = (
                            partes.shift() || ''
                        ).toLowerCase();

                        const args = partes;
                        const q = args.join(' ');

                        console.log(
                            `📩 ${comandoNome} | ${jid}`
                        );

                        const comando = comandos.get(comandoNome);

                        if (!comando) {
                            await socket.sendMessage(
                                jid,
                                {
                                    text:
                                        '❓ Comando desconhecido.\n' +
                                        `Utiliza ${PREFIX}menu para ver os comandos.`
                                },
                                { quoted: msg }
                            );

                            continue;
                        }

                        await comando.execute({
                            kage: socket,
                            jid,
                            msg,
                            q,
                            args,
                            comando: comandoNome,
                            prefix: PREFIX,
                            nomeBot: 'KAGE-BOT',
                            isGroup: jid.endsWith('@g.us')
                        });

                    } catch (err) {
                        console.error(
                            '❌ Erro ao processar mensagem:',
                            err
                        );

                        try {
                            await socket.sendMessage(
                                msg.key.remoteJid,
                                {
                                    text:
                                        '❌ Ocorreu um erro ao processar o comando.'
                                },
                                { quoted: msg }
                            );
                        } catch (sendError) {
                            console.error(
                                '❌ Não foi possível enviar a mensagem de erro:',
                                sendError.message
                            );
                        }
                    }
                }
            }
        );

    } catch (err) {
        console.error(
            '❌ Erro na inicialização:',
            err
        );

        agendarReconexao();

    } finally {
        isStarting = false;
    }
}

// ==========================================
// ENCERRAMENTO SEGURO
// ==========================================

async function encerrar() {
    console.log('\n🛑 A encerrar o KAGE-BOT...');

    shouldReconnect = false;

    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }

    try {
        if (kage) {
            kage.end(undefined);
            kage = null;
        }
    } catch (err) {
        console.error(
            'Erro ao encerrar a ligação:',
            err.message
        );
    }

    process.exit(0);
}

process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);

// ==========================================
// ARRANQUE
// ==========================================

iniciarKage().catch(err => {
    console.error(
        '❌ Falha ao iniciar o KAGE-BOT:',
        err
    );
});
