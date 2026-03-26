/**
 * Constantes, padrões regex e URLs base usados no bot.
 */

// URLs base do Mercado Livre
const ML_BASE_URL = 'https://www.mercadolivre.com.br';
const ML_PRODUCT_BASE_URL = 'https://produto.mercadolivre.com.br';
const ML_LIST_BASE_URL = 'https://lista.mercadolivre.com.br';
const ML_API_BASE_URL = 'https://api.mercadolibre.com';

// Endpoint de encurtamento de links
const ML_SHORT_LINK_URL = `${ML_API_BASE_URL}/partner/short-link`;

// Endpoint de detalhes de produto
const ML_ITEMS_URL = `${ML_API_BASE_URL}/items`;

// Regex para detectar ID de produto do ML (MLB seguido de 8-14 dígitos, com ou sem hífen)
const REGEX_PRODUCT_ID = /\bMLB-?(\d{8,14})\b/i;

// Regex para URL de produto do ML
const REGEX_PRODUCT_URL = /(?:produto\.)?mercadolivre\.com\.br\/MLB-?\d+/i;

// Regex para URL de busca/lista do ML
const REGEX_SEARCH_URL = /lista\.mercadolivre\.com\.br\//i;

// Regex para URL de página de afiliado/social do ML
const REGEX_SOCIAL_URL = /mercadolivre\.com\.br\/social\//i;

// Regex para home do ML
const REGEX_HOME_URL = /^https?:\/\/(www\.)?mercadolivre\.com\.br\/?$/i;

// Regex para carrinho do ML
const REGEX_CART_URL = /mercadolivre\.com\.br\/(carrinho|cart)/i;

// Regex para ofertas do ML
const REGEX_OFFERS_URL = /mercadolivre\.com\.br\/ofertas/i;

// Regex para categorias do ML
const REGEX_CATEGORIES_URL = /mercadolivre\.com\.br\/categorias/i;

// Regex para parâmetros de afiliado no link
const REGEX_AFFILIATE_PARAMS = /[?&](matt_word|matt_tool|ref)=/i;

// Regex para extrair URLs de um texto qualquer
const REGEX_URL = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

// Parâmetros de afiliado que devem ser removidos/substituídos
const AFFILIATE_PARAMS = ['matt_word', 'matt_tool', 'ref', 'forceInApp'];

module.exports = {
  ML_BASE_URL,
  ML_PRODUCT_BASE_URL,
  ML_LIST_BASE_URL,
  ML_API_BASE_URL,
  ML_SHORT_LINK_URL,
  ML_ITEMS_URL,
  REGEX_PRODUCT_ID,
  REGEX_PRODUCT_URL,
  REGEX_SEARCH_URL,
  REGEX_SOCIAL_URL,
  REGEX_HOME_URL,
  REGEX_CART_URL,
  REGEX_OFFERS_URL,
  REGEX_CATEGORIES_URL,
  REGEX_AFFILIATE_PARAMS,
  REGEX_URL,
  AFFILIATE_PARAMS,
};
