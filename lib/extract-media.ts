import { isYoutubeUrl, isPodcastUrl } from "@/lib/media-helpers";
import type { Post } from "@/lib/wordpress";

export function extractMediaFromPost(post: Post): { mediaUrl?: string; mediaType?: "youtube" | "podcast" } {
  const content = post.content?.rendered || "";

  // Helper pour nettoyer les URLs
  const cleanUrl = (url: string) => url.replace(/&amp;/g, '&').replace(/&#038;/g, '&');

  // 1. Recherche des blocks Gutenberg "w-block-embed" (Youtube, etc.)
  // Ces blocs peuvent contenir juste une URL ou un iframe imbriqué
  const blockRegex = /<figure[^>]*class=["'][^"']*wp-block-embed[^"']*["'][^>]*>([\s\S]*?)<\/figure>/gi;
  const blocks = [...content.matchAll(blockRegex)];
  
  for (const match of blocks) {
    const innerHtml = match[1];
    
    // Cherche un iframe à l'intérieur
    const iframeMatch = innerHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch) {
      const src = cleanUrl(iframeMatch[1]);
      if (isYoutubeUrl(src)) return { mediaUrl: src, mediaType: "youtube" };
      if (isPodcastUrl(src)) return { mediaUrl: src, mediaType: "podcast" };
    }

    // Sinon cherche juste une URL (cas où le embed n'est pas rendu en iframe)
    const urlMatch = innerHtml.match(/https?:\/\/[^\s"<]+/);
    if (urlMatch) {
       const src = cleanUrl(urlMatch[0]);
       if (isYoutubeUrl(src)) return { mediaUrl: src, mediaType: "youtube" };
       // Note: pour les podcasts, sans iframe, c'est souvent moins fiable, on ignore ou on tente
       if (isPodcastUrl(src)) return { mediaUrl: src, mediaType: "podcast" };
    }
  }
  
  // 2. Recherche générale des iframes (fallback si pas dans un block ou vieux contenu)
  const iframeRegex = /<iframe[\s\S]*?>[\s\S]*?<\/iframe>|<iframe[\s\S]*?\/>/gi;
  const iframes = content.match(iframeRegex) || [];
  
  for (const iframe of iframes) {
    const srcMatch = iframe.match(/src\s*=\s*["']([^"']+)["']/i);
    if (!srcMatch) continue;
    
    let src = cleanUrl(srcMatch[1]);
    
    if (isYoutubeUrl(src)) {
      return { mediaUrl: src, mediaType: "youtube" };
    }
    
    if (isPodcastUrl(src)) {
      return { mediaUrl: src, mediaType: "podcast" };
    }
  }

  // 3. Recherche des balises <video> directes (upload natif WP)
  const videoRegex = /<video[^>]*src=["']([^"']+)["'][^>]*>/i;
  const videoMatch = content.match(videoRegex);
  if (videoMatch) {
      return { mediaUrl: cleanUrl(videoMatch[1]), mediaType: "youtube" }; // On traite comme video générique
  }

  // 4. Recherche des balises <audio> directes
  const audioRegex = /<audio[^>]*src=["']([^"']+)["'][^>]*>/i;
  const audioMatch = content.match(audioRegex);
  if (audioMatch) {
      return { mediaUrl: cleanUrl(audioMatch[1]), mediaType: "podcast" }; // On traite comme podcast générique
  }

  return { mediaUrl: undefined, mediaType: undefined };
}
