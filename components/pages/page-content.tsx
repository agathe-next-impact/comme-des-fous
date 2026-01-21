"use client";

import { Container, Prose } from "@/components/craft";
import Hero from "@/components/hero";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatLoader } from "react-spinners";

const PODCAST_PLATFORMS = [
  "spotify.com",
  "open.spotify.com",
  "soundcloud.com",
  "podcasts.apple.com",
  "anchor.fm",
  "podbean.com",
  "acast.com",
  "deezer.com",
  "ausha.co",
  "audioboom.com",
  "megaphone.fm",
  "simplecast.com",
  "buzzsprout.com",
  "spreaker.com",
  "castbox.fm",
  "player.fm",
  "stitcher.com",
  "podcloud.fr",
  "radiofrance.fr",
];
const VIDEO_PLATFORMS = [
  "youtube.com",
  "youtu.be",
  "vimeo.com",
  "dailymotion.com",
];
function getMediaType(url: string): "video" | "podcast" | null {
  const lowerUrl = url.toLowerCase();
  if (VIDEO_PLATFORMS.some((p) => lowerUrl.includes(p))) return "video";
  if (PODCAST_PLATFORMS.some((p) => lowerUrl.includes(p))) return "podcast";
  return null;
}
function getSocialEmbed(
  url: string
): { src: string; platform?: string } | null {
  const lower = url.toLowerCase();
  if (lower.includes("instagram.com")) {
    const match = url.match(/instagram\.com\/(p|reel|tv)\/([^/?#]+)/i);
    if (match) {
      return {
        src: `https://www.instagram.com/${match[1]}/${match[2]}/embed`,
        platform: "instagram",
      };
    }
  }
  if (lower.includes("tiktok.com")) {
    const match = url.match(/tiktok\.com\/.+\/video\/(\d+)/i);
    if (match) {
      return { src: `https://www.tiktok.com/embed/v2/${match[1]}`, platform: "tiktok" };
    }
  }
  if (lower.includes("twitter.com") || lower.includes("x.com")) {
    return {
      src: `https://twitframe.com/show?url=${encodeURIComponent(url)}`,
      platform: "twitter",
    };
  }
  if (lower.includes("facebook.com")) {
    return {
      src: `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(
        url
      )}&show_text=true&width=500`,
      platform: "facebook",
    };
  }
  return null;
}
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim().replace(/&amp;/g, "&");
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/e\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

// --- Media extraction from HTML ---
// Renvoie { media, cleanedContent }
function extractEmbeddedMediaAndClean(content: string) {
  const extractedMedia: {
    src: string;
    title?: string;
    type: "video" | "podcast" | "social" | "pdf";
    platform?: string;
    raw?: string;
  }[] = [];

  let cleanedContent = content;

  // Iframes (sans exiger title)
  const iframePattern = /<iframe[^>]*src=["']([^"']+)["'][^>]*>([\s\S]*?)<\/iframe>/gi;
  cleanedContent = cleanedContent.replace(iframePattern, (match, src) => {
    const mediaType = getMediaType(src) || "video";
    extractedMedia.push({ src, type: mediaType, raw: match });
    return ""; // supprime du contenu
  });

  // YouTube links
  const youtubeLinkPattern = /<a[^>]*href=["']([^"']*(?:youtube\.com|youtu\.be)[^"']*)["'][^>]*>([^<]*)<\/a>/gi;
  cleanedContent = cleanedContent.replace(youtubeLinkPattern, (match, href, linkText) => {
    const videoId = extractYouTubeId(href);
    if (videoId) {
      const embedSrc = `https://www.youtube.com/embed/${videoId}`;
      extractedMedia.push({
        src: embedSrc,
        title: linkText?.trim() || undefined,
        type: "video",
        raw: match,
      });
      return ""; // supprime du contenu
    }
    return match;
  });

  // Social embeds
  const socialLinkPattern = /<a[^>]*href=["']([^"']*(?:instagram\.com|tiktok\.com|twitter\.com|x\.com|facebook\.com)[^"']*)["'][^>]*>([^<]*)<\/a>/gi;
  cleanedContent = cleanedContent.replace(socialLinkPattern, (match, href, linkText) => {
    const embed = getSocialEmbed(href);
    if (embed) {
      extractedMedia.push({
        src: embed.src,
        title: linkText?.trim() || undefined,
        type: "social",
        platform: embed.platform,
        raw: match,
      });
      return ""; // supprime du contenu
    }
    return match;
  });

  // PDF links
  const pdfLinkPattern = /<a[^>]*href=["']([^"']*\.pdf(?:\?[^"']*)?)["'][^>]*>([^<]*)<\/a>/gi;
  cleanedContent = cleanedContent.replace(pdfLinkPattern, (match, href, linkText) => {
    extractedMedia.push({
      src: href,
      title: linkText?.trim() || "Document PDF",
      type: "pdf",
      raw: match,
    });
    return ""; // supprime du contenu
  });

  // PDF embeds
  const pdfEmbedPattern = /<(?:object|embed)[^>]*(?:data|src)=["']([^"']*\.pdf(?:\?[^"']*)?)["'][^>]*>(?:[\s\S]*?<\/(?:object|embed)>)?/gi;
  cleanedContent = cleanedContent.replace(pdfEmbedPattern, (match, src) => {
    extractedMedia.push({
      src: src,
      title: "Document PDF",
      type: "pdf",
      raw: match,
    });
    return ""; // supprime du contenu
  });

  return { media: extractedMedia, cleanedContent };
}

// --- Main component ---
type FeaturedMedia = {
  source_url: string;
  alt_text?: string;
};

type PageWithEmbedded = {
  title: { rendered: string };
  content: { rendered: string };
  excerpt?: { rendered: string };
  featured_media?: number;
  _embedded?: {
    "wp:featuredmedia"?: FeaturedMedia[];
  };
  slug: string;
};

interface PageContentProps {
  page: PageWithEmbedded;
}

export default function PageContent({ page }: PageContentProps) {
  const featuredMedia = page.featured_media
    ? page._embedded?.["wp:featuredmedia"]?.[0]
    : null;

  const [scrapedHtml, setScrapedHtml] = useState<string | null>(null);
  const [media, setMedia] = useState<
    {
      src: string;
      title?: string;
      type: "video" | "podcast" | "social" | "pdf";
      platform?: string;
    }[]
  >([]);
  const [cleanedContent, setCleanedContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Détection éditeur classique
  const isClassicEditor =
    !page.content.rendered.includes("<!-- wp:") &&
    !page.content.rendered.includes("wp-block");

  useEffect(() => {
    async function fetchScrapedHtml() {
      if (isClassicEditor) {
        setLoading(true);
        const res = await fetch(`/api/scrape-html?slug=${page.slug}`);
        if (res.ok) {
          const html = await res.text();
          setScrapedHtml(html);
          const { media, cleanedContent } = extractEmbeddedMediaAndClean(html);
          setMedia(media);
          setCleanedContent(cleanedContent);
        }
        setLoading(false);
      } else {
        const { media, cleanedContent } = extractEmbeddedMediaAndClean(page.content.rendered);
        setMedia(media);
        setCleanedContent(cleanedContent);
      }
    }
    fetchScrapedHtml();
  }, [isClassicEditor, page.slug, page.content.rendered]);

  return (
    <div className="mt-14">
      <Hero titre={page.title.rendered} sousTitre="" />

      <Container className="mt-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            {/* Pas de catégories/tags pour les pages */}
          </div>
          {featuredMedia && (
            <div className="text-sm text-muted-foreground">
              <Image
                src={featuredMedia.source_url}
                alt={featuredMedia.alt_text || "Featured media"}
                width={250}
                height={250}
                className="object-cover rounded-md"
              />
            </div>
          )}
        </div>
        {/* Section médias en haut de page */}
        {media.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 mb-12">
            <h3 className="text-2xl font-bold mb-6">Médias</h3>
            <div className="grid grid-cols-1 gap-6">
              {media.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative p-6 group flex flex-col not-prose gap-4",
                    "border border-white/20",
                    "hover:bg-white/5 transition-all duration-300",
                    "before:absolute before:top-0 before:left-0 before:w-3 before:h-3",
                    "before:border-t-2 before:border-l-2 before:border-yellow-500",
                    "after:absolute after:bottom-0 after:right-0 after:w-3 after:h-3",
                    "after:border-b-2 after:border-r-2 after:border-red-500",
                    "before:transition-all before:duration-300 after:transition-all after:duration-300",
                    "hover:before:w-6 hover:before:h-6 hover:after:w-6 hover:after:h-6"
                  )}
                >
                  {item.type === "pdf" ? (
                    <div className="flex flex-col gap-4">
                      <div className="relative w-full aspect-[3/4] bg-muted/30">
                        <iframe
                          src={`${item.src}#view=FitH`}
                          title={item.title || "Document PDF"}
                          className="absolute inset-0 w-full h-full border-0"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {item.title || "Document PDF"}
                        </p>
                        <a
                          href={item.src}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary/90 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          Télécharger
                        </a>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className={cn(
                          "relative w-full",
                          item.type === "podcast"
                            ? "aspect-[3/1]"
                            : item.type === "social"
                            ? "aspect-[4/5]"
                            : "aspect-video"
                        )}
                      >
                        <iframe
                          src={item.src}
                          title={
                            item.title ||
                            `${
                              item.type === "podcast"
                                ? "Podcast"
                                : item.type === "social"
                                ? "Social"
                                : "Vidéo"
                            } ${index + 1}`
                          }
                          className="absolute inset-0 w-full h-full"
                          allow={
                            item.type === "podcast"
                              ? "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              : "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          }
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                      {item.title && (
                        <p className="text-sm text-muted-foreground mt-4">
                          {item.title}
                        </p>
                      )}
                    </>
                  )}
                  {item.type === "pdf" && (
                    <span className="absolute top-2 right-2 text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                      📄 PDF
                    </span>
                  )}
                  {item.type === "podcast" && (
                    <span className="absolute top-2 right-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                      🎙️ Podcast
                    </span>
                  )}
                  {item.type === "social" && (
                    <span className="absolute top-2 right-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                      # {item.platform || "Social"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Rendu du contenu principal */}
        {isClassicEditor ? (
          scrapedHtml === null ? (
            <div className="py-12 text-center text-muted-foreground">
              <BeatLoader color="#fff" />
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: cleanedContent }} />
          )
        ) : (
          <Prose>
            <div dangerouslySetInnerHTML={{ __html: cleanedContent }} />
          </Prose>
        )}
      </Container>
    </div>
  );
}