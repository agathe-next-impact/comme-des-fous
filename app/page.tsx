// Craft Imports
import { Section, Container } from "@/components/craft";
import Hero from "@/components/hero";

// Icons
import LastArticleSection from "@/components/last-article-section";
import { MostReadPostsList } from "@/components/posts/most-read-posts-list";
import DomeGallery from "@/components/ui/dome-gallery";
import CollagesRow from "@/components/collages-row";
import fs from "fs";
import path from "path";
import { StickersGallery } from "@/components/ui/stickers-gallery";


export default async function Home() {

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
    
    <div className="mt-4">
    <Hero titre="COMME DES FOUS" sousTitre="Changer les regards sur la folie"/>
    <Section>
      <Container>
          <LastArticleSection />
          <MostReadPostsList />
           <CollagesRow items={collagesItems} titre="Collages" />
          <DomeGallery images={images} fit={0.75} />
      </Container>
    </Section>
    <Container className="pb-32">
      <StickersGallery images={stickerItems} />
     </Container>
   </div>
    </>
  );
}

