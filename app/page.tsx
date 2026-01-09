// Craft Imports
import { Section, Container } from "@/components/craft";
import Hero from "@/components/hero";
// Next.js Imports
import Link from "next/link";

// Icons
import { File, Pen, Tag, Diamond, User, Folder } from "lucide-react";
import { LastArticleSection } from "@/components/last-article-section";
import { getLatestStickyPost, getCategoryById, getTagById } from "@/lib/wordpress";


export default async function Home() {
  // Récupère le dernier article sticky ou publié
  const post = await getLatestStickyPost();

  let article = undefined;
  if (post) {
    // Récupère les catégories et tags (noms)
    let categories: string[] = [];
    let tags: string[] = [];
    if (post.categories && post.categories.length > 0) {
      categories = await Promise.all(post.categories.map(async (catId) => {
        const cat = await getCategoryById(catId);
        return cat?.name || "";
      }));
    }
    if (post.tags && post.tags.length > 0) {
      tags = await Promise.all(post.tags.map(async (tagId) => {
        const tag = await getTagById(tagId);
        return tag?.name || "";
      }));
    }
    // Image principale
    let imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder.jpg";
    article = {
      title: post.title.rendered,
      excerpt: post.excerpt.rendered.replace(/<[^>]+>/g, ""),
      categories,
      tags,
      imageUrl,
      link: `/posts/${post.slug}`,
    };
  }

  return (
    <Section>
      <Container>
        <main className="bg-[var(--bg-main)] text-[var(--text-main)]">
          <Hero titre="COMME DES FOUS" />
          {article && <LastArticleSection article={article} />}
        </main>
      </Container>
    </Section>
  );
}

