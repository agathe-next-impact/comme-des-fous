import { PostsArchive } from "@/components/posts/posts-archive";
import { getTagBySlug, getPostBySlug, getPageBySlug, getAllTags, getAllPostSlugs } from "@/lib/wordpress";
import { Section, Container } from "@/components/craft";
import Hero from "@/components/hero";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Post from "@/app/posts/[slug]/page";
// import Prose from "@/components/craft/prose";
import Image from "next/image";
import PageContent from "@/components/pages/page-content";
import { generateContentMetadata, stripHtml, decodeHtmlEntities } from "@/lib/metadata";

export const revalidate = 3600;
// ✅ Forcer la génération dynamique pour les slugs non pré-générés
export const dynamicParams = true;

// ✅ Ne pas retourner de 404 si la page n'est pas pré-générée
export async function generateStaticParams() {
  // Retourner un tableau vide pour laisser ISR générer toutes les pages
  // Cela évite les 404 sur les pages non pré-générées
  return [];
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Essayer de trouver un tag
  const tag = await getTagBySlug(slug);
  if (tag) {
    return generateContentMetadata({
      title: tag.name,
      description: `Parcourez les articles, actualités et ressources associés au tag ${tag.name}.`,
      slug: slug,
    });
  }

  // Essayer de trouver un article
  const post = await getPostBySlug(slug);
  if (post) {
    return generateContentMetadata({
      title: post.title.rendered,
      description: post.excerpt.rendered 
        ? stripHtml(post.excerpt.rendered) 
        : stripHtml(post.content.rendered).slice(0, 200) + "...",
      slug: slug,
      content: post,
    });
  }

  // Essayer de trouver une page WordPress
  const page = await getPageBySlug(slug);
  if (page) {
    return generateContentMetadata({
      title: page.title.rendered,
      description: page.excerpt?.rendered 
        ? stripHtml(page.excerpt.rendered) 
        : stripHtml(page.content.rendered).slice(0, 200) + "...",
      slug: slug,
      content: page,
    });
  }

  return {
    title: "Page non trouvée",
  };
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // 1. D'abord chercher un tag
  const tag = await getTagBySlug(slug);
  if (tag) {
    return (
      <div className="mt-4">
        <Hero
          titre={tag.name}
          sousTitre={`Retrouvez tous les articles liés au tag "${tag.name}"`}
        />
        <Container className="mt-8">
          <PostsArchive
            tag={String(tag.id)}
            page={1}
            baseUrl={`/${slug}`}
            emptyMessage="Aucun article disponible pour ce tag."
          />
        </Container>
      </div>
    );
  }
  
  // 2. Ensuite chercher un post
  const post = await getPostBySlug(slug);
  if (post) {
    return <Post params={Promise.resolve({ slug })} />;
  }
  
  // 3. Enfin chercher une page
  const page = await getPageBySlug(slug);
  if (page) {
    return <PageContent page={page} />;
  }
  
  // ⚠️ Ne pas appeler notFound() si WordPress était indisponible
  // Utiliser une vérification plus robuste
  console.warn(`[SlugPage] No content found for slug: ${slug}`);
  notFound();
}
