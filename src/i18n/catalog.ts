import i18n from "./index";

/**
 * The catalogue API sends a few fixed words in English: product tags
 * ("NEW", "BESTSELLER"), garment types ("Hoodie · Urban Man"), colour
 * names ("Gold") and the "ONE" size. These helpers translate them with the list in
 * shop.json → "catalog". A word that isn't in the list is shown as it comes.
 * Product names stay in English on purpose (they are like brand names).
 */

/** "BESTSELLER" → "MÁS VENDIDO" */
export function catalogTag(tag: string): string {
  return i18n.t(`shop:catalog.tags.${tag}`, { defaultValue: tag });
}

/** "Hoodie · Urban Man" → "Sudadera · Urban Man" (the line name stays as it is). */
export function catalogType(label: string): string {
  const [type, ...rest] = label.split(" · ");
  const translated = i18n.t(`shop:catalog.types.${type}`, { defaultValue: type });
  return [translated, ...rest].join(" · ");
}

/** "Gold" → "Dorado" (a colour name saved with the product). */
export function catalogColour(name: string): string {
  return i18n.t(`shop:catalog.colours.${name}`, { defaultValue: name });
}

/** "men" → "Hombre" (the name of a shop category). */
export function catalogCategory(slug: string): string {
  return i18n.t(`shop:listing.categories.${slug}.crumb`, { defaultValue: slug });
}

/** "ONE" → "ÚNICA". Normal sizes (S, M, 42...) come back the same. */
export function catalogSize(size: string): string {
  return i18n.t(`shop:catalog.sizes.${size}`, { defaultValue: size });
}
