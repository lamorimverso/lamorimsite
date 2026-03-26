/**
 * Configuração do bot Telegram usando node-telegram-bot-api.
 * Suporta polling (desenvolvimento) e webhook (produção).
 */

const TelegramBot = require('node-telegram-bot-api');
const { config } = require('./config');
const { registerCommandHandlers } = require('./handlers/commandHandler');
const { registerMessageHandler } = require('./handlers/messageHandler');
const { log } = require('./utils/helpers');

let botInstance = null;

/**
 * Cria e configura a instância do bot Telegram.
 * @returns {TelegramBot} - Instância do bot configurada
 */
function createBot() {
  if (botInstance) return botInstance;

  let bot;

  if (config.botMode === 'webhook' && config.webhookUrl) {
    // Modo webhook (produção)
    log('info', `Iniciando bot em modo webhook na porta ${config.webhookPort}`);
    bot = new TelegramBot(config.telegramBotToken, {
      webHook: {
        port: config.webhookPort,
      },
    });

    // Configura a URL do webhook
    bot.setWebHook(`${config.webhookUrl}/bot${config.telegramBotToken}`).then(() => {
      log('info', `Webhook configurado em: ${config.webhookUrl}`);
    }).catch((error) => {
      log('error', 'Erro ao configurar webhook:', error.message);
    });
  } else {
    // Modo polling (desenvolvimento)
    log('info', 'Iniciando bot em modo polling (desenvolvimento)...');
    bot = new TelegramBot(config.telegramBotToken, {
      polling: {
        interval: 300,
        autoStart: true,
        params: {
          timeout: 10,
        },
      },
    });
  }

  // Registrar handlers
  registerCommandHandlers(bot);
  registerMessageHandler(bot);

  // Handler de erros de polling
  bot.on('polling_error', (error) => {
    log('error', 'Erro de polling:', error.message);
  });

  // Handler de erros de webhook
  bot.on('webhook_error', (error) => {
    log('error', 'Erro de webhook:', error.message);
  });

  // Handler de erros gerais
  bot.on('error', (error) => {
    log('error', 'Erro geral do bot:', error.message);
  });

  botInstance = bot;
  log('info', '✅ Bot configurado com sucesso!');
  return bot;
}

/**
 * Para o bot e limpa recursos.
 */
async function stopBot() {
  if (!botInstance) return;

  try {
    if (config.botMode !== 'webhook') {
      await botInstance.stopPolling();
    }
    botInstance = null;
    log('info', 'Bot parado com sucesso.');
  } catch (error) {
    log('error', 'Erro ao parar o bot:', error.message);
  }
}

module.exports = { createBot, stopBot };
