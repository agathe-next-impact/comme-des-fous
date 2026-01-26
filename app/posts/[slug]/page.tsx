import {
  getPostBySlug,
  getFeaturedMediaById,
  getAuthorById,
  getCategoryById,
  getTagById,
  getAllPostSlugs,
  scrapePostEmbeddedMedia,
  getPostComments,
} from "@/lib/wordpress";
import { generateContentMetadata, stripHtml, decodeHtmlEntities } from "@/lib/metadata";
import { Section, Container, Article, Prose } from "@/components/craft";
import Image from "next/image";
import dynamic from "next/dynamic";
import { PostContent } from "@/components/posts/post-content";

// ✅ Lazy loading des composants non critiques pour réduire le bundle initial
const RelatedPosts = dynamic(
  () => import("@/components/posts/related-posts").then(mod => ({ default: mod.RelatedPosts })),
  { loading: () => <div className="h-48 animate-pulse bg-white/5 rounded-lg" /> }
);

const CommentsList = dynamic(
  () => import("@/components/posts/comments-list").then(mod => ({ default: mod.CommentsList })),
  { loading: () => <div className="h-32 animate-pulse bg-white/5 rounded-lg" /> }
);

const CommentForm = dynamic(
  () => import("@/components/posts/comment-form").then(mod => ({ default: mod.CommentForm })),
  { loading: () => <div className="h-24 animate-pulse bg-white/5 rounded-lg" /> }
);

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Hero from "@/components/hero";

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  // Limite à 20 posts maximum
  return slugs.slice(0, 20);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {};
  }

  // Extraction de l'URL de l'image mise en avant via les données embedded
  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  return generateContentMetadata({
    title: post.title.rendered,
    description: post.excerpt?.rendered 
      ? stripHtml(post.excerpt.rendered) 
      : stripHtml(post.content.rendered).slice(0, 200) + "...",
    slug: post.slug,
    basePath: "posts",
    imageUrl, // On passe l'URL ici
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // ✅ Paralléliser tous les appels indépendants pour améliorer les performances
  const [featuredMedia, author, category, tags, scrapedMedia, comments] = await Promise.all([
    post.featured_media ? getFeaturedMediaById(post.featured_media) : null,
    getAuthorById(post.author),
    post.categories?.length ? getCategoryById(post.categories[0]) : null,
    post.tags?.length 
      ? Promise.all(post.tags.map(tagId => getTagById(tagId))).then(t => t.filter(Boolean))
      : [],
    scrapePostEmbeddedMedia(post.link),
    getPostComments(post.id),
  ]);

  const date = new Date(post.date).toLocaleDateString("fr-FR", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mt-4 md:mt-14">
        <Hero
          titre={decodeHtmlEntities(post.title.rendered)}
          sousTitre=""
        />

          <Container className="w-full mt-4 md:mt-8">
              <div className="w-full flex flex-col md:flex-row items-center justify-between md:gap-4 md:mb-4">
                <div>
                <div className="flex justify-between items-center gap-4 md:mb-4 pb-4">
                  <div className="flex gap-2 items-center">
                    {category && (
                      <span className="text-(--color-red) pt-0.5 pb-1 px-2 hover:text-white border border-(--color-red) transition-colors">
                        {category.name}
                      </span>
                    )}
                  </div>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 md:mb-4 pb-4">
                    {tags.map((tag) => (
                      <a 
                        key={tag.id}
                        href={`/${tag.slug}`}
                        className="text-sm text-(--color-blue) px-2 pt-0.5 pb-1 hover:text-white hover:bg-(--color-blue) border border-(--color-blue) transition-colors"
                      >
                        {tag.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              {featuredMedia?.source_url && (
              <div className="w-full flex justify-end">
                <Image
                  src={featuredMedia?.source_url || "/logo.png"}
                  alt={featuredMedia?.alt_text || "Featured media"}
                  width={250}
                  height={250}
                  className="w-full md:w-fit object-cover rounded-md"
                />
              </div>
              )}
              </div>
                
                <PostContent content={post.content.rendered} scrapedMedia={scrapedMedia} />
                <CommentsList comments={comments} />
                <CommentForm postId={post.id} />
                <RelatedPosts categoryId={category?.id} currentPostId={post.id} />
            </Container>
    </div>


      );
}
