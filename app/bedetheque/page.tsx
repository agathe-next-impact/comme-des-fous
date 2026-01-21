import { Metadata } from "next";
import { getPageBySlug } from "@/lib/wordpress";
import { generateContentMetadata, stripHtml, decodeHtmlEntities } from "@/lib/metadata";
import Hero from "@/components/hero";
import { notFound } from "next/navigation";
import { BedethequeGallery } from "@/components/bedetheque-gallery";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("bedetheque");

  if (!page) {
    return { 
      title: "Bédéthèque - Comme des fous",
      description: "Notre sélection de bandes dessinées sur la santé mentale, la psychiatrie et la folie."
    };
  }

  const description = page.excerpt?.rendered
    ? stripHtml(page.excerpt.rendered)
    : stripHtml(page.content.rendered).slice(0, 200) + "...";

  return generateContentMetadata({
    title: decodeHtmlEntities(page.title.rendered),
    description,
    slug: "bedetheque",
    basePath: "pages",
  });
}

// Liste des images de BD extraites de la page WordPress
const BD_IMAGES = [
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/Ascensionduhautmal01.jpg", title: "L'Ascension du Haut Mal" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/07/autopsie-des-echos-dans-ma-tete-freaks.jpg", title: "Autopsie des échos dans ma tête" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/blast.jpg", title: "Blast" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/borderline.jpg", title: "Borderline" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/boris.jpg", title: "Boris" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/chere-scarlet.jpg", title: "Chère Scarlet" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/chute-libre.jpg", title: "Chute Libre" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/cigarettes.jpg", title: "Cigarettes" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/deraillee.jpg", title: "Déraillée" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/dernier-etage.jpg", title: "Dernier Étage" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/Emilie-Guillon.jpg", title: "Émilie Guillon" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/emotions.jpg", title: "Émotions" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/fables-psychiatriques.jpg", title: "Fables Psychiatriques" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/goupil-ou-face.jpg", title: "Goupil ou Face" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/grace.jpg", title: "Grace" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/hp-tome-1.jpg", title: "HP Tome 1" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/hp-tome-2.jpg", title: "HP Tome 2" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/inadaptes-freaks.jpg", title: "Inadaptés" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/insomnie-maelle-reat.png", title: "Insomnie" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/je-vais-mieux.jpg", title: "Je vais mieux" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/julie-dachez.jpg", title: "Julie Dachez" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/KNL.jpg", title: "KNL" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/l-eclipse-dun-ange.jpg", title: "L'Éclipse d'un Ange" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/lhomme-le-plus-flippe.jpg", title: "L'Homme le plus flippé" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/Mirion-Malle.jpg", title: "Mirion Malle" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/misery.jpg", title: "Misery" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/morveuse.jpg", title: "Morveuse" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/nellie-bly.jpg", title: "Nellie Bly" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/Niki-Smith.jpg", title: "Niki Smith" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/presque.jpg", title: "Presque" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/07/Se-retablir-Lisa-Mandel.jpg", title: "Se Rétablir - Lisa Mandel" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/swallow.jpg", title: "Swallow" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/syndrome-de-limposteur.jpg", title: "Syndrome de l'Imposteur" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/tete-de-tim.jpg", title: "Tête de Tim" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/troisieme-population.jpg", title: "Troisième Population" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/une-case-en-moins.jpg", title: "Une Case en Moins" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/une-case-en-plus.jpg", title: "Une Case en Plus" },
  { src: "https://commedesfous.com/wp-content/uploads/2022/08/zozo-le-skyzo.jpg", title: "Zozo le Skyzo" },
];

export default async function BedethequePage() {
  const page = await getPageBySlug("bedetheque");

  // Extraire le texte d'introduction de la page WordPress si disponible
  let introText = "Notre sélection de bandes dessinées sur la santé mentale, la psychiatrie et la folie. N'hésitez pas à découvrir ces œuvres qui changent les regards.";
  
  if (page?.content?.rendered) {
    // Extraire le premier paragraphe comme intro
    const pMatch = page.content.rendered.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (pMatch) {
      introText = stripHtml(pMatch[1]);
    }
  }

  return (
    <main className="min-h-screen">
      <Hero 
        titre="Bédéthèque"
        sousTitre={introText}
      />
      
      <section className="container mx-auto px-4 py-12">
        <p className="text-center text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          {BD_IMAGES.length} bandes dessinées à découvrir
        </p>
        
        <BedethequeGallery images={BD_IMAGES} />
      </section>
    </main>
  );
}
