import {
  getPageBySlug,
  getAllPages,
} from "@/lib/wordpress";
import { generateContentMetadata, stripHtml, decodeHtmlEntities } from "@/lib/metadata";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageContent from "@/components/pages/page-content";

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

  return <PageContent page={page} />;
}
