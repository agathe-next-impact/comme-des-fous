"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import { Post } from "@/lib/wordpress.d";
import { DecodeFr } from "@/components/decode-fr";
import { cn } from "@/lib/utils";
import { truncateHtml } from "@/lib/metadata";

interface ScrapedMedia {
  src: string;
  title?: string;
  type?: "video" | "podcast";
}

// Podcast platforms detection
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
  "mixcloud.com",
];

const isPodcastUrl = (url: string) => {
  const lower = url.toLowerCase();
  // Mixcloud: match all widget/iframe embeds and all mixcloud.com subdomains
  if (lower.includes("mixcloud.com/widget/iframe")) return true;
  if (/https?:\/\/(www\.)?mixcloud\.com\//.test(lower)) return true;
  return PODCAST_PLATFORMS.some((p) => lower.includes(p));
};
const isYoutubeUrl = (url: string) =>
  url.includes("youtube.com") || url.includes("youtu.be");
const getMediaType = (url: string): "video" | "podcast" | null => {
  const lowerUrl = url.toLowerCase();
  if (
    ["youtube.com", "youtu.be", "vimeo.com", "dailymotion.com"].some((p) =>
      lowerUrl.includes(p)
    )
  )
    return "video";
  if (
    PODCAST_PLATFORMS.some((p) => lowerUrl.includes(p)) ||
    lowerUrl.includes("soundcloud.com") ||
    lowerUrl.includes("www.soundcloud.com")
  )
    return "podcast";
  return null;
};

export function PostCard({
  post,
  index,
  scrapedMedia,
}: {
  post: Post;
  index?: number;
  scrapedMedia?: ScrapedMedia[];
}) {
  const [imageError, setImageError] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [embeddedMedia, setEmbeddedMedia] = useState<{
    type: "youtube" | "podcast";
    url: string;
  } | null>(null);

  // Use embedded data instead of separate API calls
  const media = post._embedded?.["wp:featuredmedia"]?.[0] ?? null;
  const category = post._embedded?.["wp:term"]?.[0]?.[0] ?? null;
  const tags = post._embedded?.["wp:term"]?.[1] ?? [];

  const date = new Date(post.date).toLocaleDateString("fr-FR", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Extract embedded media from content or use scraped media
  useEffect(() => {
    // Priority 1: Use first video from scraped media
    if (scrapedMedia && scrapedMedia.length > 0) {
      const video = scrapedMedia.find(
        (m) => isYoutubeUrl(m.src) || m.type === "video"
      );
      if (video) {
        setEmbeddedMedia({ type: "youtube", url: video.src });
        return;
      }
      // Sinon podcast
      const podcast = scrapedMedia.find(
        (m) => isPodcastUrl(m.src) || m.type === "podcast"
      );
      if (podcast) {
        setEmbeddedMedia({ type: "podcast", url: podcast.src });
        return;
      }
    }

    // Priority 2: Check for first video iframe in content
    const content = post.content?.rendered || "";
    const iframeMatches = [
      ...content.matchAll(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi),
    ];
    if (iframeMatches.length > 0) {
      const videoIframe = iframeMatches.find((m) => isYoutubeUrl(m[1]));
      if (videoIframe) {
        setEmbeddedMedia({ type: "youtube", url: videoIframe[1] });
        return;
      }
      // Sinon podcast
      const podcastIframe = iframeMatches.find((m) => isPodcastUrl(m[1]));
      if (podcastIframe) {
        setEmbeddedMedia({ type: "podcast", url: podcastIframe[1] });
        return;
      }
    }

    // Priority 3: Scrape from public page if no media found and no featured image
    if (!media?.source_url) {
      scrapeMediaFromPost();
    }
  }, [post, scrapedMedia, media]);

  // Extract author name from embedded data
  const author =
    post._embedded?.author?.[0]?.name ||
    (typeof post.author === "string" ? post.author : "Inconnu");

  // Scrape media from public WordPress page
  const scrapeMediaFromPost = async () => {
    try {
      const response = await fetch(
        `/api/scrape-media?url=${encodeURIComponent(post.link)}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.media && data.media.length > 0) {
          // Use first media found
          const firstMedia = data.media[0];
          const type = isYoutubeUrl(firstMedia.src) ? "youtube" : "podcast";
          setEmbeddedMedia({ type, url: firstMedia.src });
        }
      }
    } catch (error) {
      console.error("Failed to scrape media:", error);
    }
  };

  // Generate random color for posts without media
  const colors = ["yellow", "red", "blue"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  // Helper for iframe error handling
  const handleIframeError = () => setIframeError(true);

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={cn(
        "relative p-6 group flex justify-between flex-col not-prose gap-8",
        "border-r border-b border-white/20",
        "hover:bg-white/5 transition-all duration-300",
        "before:absolute before:top-0 before:left-0 before:w-3 before:h-3",
        "before:border-t-2 before:border-l-2 before:border-yellow-500",
        "after:absolute after:bottom-0 after:right-0 after:w-3 after:h-3",
        "after:border-b-2 after:border-r-2 after:border-red-500",
        "before:transition-all before:duration-300 after:transition-all after:duration-300",
        "hover:before:w-6 hover:before:h-6 hover:after:w-6 hover:after:h-6"
      )}
    >
      <div className="flex flex-col gap-4">
        <div
          className={cn(
            "w-full overflow-hidden relative flex items-center justify-center bg-muted",
            embeddedMedia?.type === "podcast" ? "aspect-3/1" : "aspect-video"
          )}
        >
          {embeddedMedia && !iframeError && embeddedMedia.type === "youtube" ? (
            <iframe
              src={embeddedMedia.url}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={handleIframeError}
            />
          ) : embeddedMedia &&
            !iframeError &&
            embeddedMedia.type === "podcast" ? (
            <iframe
              src={embeddedMedia.url}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              onError={handleIframeError}
            />
          ) : embeddedMedia &&
            iframeError &&
            embeddedMedia.type === "podcast" ? (
            <a
              href={embeddedMedia.url}
              target="_blank"
              rel="noopener"
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-muted widget-404"
            >
              <img
                src="/_next/static/media/logo.d3ea090f.png"
                alt="Podcast"
                style={{ width: 80, height: 80 }}
              />
              <span className="mt-2 font-bold text-lg">
                Écouter sur la plateforme
              </span>
            </a>
          ) : media?.source_url && !imageError ? (
            <Image
              className="absolute inset-0 w-full h-full object-cover"
              src={media.source_url}
              alt={post.title?.rendered || "Post thumbnail"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="absolute inset-0 w-full h-full widget-404"
              style={{ backgroundColor: randomColor }}
            />
          )}
        </div>
        <h3 className="text-2xl font-title font-normal leading-snug letter-spacing-widest group-hover:underline">
          <DecodeFr>{post.title.rendered}</DecodeFr>
        </h3>
        <div
          className="text-sm"
        >
          {post.excerpt?.rendered ? (
            <DecodeFr>{truncateHtml(post.excerpt.rendered, 32)}</DecodeFr>
          ) : (
            ""
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-t-white/30 pt-4">
        <div className="flex justify-between items-center text-sm">
          {category && category.name && (
            <Link
              href={`/${category.slug}`}
              className="text-(--color-red) px-2 py-1 hover:text-white hover:bg-(--color-red) border border-(--color-red) transition-colors"
            >
              <DecodeFr>{category.name || "Uncategorized"}</DecodeFr>
            </Link>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag: any) => (
              <Link
                key={tag.id}
                href={`/posts/tags/${tag.slug}`}
                className="text-sm text-(--color-blue) px-2 pt-0.5 pb-1 hover:text-white border border-(--color-blue) hover:bg-(--color-blue) transition-colors"
              >
                <DecodeFr>{tag.name}</DecodeFr>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
