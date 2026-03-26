/**
 * Parsing e classificação de links do Mercado Livre.
 * Determina o tipo de URL e extrai informações relevantes.
 */

const {
  REGEX_PRODUCT_ID,
  REGEX_PRODUCT_URL,
  REGEX_SEARCH_URL,
  REGEX_SOCIAL_URL,
  REGEX_HOME_URL,
  REGEX_CART_URL,
  REGEX_OFFERS_URL,
  REGEX_CATEGORIES_URL,
  REGEX_AFFILIATE_PARAMS,
} = require('../utils/constants');

const { extractProductId } = require('../utils/helpers');

/**
 * Verifica se a URL tem parâmetros de afiliado.
 * @param {string} url
 * @returns {boolean}
 */
function hasAffiliateParams(url) {
  return REGEX_AFFILIATE_PARAMS.test(url);
}

/**
 * Verifica se os parâmetros de afiliado pertencem ao dono do bot.
 * @param {string} url
 * @param {string} partnerId - ID do parceiro (dono do bot)
 * @returns {boolean}
 */
function isOwnAffiliateParams(url, partnerId) {
  if (!partnerId || !hasAffiliateParams(url)) return false;
  // Verifica se o matt_word ou ref contém o partnerId do dono
  return url.toLowerCase().includes(partnerId.toLowerCase());
}

/**
 * Classifica uma URL do Mercado Livre e retorna metadados.
 *
 * @param {string} url - URL a classificar
 * @param {string} [partnerId] - ID do parceiro para detectar afiliado próprio
 * @returns {{
 *   type: 'product'|'search'|'social'|'home'|'cart'|'offers'|'category'|'unknown',
 *   productId: string|null,
 *   hasAffiliate: boolean,
 *   isOwnAffiliate: boolean,
 *   originalUrl: string,
 *   searchTerm: string|null
 * }}
 */
function classifyLink(url, partnerId = '') {
  const result = {
    type: 'unknown',
    productId: null,
    hasAffiliate: false,
    isOwnAffiliate: false,
    originalUrl: url,
    searchTerm: null,
  };

  if (!url) return result;

  result.hasAffiliate = hasAffiliateParams(url);
  result.isOwnAffiliate = isOwnAffiliateParams(url, partnerId);

  // 1. Verificar se é home
  if (REGEX_HOME_URL.test(url)) {
    result.type = 'home';
    return result;
  }

  // 2. Verificar se é carrinho
  if (REGEX_CART_URL.test(url)) {
    result.type = 'cart';
    return result;
  }

  // 3. Verificar se é ofertas
  if (REGEX_OFFERS_URL.test(url)) {
    result.type = 'offers';
    return result;
  }

  // 4. Verificar se é categorias
  if (REGEX_CATEGORIES_URL.test(url)) {
    result.type = 'category';
    return result;
  }

  // 5. Verificar se é página de afiliado/social
  if (REGEX_SOCIAL_URL.test(url)) {
    result.type = 'social';
    return result;
  }

  // 6. Verificar se é URL de produto
  if (REGEX_PRODUCT_URL.test(url)) {
    result.type = 'product';
    result.productId = extractProductId(url);
    return result;
  }

  // 7. Verificar se é link de busca/lista
  if (REGEX_SEARCH_URL.test(url)) {
    result.type = 'search';
    // Extrair o termo de busca do path
    try {
      const urlObj = new URL(url);
      // O termo de busca fica no path: /lista.mercadolivre.com.br/TERMO
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        result.searchTerm = decodeURIComponent(pathParts[0]).replace(/-/g, ' ');
      }
    } catch (_) {
      // Ignora erros de parsing
    }
    return result;
  }

  // 8. URL de domínio ML não reconhecida
  if (/mercadolivre\.com\.br/i.test(url) || /mercadolibre\.com/i.test(url)) {
    result.type = 'unknown';
    // Tenta extrair um ID de produto mesmo em URLs não reconhecidas
    const productId = extractProductId(url);
    if (productId) {
      result.type = 'product';
      result.productId = productId;
    }
  }

  return result;
}

/**
 * Verifica se a URL pertence ao Mercado Livre.
 * @param {string} url
 * @returns {boolean}
 */
function isMercadoLivreUrl(url) {
  return /mercadolivre\.com\.br/i.test(url) || /mercadolibre\.com/i.test(url);
}

module.exports = {
  classifyLink,
  isMercadoLivreUrl,
  hasAffiliateParams,
  isOwnAffiliateParams,
};
