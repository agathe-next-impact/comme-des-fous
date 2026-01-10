import Hero from "@/components/hero";
import { Section, Container } from "@/components/craft";
import type { Metadata } from "next";
import { PostsArchive } from "@/components/posts/posts-archive";
import { getCategoryBySlug } from "@/lib/wordpress";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "À VOIR",
  description: "Sélection d'articles, livres et documents à ne pas manquer",
  alternates: {
    canonical: "/posts/categories/a-voir",
  },
};

export default async function AVoirCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  
  // Vérifier que la catégorie existe
  const category = await getCategoryBySlug("a-voir");

  
  return (
    <Section>
      <Container className="bg-(--color-yellow)">
        <Hero titre="À VOIR" sousTitre="Sélection de films, documentaires et vidéos à ne pas manquer" className="text-black"/>
      </Container>
      <Container className="mt-8">
        <PostsArchive 
          category={category?.id ? String(category.id) : undefined}
          page={page}
          baseUrl="/posts/categories/a-voir"
          emptyMessage="Aucun article vidéo disponible pour le moment." 
        />
      </Container>
    </Section>
  );
}
