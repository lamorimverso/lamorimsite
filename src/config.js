/**
 * Carrega e valida as variáveis de ambiente necessárias para o bot.
 */

require('dotenv').config();

const config = {
  // Token do bot Telegram (obrigatório)
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',

  // Credenciais do programa de afiliados do Mercado Livre
  mlAccessToken: process.env.ML_ACCESS_TOKEN || '',
  mlPartnerId: process.env.ML_PARTNER_ID || '',
  mlSiteId: process.env.ML_SITE_ID || 'MLB',

  // Lista de IDs de produtos recomendados (separados por vírgula)
  mlRecommendedProducts: (process.env.ML_RECOMMENDED_PRODUCTS || '')
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0),

  // Configurações opcionais
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10),
  logLevel: process.env.LOG_LEVEL || 'info',

  // Modo de operação: 'polling' (dev) ou 'webhook' (produção)
  botMode: process.env.BOT_MODE || 'polling',

  // Configurações de webhook (usadas em modo produção)
  webhookUrl: process.env.WEBHOOK_URL || '',
  webhookPort: parseInt(process.env.PORT || '3000', 10),
};

/**
 * Valida as variáveis de ambiente obrigatórias.
 * Lança um erro se alguma estiver faltando.
 */
function validateConfig() {
  const required = ['telegramBotToken', 'mlAccessToken', 'mlPartnerId'];
  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias não configuradas: ${missing.join(', ')}\n` +
        'Copie o arquivo .env.example para .env e preencha os valores.'
    );
  }

  if (config.mlRecommendedProducts.length === 0) {
    console.warn(
      '[CONFIG] Aviso: ML_RECOMMENDED_PRODUCTS não configurado. ' +
        'Fallback de recomendações não funcionará.'
    );
  }
}

module.exports = { config, validateConfig };
