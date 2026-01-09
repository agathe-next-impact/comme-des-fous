"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Post } from "@/lib/wordpress.d";
import { DecodeFr } from "@/components/decode-fr";
import { cn } from "@/lib/utils";
import { truncateHtml } from "@/lib/metadata";

export function PostCard({ post, index }: { post: Post; index?: number }) {
  const [imageError, setImageError] = useState(false);
  // Use embedded data instead of separate API calls
  const media = post._embedded?.["wp:featuredmedia"]?.[0] ?? null;
  const category = post._embedded?.["wp:term"]?.[0]?.[0] ?? null;
  const date = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Extract embedded YouTube videos only
  const extractEmbeddedMedia = (content: string) => {
    // Check for iframe and only allow YouTube
    const iframeMatch = content.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/i);
    if (iframeMatch) {
      const url = iframeMatch[1];
      // Only embed YouTube videos
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return { type: 'youtube', url };
      }
    }
    
    return null;
  };

  const embeddedMedia = extractEmbeddedMedia(post.content?.rendered || '');

  // Generate random color for posts without media
  const getRandomColor = (postId: number) => {
    const colors = [
      'var(--color-yellow)',
      'var(--color-red)',
      'var(--color-blue)',
      'var(--color-green)'
    ];
    return colors[postId % colors.length];
  };

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
        <div className="w-full aspect-video overflow-hidden relative flex items-center justify-center bg-muted">
          {embeddedMedia && embeddedMedia.type === 'youtube' ? (
            <iframe
              src={embeddedMedia.url}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
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
              className="absolute inset-0 w-full h-full"
              style={{ backgroundColor: getRandomColor(post.id) }}
            />
          )}
        </div>
        <h3 className="text-2xl font-medium">
          <DecodeFr>{post.title.rendered}</DecodeFr>
        </h3>
        <div className="text-sm" style={{ fontFamily: 'Host Grotesk, sans-serif' }}>
          {post.excerpt?.rendered
            ? <DecodeFr>{truncateHtml(post.excerpt.rendered, 12)}</DecodeFr>
            : "No excerpt available"}
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t-[1px] border-t-white/30 pt-4">
        <div className="flex justify-between items-center text-xs">
          <p><DecodeFr>{category?.name || "Uncategorized"}</DecodeFr></p>
          <p>{date}</p>
        </div>
      </div>
    </Link>
  );
}
