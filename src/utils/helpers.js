/**
 * Funções auxiliares genéricas usadas em todo o bot.
 */

const { REGEX_URL, REGEX_PRODUCT_ID } = require('./constants');

/**
 * Extrai todas as URLs de um texto.
 * @param {string} text - Texto da mensagem do Telegram
 * @returns {string[]} - Lista de URLs encontradas
 */
function extractUrls(text) {
  if (!text) return [];
  const matches = text.match(REGEX_URL);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Extrai o ID de produto MLB de um texto ou URL.
 * Retorna o ID no formato MLB1234567890 (sem hífen).
 * @param {string} text - Texto para procurar o ID
 * @returns {string|null} - ID do produto ou null
 */
function extractProductId(text) {
  if (!text) return null;
  const match = text.match(REGEX_PRODUCT_ID);
  if (match) {
    // Retorna sempre no formato sem hífen: MLB + dígitos
    return `MLB${match[1]}`;
  }
  return null;
}

/**
 * Verifica se um texto contém algum domínio do Mercado Livre.
 * @param {string} text - Texto para verificar
 * @returns {boolean}
 */
function hasMercadoLivreContent(text) {
  if (!text) return false;
  return (
    /mercadolivre\.com\.br/i.test(text) ||
    /mercadolibre\.com/i.test(text) ||
    REGEX_PRODUCT_ID.test(text)
  );
}

/**
 * Formata uma mensagem de log com timestamp.
 * @param {string} level - Nível do log (info, warn, error)
 * @param {string} message - Mensagem
 * @param {any} [data] - Dados adicionais
 */
function log(level, message, data) {
  const timestamp = new Date().toISOString();
  const logLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();

  const levels = { error: 0, warn: 1, info: 2, debug: 3 };
  const currentLevel = levels[logLevel] !== undefined ? levels[logLevel] : 2;
  const messageLevel = levels[level] !== undefined ? levels[level] : 2;

  if (messageLevel <= currentLevel) {
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    if (data !== undefined) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }
}

/**
 * Aguarda um número de milissegundos.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  extractUrls,
  extractProductId,
  hasMercadoLivreContent,
  log,
  sleep,
};
