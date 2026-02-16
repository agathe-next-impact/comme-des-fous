import React from "react";
import { extractMediaFromPost } from "@/lib/extract-media";
import { DecodeFr } from "./decode-fr";
import Link from "next/link";
import { truncateHtml } from "@/lib/utils";
import { getRecentPosts } from "@/lib/wordpress";
import { MediaFacade } from "./media-facade";
import Image from "next/image";

function getYoutubeId(url: string) {
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return (match && match[2].length === 11) ? match[2] : null;
}

interface TaxLink {
  id: number;
  name: string;
  slug: string;
}

interface Article {
  title: string;
  excerpt: string;
  categories: TaxLink[];
  tags: TaxLink[];
  imageUrl: string;
  link: string;
  mediaUrl?: string;
  mediaType?: "youtube" | "podcast";
  isPinned?: boolean;
  date?: string; // ISO string
}

// plus de props



async function fetchLastNonPinnedArticle(): Promise<Article | null> {
  const posts = await getRecentPosts();
  const nonPinned = posts.filter((p: any) => !p.sticky);
  if (nonPinned.length === 0) return null;
  nonPinned.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const post = nonPinned[0];
  if (!post) return null;

  // Extraction des catégories et tags avec slug et nom depuis _embedded.wp:term
  let categories: TaxLink[] = [];
  let tags: TaxLink[] = [];
  if (post._embedded && post._embedded["wp:term"]) {
    const terms = post._embedded["wp:term"];
    // Catégories
    if (Array.isArray(terms[0])) {
      categories = terms[0].map((cat: any) => ({ id: cat.id, name: cat.name, slug: cat.slug }));
    }
    // Tags
    if (Array.isArray(terms[1])) {
      tags = terms[1].map((tag: any) => ({ id: tag.id, name: tag.name, slug: tag.slug }));
    }
  }

  function getImageUrl(post: any): string {
    return post.featured_media?.source_url || "";
  }


  return {
    title: typeof post.title === "object" && post.title?.rendered ? post.title.rendered : String(post.title),
    excerpt: typeof post.excerpt === "object" && post.excerpt?.rendered ? post.excerpt.rendered : String(post.excerpt),
    categories,
    tags,
    imageUrl: getImageUrl(post),
    link: `/posts/${post.slug}`,
    isPinned: !!post.sticky,
    date: post.date,
  };
}




export default async function LastArticleSection() {
  const posts = await getRecentPosts();
  const nonPinned = posts.filter((p: any) => !p.sticky);
  if (nonPinned.length === 0) return null;
  nonPinned.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const post = nonPinned[0];
  if (!post) return null;

  let categories: TaxLink[] = [];
  let tags: TaxLink[] = [];
  if (post._embedded && post._embedded["wp:term"]) {
    const terms = post._embedded["wp:term"];
    if (Array.isArray(terms[0])) {
      categories = terms[0].map((cat: any) => ({ id: cat.id, name: cat.name, slug: cat.slug }));
    }
    if (Array.isArray(terms[1])) {
      tags = terms[1].map((tag: any) => ({ id: tag.id, name: tag.name, slug: tag.slug }));
    }
  }

  // Récupère l'image mise en avant via _embedded['wp:featuredmedia'][0].source_url si disponible
  let imageUrl = "";
  if (post._embedded && post._embedded["wp:featuredmedia"] && post._embedded["wp:featuredmedia"][0]?.source_url) {
    imageUrl = post._embedded["wp:featuredmedia"][0].source_url;
  }

  // Extraction du media embarqué via l'utilitaire partagé
  const { mediaUrl, mediaType } = extractMediaFromPost(post);
  const embeddedMedia = mediaUrl && mediaType ? { type: mediaType, url: mediaUrl } : null;

  const article: Article = {
    title: typeof post.title === "object" && post.title?.rendered ? post.title.rendered : String(post.title),
    excerpt: typeof post.excerpt === "object" && post.excerpt?.rendered ? post.excerpt.rendered : String(post.excerpt),
    categories,
    tags,
    imageUrl,
    link: `/posts/${post.slug}`,
    isPinned: !!post.sticky,
    date: post.date,
    mediaUrl: embeddedMedia?.url,
    mediaType: embeddedMedia?.type,
  };

  let illustration: React.ReactNode = null;
  if (embeddedMedia) {
    let posterUrl = article.imageUrl;
    if (embeddedMedia.type === "youtube") {
      const videoId = getYoutubeId(embeddedMedia.url);
      if (videoId) {
        posterUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }

    illustration = (
      <MediaFacade
        mediaUrl={embeddedMedia.url}
        mediaType={embeddedMedia.type}
        posterUrl={posterUrl}
        title={article.title}
      />
    );
  } else if (article.imageUrl) {
    illustration = (
      <Image
        src={article.imageUrl}
        alt={article.title}
        fill
        className="object-cover shadow-md"
        sizes="(max-width: 768px) 100vw, 66vw"
        priority
      />
    );
  }
  return (
    <section className="flex flex-col md:flex-row gap-8 items-stretch w-full pb-8">
      {/* Left: Infos */}
      <div className="md:w-1/3 flex flex-col justify-between gap-4 py-4 border-y border-red-500">
        <div>
          <Link href={article.link} className="hover:underline">
            <h2 className="text-2xl md:text-4xl font-title font-normal leading-snug letter-spacing-widest group-hover:underline mb-2"><DecodeFr>{article.title}</DecodeFr></h2>
          </Link>
          <p className="text-base text-muted-foreground mb-4"><DecodeFr>{truncateHtml(article.excerpt, 40)}</DecodeFr></p>
        </div>
        <div>
            <div className="flex flex-wrap gap-2">
              {article.categories.slice(0, 1).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/posts/categories/${encodeURIComponent(cat.slug)}`}
                  className="text-sm text-(--color-red) border border-(--color-red) mb-4 px-2 py-1 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/${encodeURIComponent(tag.slug)}`}
                  className="text-sm text-(--color-yellow) border border-(--color-yellow) px-2 py-1 transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
        </div>
      </div>
      {/* Right: Image (2/3) */}
      <div className="md:w-2/3 flex items-center justify-center">
        <a href={article.link} className="block w-full h-full">
          <div className="w-full h-full min-h-60 md:min-h-80 lg:min-h-100 flex-1 relative">
            {illustration}
          </div>
        </a>
      </div>
    </section>
  );
}
