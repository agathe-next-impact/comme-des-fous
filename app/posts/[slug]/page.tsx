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
import { PostContent } from "@/components/posts/post-content";
import { RelatedPosts } from "@/components/posts/related-posts";
import { CommentsList } from "@/components/posts/comments-list";
import { CommentForm } from "@/components/posts/comment-form";

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

  const featuredMedia = post.featured_media
    ? await getFeaturedMediaById(post.featured_media)
    : null;
  const author = await getAuthorById(post.author);
  const date = new Date(post.date).toLocaleDateString("fr-FR", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const category = post.categories?.length ? await getCategoryById(post.categories[0]) : undefined;
  
  // Récupérer tous les tags du post
  const tags = post.tags?.length 
    ? (await Promise.all(post.tags.map(tagId => getTagById(tagId)))).filter(Boolean)
    : [];

  // Scraper les médias embarqués depuis la page publique WordPress
  const scrapedMedia = await scrapePostEmbeddedMedia(post.link);

  // Récupérer les commentaires
  const comments = await getPostComments(post.id);

  return (
    <div className="mt-14">
        <Hero
          titre={decodeHtmlEntities(post.title.rendered)}
          sousTitre=""
        />

          <Container className="mt-8">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                <div className="flex justify-between items-center gap-4 mb-4 pb-4">
                  <div className="flex gap-2 items-center">
                    {category && (
                      <span className="text-(--color-red) pt-0.5 pb-1 px-2 hover:text-white border border-(--color-red) transition-colors">
                        {category.name}
                      </span>
                    )}
                  </div>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4 pb-4">
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
              <div className="text-sm text-muted-foreground">
                <Image
                  src={featuredMedia?.source_url || "/logo.png"}
                  alt={featuredMedia?.alt_text || "Featured media"}
                  width={250}
                  height={250}
                  className="object-cover rounded-md"
                />
              </div>
              </div>
                
                <PostContent content={post.content.rendered} scrapedMedia={scrapedMedia} />
                <CommentsList comments={comments} />
                <CommentForm postId={post.id} />
                <RelatedPosts categoryId={category?.id} currentPostId={post.id} />
            </Container>
    </div>


      );
}
