"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PostContentProps {
  content: string;
  className?: string;
  scrapedMedia?: { src: string; title?: string; type?: 'video' | 'podcast' }[];
}

interface EmbeddedMedia {
  src: string;
  title?: string;
  type: 'video' | 'podcast';
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

// Extraire l'ID de vidéo YouTube de n'importe quelle URL
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

export function PostContent({ content, className, scrapedMedia = [] }: PostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [media, setMedia] = useState<EmbeddedMedia[]>([]);
  const [cleanedContent, setCleanedContent] = useState(content);
  const [isProcessed, setIsProcessed] = useState(false);

  // Extraire les iframes du HTML brut AVANT le rendu
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Commencer avec les médias scrapés côté serveur (avec type détecté)
    const extractedMedia: EmbeddedMedia[] = scrapedMedia.map(m => ({
      src: m.src,
      title: m.title,
      type: m.type || getMediaType(m.src) || 'video'
    }));
    let modifiedContent = content;

    // Debug: afficher le contenu HTML brut
    console.log("=== RAW HTML CONTENT ===");
    console.log(content);
    console.log("========================");

    // Chercher toutes les iframes avec regex dans le HTML brut
    // Pattern qui capture tout le tag iframe
    const iframePattern = /<iframe[^>]*>/gi;
    const iframeMatches = content.match(iframePattern);

    console.log("Iframe tags found:", iframeMatches?.length || 0);
    console.log("Iframe matches:", iframeMatches);

    if (iframeMatches) {
      iframeMatches.forEach((iframeTag) => {
        // Extraire src
        const srcMatch = iframeTag.match(/src=["']([^"']+)["']/i);
        const src = srcMatch?.[1];

        // Extraire title
        const titleMatch = iframeTag.match(/title=["']([^"']+)["']/i);
        const title = titleMatch?.[1];

        console.log("Extracted from iframe:", { src, title });

        if (src) {
          const mediaType = getMediaType(src);
          if (mediaType) {
            extractedMedia.push({ src, title, type: mediaType });
          }
        }
      });
    }

    // Supprimer les conteneurs d'iframes du HTML
    // 1. Supprimer les divs contenant des iframes
    modifiedContent = modifiedContent.replace(
      /<div[^>]*>[\s\S]*?<iframe[\s\S]*?<\/iframe>[\s\S]*?<\/div>/gi,
      ""
    );

    // 2. Supprimer les figures contenant des iframes
    modifiedContent = modifiedContent.replace(
      /<figure[^>]*>[\s\S]*?<iframe[\s\S]*?<\/iframe>[\s\S]*?<\/figure>/gi,
      ""
    );

    // 3. Supprimer les iframes restantes
    modifiedContent = modifiedContent.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "");
    modifiedContent = modifiedContent.replace(/<iframe[^>]*\/>/gi, "");
    modifiedContent = modifiedContent.replace(/<iframe[^>]*>/gi, "");

    // 4. Chercher les liens YouTube
    const youtubeLinkPattern = /<a[^>]*href=["']([^"']*(?:youtube\.com|youtu\.be)[^"']*)["'][^>]*>([^<]*)<\/a>/gi;
    let linkMatch;

    while ((linkMatch = youtubeLinkPattern.exec(content)) !== null) {
      const href = linkMatch[1];
      const linkText = linkMatch[2];
      const videoId = extractYouTubeId(href);

      console.log("YouTube link found:", { href, linkText, videoId });

      if (videoId) {
        const embedSrc = `https://www.youtube.com/embed/${videoId}`;
        if (!extractedMedia.some((m) => m.src.includes(videoId))) {
          extractedMedia.push({
            src: embedSrc,
            title: linkText?.trim() || undefined,
            type: 'video',
          });
        }
      }
    }

    // 5. Supprimer les liens YouTube du contenu
    modifiedContent = modifiedContent.replace(
      /<a[^>]*href=["'][^"']*(?:youtube\.com|youtu\.be)[^"']*["'][^>]*>[^<]*<\/a>/gi,
      ""
    );

    // 6. Nettoyer les éléments vides
    modifiedContent = modifiedContent.replace(/<p[^>]*>\s*<\/p>/gi, "");
    modifiedContent = modifiedContent.replace(/<div[^>]*>\s*<\/div>/gi, "");

    console.log("Total extracted media:", extractedMedia.length, extractedMedia);
    console.log("Scraped media from server:", scrapedMedia.length, scrapedMedia);

    setMedia(extractedMedia);
    setCleanedContent(modifiedContent);
    setIsProcessed(true);
  }, [content, scrapedMedia]);

  // Styliser le contenu après le rendu
  useEffect(() => {
    if (!contentRef.current || !isProcessed) return;

    const container = contentRef.current;

    // Liens externes
    container.querySelectorAll("a").forEach((link) => {
      link.classList.add("text-primary", "hover:underline", "transition-colors");
      if (link.hostname !== window.location.hostname) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });

    // Images
    container.querySelectorAll("img").forEach((img) => {
      img.classList.add("my-4", "w-full", "h-auto");
      if (img.parentElement?.tagName !== "FIGURE") {
        const figure = document.createElement("figure");
        figure.className = "my-8";
        img.parentNode?.insertBefore(figure, img);
        figure.appendChild(img);
        if (img.alt) {
          const figcaption = document.createElement("figcaption");
          figcaption.className = "text-sm text-muted-foreground text-center mt-2";
          figcaption.textContent = img.alt;
          figure.appendChild(figcaption);
        }
      }
    });

    // Citations
    container.querySelectorAll("blockquote").forEach((quote) => {
      quote.classList.add(
        "border-l-4",
        "border-primary",
        "pl-6",
        "py-2",
        "my-6",
        "italic",
        "text-muted-foreground"
      );
    });

    // Listes
    container.querySelectorAll("ul, ol").forEach((list) => {
      list.classList.add("my-4", "space-y-2", "ml-6");
    });

    // Titres
    container.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
      heading.classList.add("font-bold", "mt-12", "mb-6", "leading-tight");
    });

    // Paragraphes
    container.querySelectorAll("p").forEach((p) => {
      p.classList.add("mb-6");
      p.style.lineHeight = "2.2";
    });

    // Tableaux
    container.querySelectorAll("table").forEach((table) => {
      table.classList.add("w-full", "my-8", "border-collapse");
      if (!table.parentElement?.classList.contains("table-container")) {
        const wrapper = document.createElement("div");
        wrapper.className = "table-container overflow-x-auto";
        table.parentNode?.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });

    container.querySelectorAll("th").forEach((th) => {
      th.classList.add("border", "border-border", "px-4", "py-2", "bg-muted", "font-semibold");
    });

    container.querySelectorAll("td").forEach((td) => {
      td.classList.add("border", "border-border", "px-4", "py-2");
    });

    // Code
    container.querySelectorAll("pre").forEach((pre) => {
      pre.classList.add("bg-muted", "p-4", "my-4", "overflow-x-auto", "text-sm");
    });

    container.querySelectorAll("code").forEach((code) => {
      if (code.parentElement?.tagName !== "PRE") {
        code.classList.add("bg-muted", "px-2", "py-1", "text-sm", "font-mono");
      }
    });
  }, [isProcessed, cleanedContent]);

  return (
    <>
      <div className="max-w-4xl mx-auto mt-12 border-t border-white/20 pt-8" />
      {/* Contenu principal */}
      <div
        ref={contentRef}
        className={cn(
          "max-w-4xl mx-auto p-8",
          "prose prose-lg dark:prose-invert",
          "prose-headings:font-bold prose-headings:tracking-tight prose-headings:mt-12 prose-headings:mb-6 prose-headings:leading-tight",
          "prose-p:mb-6",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
          "prose-strong:font-bold",
          "prose-code:text-primary prose-code:before:content-none prose-code:after:content-none",
          "prose-pre:bg-muted",
          "prose-blockquote:border-primary prose-blockquote:my-8",
          "prose-img:shadow-lg prose-img:my-8",
          "prose-ul:my-6 prose-ol:my-6",
          className
        )}
        style={{ lineHeight: "2.2" }}
        dangerouslySetInnerHTML={{ __html: cleanedContent }}
      />

      {/* Section des médias embarqués */}
      {isProcessed && media.length > 0 && (
        <div className="max-w-4xl mx-auto mt-12 border-t border-white/20 pt-8">
          <h3 className="text-2xl font-bold mb-6">Médias</h3>
          <div className="grid grid-cols-1 gap-6">
            {media.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "relative p-6 group flex flex-col not-prose",
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
                <div className={cn(
                  "relative w-full",
                  item.type === 'podcast' ? 'aspect-[3/1]' : 'aspect-video'
                )}>
                  <iframe
                    src={item.src}
                    title={item.title || `${item.type === 'podcast' ? 'Podcast' : 'Vidéo'} ${index + 1}`}
                    className="absolute inset-0 w-full h-full"
                    allow={item.type === 'podcast' 
                      ? "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      : "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    }
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                {item.title && (
                  <p className="text-sm text-muted-foreground mt-4">{item.title}</p>
                )}
                {item.type === 'podcast' && (
                  <span className="absolute top-2 right-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                    🎙️ Podcast
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
