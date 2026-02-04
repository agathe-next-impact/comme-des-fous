import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  // Remplace par l'URL de ton site WordPress
  const wpUrl = `https://commedesfous.com/${slug}`;

  try {
    const res = await fetch(wpUrl);
    if (!res.ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const html = await res.text();
    console.log(html);
    const $ = cheerio.load(html);

    // Exemple : récupère le contenu principal (adapte le sélecteur selon ton thème)
    const mainContent = $("main").html() || $("#wrapper-content").html() || $("article").html() ;

    if (!mainContent) {
      return NextResponse.json({ error: "No content found" }, { status: 404 });
    }

    return new NextResponse(mainContent, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (e) {
    return NextResponse.json({ error: "Scrape failed" }, { status: 500 });
  }
}