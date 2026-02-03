import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
    }

    const html = await response.text();
    const media: { src: string; title?: string; type?: 'video' | 'podcast' }[] = [];

    // 1. <iframe> tags (as before)
    const iframeRegex = /<iframe[\s\S]*?>[\s\S]*?<\/iframe>|<iframe[\s\S]*?\/>/gi;
    const iframes = html.match(iframeRegex) || [];
    for (const iframe of iframes) {
      const srcMatch = iframe.match(/src\s*=\s*["']([^"']+)["']/i);
      if (!srcMatch) continue;
      let src = srcMatch[1].replace(/&amp;/g, '&').replace(/&#038;/g, '&');
      // Mixcloud correction
      if (src.includes('mixcloud.com/widget/iframe') && src.includes('feed=')) {
        const feedMatch = src.match(/feed=([^&]+)/);
        if (feedMatch) {
          let feedValue = decodeURIComponent(feedMatch[1]);
          if (feedValue.startsWith('/')) {
            feedValue = `https://www.mixcloud.com${feedValue}`;
            src = src.replace(/feed=([^&]+)/, `feed=${encodeURIComponent(feedValue)}`);
          }
        }
      }
      if (!src || src.startsWith('about:') || src.startsWith('javascript:')) continue;
      const titleMatch = iframe.match(/title\s*=\s*["']([^"']+)["']/i);
      const title = titleMatch ? titleMatch[1].replace(/&quot;/g, '"') : undefined;
      let type: 'video' | 'podcast';
      if (src.includes('mixcloud.com/widget/iframe')) {
        type = 'podcast';
      } else {
        const isVideo = /youtube|youtu\.be|vimeo|dailymotion|wistia|twitch/i.test(src);
        type = isVideo ? 'video' : 'podcast';
      }
      if (!media.some(m => m.src === src)) {
        media.push({ src, title, type });
      }
    }

    // 2. <audio> tags (as before)
    const audioRegex = /<audio[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let audioMatch;
    while ((audioMatch = audioRegex.exec(html)) !== null) {
      const src = audioMatch[1].replace(/&amp;/g, '&');
      if (!media.some(m => m.src === src)) {
        media.push({ src, type: 'podcast' });
      }
    }

    // 3. [video src="..."] shortcodes and [video]...[/video]
    //    Also handles [video mp4="..."] and similar
    const shortcodeRegex = /\[video[^\]]*(src|mp4)\s*=\s*["']([^"']+)["'][^\]]*\]|\[video[^\]]*\](.*?)\[\/video\]/gi;
    let shortcodeMatch;
    while ((shortcodeMatch = shortcodeRegex.exec(html)) !== null) {
      let src = shortcodeMatch[2] || shortcodeMatch[3];
      if (src) {
        // Try to extract URL from inside [video]...[/video] if not direct attribute
        const urlMatch = src.match(/https?:\/\/[^\s"'<>]+/);
        if (urlMatch) src = urlMatch[0];
        if (!media.some(m => m.src === src)) {
          media.push({ src, type: 'video' });
        }
      }
    }

    // 4. Gutenberg blocks: <div class="wp-block-embed-..."> and <figure class="wp-block-embed">
    //    Extract <iframe>, <a>, or <video> inside, or data-embed-url/data-url attributes
    const blockDivRegex = /<div[^>]+class=["'][^"']*wp-block-embed-([^"'\s]+)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi;
    let blockDivMatch;
    while ((blockDivMatch = blockDivRegex.exec(html)) !== null) {
      const inner = blockDivMatch[2];
      // Try <iframe>
      const iframeMatch = inner.match(/<iframe[^>]+src=["']([^"']+)["']/i);
      if (iframeMatch && !media.some(m => m.src === iframeMatch[1])) {
        media.push({ src: iframeMatch[1], type: 'video' });
        continue;
      }
      // Try <a>
      const aMatch = inner.match(/<a[^>]+href=["']([^"']+)["']/i);
      if (aMatch && !media.some(m => m.src === aMatch[1])) {
        media.push({ src: aMatch[1], type: 'video' });
        continue;
      }
      // Try <video>
      const videoMatch = inner.match(/<video[^>]+src=["']([^"']+)["']/i);
      if (videoMatch && !media.some(m => m.src === videoMatch[1])) {
        media.push({ src: videoMatch[1], type: 'video' });
        continue;
      }
      // Try data-embed-url or data-url
      const dataUrlMatch = inner.match(/data-(?:embed-)?url=["']([^"']+)["']/i);
      if (dataUrlMatch && !media.some(m => m.src === dataUrlMatch[1])) {
        media.push({ src: dataUrlMatch[1], type: 'video' });
        continue;
      }
    }
    // <figure class="wp-block-embed">
    const figureBlockRegex = /<figure[^>]+class=["'][^"']*wp-block-embed[^"']*["'][^>]*>([\s\S]*?)<\/figure>/gi;
    let figureBlockMatch;
    while ((figureBlockMatch = figureBlockRegex.exec(html)) !== null) {
      const inner = figureBlockMatch[1];
      // Try <iframe>
      const iframeMatch = inner.match(/<iframe[^>]+src=["']([^"']+)["']/i);
      if (iframeMatch && !media.some(m => m.src === iframeMatch[1])) {
        media.push({ src: iframeMatch[1], type: 'video' });
        continue;
      }
      // Try <a>
      const aMatch = inner.match(/<a[^>]+href=["']([^"']+)["']/i);
      if (aMatch && !media.some(m => m.src === aMatch[1])) {
        media.push({ src: aMatch[1], type: 'video' });
        continue;
      }
      // Try <video>
      const videoMatch = inner.match(/<video[^>]+src=["']([^"']+)["']/i);
      if (videoMatch && !media.some(m => m.src === videoMatch[1])) {
        media.push({ src: videoMatch[1], type: 'video' });
        continue;
      }
      // Try data-embed-url or data-url
      const dataUrlMatch = inner.match(/data-(?:embed-)?url=["']([^"']+)["']/i);
      if (dataUrlMatch && !media.some(m => m.src === dataUrlMatch[1])) {
        media.push({ src: dataUrlMatch[1], type: 'video' });
        continue;
      }
    }

    // 5. <script> blocks with video URLs (e.g., JSON-LD, or plugin-injected)
    //    Look for YouTube/Vimeo/Dailymotion URLs in <script> tags
    const scriptRegex = /<script[\s\S]*?>([\s\S]*?)<\/script>/gi;
    let scriptMatch;
    while ((scriptMatch = scriptRegex.exec(html)) !== null) {
      const scriptContent = scriptMatch[1];
      // Find all video URLs
      const urlRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|wistia\.com|twitch\.tv|[a-z0-9\-.]+\/[^"]+?\.(mp4|webm|ogg))[^"'\s<>{}]*)/gi;
      let urlMatch;
      while ((urlMatch = urlRegex.exec(scriptContent)) !== null) {
        const src = urlMatch[1];
        if (!media.some(m => m.src === src)) {
          media.push({ src, type: 'video' });
        }
      }
    }

    // 6. <video> tags (self-hosted)
    const videoTagRegex = /<video[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let videoTagMatch;
    while ((videoTagMatch = videoTagRegex.exec(html)) !== null) {
      const src = videoTagMatch[1];
      if (!media.some(m => m.src === src)) {
        media.push({ src, type: 'video' });
      }
    }

    return NextResponse.json({ media });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to scrape media' }, { status: 500 });
  }
}
