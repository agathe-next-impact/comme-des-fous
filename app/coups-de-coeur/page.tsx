import { getPageBySlug } from "@/lib/wordpress";
import { generateContentMetadata, stripHtml, decodeHtmlEntities } from "@/lib/metadata";
import { DecodeFr } from "@/components/decode-fr";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

import type { Metadata } from "next";
import Hero from "@/components/hero";

// Revalidate every hour
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("coups-de-coeur");

  if (!page) {
    return {
      title: "Coups de cœur",
    };
  }

  const description = page.excerpt?.rendered
    ? stripHtml(page.excerpt.rendered)
    : stripHtml(page.content.rendered).slice(0, 200) + "...";

  return generateContentMetadata({
    title: decodeHtmlEntities(page.title.rendered),
    description,
    slug: "coups-de-coeur",
    basePath: "pages",
    content: page,
  });
}

// Interface pour les blocs extraits
interface BlockItem {
  image?: string;
  title?: string;
  link?: string;
  content: string; // Contenu HTML complet du bloc
}

// Extraire les blocs du contenu WordPress (Gutenberg blocks)
function parseGutenbergBlocks(content: string): {
  items: BlockItem[];
  headerContent: string;
} {
  const items: BlockItem[] = [];
  let headerContent = "";

  // Pattern pour détecter les wp:columns
  const columnsPattern = /<!-- wp:columns[^>]*-->([\s\S]*?)<!-- \/wp:columns -->/gi;
  const columnsMatches = [...content.matchAll(columnsPattern)];

  // Récupérer le contenu avant les colonnes (intro)
  const firstColumnsIndex = content.indexOf("<!-- wp:columns");
  if (firstColumnsIndex > 0) {
    headerContent = content.slice(0, firstColumnsIndex)
      .replace(/<!--[^>]*-->/g, "")
      .trim();
  }

  columnsMatches.forEach((columnsMatch) => {
    const columnsBlock = columnsMatch[0];
    
    // Extraire chaque colonne
    const columnPattern = /<!-- wp:column[^>]*-->([\s\S]*?)<!-- \/wp:column -->/gi;
    const columnMatches = [...columnsBlock.matchAll(columnPattern)];

    columnMatches.forEach((columnMatch) => {
      const columnContent = columnMatch[1];
      const item: BlockItem = { content: "" };

      // Extraire l'image
      const imgMatch = columnContent.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
      if (imgMatch) {
        item.image = imgMatch[1];
      }

      // Extraire le lien principal
      const linkMatch = columnContent.match(/<a[^>]*href=["']([^"']+)["'][^>]*>/i);
      if (linkMatch) {
        item.link = linkMatch[1];
      }

      // Extraire le titre (h2, h3, h4)
      const headingMatch = columnContent.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i);
      if (headingMatch) {
        item.title = stripHtml(headingMatch[1]).trim();
      }

      // Nettoyer et conserver le contenu HTML complet
      let cleanContent = columnContent
        .replace(/<!-- wp:[^>]*-->/g, "") // Supprimer les commentaires Gutenberg
        .replace(/<!-- \/wp:[^>]*-->/g, "")
        .trim();

      item.content = cleanContent;

      // N'ajouter que si le bloc a du contenu
      if (item.content || item.image || item.title) {
        items.push(item);
      }
    });
  });

  // Si pas de colonnes, chercher d'autres structures (figures, groupes)
  if (items.length === 0) {
    // Pattern pour les figures avec images
    const figurePattern = /<figure[^>]*>([\s\S]*?)<\/figure>/gi;
    const figures = [...content.matchAll(figurePattern)];

    figures.forEach((figureMatch) => {
      const figureContent = figureMatch[0];
      const item: BlockItem = { content: figureContent };

      const imgMatch = figureContent.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
      if (imgMatch) {
        item.image = imgMatch[1];
      }

      const linkMatch = figureContent.match(/<a[^>]*href=["']([^"']+)["'][^>]*>/i);
      if (linkMatch) {
        item.link = linkMatch[1];
      }

      const captionMatch = figureContent.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
      if (captionMatch) {
        item.title = stripHtml(captionMatch[1]).trim();
      }

      items.push(item);
    });
  }

  return { items, headerContent };
}

export default async function CoupsDeCoeurPage() {
  const page = await getPageBySlug("coups-de-coeur");

  if (!page) {
    notFound();
  }

  const { items, headerContent } = parseGutenbergBlocks(page.content.rendered);

  return (
    <div className="md:mt-14">
      <Hero titre="ON AIME" sousTitre={headerContent} />

      {/* Grille de coups de cœur */}
      {items.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
            {items.map((item, index) => (
              <CoupDeCoeurCard key={index} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Fallback si aucun item détecté - afficher le contenu brut */}
      {items.length === 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div
            className="prose prose-lg dark:prose-invert prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: page.content.rendered }}
          />
        </section>
      )}
    </div>
  );
}

// Composant carte style post-card
function CoupDeCoeurCard({ item }: { item: BlockItem }) {
  const CardWrapper = item.link ? "a" : "div";
  const cardProps = item.link
    ? {
        href: item.link,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  return (
    <CardWrapper
      {...cardProps}
      className={cn(
        "relative group flex flex-col not-prose",
        "border-r border-b border-white/20",
        "hover:bg-white/5 transition-all duration-300",
        "before:absolute before:top-0 before:left-0 before:w-3 before:h-3",
        "before:border-t-2 before:border-l-2 before:border-yellow-500",
        "after:absolute after:bottom-0 after:right-0 after:w-3 after:h-3",
        "after:border-b-2 after:border-r-2 after:border-red-500",
        "before:transition-all before:duration-300 after:transition-all after:duration-300",
        "hover:before:w-6 hover:before:h-6 hover:after:w-6 hover:after:h-6"
      )}
    >

      {/* Contenu avec padding */}
      <div className="p-6 flex flex-col gap-4 flex-1">


        {/* Contenu complet du bloc */}
        <div
          className={cn(
            "coup-de-coeur-content",
            "text-base leading-relaxed",
            "prose prose-base dark:prose-invert max-w-none",
            "prose-p:mb-3 prose-p:leading-relaxed",
            // Images pleine largeur (override des attributs HTML width/height)
            "[&_img]:!w-full [&_img]:!max-w-full [&_img]:!h-auto [&_img]:my-4 [&_img]:mx-0 [&_img]:object-contain",
            "[&_figure]:!w-full [&_figure]:!max-w-full [&_figure]:my-4 [&_figure]:mx-0",
            "prose-h2:text-lg prose-h2:font-bold prose-h2:mb-2 prose-h2:mt-0",
            "prose-h3:text-base prose-h3:font-bold prose-h3:mb-2 prose-h3:mt-0",
            "prose-ul:my-2 prose-ol:my-2",
            "prose-li:my-0.5"
          )}
        >
          {/* CSS pour forcer la couleur des liens (override les styles inline) */}
          <style>{`
            .coup-de-coeur-content a,
            .coup-de-coeur-content a *,
            .coup-de-coeur-content a span,
            .coup-de-coeur-content p a,
            .coup-de-coeur-content li a {
              color: rgb(239, 68, 68) !important;
              text-decoration: none;
            }
            .coup-de-coeur-content a:hover {
              text-decoration: underline;
            }
          `}</style>
          <div dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(item.content) }} />
        </div>

        {/* Indicateur de lien externe */}
        {item.link && (
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/20">
            <span className="text-xs text-muted-foreground truncate max-w-[80%]">
              {new URL(item.link).hostname.replace("www.", "")}
            </span>
            <span className="inline-flex items-center justify-center w-8 h-8 bg-white/10 rounded-full group-hover:bg-primary/20 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </span>
        </div>
        )}
      </div>
    </CardWrapper>
  );
}
