/**
 * Cache mémoire simple pour réduire les appels API redondants
 */

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère une valeur du cache si elle existe et n'a pas expiré
 */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * Stocke une valeur dans le cache
 */
export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Wrapper qui gère automatiquement le cache pour une fonction async
 */
export async function withCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = getCached<T>(key);
  if (cached) return cached;
  
  const data = await fetcher();
  setCache(key, data);
  return data;
}

/**
 * Invalide une entrée spécifique du cache
 */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/**
 * Invalide toutes les entrées du cache commençant par un préfixe
 */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Vide entièrement le cache
 */
export function clearCache(): void {
  cache.clear();
}
