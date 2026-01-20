"use client";

import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

interface PostContentProps {
  content: string;
  className?: string;
  scrapedMedia?: { src: string; title?: string; type?: 'video' | 'podcast' }[];
}

interface EmbeddedMedia {
  src: string;
  title?: string;
  type: 'video' | 'podcast' | 'social';
  platform?: 'instagram' | 'tiktok' | 'twitter' | 'facebook';
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

function getSocialEmbed(url: string): { src: string; platform?: EmbeddedMedia['platform'] } | null {
  const lower = url.toLowerCase();

  if (lower.includes('instagram.com')) {
    const match = url.match(/instagram\.com\/(p|reel|tv)\/([^/?#]+)/i);
    if (match) {
      return { src: `https://www.instagram.com/${match[1]}/${match[2]}/embed`, platform: 'instagram' };
    }
  }

  if (lower.includes('tiktok.com')) {
    const match = url.match(/tiktok\.com\/.+\/video\/(\d+)/i);
    if (match) {
      return { src: `https://www.tiktok.com/embed/v2/${match[1]}`, platform: 'tiktok' };
    }
  }

  if (lower.includes('twitter.com') || lower.includes('x.com')) {
    return { src: `https://twitframe.com/show?url=${encodeURIComponent(url)}`, platform: 'twitter' };
  }

  if (lower.includes('facebook.com')) {
    return { src: `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`, platform: 'facebook' };
  }

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

function getMediaKey(src: string): string {
  const lower = src.toLowerCase();
  const ytId = extractYouTubeId(lower);
  if (ytId) return `yt:${ytId}`;

  const insta = lower.match(/instagram\.com\/(p|reel|tv)\/([^/?#]+)/i);
  if (insta?.[2]) return `ig:${insta[2]}`;

  const tiktok = lower.match(/tiktok\.com\/.+\/video\/(\d+)/i);
  if (tiktok?.[1]) return `tt:${tiktok[1]}`;

  const twitter = lower.match(/https?:\/\/(?:www\.)?(twitter\.com|x\.com)\/[^\s?#]+/i);
  if (twitter) return `tw:${lower}`;

  const facebook = lower.match(/facebook\.com\//i);
  if (facebook) return `fb:${lower}`;

  return lower;
}

function processContent(
  content: string,
  scrapedMedia: { src: string; title?: string; type?: 'video' | 'podcast' }[]
): { media: EmbeddedMedia[]; cleanedContent: string } {
  const extractedMedia: EmbeddedMedia[] = [];
  const seen = new Set<string>();
  const addMedia = (item: EmbeddedMedia) => {
    const key = getMediaKey(item.src);
    if (seen.has(key)) return;
    seen.add(key);
    extractedMedia.push(item);
  };

  scrapedMedia.forEach((m) => {
    addMedia({
      src: m.src,
      title: m.title,
      type: (m.type as EmbeddedMedia['type']) || getMediaType(m.src) || 'video',
    });
  });

  let modifiedContent = content;

  const iframePattern = /<iframe[^>]*>/gi;
  const iframeMatches = content.match(iframePattern);

  if (iframeMatches) {
    iframeMatches.forEach((iframeTag) => {
      const srcMatch = iframeTag.match(/src=["']([^"']+)["']/i);
      const src = srcMatch?.[1];
      const titleMatch = iframeTag.match(/title=["']([^"']+)["']/i);
      const title = titleMatch?.[1];

      if (src) {
        const mediaType = getMediaType(src);
        if (mediaType) {
          addMedia({ src, title, type: mediaType });
        }
      }
    });
  }

  modifiedContent = modifiedContent.replace(
    /<div[^>]*>[\s\S]*?<iframe[\s\S]*?<\/iframe>[\s\S]*?<\/div>/gi,
    ""
  );
  modifiedContent = modifiedContent.replace(
    /<figure[^>]*>[\s\S]*?<iframe[\s\S]*?<\/iframe>[\s\S]*?<\/figure>/gi,
    ""
  );
  modifiedContent = modifiedContent.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "");
  modifiedContent = modifiedContent.replace(/<iframe[^>]*\/>/gi, "");
  modifiedContent = modifiedContent.replace(/<iframe[^>]*>/gi, "");

  const youtubeLinkPattern = /<a[^>]*href=["']([^"']*(?:youtube\.com|youtu\.be)[^"']*)["'][^>]*>([^<]*)<\/a>/gi;
  let linkMatch;

  while ((linkMatch = youtubeLinkPattern.exec(content)) !== null) {
    const href = linkMatch[1];
    const linkText = linkMatch[2];
    const videoId = extractYouTubeId(href);

    if (videoId) {
      const embedSrc = `https://www.youtube.com/embed/${videoId}`;
      addMedia({
        src: embedSrc,
        title: linkText?.trim() || undefined,
        type: 'video',
      });
    }
  }

  modifiedContent = modifiedContent.replace(
    /<a[^>]*href=["'][^"']*(?:youtube\.com|youtu\.be)[^"']*["'][^>]*>[^<]*<\/a>/gi,
    ""
  );

  const socialLinkPattern = /<a[^>]*href=["']([^"']*(?:instagram\.com|tiktok\.com|twitter\.com|x\.com|facebook\.com)[^"']*)["'][^>]*>([^<]*)<\/a>/gi;
  let socialMatch;

  while ((socialMatch = socialLinkPattern.exec(content)) !== null) {
    const href = socialMatch[1];
    const linkText = socialMatch[2];
    const embed = getSocialEmbed(href);

    if (embed) {
      addMedia({
        src: embed.src,
        title: linkText?.trim() || undefined,
        type: 'social',
        platform: embed.platform,
      });
    }
  }

  modifiedContent = modifiedContent.replace(
    /<a[^>]*href=["'][^"']*(?:instagram\.com|tiktok\.com|twitter\.com|x\.com|facebook\.com)[^"']*["'][^>]*>[^<]*<\/a>/gi,
    ""
  );

  // Supprimer blockquotes et scripts d'embed sociaux (Instagram, Twitter/X, TikTok, Facebook)
  modifiedContent = modifiedContent.replace(
    /<blockquote[^>]*(?:instagram-media|twitter\-tweet|tiktok\-embed|data-instgrm-permalink|instagram\.com|tiktok\.com|twitter\.com|x\.com|facebook\.com)[\s\S]*?<\/blockquote>/gi,
    ""
  );
  modifiedContent = modifiedContent.replace(
    /<script[^>]*src=["'][^"']*(instagram\.com|platform\.twitter\.com|tiktok\.com|connect\.facebook\.net)[^"']*["'][^>]*>[\s\S]*?<\/script>/gi,
    ""
  );

  // Supprimer les paragraphes contenant uniquement une URL de media/social
  const mediaUrlParagraphPattern = /<p[^>]*>\s*https?:\/\/[\w.-]+[^\s<>"]*(?:youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|instagram\.com|tiktok\.com|twitter\.com|x\.com|facebook\.com)[^\s<>"]*\s*<\/p>/gi;
  modifiedContent = modifiedContent.replace(mediaUrlParagraphPattern, "");

  modifiedContent = modifiedContent.replace(/<p[^>]*>\s*<\/p>/gi, "");
  modifiedContent = modifiedContent.replace(/<div[^>]*>\s*<\/div>/gi, "");

  return { media: extractedMedia, cleanedContent: modifiedContent };
}

export function PostContent({ content, className, scrapedMedia = [] }: PostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { media, cleanedContent } = useMemo(
    () => processContent(content, scrapedMedia),
    [content, scrapedMedia]
  );

  useEffect(() => {
    if (!contentRef.current) return;

    const container = contentRef.current;

    container.querySelectorAll("a").forEach((link) => {
      link.style.color = "var(--color-red)";
      link.style.textDecoration = "underline";
      link.style.textDecorationThickness = "2px";
      link.style.textUnderlineOffset = "4px";
      link.style.transition = "color 150ms ease";

      if (link.hostname !== window.location.hostname) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });

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

    container.querySelectorAll("ul, ol").forEach((list) => {
      list.classList.add("my-4", "space-y-2", "ml-6");
    });

    container.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
      heading.classList.add("font-bold", "mt-12", "mb-6", "leading-tight");
    });

    container.querySelectorAll("p").forEach((p) => {
      p.classList.add("mb-6");
      p.style.lineHeight = "2.2";
    });

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

    container.querySelectorAll("pre").forEach((pre) => {
      pre.classList.add("bg-muted", "p-4", "my-4", "overflow-x-auto", "text-sm");
    });

    container.querySelectorAll("code").forEach((code) => {
      if (code.parentElement?.tagName !== "PRE") {
        code.classList.add("bg-muted", "px-2", "py-1", "text-sm", "font-mono");
      }
    });
  }, [cleanedContent]);

  return (
    <>
      <div className="max-w-4xl mx-auto mt-12 border-t border-white/20 pt-8" />
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

      {media.length > 0 && (
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
                  item.type === 'podcast'
                    ? 'aspect-[3/1]'
                    : item.type === 'social'
                      ? 'aspect-[4/5]'
                      : 'aspect-video'
                )}>
                  <iframe
                    src={item.src}
                    title={item.title || `${item.type === 'podcast' ? 'Podcast' : item.type === 'social' ? 'Social' : 'Vidéo'} ${index + 1}`}
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
                {item.type === 'social' && (
                  <span className="absolute top-2 right-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                    # {item.platform || 'Social'}
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
