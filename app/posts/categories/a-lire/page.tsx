import Hero from "@/components/hero";
import { Section, Container } from "@/components/craft";
import type { Metadata } from "next";
import { PostsArchive } from "@/components/posts/posts-archive";
import { getCategoryBySlug } from "@/lib/wordpress";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "À LIRE",
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
  
  console.log("Category Debug:", { 
    slug: "a-lire", 
    id: category?.id, 
    page 
  });
  
  return (
    <Section>
      <Container className="bg-(--color-red)">
        <Hero
          titre="À LIRE"
          sousTitre="Sélection d'articles, livres et documents à ne pas manquer"
          className="text-black"
        />
      </Container>
      <Container className="mt-8">
        <PostsArchive 
          category={category?.id ? String(category.id) : undefined}
          page={page}
          baseUrl="/posts/categories/a-lire"
          emptyMessage="Aucun article disponible pour le moment." 
        />
      </Container>
    </Section>
  );
}
