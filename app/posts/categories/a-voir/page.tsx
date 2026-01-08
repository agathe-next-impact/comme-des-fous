import Hero from "@/components/hero";
import { Section, Container } from "@/components/craft";

export default function AVoirCategoryPage() {
  return (
    <Section className="bg-[var(--color-yellow)] pb-0">
      <Container>
        <Hero titre="À VOIR" sousTitre="Sélection de films, documentaires et vidéos à ne pas manquer" className="text-black"/>
      </Container>
    </Section>
  );
}
