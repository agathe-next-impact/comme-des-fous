import Hero from "@/components/hero";
import { Section, Container } from "@/components/craft";

export default function AEcouterCategoryPage() {
  return (
    <Section className="bg-(--color-blue)">
      <Container>
        <Hero titre="À ÉCOUTER" sousTitre="Sélection de podcasts, musiques et enregistrements audio à ne pas manquer" className="text-black"/>
      </Container>
    </Section>
  );
}
