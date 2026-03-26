/**
 * Handlers para comandos do bot (/start, /help, /recomendacoes).
 */

const { config } = require('../config');
const { buildProductUrl } = require('../services/affiliateConverter');
const { convertToAffiliate } = require('../services/affiliateConverter');
const { shortenLink } = require('../services/linkShortener');
const { log } = require('../utils/helpers');

/**
 * Registra todos os handlers de comando no bot.
 * @param {object} bot - Instância do node-telegram-bot-api
 */
function registerCommandHandlers(bot) {
  // /start — Mensagem de boas-vindas
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from && msg.from.first_name ? msg.from.first_name : 'amigo(a)';

    const welcomeMessage =
      `🛒 Olá, ${firstName}! Sou o LamorimPromos Bot!\n\n` +
      `Envie qualquer link do Mercado Livre e eu converto para o nosso link de afiliado e encurto pra você! 🔗\n\n` +
      `📌 O que eu faço:\n` +
      `• 🔗 Converto links de produtos para nosso afiliado\n` +
      `• 🔍 Converto links de busca\n` +
      `• 🔄 Substituo links de outros afiliados\n` +
      `• 📦 Sugiro produtos quando o link não é de produto\n\n` +
      `Digite /help para ver todas as funcionalidades.`;

    try {
      await bot.sendMessage(chatId, welcomeMessage);
    } catch (error) {
      log('error', 'Erro ao enviar mensagem /start:', error.message);
    }
  });

  // /help — Lista de funcionalidades
  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;

    const helpMessage =
      `🤖 *LamorimPromos Bot — Ajuda*\n\n` +
      `Envie um link do Mercado Livre e eu cuido do resto!\n\n` +
      `*Como usar:*\n` +
      `1️⃣ Cole o link de um produto do ML\n` +
      `2️⃣ Ou envie o ID do produto (ex: MLB1234567890)\n` +
      `3️⃣ Receba o link convertido e encurtado ✅\n\n` +
      `*O que eu converto:*\n` +
      `• 📦 Links de produtos\n` +
      `• 🔍 Links de busca (lista.mercadolivre.com.br)\n` +
      `• 🔄 Links de outros afiliados → substituo pelo nosso\n` +
      `• ⚠️ Links sem produto (home, carrinho, etc.) → recomendo um produto\n\n` +
      `*Comandos disponíveis:*\n` +
      `/start — Mensagem de boas-vindas\n` +
      `/help — Esta ajuda\n` +
      `/recomendacoes — Ver produtos recomendados\n\n` +
      `💰 Comprando pelos nossos links você nos apoia!`;

    try {
      await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    } catch (error) {
      log('error', 'Erro ao enviar mensagem /help:', error.message);
    }
  });

  // /recomendacoes — Mostra os produtos recomendados
  bot.onText(/\/recomendacoes/, async (msg) => {
    const chatId = msg.chat.id;

    const recommendedIds = config.mlRecommendedProducts;

    if (!recommendedIds || recommendedIds.length === 0) {
      await bot.sendMessage(
        chatId,
        '📭 Nenhum produto recomendado configurado no momento. Volte em breve!'
      );
      return;
    }

    try {
      await bot.sendMessage(chatId, '🔄 Preparando links de recomendações...');

      const lines = ['📦 *Produtos Recomendados:*\n'];

      for (let i = 0; i < recommendedIds.length; i++) {
        const productId = recommendedIds[i];
        try {
          const productUrl = buildProductUrl(productId);
          const affiliateUrl = convertToAffiliate(productUrl, config.mlPartnerId);
          const shortUrl = await shortenLink(affiliateUrl, config.mlAccessToken);
          lines.push(`${i + 1}. 🔗 ${shortUrl}`);
        } catch (_) {
          lines.push(`${i + 1}. ⚠️ ${productId} (erro ao gerar link)`);
        }
      }

      lines.push('\n💰 Comprando por esses links você nos apoia!');

      await bot.sendMessage(chatId, lines.join('\n'), { parse_mode: 'Markdown' });
    } catch (error) {
      log('error', 'Erro ao enviar /recomendacoes:', error.message);
      await bot.sendMessage(chatId, '❌ Erro ao buscar recomendações. Tente novamente mais tarde.');
    }
  });
}

module.exports = { registerCommandHandlers };
