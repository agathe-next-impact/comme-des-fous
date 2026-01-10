import { PostsArchive } from "@/components/posts/posts-archive";
import { getCategoryBySlug, getTagBySlug } from "@/lib/wordpress";
import { Section, Container } from "@/components/craft";
import Hero from "@/components/hero";
import type { Metadata } from "next";

export const revalidate = 3600;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  return {
    title: `Articles avec le tag : ${tag?.name}`,
    description: `Parcourez les articles, actualités et ressources associés au tag ${tag?.name}.`,
    alternates: {
      canonical: `/posts/tags/${slug}`,
    },
  };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const pageParams = await searchParams;
  const page = pageParams.page ? parseInt(pageParams.page) : 1;
  const tag = await getTagBySlug(slug);

  return (
    <Section>
      <Container>
        <Hero
          titre={`${tag?.name}`}
          sousTitre={`Retrouvez tous les articles "${tag?.name}"`}
        />
      </Container>
      <Container className="mt-8">
        <PostsArchive
          tag={tag?.id ? String(tag.id) : undefined}
          page={page}
          baseUrl={`/${slug}`}
          emptyMessage="Aucun article disponible pour ce tag."
        />
      </Container>
    </Section>
  );
}
