import { isYoutubeUrl, isPodcastUrl } from "@/lib/media-helpers";
import type { Post } from "@/lib/wordpress";

export function extractMediaFromPost(post: Post) {
  // Priority 1: Check for first video iframe in content
  const content = post.content?.rendered || "";
  const iframeMatches = [
    ...content.matchAll(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi),
  ];
  if (iframeMatches.length > 0) {
    const videoIframe = iframeMatches.find((m) => isYoutubeUrl(m[1]));
    if (videoIframe) {
      return { mediaUrl: videoIframe[1], mediaType: "youtube" };
    }
    // Sinon podcast
    const podcastIframe = iframeMatches.find((m) => isPodcastUrl(m[1]));
    if (podcastIframe) {
      return { mediaUrl: podcastIframe[1], mediaType: "podcast" };
    }
  }
  // No media found
  return { mediaUrl: undefined, mediaType: undefined };
}
