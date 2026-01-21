import he from 'he';
import { siteConfig } from "@/site.config";
import type { Metadata } from "next";

// Décode les entités HTML (&amp;, &#8217;, etc.)
export function decodeHtmlEntities(str: string): string {
  return he.decode(str);
}

interface ContentMetadataOptions {
  title: string;
  description: string;
  slug: string;
  basePath?: "posts" | "pages";
  imageUrl?: string; // Ajout d'une option pour l'image réelle
}

export function generateContentMetadata({
  title,
  description,
  slug,
  basePath,
  imageUrl,
}: ContentMetadataOptions): Metadata {
  const decodedTitle = decodeHtmlEntities(title);
  const decodedDescription = decodeHtmlEntities(description);
  
  // Construction dynamique de l'URL selon le type de contenu
  const path = basePath ? `/${basePath}/${slug}` : `/${slug}`;
  const fullUrl = `${siteConfig.site_domain}${path}`;

  const ogUrl = new URL(`${siteConfig.site_domain}/api/og`);
  ogUrl.searchParams.append("title", decodedTitle);
  ogUrl.searchParams.append("description", decodedDescription);

  const finalImageUrl = imageUrl || ogUrl.toString();

  return {
    title: decodedTitle,
    description: decodedDescription,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: decodedTitle,
      description: decodedDescription,
      type: "article",
      url: fullUrl,
      images: [
        {
          url: finalImageUrl,
          width: 1200,
          height: 630,
          alt: decodedTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: decodedTitle,
      description: decodedDescription,
      images: [finalImageUrl],
    },
  };
}

export function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

export function truncateHtml(html: string, maxWords: number): string {
  const text = stripHtml(html);
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}
