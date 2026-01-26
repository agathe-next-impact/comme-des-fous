import fetch from "node-fetch";

export async function filterValidMedia(media: { src: string }[]): Promise<typeof media> {
  const results = await Promise.all(
    media.map(async (item) => {
      try {
        const res = await fetch(item.src, { method: "HEAD" });
        if (res.ok) return item;
      } catch {
        // Ignore
      }
      return null;
    })
  );
  return results.filter(Boolean) as typeof media;
}