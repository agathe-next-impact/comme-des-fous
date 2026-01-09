import "./globals.css";

// Suppression de l'import Head, on utilise le composant <head> natif App Router
import { ThemeProvider } from "@/components/theme/theme-provider";
import { StaggeredMenu } from "@/components/ui/staggered-menu";
import { Footer } from "@/components/layout/footer";
import TopBar from "@/components/layout/topbar";
import { Analytics } from "@vercel/analytics/react";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import { URLRewriter } from "@/components/url-rewriter";

import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "WordPress & Next.js Starter by 9d8",
  description:
    "A starter template for Next.js with WordPress as a headless CMS.",
  metadataBase: new URL(siteConfig.site_domain),
  alternates: {
    canonical: "/",
  },
};

const menuItems = [
  { label: 'Blog', ariaLabel: 'Blog', link: '/posts' },
  { label: 'On aime', ariaLabel: 'Coups de coeur', link: '/about' },
  { label: 'Liens', ariaLabel: 'Liens', link: '/liens' },
  { label: 'Contact', ariaLabel: 'Contact', link: '/contact' }
];

const socialItems = [
  { label: 'Twitter', link: 'https://twitter.com' },
  { label: 'GitHub', link: 'https://github.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' }
];


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Host Grotesk et New Astro Soft via Adobe Fonts */}
        <link rel="stylesheet" href="https://use.typekit.net/otn3nyx.css" />
      </head>
      <body className={cn("min-h-screen font-sans antialiased")}> 
        <URLRewriter />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TopBar />
            <StaggeredMenu
              position="right"
              items={menuItems}
              socialItems={socialItems}
              displaySocials={true}
              displayItemNumbering={true}
              menuButtonColor="#fff"
              openMenuButtonColor="#fff"
              changeMenuColorOnOpen={true}
              colors={['#000000', '#000000']}
              logoUrl="/path-to-your-logo.svg"
              accentColor="#ff6b6b"
            />
          {children}
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
