import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

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
    const media: { src: string; title?: string; type?: 'video' | 'podcast' }[] = [];

    // Extract ALL iframes - universal approach
    const iframeRegex = /<iframe[^>]*>/gi;
    const iframes = html.match(iframeRegex) || [];

    console.log(`[API Scrape] Found ${iframes.length} iframes in ${url}`);

    for (const iframe of iframes) {
      // Extract src attribute
      const srcMatch = iframe.match(/src=["']([^"']+)["']/i);
      if (!srcMatch) continue;

      let src = srcMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&#038;/g, '&');

      // Correction Mixcloud: paramètre feed relatif → absolu
      if (src.includes('mixcloud.com/widget/iframe') && src.includes('feed=')) {
        // Récupère le paramètre feed
        const feedMatch = src.match(/feed=([^&]+)/);
        if (feedMatch) {
          let feedValue = decodeURIComponent(feedMatch[1]);
          if (feedValue.startsWith('/')) {
            // Transforme en URL absolue
            feedValue = `https://www.mixcloud.com${feedValue}`;
            // Reconstruit l'URL src
            src = src.replace(/feed=([^&]+)/, `feed=${encodeURIComponent(feedValue)}`);
          }
        }
      }

      // Skip empty or invalid sources
      if (!src || src.startsWith('about:') || src.startsWith('javascript:')) continue;

      // Extract title if present
      const titleMatch = iframe.match(/title=["']([^"']+)["']/i);
      const title = titleMatch ? titleMatch[1].replace(/&quot;/g, '"') : undefined;

      // Détection robuste du type pour Mixcloud
      let type: 'video' | 'podcast';
      if (src.includes('mixcloud.com/widget/iframe')) {
        type = 'podcast';
      } else {
        const isVideo = /youtube|youtu\.be|vimeo|dailymotion|wistia|twitch/i.test(src);
        type = isVideo ? 'video' : 'podcast';
      }

      // Avoid duplicates
      if (!media.some(m => m.src === src)) {
        console.log(`[API Scrape] Found iframe: ${src} (${type})`);
        media.push({ src, title, type });
      }
    }

    // Also extract <audio> tags
    const audioRegex = /<audio[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let audioMatch;
    while ((audioMatch = audioRegex.exec(html)) !== null) {
      const src = audioMatch[1].replace(/&amp;/g, '&');
      if (!media.some(m => m.src === src)) {
        media.push({ src, type: 'podcast' });
      }
    }

    return NextResponse.json({ media });
  } catch (error) {
    console.error('[API Scrape] Error:', error);
    return NextResponse.json({ error: 'Failed to scrape media' }, { status: 500 });
  }
}
