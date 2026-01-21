import {
  getPageBySlug,
  getAllPages,
} from "@/lib/wordpress";
import { generateContentMetadata, stripHtml, decodeHtmlEntities } from "@/lib/metadata";
import { Section, Container, Prose } from "@/components/craft";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Hero from "@/components/hero";
import PageContent from "@/components/pages/page-content";

// Define the PageWithEmbedded type if not already imported
type PageWithEmbedded = Awaited<ReturnType<typeof getPageBySlug>> & {
  _embedded?: {
    "wp:featuredmedia"?: Array<any>;
  };
  featured_media?: number;
};




export async function generateStaticParams() {
  const pages = await getAllPages();
  // Limite à 20 pages maximum
  return pages.slice(0, 20).map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return {};
  }

  const description = page.excerpt?.rendered
    ? stripHtml(page.excerpt.rendered)
    : stripHtml(page.content.rendered).slice(0, 200) + "...";
  return generateContentMetadata({
    title: decodeHtmlEntities(page.title.rendered),
    description,
    slug: page.slug,
    basePath: "pages",
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug(slug) as PageWithEmbedded;

  if (!page) {
    notFound();
  }

  // Featured media if available
  const featuredMedia = page.featured_media
    ? page._embedded?.["wp:featuredmedia"]?.[0]
    : null;

  return (
    <div className="mt-14">
      <Hero
        titre={decodeHtmlEntities(page.title.rendered)}
        sousTitre=""
      />


        <PageContent page={page} />

    </div>
  );
}
