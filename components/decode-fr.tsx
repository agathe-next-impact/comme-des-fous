import React from "react";

/**
 * Composant utilitaire qui transforme les entités HTML et caractères spéciaux pour un affichage correct en français.
 * Utilisation : <DecodeFr>{texte}</DecodeFr>
 */
export function DecodeFr({ children }: { children: string }) {
  // Décodage des entités HTML et normalisation Unicode
  let decoded = children;
  if (typeof window !== "undefined") {
    // Navigateur : utilise DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(decoded, "text/html");
    decoded = doc.documentElement.textContent || "";
  } else {
    // Node.js : fallback simple (remplace les entités courantes)
    decoded = decoded
      .replace(/&eacute;/g, "é")
      .replace(/&egrave;/g, "è")
      .replace(/&ecirc;/g, "ê")
      .replace(/&agrave;/g, "à")
      .replace(/&ocirc;/g, "ô")
      .replace(/&ucirc;/g, "û")
      .replace(/&ccedil;/g, "ç")
      .replace(/&rsquo;/g, "’")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'");
  }
  return <>{decoded}</>;
}
