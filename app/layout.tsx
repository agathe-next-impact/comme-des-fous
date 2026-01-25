import "./globals.css";

// ✅ Polices Google optimisées avec next/font (préchargement + hébergement local)
import { Belanosima, Nunito, Fredoka, Quicksand, Open_Sans } from "next/font/google";

// Suppression de l'import Head, on utilise le composant <head> natif App Router
import { ThemeProvider } from "@/components/theme/theme-provider";
import { StaggeredMenu } from "@/components/ui/staggered-menu";
import { Footer } from "@/components/layout/footer";
import TopBar from "@/components/layout/topbar";
import { Analytics } from "@vercel/analytics/react";
import BeatLoader from "react-spinners/BeatLoader";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import { URLRewriter } from "@/components/url-rewriter";

import type { Metadata } from "next";
import { decodeHtmlEntities } from "@/lib/metadata";

// ✅ Polices principales optimisées
const belanosima = Belanosima({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-belanosima",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: decodeHtmlEntities(
    "Comme des Fous - Changer les regards sur la folie",
  ),
  description: "Changer les regards sur la folie",
  metadataBase: new URL(siteConfig.site_domain),
  alternates: {
    canonical: "/",
  },
};

const menuItems = [
  { label: "Blog", ariaLabel: "Blog", link: "/posts" },
  { label: "On aime", ariaLabel: "Coups de coeur", link: "/coups-de-coeur" },
  { label: "BDthèque", ariaLabel: "BDthèque", link: "/bedetheque" },
  { label: "Playlist", ariaLabel: "Playlist", link: "/playlist-musicale-de-fous" },
];

const socialItems = [
  { label: "Insta", logo:"/icons/logo-insta.png", link: "https://www.instagram.com/comme_des_fous/" },
  { label: "Antipsy Link Tree", logo:"/icons/antipsy-antivalidistes-link-logo.webp", link: "https://linktr.ee/antipsych" },
  { label: "Groupe Médocs - Autre lieu", logo:"/icons/medoc-autrelieu-logo.png", link: "https://medocs.autrelieu.be/" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="fr" 
      suppressHydrationWarning 
      className={cn(
        "overflow-x-hidden",
        belanosima.variable,
        nunito.variable,
        fredoka.variable,
        quicksand.variable
      )}
    >
      <head>
      </head>
      <body className={cn("min-h-screen min-w-screen antialiased", openSans.className)}>
        <URLRewriter />   
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
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
            colors={["#000000", "#000000"]}
            logoUrl="/path-to-your-logo.png"
            accentColor="yellow"
          />
          {children}
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

export function Loading() {
  return (
    <div className="flex justify-center items-center min-h-[40vh]">
      <BeatLoader color="#fff" />
    </div>
  );
}
