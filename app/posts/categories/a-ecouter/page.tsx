import Hero from "@/components/hero";
import { Section, Container } from "@/components/craft";
import { PodcastFeed } from "@/components/podcast-feed";
import { PostsArchive } from "@/components/posts/posts-archive";
import { getCategoryBySlug } from "@/lib/wordpress";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "À ÉCOUTER",
  description: "Sélection de podcasts, musiques et enregistrements audio à ne pas manquer",
  alternates: {
    canonical: "/posts/categories/a-ecouter",
  },
};

export default async function AEcouterCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  
  // Vérifier que la catégorie existe
  const category = await getCategoryBySlug("a-ecouter");

  
  return (
    <Section>
      <Container className="bg-(--color-blue)">
        <Hero 
          titre="À ÉCOUTER" 
          sousTitre="Sélection de podcasts, musiques et enregistrements audio à ne pas manquer" 
          className="text-black"
        />
      </Container>
      <Container className="mt-8">
        <PodcastFeed feedUrl="https://feeds.acast.com/public/shows/comme-des-fous" maxEpisodes={15} />
        <PostsArchive 
          category={category?.id ? String(category.id) : undefined}
          page={page}
          baseUrl="/posts/categories/a-ecouter"
          emptyMessage="Aucun article audio disponible pour le moment." 
        />
      </Container>
    </Section>
  );
}
