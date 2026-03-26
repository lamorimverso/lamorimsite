/**
 * Conversão de links para o formato de afiliado do dono do bot.
 * Adiciona parâmetros de rastreamento do parceiro e remove parâmetros de outros afiliados.
 */

const { AFFILIATE_PARAMS, ML_PRODUCT_BASE_URL } = require('../utils/constants');

/**
 * Remove parâmetros de afiliado de uma URL.
 * @param {string} url - URL original
 * @returns {string} - URL sem parâmetros de afiliado
 */
function cleanAffiliateParams(url) {
  try {
    const urlObj = new URL(url);
    AFFILIATE_PARAMS.forEach((param) => {
      urlObj.searchParams.delete(param);
    });
    return urlObj.toString();
  } catch (_) {
    // Se não conseguir parsear, retorna a URL original
    return url;
  }
}

/**
 * Adiciona os parâmetros de afiliado do dono do bot a uma URL.
 * @param {string} url - URL limpa (sem parâmetros de outros afiliados)
 * @param {string} partnerId - ID do parceiro (dono do bot)
 * @returns {string} - URL com parâmetros do afiliado
 */
function addAffiliateParams(url, partnerId) {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('matt_word', partnerId);
    urlObj.searchParams.set('matt_tool', 'bot');
    return urlObj.toString();
  } catch (_) {
    // Se falhar, tenta concatenar manualmente
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}matt_word=${encodeURIComponent(partnerId)}&matt_tool=bot`;
  }
}

/**
 * Converte uma URL para o formato de afiliado do dono.
 * Remove parâmetros de outros afiliados e adiciona os do dono.
 * @param {string} url - URL original (pode ter afiliado de qualquer pessoa)
 * @param {string} partnerId - ID do parceiro do dono do bot
 * @returns {string} - URL com afiliado do dono
 */
function convertToAffiliate(url, partnerId) {
  const cleanUrl = cleanAffiliateParams(url);
  return addAffiliateParams(cleanUrl, partnerId);
}

/**
 * Constrói a URL completa de um produto a partir do ID.
 * @param {string} productId - ID no formato MLB1234567890 ou MLB-1234567890
 * @returns {string} - URL completa do produto
 */
function buildProductUrl(productId) {
  // Normaliza o ID: sempre com hífen no formato MLB-XXXXXXXXXX
  const normalizedId = productId.replace(/^MLB-?/, 'MLB-');
  return `${ML_PRODUCT_BASE_URL}/${normalizedId}`;
}

module.exports = {
  cleanAffiliateParams,
  addAffiliateParams,
  convertToAffiliate,
  buildProductUrl,
};
