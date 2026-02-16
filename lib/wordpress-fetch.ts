/**
 * Fetch WordPress avec retry automatique et gestion d'erreurs robuste
 */

const WORDPRESS_URL = process.env.WORDPRESS_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;

interface FetchOptions {
  retries?: number;
  revalidate?: number;
  backoffMs?: number;
}

export async function fetchWordPress<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T | null> {
  const { retries = 3, revalidate = 3600, backoffMs = 1000 } = options;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const url = `${WORDPRESS_URL}${endpoint}`;
      
      const res = await fetch(url, {
        next: { revalidate },
        headers: {
          'User-Agent': 'CommeDesFous/1.0',
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return await res.json();
    } catch (error) {
      const isLastAttempt = attempt === retries - 1;
      
      if (isLastAttempt) {
        console.warn(`WordPress fetch failed for ${endpoint} after ${retries} attempts`);
        return null; // Retourne null au lieu de crash
      }

      // Backoff exponentiel
      const delay = backoffMs * Math.pow(2, attempt);
      console.log(`Retry ${attempt + 1}/${retries} for ${endpoint} in ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  return null;
}

/**
 * Fetch paginé pour éviter le dépassement du cache 2MB
 */
export async function fetchWordPressPaginated<T = any>(
  endpoint: string,
  perPage = 20
): Promise<T[]> {
  const results: T[] = [];
  let page = 1;

  while (true) {
    const separator = endpoint.includes('?') ? '&' : '?';
    const paginatedEndpoint = `${endpoint}${separator}per_page=${perPage}&page=${page}`;
    
    const batch = await fetchWordPress<T[]>(paginatedEndpoint);
    
    if (!batch || batch.length === 0) break;
    
    results.push(...batch);
    
    // Limite de sécurité
    if (page >= 50) {
      console.warn(`Pagination limit reached for ${endpoint}`);
      break;
    }
    
    page++;
  }

  return results;
}