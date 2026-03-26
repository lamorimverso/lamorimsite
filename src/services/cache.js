/**
 * Cache simples em memória com TTL configurável.
 * Evita chamadas repetidas à API do Mercado Livre.
 */

// Armazena os itens no formato: { valor, expiresAt }
const store = new Map();

/**
 * Busca um valor no cache.
 * @param {string} key - Chave de busca
 * @returns {any|null} - Valor armazenado ou null se não existir / expirado
 */
function get(key) {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }

  return entry.value;
}

/**
 * Armazena um valor no cache com TTL.
 * @param {string} key - Chave
 * @param {any} value - Valor a armazenar
 * @param {number} ttlSeconds - Tempo de vida em segundos (padrão: 3600)
 */
function set(key, value, ttlSeconds = 3600) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Remove um valor específico do cache.
 * @param {string} key - Chave a remover
 */
function remove(key) {
  store.delete(key);
}

/**
 * Limpa todo o cache.
 */
function clear() {
  store.clear();
}

/**
 * Retorna o número de entradas no cache (incluindo expiradas ainda não removidas).
 * @returns {number}
 */
function size() {
  return store.size;
}

module.exports = { get, set, remove, clear, size };
