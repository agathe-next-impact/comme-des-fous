"use client";

import { Container, Prose } from "@/components/craft";
import Hero from "@/components/hero";
import Image from "next/image";
import { useEffect, useState } from "react";

type FeaturedMedia = {
  source_url: string;
  alt_text?: string;
};

type PageWithEmbedded = {
  title: { rendered: string };
  content: { rendered: string };
  excerpt?: { rendered: string };
  featured_media?: number;
  _embedded?: {
    "wp:featuredmedia"?: FeaturedMedia[];
  };
  slug: string;
};

interface PageContentProps {
  page: PageWithEmbedded;
}

export default function PageContent({ page }: PageContentProps) {
  const featuredMedia = page.featured_media
    ? page._embedded?.["wp:featuredmedia"]?.[0]
    : null;

  const [scrapedHtml, setScrapedHtml] = useState<string | null>(null);

  // Détection éditeur classique
  const isClassicEditor =
    !page.content.rendered.includes("<!-- wp:") &&
    !page.content.rendered.includes("wp-block");

  useEffect(() => {
    async function fetchScrapedHtml() {
      if (isClassicEditor) {
        const res = await fetch(`/api/scrape-html?slug=${page.slug}`);
        if (res.ok) {
          const html = await res.text();
          setScrapedHtml(html);
        }
      }
    }
    fetchScrapedHtml();
  }, [isClassicEditor, page.slug]);

  return (
    <div className="mt-14">
      <Hero
        titre={page.title.rendered}
        sousTitre=""
      />

      <Container className="mt-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            {/* Pas de catégories/tags pour les pages */}
          </div>
          {featuredMedia && (
            <div className="text-sm text-muted-foreground">
              <Image
                src={featuredMedia.source_url}
                alt={featuredMedia.alt_text || "Featured media"}
                width={250}
                height={250}
                className="object-cover rounded-md"
              />
            </div>
          )}
        </div>
        {isClassicEditor && scrapedHtml ? (
          <div dangerouslySetInnerHTML={{ __html: scrapedHtml }} />
        ) : (
          <Prose>
            <div dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
          </Prose>
        )}
      </Container>
    </div>
  );
}