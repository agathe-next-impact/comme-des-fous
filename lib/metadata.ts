import he from 'he';
import { siteConfig } from "@/site.config";
import type { Metadata } from "next";
import type { Post } from "./wordpress.d";

// Image par défaut utilisée si aucune image mise en avant n'est disponible
const DEFAULT_FALLBACK_IMAGE = `${siteConfig.site_domain}/logo.png`;

// Décode les entités HTML (&amp;, &#8217;, etc.)
export function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return he.decode(str);
}


/**
 * Nettoie et encode correctement le texte pour les métadonnées
 * Supprime les balises HTML, décode les entités, et normalise les espaces
 */
export function sanitizeMetaText(text: string): string {
  if (!text) return "";
  
  // 1. Supprimer les balises HTML
  let cleaned = text.replace(/<[^>]*>/g, "");
  
  // 2. Décoder les entités HTML
  cleaned = he.decode(cleaned);
  
  // 3. Normaliser les espaces (enlever espaces multiples, retours à la ligne)
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  
  // 4. Supprimer les caractères de contrôle
  cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, "");
  
  return cleaned;
}

/**
 * Extrait l'URL de l'image mise en avant d'un post/page WordPress
 * Cherche dans _embedded['wp:featuredmedia'] ou featured_media_url
 */
export function getFeaturedImageUrl(content: Post | any): string | undefined {
  // 1. Chercher dans _embedded (méthode standard avec ?_embed)
  if (content?._embedded?.["wp:featuredmedia"]?.[0]?.source_url) {
    return content._embedded["wp:featuredmedia"][0].source_url;
  }
  
  // 2. Chercher une taille optimisée pour OG (1200x630 idéal)
  const media = content?._embedded?.["wp:featuredmedia"]?.[0];
  if (media?.media_details?.sizes) {
    const sizes = media.media_details.sizes;
    // Priorité : large > medium_large > full
    const preferredSize = sizes.large || sizes.medium_large || sizes.full;
    if (preferredSize?.source_url) {
      return preferredSize.source_url;
    }
  }
  
  // 3. Fallback sur featured_media_url si présent
  if (content?.featured_media_url) {
    return content.featured_media_url;
  }
  
  // 4. Chercher la première image dans le contenu si pas d'image mise en avant
  if (content?.content?.rendered) {
    const imgMatch = content.content.rendered.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch?.[1]) {
      return imgMatch[1];
    }
  }

  // 5. Fallback final sur une image statique du site
  return DEFAULT_FALLBACK_IMAGE;
}

/**
 * Récupère l'URL optimisée de l'image mise en avant
 * Retourne l'URL de meilleure qualité disponible pour les réseaux sociaux
 */
export function getOptimizedFeaturedImageUrl(
  content: Post | any,
  preferredWidth: number = 1200
): string | undefined {
  const media = content?._embedded?.["wp:featuredmedia"]?.[0];
  
  if (!media) {
    return getFeaturedImageUrl(content);
  }

  // 1. Chercher la taille la plus proche de la largeur souhaitée
  if (media?.media_details?.sizes) {
    const sizes = media.media_details.sizes;
    
    // Trier les tailles disponibles par largeur
    const sortedSizes = Object.entries(sizes)
      .map(([name, details]: [string, any]) => ({
        name,
        width: details.width,
        url: details.source_url
      }))
      .sort((a, b) => Math.abs(a.width - preferredWidth) - Math.abs(b.width - preferredWidth));
    
    if (sortedSizes.length > 0) {
      return sortedSizes[0].url;
    }
  }

  // 2. Fallback sur l'URL source complète
  return media.source_url || getFeaturedImageUrl(content);
}

interface ContentMetadataOptions {
  title: string;
  description: string;
  slug: string;
  basePath?: "posts" | "pages";
  imageUrl?: string;
  content?: Post | any;
}

export function generateContentMetadata({
  title,
  description,
  slug,
  basePath,
  imageUrl,
  content,
}: ContentMetadataOptions): Metadata {
  // ✅ Nettoyage et encodage correct des textes
  const cleanTitle = sanitizeMetaText(title);
  let cleanDescription = sanitizeMetaText(description);
  
  // ✅ LinkedIn préfère des descriptions entre 150-200 caractères
  if (cleanDescription.length > 200) {
    cleanDescription = cleanDescription.substring(0, 197) + "...";
  }
  
  // Construction dynamique de l'URL selon le type de contenu
  const path = basePath ? `/${basePath}/${slug}` : `/${slug}`;
  const fullUrl = `${siteConfig.site_domain}${path}`;

  // ✅ Priorité : imageUrl explicite > image mise en avant WP > fallback
  let finalImageUrl = imageUrl;
  
  // Si imageUrl n'est pas définie, essayer d'extraire depuis le contenu
  if (!finalImageUrl && content) {
    finalImageUrl = getFeaturedImageUrl(content);
  }
  
  // Si toujours pas d'image, utiliser le fallback par défaut
  if (!finalImageUrl) {
    finalImageUrl = DEFAULT_FALLBACK_IMAGE;
  }

  // ✅ S'assurer que l'URL de l'image est absolue
  if (finalImageUrl && !finalImageUrl.startsWith('http')) {
    finalImageUrl = `${siteConfig.site_domain}${finalImageUrl}`;
  }

  return {
    title: cleanTitle,
    description: cleanDescription,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: cleanTitle,
      description: cleanDescription,
      type: "article",
      url: fullUrl,
      siteName: siteConfig.site_name,
      locale: "fr_FR",
      images: [
        {
          url: finalImageUrl,
          width: 1200,
          height: 630,
          alt: cleanTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: cleanDescription,
      images: [finalImageUrl],
    },
  };
}

export function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

export function truncateHtml(html: string, maxWords: number): string {
  const text = sanitizeMetaText(html);
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}
