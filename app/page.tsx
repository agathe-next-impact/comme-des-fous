// Craft Imports
import { Section, Container } from "@/components/craft";
import Hero from "@/components/hero";

// Icons
import { LastArticleSection } from "@/components/last-article-section";
import { MostReadPostsList } from "@/components/posts/most-read-posts-list";
import DomeGallery from "@/components/ui/dome-gallery";
import Masonry from "@/components/ui/masonry";
import CollagesRow from "@/components/collages-row";
import { getLatestStickyPost, getCategoryById, getTagById } from "@/lib/wordpress";
import { extractMediaFromPost } from "@/lib/extract-media";
import fs from "fs";
import path from "path";


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
    const { mediaUrl, mediaType } = extractMediaFromPost(post);
    // Ensure mediaType is strictly 'youtube', 'podcast', or undefined (for TS)
    let validMediaType: "youtube" | "podcast" | undefined = undefined;
    if (mediaType === "youtube") validMediaType = "youtube";
    else if (mediaType === "podcast") validMediaType = "podcast";
    article = {
      title: post.title.rendered,
      excerpt: post.excerpt.rendered.replace(/<[^>]+>/g, ""),
      categories,
      tags,
      imageUrl,
      link: `/posts/${post.slug}`,
      mediaUrl,
      mediaType: validMediaType,
    };
  }

  const dir = path.join(process.cwd(), "public/all-of-fame");
  const files = fs.readdirSync(dir);
  const images = files
    .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
    .map((f) => ({
      src: `/all-of-fame/${f}`,
      alt: f,
    }));

  const stickersDir = path.join(process.cwd(), "public/stickers");
  const stickerFiles = fs.readdirSync(stickersDir);
  const stickerItems = stickerFiles
    .filter((f) => /\.(jpe?g|png|webp|gif|svg)$/i.test(f))
    .map((f, i) => ({
      id: `sticker-${i}`,
      img: `/stickers/${f}`,
      url: `/stickers/${f}`,
      height: 300 + Math.floor(Math.random() * 200), // hauteur aléatoire pour effet masonry
    }));

  const collagesDir = path.join(process.cwd(), "public/collages");
  const collageFiles = fs.readdirSync(collagesDir);
  const collagesItems = collageFiles
    .filter((f) => /\.(jpe?g|png|webp|gif|svg)$/i.test(f))
    .map((f, i) => ({
      id: `collage-${i}`,
      img: `/collages/${f}`,
      url: `/collages/${f}`,
      height: 300 + Math.floor(Math.random() * 200), // hauteur aléatoire pour effet masonry
    }));

  return (
    <>
    <Hero titre="COMME DES FOUS" sousTitre="Changer les regards sur la folie"/>
    <Section>
      <Container>
          {article && <LastArticleSection article={article} />}
          <MostReadPostsList />
           <CollagesRow items={collagesItems} titre="Collages" />
          <DomeGallery images={images} fit={0.75} />
      </Container>
    </Section>
    <Container className="pb-32">
          <Masonry items={stickerItems} titre="Sainte Anne est à nous & La rue est à nous !" colonnes={4} />
    </Container>
   
    </>
  );
}

