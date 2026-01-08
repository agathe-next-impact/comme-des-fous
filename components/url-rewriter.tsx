"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * URLRewriter: Réécrit l'URL du navigateur pour ne garder que le slug (sans sous-dossier ni préfixe)
 * Usage: placer ce composant dans layout.tsx ou dans la page concernée
 */
export function URLRewriter() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Extraire le dernier segment du chemin (le slug)
    const segments = pathname.split("/").filter(Boolean);
    const slug = segments[segments.length - 1] || "";
    // Si l'URL n'est pas déjà juste le slug, la réécrire
    if (pathname !== `/${slug}` && slug) {
      window.history.replaceState(null, "", `/${slug}`);
    }
  }, [pathname]);

  return null;
}
