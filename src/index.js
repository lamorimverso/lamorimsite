/**
 * Entry point do LamorimPromos Bot.
 * Inicializa as configurações e inicia o bot Telegram.
 */

const { validateConfig } = require('./config');
const { createBot, stopBot } = require('./bot');
const { log } = require('./utils/helpers');

// Validar variáveis de ambiente antes de iniciar
try {
  validateConfig();
} catch (error) {
  console.error('❌ Erro de configuração:', error.message);
  process.exit(1);
}

log('info', '🚀 Iniciando LamorimPromos Bot...');

// Criar e iniciar o bot
const bot = createBot();

log('info', '✅ LamorimPromos Bot está rodando! Aguardando mensagens...');

// Graceful shutdown
process.on('SIGINT', async () => {
  log('info', 'Recebido SIGINT. Encerrando bot...');
  await stopBot();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('info', 'Recebido SIGTERM. Encerrando bot...');
  await stopBot();
  process.exit(0);
});

// Capturar erros não tratados
process.on('uncaughtException', (error) => {
  log('error', 'Erro não capturado:', error.message);
  log('error', error.stack);
  // Em produção, pode ser melhor reiniciar o processo
  // process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log('error', 'Promise rejeitada sem tratamento:', reason);
});

module.exports = bot;
