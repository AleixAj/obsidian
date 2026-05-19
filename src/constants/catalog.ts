/**
 * Editorial order for the "new collection" surfaces.
 *
 * The API owns product data; the SPA owns this campaign-specific ordering
 * so Home, PLP and PDP recommendations stay visually consistent.
 */
export const NEW_COLLECTION_ORDER = [
  "p7",
  "p12",
  "p9",
  "p18",
  "p1",
  "p4",
  "p2",
  "p5",
  "p3",
  "p10",
  "p6",
  "p11",
  "p8",
  "p13",
  "p15",
  "p17",
  "p16",
  "p14",
] as const;

const NEW_COLLECTION_RANK: ReadonlyMap<string, number> = new Map(
  NEW_COLLECTION_ORDER.map((slug, index) => [slug, index]),
);

const rankProduct = (id: string) => NEW_COLLECTION_RANK.get(id) ?? Number.MAX_SAFE_INTEGER;

export function compareNewCollectionOrder<T extends { id: string }>(a: T, b: T): number {
  return rankProduct(a.id) - rankProduct(b.id);
}
