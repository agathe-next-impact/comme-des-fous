// Media helpers for last-article-section
// Copied from post-card.tsx for reuse

const PODCAST_PLATFORMS = [
  "spotify.com",
  "open.spotify.com",
  "soundcloud.com",
  "podcasts.apple.com",
  "anchor.fm",
  "podbean.com",
  "acast.com",
  "deezer.com",
  "ausha.co",
  "audioboom.com",
  "megaphone.fm",
  "simplecast.com",
  "buzzsprout.com",
  "spreaker.com",
  "castbox.fm",
  "player.fm",
  "stitcher.com",
  "podcloud.fr",
  "mixcloud.com",
];

export const isPodcastUrl = (url: string) => {
  const lower = url.toLowerCase();
  if (lower.includes("mixcloud.com/widget/iframe")) return true;
  if (/https?:\/\/(www\.)?mixcloud\.com\//.test(lower)) return true;
  return PODCAST_PLATFORMS.some((p) => lower.includes(p));
};

export const isYoutubeUrl = (url: string) =>
  url.includes("youtube.com") || url.includes("youtu.be");

export const getMediaType = (url: string): "video" | "podcast" | null => {
  const lowerUrl = url.toLowerCase();
  if ([
    "youtube.com",
    "youtu.be",
    "vimeo.com",
    "dailymotion.com",
  ].some((p) => lowerUrl.includes(p))) return "video";
  if (
    PODCAST_PLATFORMS.some((p) => lowerUrl.includes(p)) ||
    lowerUrl.includes("soundcloud.com") ||
    lowerUrl.includes("www.soundcloud.com")
  ) return "podcast";
  return null;
};
