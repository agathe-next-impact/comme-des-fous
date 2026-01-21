import { NextRequest, NextResponse } from 'next/server';

export interface ScrapedImage {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const filter = request.nextUrl.searchParams.get('filter'); // optional: filter by path pattern

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS/14)',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
    }

    const html = await response.text();
    const images: ScrapedImage[] = [];
    const seenSources = new Set<string>();

    // Extract all <img> tags
    const imgRegex = /<img[^>]*>/gi;
    const imgTags = html.match(imgRegex) || [];

    for (const imgTag of imgTags) {
      // Extract src (try data-src first for lazy loading, then src)
      const dataSrcMatch = imgTag.match(/data-src\s*=\s*["']([^"']+)["']/i);
      const srcMatch = imgTag.match(/src\s*=\s*["']([^"']+)["']/i);
      let src = dataSrcMatch?.[1] || srcMatch?.[1];
      
      if (!src) continue;
      
      // Clean up the URL
      src = src.replace(/&amp;/g, '&').replace(/&#038;/g, '&');
      
      // Skip data URIs, placeholders, and tracking pixels
      if (src.startsWith('data:') || src.includes('pixel') || src.includes('spacer') || src.includes('blank')) {
        continue;
      }

      // Apply filter if provided (e.g., "wp-content/uploads/2022")
      if (filter && !src.includes(filter)) {
        continue;
      }

      // Skip thumbnails - prefer full-size images
      // Remove size suffixes like -150x150, -300x300, -1024x947
      const cleanSrc = src.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
      
      // Skip if we already have this image (even with different size)
      const normalizedSrc = cleanSrc.replace(/^https?:\/\/[^/]+/, '');
      if (seenSources.has(normalizedSrc)) {
        continue;
      }
      seenSources.add(normalizedSrc);

      // Extract alt text
      const altMatch = imgTag.match(/alt\s*=\s*["']([^"']*)["']/i);
      const alt = altMatch?.[1]?.replace(/&quot;/g, '"').replace(/&#039;/g, "'");

      // Extract title
      const titleMatch = imgTag.match(/title\s*=\s*["']([^"']*)["']/i);
      const title = titleMatch?.[1]?.replace(/&quot;/g, '"').replace(/&#039;/g, "'");

      // Extract dimensions
      const widthMatch = imgTag.match(/width\s*=\s*["']?(\d+)["']?/i);
      const heightMatch = imgTag.match(/height\s*=\s*["']?(\d+)["']?/i);

      // Construct full URL if relative
      let fullSrc = cleanSrc;
      if (!fullSrc.startsWith('http')) {
        const baseUrl = new URL(url);
        fullSrc = fullSrc.startsWith('/')
          ? `${baseUrl.origin}${fullSrc}`
          : `${baseUrl.origin}/${fullSrc}`;
      }

      images.push({
        src: fullSrc,
        alt: alt || undefined,
        title: title || undefined,
        width: widthMatch ? parseInt(widthMatch[1], 10) : undefined,
        height: heightMatch ? parseInt(heightMatch[1], 10) : undefined,
      });
    }

    // Also extract from CSS background-image in style attributes
    const bgRegex = /style\s*=\s*["'][^"']*background(?:-image)?\s*:\s*url\(\s*["']?([^"')]+)["']?\s*\)[^"']*["']/gi;
    let bgMatch;
    while ((bgMatch = bgRegex.exec(html)) !== null) {
      let src = bgMatch[1].replace(/&amp;/g, '&');
      
      if (filter && !src.includes(filter)) continue;
      
      const normalizedSrc = src.replace(/^https?:\/\/[^/]+/, '').replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
      if (seenSources.has(normalizedSrc)) continue;
      seenSources.add(normalizedSrc);

      if (!src.startsWith('http')) {
        const baseUrl = new URL(url);
        src = src.startsWith('/') ? `${baseUrl.origin}${src}` : `${baseUrl.origin}/${src}`;
      }

      images.push({ src });
    }

    return NextResponse.json({ 
      images,
      count: images.length,
      url 
    });
  } catch (error) {
    console.error('Scrape images error:', error);
    return NextResponse.json({ error: 'Failed to scrape images' }, { status: 500 });
  }
}
