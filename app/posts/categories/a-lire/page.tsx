import Hero from "@/components/hero";
import { Section, Container } from "@/components/craft";
import type { Metadata } from "next";
import { decodeHtmlEntities } from '@/lib/metadata';
import { PostsArchive } from "@/components/posts/posts-archive";
import { getCategoryBySlug } from "@/lib/wordpress";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: decodeHtmlEntities("À LIRE"),
  description: "Sélection d'articles, livres et documents à ne pas manquer",
  alternates: {
    canonical: "/posts/categories/a-lire",
  },
};

export default async function ALireCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  
  // Vérifier que la catégorie existe
  const category = await getCategoryBySlug("a-lire");
  
  return (
    <>
      <div className="bg-(--color-red) mt-4">
        <Hero
          titre="À LIRE"
          sousTitre="Sélection d'articles, livres et documents à ne pas manquer"
          className="text-black"
        />
      </div>
    <Section>
      <Container className="mt-8">
        <PostsArchive 
          category={category?.id ? String(category.id) : undefined}
          page={page}
          baseUrl="/posts/categories/a-lire"
          emptyMessage="Aucun article disponible pour le moment." 
        />
      </Container>
    </Section>
    </>
  );
}
