/**
 * Handler principal de mensagens do bot.
 * Recebe uma mensagem do Telegram, classifica o link e executa a ação correta.
 *
 * Cenários tratados:
 * 1. Link de produto válido → converte afiliado + encurta
 * 2. Link não é produto (home, carrinho, ofertas, categorias) → fallback recomendação
 * 3. Link de busca → converte busca para afiliado + encurta
 * 4. Link de página de afiliado (social) de outro → fallback recomendação
 * 5. Link de lista de produtos com afiliado (próprio ou alheio) → fallback recomendação
 * 6. ID de produto no texto (MLB...) → constrói URL, converte e encurta
 * 7. Sem nenhum link ML → mensagem de ajuda
 */

const { config } = require('../config');
const { classifyLink, isMercadoLivreUrl } = require('../services/linkParser');
const { convertToAffiliate, buildProductUrl } = require('../services/affiliateConverter');
const { shortenLink } = require('../services/linkShortener');
const { getFirstRecommendedProduct } = require('../services/productScraper');
const { extractUrls, extractProductId, hasMercadoLivreContent, log } = require('../utils/helpers');

// Mensagens do bot em português brasileiro
const MESSAGES = {
  converted:
    '✅ Link convertido e encurtado:\n\n🔗 {shortUrl}\n\n💰 Comprando por esse link você nos ajuda!',
  notProduct:
    '⚠️ Este link não é de um produto específico.\n\n✅ Aqui está uma recomendação:\n🔗 {shortUrl}',
  otherAffiliate:
    '🔄 Link de outro afiliado detectado!\n\n✅ Aqui está o link convertido para nosso afiliado:\n🔗 {shortUrl}',
  searchConverted:
    '🔍 Link de busca convertido:\n\n🔗 {shortUrl}\n\n💰 Comprando por esse link você nos ajuda!',
  error: '❌ Não consegui converter esse link. Tente novamente mais tarde.',
  tokenExpired:
    '⚠️ O token do Mercado Livre expirou. Por favor, atualize o ML_ACCESS_TOKEN no servidor.',
  noLink:
    '🤔 Não encontrei nenhum link do Mercado Livre na sua mensagem.\n\nEnvie um link de produto, busca ou compartilhe um produto do app do Mercado Livre!',
  noRecommendation:
    '⚠️ Não encontrei um produto adequado para recomendar no momento. Tente enviar um link de produto diretamente.',
  processing: '⏳ Processando seu link...',
};

/**
 * Substitui o placeholder {shortUrl} em uma mensagem.
 * @param {string} template - Template da mensagem
 * @param {string} shortUrl - URL encurtada
 * @returns {string}
 */
function formatMessage(template, shortUrl) {
  return template.replace('{shortUrl}', shortUrl);
}

/**
 * Obtém o link de fallback: pega o primeiro produto recomendado, converte e encurta.
 * @returns {Promise<string|null>} - URL encurtada ou null se não houver recomendação
 */
async function getFallbackLink() {
  const productId = await getFirstRecommendedProduct(
    config.mlRecommendedProducts,
    config.mlAccessToken,
    config.cacheTtlSeconds
  );

  if (!productId) return null;

  const productUrl = buildProductUrl(productId);
  const affiliateUrl = convertToAffiliate(productUrl, config.mlPartnerId);
  return await shortenLink(affiliateUrl, config.mlAccessToken);
}

/**
 * Processa um único link do ML e retorna a mensagem de resposta.
 * @param {string} url - URL a processar
 * @returns {Promise<string>} - Mensagem de resposta
 */
async function processLink(url) {
  try {
    const classification = classifyLink(url, config.mlPartnerId);
    log('info', `Link classificado como: ${classification.type}`, {
      url,
      hasAffiliate: classification.hasAffiliate,
      isOwnAffiliate: classification.isOwnAffiliate,
      productId: classification.productId,
    });

    // Cenário 1: Link de produto válido
    if (classification.type === 'product' && classification.productId) {
      const productUrl = buildProductUrl(classification.productId);
      const affiliateUrl = convertToAffiliate(productUrl, config.mlPartnerId);
      const shortUrl = await shortenLink(affiliateUrl, config.mlAccessToken);
      return formatMessage(MESSAGES.converted, shortUrl);
    }

    // Cenário 3: Link de busca (sem afiliado de lista — links de lista com afiliado vão para fallback)
    if (classification.type === 'search' && !classification.hasAffiliate) {
      const affiliateUrl = convertToAffiliate(url, config.mlPartnerId);
      const shortUrl = await shortenLink(affiliateUrl, config.mlAccessToken);
      return formatMessage(MESSAGES.searchConverted, shortUrl);
    }

    // Cenário 4 e 5: Página de afiliado social (próprio ou de outro)
    // Cenário 6 e 7: Lista/busca com parâmetros de afiliado (próprio ou de outro)
    // Cenário 2: Links que não são produto (home, carrinho, ofertas, categorias, unknown, social, busca com afiliado)
    const fallbackTypes = ['home', 'cart', 'offers', 'category', 'social', 'unknown'];
    const isFallbackCase =
      fallbackTypes.includes(classification.type) ||
      (classification.type === 'search' && classification.hasAffiliate);

    if (isFallbackCase) {
      const shortUrl = await getFallbackLink();
      if (!shortUrl) return MESSAGES.noRecommendation;

      // Diferenciar mensagem para link de outro afiliado vs. outros casos
      if (
        classification.type === 'social' &&
        classification.hasAffiliate &&
        !classification.isOwnAffiliate
      ) {
        return formatMessage(MESSAGES.otherAffiliate, shortUrl);
      }

      return formatMessage(MESSAGES.notProduct, shortUrl);
    }

    // Caso não reconhecido com produto válido dentro
    const shortUrl = await getFallbackLink();
    if (!shortUrl) return MESSAGES.noRecommendation;
    return formatMessage(MESSAGES.notProduct, shortUrl);
  } catch (error) {
    if (error.message === 'TOKEN_EXPIRED') {
      return MESSAGES.tokenExpired;
    }
    log('error', 'Erro ao processar link:', error.message);
    return MESSAGES.error;
  }
}

/**
 * Handler principal — registra o listener de mensagens no bot.
 * @param {object} bot - Instância do node-telegram-bot-api
 */
function registerMessageHandler(bot) {
  bot.on('message', async (msg) => {
    // Ignorar mensagens de comandos (já tratadas pelos commandHandlers)
    if (!msg.text || msg.text.startsWith('/')) return;

    const chatId = msg.chat.id;
    const text = msg.text;

    log('info', `Nova mensagem de ${msg.from && msg.from.username ? '@' + msg.from.username : msg.chat.id}`);

    // Verificar se tem conteúdo do ML
    if (!hasMercadoLivreContent(text)) {
      await bot.sendMessage(chatId, MESSAGES.noLink);
      return;
    }

    // Extrair URLs do texto
    let urls = extractUrls(text);

    // Filtrar apenas URLs do ML
    urls = urls.filter((url) => isMercadoLivreUrl(url));

    // Se não há URLs mas tem ID de produto (ex: MLB1234567890 sem URL)
    if (urls.length === 0) {
      const productId = extractProductId(text);
      if (productId) {
        log('info', `ID de produto detectado no texto: ${productId}`);
        try {
          await bot.sendMessage(chatId, MESSAGES.processing);
          const productUrl = buildProductUrl(productId);
          const affiliateUrl = convertToAffiliate(productUrl, config.mlPartnerId);
          const shortUrl = await shortenLink(affiliateUrl, config.mlAccessToken);
          await bot.sendMessage(chatId, formatMessage(MESSAGES.converted, shortUrl));
        } catch (error) {
          if (error.message === 'TOKEN_EXPIRED') {
            await bot.sendMessage(chatId, MESSAGES.tokenExpired);
          } else {
            log('error', 'Erro ao processar ID de produto:', error.message);
            await bot.sendMessage(chatId, MESSAGES.error);
          }
        }
        return;
      }

      // Sem nenhum link ou ID do ML
      await bot.sendMessage(chatId, MESSAGES.noLink);
      return;
    }

    // Processar cada URL encontrada
    try {
      await bot.sendMessage(chatId, MESSAGES.processing);

      for (const url of urls) {
        const responseMessage = await processLink(url);
        await bot.sendMessage(chatId, responseMessage);
      }
    } catch (error) {
      log('error', 'Erro ao processar mensagem:', error.message);
      await bot.sendMessage(chatId, MESSAGES.error);
    }
  });
}

module.exports = { registerMessageHandler, processLink };
