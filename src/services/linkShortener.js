/**
 * Encurtamento de links via API do Mercado Livre.
 * Usa o endpoint POST /partner/short-link.
 * Em caso de falha, retorna o link longo como fallback.
 */

const fetch = require('node-fetch');
const { ML_SHORT_LINK_URL } = require('../utils/constants');
const { log } = require('../utils/helpers');

/**
 * Encurta uma URL usando a API do Mercado Livre.
 * @param {string} url - URL a encurtar
 * @param {string} accessToken - Token de acesso do ML
 * @returns {Promise<string>} - URL encurtada ou URL original em caso de erro
 */
async function shortenLink(url, accessToken) {
  if (!accessToken) {
    log('warn', 'ML_ACCESS_TOKEN não configurado. Retornando link longo.');
    return url;
  }

  try {
    log('info', `Encurtando link: ${url}`);

    const response = await fetch(ML_SHORT_LINK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', `Erro na API de encurtamento (${response.status}):`, errorText);

      // Token expirado
      if (response.status === 401) {
        log('warn', 'Token do ML expirado ou inválido.');
        throw new Error('TOKEN_EXPIRED');
      }

      // Retorna link longo como fallback
      return url;
    }

    const data = await response.json();
    const shortUrl = data.short_url || data.url || url;
    log('info', `Link encurtado com sucesso: ${shortUrl}`);
    return shortUrl;
  } catch (error) {
    if (error.message === 'TOKEN_EXPIRED') {
      throw error;
    }
    log('error', 'Erro ao encurtar link:', error.message);
    // Fallback: retorna o link longo
    return url;
  }
}

module.exports = { shortenLink };
