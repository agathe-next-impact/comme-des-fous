import { Section, Container } from "@/components/craft";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { mainMenu, contentMenu } from "@/menu.config";
import { siteConfig } from "@/site.config";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <Section>
        <Container className="grid md:grid-cols-[1.5fr_1fr] gap-12 pb-8">
          <div className="flex flex-col gap-6 not-prose">
            <Link href="/">
              <h3 className="sr-only">{siteConfig.site_name}</h3>
              <Image
                src="/logo.png"
                alt="Logo"
                width={84}
                height={84}
              />
            </Link>
            <p className="font-title text-2xl">Changer les regards sur la folie</p>
          </div>
          <div className="flex justify-end items-end gap-4">2025 Comme des fous. Tous droits réservés.</div>

        </Container>
        <Container className="border-t not-prose flex flex-col md:flex-row md:gap-2 gap-6 justify-between md:items-center pt-4">
          <ThemeToggle />
          <p className="text-[var(--text-main)]">
            <a href="https://next-impact.digital" target="_blank" rel="noopener noreferrer">Réalisé par Next Impact
            <Image
              src="/logo-blanc-carre.png"
              alt="Next Impact"
              width={30}
              height={30}
              className="inline-block ml-2 align-top filter invert-0 brightness-0 dark:filter-none"
            />
            </a>

          </p>
        </Container>
      </Section>
    </footer>
  );
}
