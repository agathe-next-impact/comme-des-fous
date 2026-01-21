import { PostsArchive } from "@/components/posts/posts-archive";
import { getTagBySlug, getPostBySlug, getPageBySlug } from "@/lib/wordpress";
import { Section, Container } from "@/components/craft";
import Hero from "@/components/hero";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Post from "@/app/posts/[slug]/page";
// import Prose from "@/components/craft/prose";
import Image from "next/image";
import PageContent from "@/components/pages/page-content";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Essayer de trouver un tag
  const tag = await getTagBySlug(slug);
  if (tag) {
    return {
      title: `${tag.name}`,
      description: `Parcourez les articles, actualités et ressources associés au tag ${tag.name}.`,
      alternates: {
        canonical: `/${slug}`,
      },
    };
  }

  // Essayer de trouver un article
  const post = await getPostBySlug(slug);
  if (post) {
    return {
      title: post.title.rendered,
      description: post.excerpt.rendered.replace(/<[^>]*>/g, "").substring(0, 160),
      alternates: {
        canonical: `/${slug}`,
      },
    };
  }

  // Essayer de trouver une page WordPress
  const page = await getPageBySlug(slug);
  if (page) {
    return {
      title: page.title.rendered,
      description: page.excerpt?.rendered
        ? page.excerpt.rendered.replace(/<[^>]*>/g, "").substring(0, 160)
        : page.content.rendered.replace(/<[^>]*>/g, "").substring(0, 160),
      alternates: {
        canonical: `/${slug}`,
      },
    };
  }

  return {
    title: "Page non trouvée",
  };
}

export default async function DynamicSlugPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const pageParams = await searchParams;
  const page = pageParams.page ? parseInt(pageParams.page) : 1;

  // Essayer de trouver un tag d'abord
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
            page={page}
            baseUrl={`/${slug}`}
            emptyMessage="Aucun article disponible pour ce tag."
          />
        </Container>
      </div>
    );
  }

  // Sinon, essayer de trouver un article
  const post = await getPostBySlug(slug);
  if (post) {
    // Rediriger vers le composant Post existant
    return <Post params={Promise.resolve({ slug })} />;
  }

  // Sinon, essayer de trouver une page WordPress
  const wpPage = await getPageBySlug(slug);
  if (wpPage) {
    return (

        <PageContent page={wpPage} />
    );
  }

  // Si rien n'est trouvé, retourner 404
  notFound();
}
