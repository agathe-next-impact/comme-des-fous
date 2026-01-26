export const PODCAST_PLATFORMS = [
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

export const isYoutubeUrl = (url: string) =>
  url.includes("youtube.com") || url.includes("youtu.be");

export const isPodcastUrl = (url: string) => {
  const lower = url.toLowerCase();
  if (lower.includes("mixcloud.com/widget/iframe")) return true;
  if (/https?:\/\/(www\.)?mixcloud\.com\//.test(lower)) return true;
  return PODCAST_PLATFORMS.some((p) => lower.includes(p));
};