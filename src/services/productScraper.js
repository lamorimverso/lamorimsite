/**
 * Busca detalhes de produtos via API do Mercado Livre.
 * Usa cache para evitar chamadas repetidas.
 */

const fetch = require('node-fetch');
const cache = require('./cache');
const { ML_ITEMS_URL } = require('../utils/constants');
const { log } = require('../utils/helpers');

/**
 * Busca detalhes de um produto pela API do ML.
 * Usa cache para evitar chamadas repetidas.
 * @param {string} productId - ID do produto (ex: MLB1234567890)
 * @param {string} accessToken - Token de acesso do ML
 * @param {number} [cacheTtl=3600] - TTL do cache em segundos
 * @returns {Promise<object|null>} - Dados do produto ou null em caso de erro
 */
async function getProductDetails(productId, accessToken, cacheTtl = 3600) {
  const cacheKey = `product:${productId}`;

  // Verificar cache
  const cached = cache.get(cacheKey);
  if (cached) {
    log('info', `Produto ${productId} obtido do cache.`);
    return cached;
  }

  try {
    log('info', `Buscando detalhes do produto: ${productId}`);

    const headers = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${ML_ITEMS_URL}/${productId}`, { headers });

    if (!response.ok) {
      log('warn', `Produto ${productId} não encontrado (${response.status})`);
      return null;
    }

    const data = await response.json();
    cache.set(cacheKey, data, cacheTtl);
    return data;
  } catch (error) {
    log('error', `Erro ao buscar produto ${productId}:`, error.message);
    return null;
  }
}

/**
 * Retorna o primeiro produto válido da lista de recomendações.
 * Tenta cada produto em ordem até encontrar um válido.
 * @param {string[]} recommendedIds - Lista de IDs de produtos recomendados
 * @param {string} accessToken - Token de acesso do ML
 * @param {number} [cacheTtl=3600] - TTL do cache em segundos
 * @returns {Promise<string|null>} - ID do primeiro produto válido ou null
 */
async function getFirstRecommendedProduct(recommendedIds, accessToken, cacheTtl = 3600) {
  if (!recommendedIds || recommendedIds.length === 0) {
    log('warn', 'Nenhum produto recomendado configurado.');
    return null;
  }

  for (const productId of recommendedIds) {
    if (!productId) continue;

    const details = await getProductDetails(productId, accessToken, cacheTtl);
    if (details && details.id) {
      log('info', `Primeiro produto recomendado válido: ${productId}`);
      return productId;
    }

    log('warn', `Produto recomendado inválido ou inativo: ${productId}. Tentando próximo...`);
  }

  // Se nenhum produto da API for válido, retorna o primeiro da lista mesmo assim
  log('warn', 'Nenhum produto recomendado pôde ser validado pela API. Usando primeiro da lista.');
  return recommendedIds[0] || null;
}

module.exports = {
  getProductDetails,
  getFirstRecommendedProduct,
};
