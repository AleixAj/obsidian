/**
 * Asks Unsplash for a smaller copy of a photo.
 *
 * Product photos are saved with w=1200, but a card is only ~330px wide,
 * so the browser downloaded 3-4x more pixels than it shows. Unsplash
 * resizes on its side when we change the "w" param. Other addresses
 * (our own /api/media files, avatars...) are returned unchanged.
 */
export function sizedImage(url: string, width: number): string;
export function sizedImage(url: string | null, width: number): string | null;
export function sizedImage(url: string | null, width: number): string | null {
  if (!url || !url.startsWith("https://images.unsplash.com/")) return url;

  const sized = new URL(url);
  sized.searchParams.set("w", String(width));
  // Keep the good defaults if the admin pasted a bare Unsplash link.
  if (!sized.searchParams.has("q")) sized.searchParams.set("q", "75");
  if (!sized.searchParams.has("auto")) sized.searchParams.set("auto", "format");
  return sized.toString();
}
