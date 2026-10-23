const {
  proto,
  generateWAMessageFromContent
} = require('@whiskeysockets/baileys');

module.exports = {
  name: 'testemenu',
  description: 'Testa o menu interativo nativo.',
  category: 'Gerais',
  icon: '🧪',

  async execute({ kage, jid }) {
    try {
      const mensagem = generateWAMessageFromContent(
        jid,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },
              interactiveMessage: proto.Message.InteractiveMessage.create({
                body: proto.Message.InteractiveMessage.Body.create({
                  text: '🥷 KAGE-BOT\n\nEscolhe uma opção para continuar.'
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                  text: 'THE SHADOW ASSISTANT'
                }),
                nativeFlowMessage:
                  proto.Message.InteractiveMessage.NativeFlowMessage.create({
                    buttons: [
                      {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                          display_text: '🏓 Testar Ping',
                          id: 'KAGE_MENU:COMMAND:ping'
                        })
                      },
                      {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                          display_text: '📋 Abrir Menu',
                          id: 'KAGE_MENU:HOME'
                        })
                      }
                    ]
                  })
              })
            }
          }
        },
        {
          userJid: kage.user.id
        }
      );

      console.log('🧪 A transmitir mensagem interativa...');

      await kage.relayMessage(jid, mensagem.message, {
        messageId: mensagem.key.id
      });

      console.log('✅ Pedido de transmissão concluído.');
    } catch (err) {
      console.error(
        '❌ Erro no teste interativo:',
        err.stack || err
      );

      await kage.sendMessage(jid, {
        text: 'O teste interativo falhou: ' + err.message
      });
    }
  }
};
