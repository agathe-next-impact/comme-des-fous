import { PostsArchive } from "@/components/posts/posts-archive";
import { getTagBySlug, getPostBySlug } from "@/lib/wordpress";
import { Section, Container } from "@/components/craft";
import Hero from "@/components/hero";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Post from "@/app/posts/[slug]/page";

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
      <Section>
        <Container>
          <Hero
            titre={tag.name}
            sousTitre={`Retrouvez tous les articles liés au tag "${tag.name}"`}
          />
        </Container>
        <Container className="mt-8">
          <PostsArchive
            tag={String(tag.id)}
            page={page}
            baseUrl={`/${slug}`}
            emptyMessage="Aucun article disponible pour ce tag."
          />
        </Container>
      </Section>
    );
  }
  
  // Sinon, essayer de trouver un article
  const post = await getPostBySlug(slug);
  if (post) {
    // Rediriger vers le composant Post existant
    return <Post params={Promise.resolve({ slug })} />;
  }
  
  // Si rien n'est trouvé, retourner 404
  notFound();
}
