import Hero from "@/components/hero";
import { Section, Container } from "@/components/craft";


export default function ALireCategoryPage() {
  return (
    <Section className="bg-(--color-red)">
      <Container>
        <Hero titre="À LIRE" sousTitre="Sélection d'articles, livres et documents à ne pas manquer" className="text-black"/>
      </Container>
    </Section>
  );
}
