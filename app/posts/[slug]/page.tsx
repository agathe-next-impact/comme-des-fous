import {
  getPostBySlug,
  getFeaturedMediaById,
  getAuthorById,
  getCategoryById,
  getTagById,
  getAllPostSlugs,
  scrapePostEmbeddedMedia,
} from "@/lib/wordpress";
import { generateContentMetadata, stripHtml } from "@/lib/metadata";
import { Section, Container, Article, Prose } from "@/components/craft";
import { badgeVariants } from "@/components/ui/badge";
import { PostContent } from "@/components/posts/post-content";

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

  return generateContentMetadata({
    title: post.title.rendered,
    description: stripHtml(post.excerpt.rendered),
    slug: post.slug,
    basePath: "posts",
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

  return (
    <Section>
      <Container>
        <Hero
          titre={post.title.rendered}
          sousTitre=""
        />
      </Container>

          <Container className="mt-8">

                <div className="flex justify-between items-center gap-4 mb-4 pb-4">
                  <h5>
                    Publié {date} par{" "}
                    {author?.name ? (
                      <span>
                        {author.name}
                      </span>
                    ) : (
                      "Anonyme"
                    )}
                  </h5>
                  <div className="flex gap-2 items-center">
                    {category && (
                      <span className="text-(--color-red) pt-0.5 pb-1 px-2 rounded-full hover:text-white border border-(--color-red) transition-colors">
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
                        className="text-sm text-(--color-blue) px-2 pt-0.5 pb-1 rounded-full hover:text-white hover:bg-(--color-blue) border border-(--color-blue) transition-colors"
                      >
                        {tag.name}
                      </a>
                    ))}
                  </div>
                )}
                
                <PostContent content={post.content.rendered} scrapedMedia={scrapedMedia} />

            </Container>
          </Section>
      );
}
