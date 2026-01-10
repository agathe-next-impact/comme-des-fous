import Hero from "@/components/hero";
import { Section, Container } from "@/components/craft";
import type { Metadata } from "next";
import { getAllTags } from "@/lib/wordpress";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tags",
  description: "Parcourez les articles par tags.",
  alternates: {
    canonical: "/posts/tags",
  },
};

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <Section>
      <Container>
        <Hero
          titre="Tags"
          sousTitre="Parcourez les articles en sélectionnant un tag."
        />
      </Container>
      <Container className="mt-8">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link href={`/${tag.slug}`} key={tag.id}>
              <Badge variant="outline">{tag.name}</Badge>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
