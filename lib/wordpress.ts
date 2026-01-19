/**
 * Récupère les N posts les plus commentés (par défaut 10)
 */
/**
 * Récupère les N posts les plus commentés (tri côté front, fallback si l'API ne supporte pas orderby=comment_count)
 */
export async function getMostCommentedPosts(limit: number = 10): Promise<Post[]> {
  // On récupère jusqu'à 100 posts récents et on trie côté front
  const posts = await getRecentPosts();
  return posts
    .slice() // copie pour ne pas muter l'original
    .sort((a, b) => (b.comment_count ?? 0) - (a.comment_count ?? 0))
    .slice(0, limit);
}
/**
 * Récupère le dernier article sticky (mis en avant) depuis WordPress
 */
export async function getLatestStickyPost(): Promise<Post | undefined> {
  // Essaye de récupérer le dernier sticky
  const stickyPosts = await wordpressFetchGraceful<Post[]>(
    "/wp-json/wp/v2/posts",
    [],
    { sticky: true, per_page: 1, _embed: true, orderby: "date", order: "desc" },
    ["wordpress", "posts", "sticky"]
  );
  if (stickyPosts.length > 0) return stickyPosts[0];
  // Sinon, récupère le dernier article publié
  const latestPosts = await wordpressFetchGraceful<Post[]>(
    "/wp-json/wp/v2/posts",
    [],
    { per_page: 1, _embed: true, orderby: "date", order: "desc" },
    ["wordpress", "posts", "latest"]
  );
  return latestPosts[0];
}

// Description: WordPress API functions
// Used to fetch data from a WordPress site using the WordPress REST API
// Types are imported from `wp.d.ts`

import querystring from "query-string";
import type {
  Post,
  Category,
  Tag,
  Page,
  Author,
  FeaturedMedia,
} from "./wordpress.d";

// Single source of truth for WordPress configuration
    export type { Post } from "./wordpress.d";
// Simple in-memory cache for build-time API calls
const tempCache: Record<string, any> = {};

function getCacheKey(path: string, query?: Record<string, any>) {
  return path + (query ? `?${JSON.stringify(query)}` : "");
}
const baseUrl = process.env.WORDPRESS_URL;
const isConfigured = Boolean(baseUrl);

if (!isConfigured) {
  console.warn(
    "WORDPRESS_URL environment variable is not defined - WordPress features will be unavailable"
  );
}

class WordPressAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string
  ) {
    super(message);
    this.name = "WordPressAPIError";
  }
}

// Pagination types
export interface WordPressPaginationHeaders {
  total: number;
  totalPages: number;
}

export interface WordPressResponse<T> {
  data: T;
  headers: WordPressPaginationHeaders;
}

const USER_AGENT = "Next.js WordPress Client";
const CACHE_TTL = 3600; // 1 hour

// Core fetch - throws on error (for functions that require data)
async function wordpressFetch<T>(
  path: string,
  query?: Record<string, any>,
  tags: string[] = ["wordpress"]
): Promise<T> {
  if (!baseUrl) {
    throw new Error("WordPress URL not configured");
  }

  const url = `${baseUrl}${path}${query ? `?${querystring.stringify(query)}` : ""}`;
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { tags, revalidate: CACHE_TTL },
  });
  if (!response.ok) {
    throw new WordPressAPIError(
      `WordPress API request failed: ${response.statusText}`,
      response.status,
      url
    );
  }
  const json = await response.json();
  return json;
}

// Graceful fetch - returns fallback when WordPress unavailable or on error
async function wordpressFetchGraceful<T>(
  path: string,
  fallback: T,
  query?: Record<string, any>,
  tags: string[] = ["wordpress"]
): Promise<T> {
  if (!isConfigured) return fallback;

  try {
    return await wordpressFetch<T>(path, query, tags);
  } catch {
    console.warn(`WordPress fetch failed for ${path}`);
    return fallback;
  }
}

// Paginated fetch - returns response with headers
async function wordpressFetchPaginated<T>(
  path: string,
  query?: Record<string, any>,
  tags: string[] = ["wordpress"]
): Promise<WordPressResponse<T>> {
  if (!baseUrl) {
    throw new Error("WordPress URL not configured");
  }

  const url = `${baseUrl}${path}${query ? `?${querystring.stringify(query)}` : ""}`;
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { tags, revalidate: CACHE_TTL },
  });
  if (!response.ok) {
    throw new WordPressAPIError(
      `WordPress API request failed: ${response.statusText}`,
      response.status,
      url
    );
  }
  const json = await response.json();
  const result = {
    data: json,
    headers: {
      total: parseInt(response.headers.get("X-WP-Total") || "0", 10),
      totalPages: parseInt(response.headers.get("X-WP-TotalPages") || "0", 10),
    },
  };
  return result;
}

// Graceful paginated fetch - returns empty response when unavailable
async function wordpressFetchPaginatedGraceful<T>(
  path: string,
  query?: Record<string, any>,
  tags: string[] = ["wordpress"]
): Promise<WordPressResponse<T[]>> {
  const emptyResponse: WordPressResponse<T[]> = {
    data: [],
    headers: { total: 0, totalPages: 0 },
  };

  if (!isConfigured) return emptyResponse;

  try {
    return await wordpressFetchPaginated<T[]>(path, query, tags);
  } catch {
    console.warn(`WordPress paginated fetch failed for ${path}`);
    return emptyResponse;
  }
}

// Paginated posts with filter support
export async function getPostsPaginated(
  page: number = 1,
  perPage: number = 9,
  filterParams?: {
    author?: string;
    tag?: string;
    category?: string;
    search?: string;
  }
): Promise<WordPressResponse<Post[]>> {
  const query: Record<string, any> = {
    _embed: true,
    per_page: perPage,
    page,
  };

  // Build cache tags based on filters
  const cacheTags = ["wordpress", "posts", `posts-page-${page}`];

  if (filterParams?.search) {
    query.search = filterParams.search;
    cacheTags.push("posts-search");
  }
  if (filterParams?.author) {
    query.author = filterParams.author;
    cacheTags.push(`posts-author-${filterParams.author}`);
  }
  if (filterParams?.tag) {
    query.tags = filterParams.tag;
    cacheTags.push(`posts-tag-${filterParams.tag}`);
  }
  if (filterParams?.category) {
    query.categories = filterParams.category;
    cacheTags.push(`posts-category-${filterParams.category}`);
  }

  return wordpressFetchPaginatedGraceful<Post>(
    "/wp-json/wp/v2/posts",
    query,
    cacheTags
  );
}

/**
 * Fetches recent posts (up to 100). For paginated access use getPostsPaginated().
 * For fetching ALL posts (e.g., sitemap), use getAllPostsForSitemap().
 */
export async function getRecentPosts(filterParams?: {
  author?: string;
  tag?: string;
  category?: string;
  search?: string;
}): Promise<Post[]> {
  const query: Record<string, any> = {
    _embed: true,
    per_page: 100,
  };

  if (filterParams?.search) query.search = filterParams.search;
  if (filterParams?.author) query.author = filterParams.author;
  if (filterParams?.tag) query.tags = filterParams.tag;
  if (filterParams?.category) query.categories = filterParams.category;

  return wordpressFetchGraceful<Post[]>("/wp-json/wp/v2/posts", [], query, [
    "wordpress",
    "posts",
  ]);
}

export async function getPostById(id: number): Promise<Post> {
  try {
    return await wordpressFetch<Post>(`/wp-json/wp/v2/posts/${id}`);
  } catch (err: any) {
    if (err instanceof WordPressAPIError && err.status === 404) {
      return undefined as any;
    }
    throw err;
  }
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await wordpressFetchGraceful<Post[]>(
    "/wp-json/wp/v2/posts",
    [],
    { slug }
  );
  return posts[0];
}

export async function getAllCategories(): Promise<Category[]> {
  return wordpressFetchGraceful<Category[]>(
    "/wp-json/wp/v2/categories",
    [],
    { per_page: 100 },
    ["wordpress", "categories"]
  );
}

export async function getCategoryById(id: number): Promise<Category> {
  try {
    return await wordpressFetch<Category>(`/wp-json/wp/v2/categories/${id}`);
  } catch (err: any) {
    if (
      err instanceof WordPressAPIError &&
      (err.status === 404 || err.status === 500)
    ) {
      return undefined as any;
    }
    throw err;
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  return wordpressFetch<Category[]>("/wp-json/wp/v2/categories", { slug }).then(
    (categories) => categories[0]
  );
}

export async function getPostsByCategory(categoryId: number): Promise<Post[]> {
  return wordpressFetch<Post[]>("/wp-json/wp/v2/posts", {
    categories: categoryId,
  });
}

export async function getPostsByTag(tagId: number): Promise<Post[]> {
  return wordpressFetch<Post[]>("/wp-json/wp/v2/posts", { tags: tagId });
}

export async function getTagsByPost(postId: number): Promise<Tag[]> {
  return wordpressFetch<Tag[]>("/wp-json/wp/v2/tags", { post: postId });
}

export async function getAllTags(): Promise<Tag[]> {
  return wordpressFetchGraceful<Tag[]>(
    "/wp-json/wp/v2/tags",
    [],
    { per_page: 100 },
    ["wordpress", "tags"]
  );
}

export async function getTagById(id: number): Promise<Tag> {
  try {
    return await wordpressFetch<Tag>(`/wp-json/wp/v2/tags/${id}`);
  } catch (err: any) {
    if (
      err instanceof WordPressAPIError &&
      (err.status === 404 || err.status === 500)
    ) {
      return undefined as any;
    }
    throw err;
  }
}

export async function getTagBySlug(slug: string): Promise<Tag | undefined> {
  const tags = await wordpressFetchGraceful<Tag[]>(
    "/wp-json/wp/v2/tags",
    [],
    { slug },
    ["wordpress", "tags", `tag-slug-${slug}`]
  );
  return tags[0];
}

export async function getAllPages(): Promise<Page[]> {
  return wordpressFetchGraceful<Page[]>(
    "/wp-json/wp/v2/pages",
    [],
    { per_page: 100 },
    ["wordpress", "pages"]
  );
}

export async function getPageById(id: number): Promise<Page> {
  try {
    return await wordpressFetch<Page>(`/wp-json/wp/v2/pages/${id}`);
  } catch (err: any) {
    if (err instanceof WordPressAPIError && err.status === 404) {
      return undefined as any;
    }
    throw err;
  }
}

export async function getPageBySlug(slug: string): Promise<Page | undefined> {
  const pages = await wordpressFetchGraceful<Page[]>(
    "/wp-json/wp/v2/pages",
    [],
    { slug }
  );
  return pages[0];
}

export async function getAllAuthors(): Promise<Author[]> {
  return wordpressFetchGraceful<Author[]>(
    "/wp-json/wp/v2/users",
    [],
    { per_page: 100 },
    ["wordpress", "authors"]
  );
}

export async function getAuthorById(id: number): Promise<Author> {
  try {
    return await wordpressFetch<Author>(`/wp-json/wp/v2/users/${id}`);
  } catch (err: any) {
    if (
      err instanceof WordPressAPIError &&
      (err.status === 404 || err.status === 500)
    ) {
      // Return a fallback author object if not found or server error
      return {
        id,
        name: "Unknown author",
        url: "",
        description: "",
        link: "",
        slug: "unknown",
        avatar_urls: {},
        meta: {},
      };
    }
    throw err;
  }
}

export async function getAuthorBySlug(slug: string): Promise<Author> {
  return wordpressFetch<Author[]>("/wp-json/wp/v2/users", { slug }).then(
    (users) => users[0]
  );
}

export async function getPostsByAuthor(authorId: number): Promise<Post[]> {
  return wordpressFetch<Post[]>("/wp-json/wp/v2/posts", { author: authorId });
}

export async function getPostsByAuthorSlug(
  authorSlug: string
): Promise<Post[]> {
  const author = await getAuthorBySlug(authorSlug);
  return wordpressFetch<Post[]>("/wp-json/wp/v2/posts", { author: author.id });
}

export async function getPostsByCategorySlug(
  categorySlug: string
): Promise<Post[]> {
  const category = await getCategoryBySlug(categorySlug);
  return wordpressFetch<Post[]>("/wp-json/wp/v2/posts", {
    categories: category.id,
  });
}

export async function getPostsByTagSlug(tagSlug: string): Promise<Post[]> {
  const tag = await getTagBySlug(tagSlug);
  if (!tag) {
    throw new Error(`Tag not found for slug: ${tagSlug}`);
  }
  return wordpressFetch<Post[]>("/wp-json/wp/v2/posts", { tags: tag.id });
}

export async function getFeaturedMediaById(id: number): Promise<FeaturedMedia> {
  try {
    return await wordpressFetch<FeaturedMedia>(`/wp-json/wp/v2/media/${id}`);
  } catch (err: any) {
    if (
      err instanceof WordPressAPIError &&
      (err.status === 404 || err.status === 500)
    ) {
      // Return a fallback media object if not found or server error
      return {
        id,
        date: "",
        date_gmt: "",
        modified: "",
        modified_gmt: "",
        slug: "unknown",
        status: "publish",
        link: "",
        guid: { rendered: "" },
        title: { rendered: "" },
        author: 0,
        caption: { rendered: "" },
        alt_text: "",
        media_type: "image",
        mime_type: "",
        media_details: {
          width: 0,
          height: 0,
          file: "",
          sizes: {},
        },
        source_url: "",
      };
    }
    throw err;
  }
}

export async function searchCategories(query: string): Promise<Category[]> {
  return wordpressFetchGraceful<Category[]>(
    "/wp-json/wp/v2/categories",
    [],
    { search: query, per_page: 100 }
  );
}

export async function searchTags(query: string): Promise<Tag[]> {
  return wordpressFetchGraceful<Tag[]>("/wp-json/wp/v2/tags", [], {
    search: query,
    per_page: 100,
  });
}

export async function searchAuthors(query: string): Promise<Author[]> {
  return wordpressFetchGraceful<Author[]>("/wp-json/wp/v2/users", [], {
    search: query,
    per_page: 100,
  });
}

// Fetches ALL post slugs for generateStaticParams
// Returns empty array if WordPress is unavailable (allows build to succeed)
export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
  if (!isConfigured) return [];

  try {
    const allSlugs: { slug: string }[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await wordpressFetchPaginated<Post[]>(
        "/wp-json/wp/v2/posts",
        { per_page: 100, page, _fields: "slug" }
      );

      allSlugs.push(...response.data.map((post) => ({ slug: post.slug })));
      hasMore = page < response.headers.totalPages;
      page++;
    }

    return allSlugs;
  } catch {
    console.warn("WordPress unavailable, skipping static generation for posts");
    return [];
  }
}

// Fetches ALL posts for sitemap generation (paginates through all pages)
// Returns slug and modified date for each post
export async function getAllPostsForSitemap(): Promise<
  { slug: string; modified: string }[]
> {
  if (!isConfigured) return [];

  try {
    const allPosts: { slug: string; modified: string }[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await wordpressFetchPaginated<Post[]>(
        "/wp-json/wp/v2/posts",
        { per_page: 100, page, _fields: "slug,modified" }
      );

      allPosts.push(
        ...response.data.map((post) => ({
          slug: post.slug,
          modified: post.modified,
        }))
      );
      hasMore = page < response.headers.totalPages;
      page++;
    }

    return allPosts;
  } catch {
    console.warn("WordPress unavailable, skipping sitemap generation");
    return [];
  }
}

// Enhanced pagination functions for specific queries
export async function getPostsByCategoryPaginated(
  categoryId: number,
  page: number = 1,
  perPage: number = 9
): Promise<WordPressResponse<Post[]>> {
  return wordpressFetchPaginatedGraceful<Post>("/wp-json/wp/v2/posts", {
    _embed: true,
    per_page: perPage,
    page,
    categories: categoryId,
  });
}

export async function getPostsByTagPaginated(
  tagId: number,
  page: number = 1,
  perPage: number = 9
): Promise<WordPressResponse<Post[]>> {
  return wordpressFetchPaginatedGraceful<Post>("/wp-json/wp/v2/posts", {
    _embed: true,
    per_page: perPage,
    page,
    tags: tagId,
  });
}

export async function getPostsByAuthorPaginated(
  authorId: number,
  page: number = 1,
  perPage: number = 9
): Promise<WordPressResponse<Post[]>> {
  return wordpressFetchPaginatedGraceful<Post>("/wp-json/wp/v2/posts", {
    _embed: true,
    per_page: perPage,
    page,
    author: authorId,
  });
}

// Podcast platforms detection
const PODCAST_PLATFORMS = [
  'spotify.com', 'open.spotify.com', 'soundcloud.com', 'podcasts.apple.com',
  'anchor.fm', 'podbean.com', 'acast.com', 'deezer.com', 'ausha.co',
  'audioboom.com', 'megaphone.fm', 'simplecast.com', 'buzzsprout.com',
  'spreaker.com', 'castbox.fm', 'player.fm', 'stitcher.com', 'podcloud.fr',
  'radiofrance.fr',
];

const VIDEO_PLATFORMS = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'];

function getMediaType(url: string): 'video' | 'podcast' | null {
  const lowerUrl = url.toLowerCase();
  if (VIDEO_PLATFORMS.some(p => lowerUrl.includes(p))) return 'video';
  if (PODCAST_PLATFORMS.some(p => lowerUrl.includes(p))) return 'podcast';
  return null;
}

/**
 * Scrape la page publique WordPress pour récupérer les iframes vidéo et podcast
 * qui ne sont pas disponibles via l'API REST
 */
export async function scrapePostEmbeddedMedia(postUrl: string): Promise<{ src: string; title?: string; type?: 'video' | 'podcast' }[]> {
  try {
    const response = await fetch(postUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS/14)',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) return [];

    const html = await response.text();
    const media: { src: string; title?: string; type?: 'video' | 'podcast' }[] = [];

    // Extract ALL iframes - universal approach
    const iframeRegex = /<iframe[^>]*>/gi;
    const iframes = html.match(iframeRegex) || [];
    
    console.log(`[Scrape] Found ${iframes.length} iframes in ${postUrl}`);

    for (const iframe of iframes) {
      // Extract src attribute
      const srcMatch = iframe.match(/src=["']([^"']+)["']/i);
      if (!srcMatch) continue;


      let src = srcMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&#038;/g, '&');

      // Correction Mixcloud: paramètre feed relatif → absolu
      if (src.includes('mixcloud.com/widget/iframe') && src.includes('feed=')) {
        // Récupère le paramètre feed
        const feedMatch = src.match(/feed=([^&]+)/);
        if (feedMatch) {
          let feedValue = decodeURIComponent(feedMatch[1]);
          if (feedValue.startsWith('/')) {
            // Transforme en URL absolue
            feedValue = `https://www.mixcloud.com${feedValue}`;
            // Reconstruit l'URL src
            src = src.replace(/feed=([^&]+)/, `feed=${encodeURIComponent(feedValue)}`);
          }
        }
      }

      // Skip empty or invalid sources
      if (!src || src.startsWith('about:') || src.startsWith('javascript:')) continue;

      // Vérifie si le src retourne une 404
      let is404 = false;
      try {
        const headResp = await fetch(src, { method: 'HEAD' });
        if (!headResp.ok && headResp.status === 404) {
          is404 = true;
        }
      } catch (err) {
        is404 = true;
      }
      if (is404) {
        console.log(`[Scrape] Ignored iframe (404): ${src}`);
        continue;
      }

      // Extract title if present
      const titleMatch = iframe.match(/title=["']([^"']+)["']/i);
      const title = titleMatch ? titleMatch[1].replace(/&quot;/g, '"') : undefined;


      // Détection robuste du type pour Mixcloud
      let type: 'video' | 'podcast';
      if (src.includes('mixcloud.com/widget/iframe')) {
        type = 'podcast';
      } else {
        const isVideo = /youtube|youtu\.be|vimeo|dailymotion|wistia|twitch/i.test(src);
        type = isVideo ? 'video' : 'podcast';
      }

      // Avoid duplicates
      if (!media.some(m => m.src === src)) {
        console.log(`[Scrape] Found iframe: ${src} (${type})`);
        media.push({ src, title, type });
      }
    }

    // Also extract <audio> tags
    const audioRegex = /<audio[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let audioMatch;
    while ((audioMatch = audioRegex.exec(html)) !== null) {
      const src = audioMatch[1].replace(/&amp;/g, '&');
      if (!media.some(m => m.src === src)) {
        media.push({ src, type: 'podcast' });
      }
    }

    // Détection des liens directs vers les plateformes de podcasts
    const linkRegex = /<a\s[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      let url = linkMatch[1];
      const text = linkMatch[2];
      // Transformation automatique pour Mixcloud
      if (url.includes('mixcloud.com') && !url.includes('widget/iframe')) {
        // Nettoie l'URL (enlève les paramètres éventuels)
        const baseUrl = url.split('?')[0];
        url = `https://www.mixcloud.com/widget/iframe/?feed=${encodeURIComponent(baseUrl)}`;
      }
      if (getMediaType(url) === 'podcast' && !media.some(m => m.src === url)) {
        media.push({ src: url, title: text, type: 'podcast' });
      }
    }

    return media;
  } catch (error) {
    console.error(`[Scrape] Error scraping ${postUrl}:`, error);
    return [];
  }
}

export { WordPressAPIError };
