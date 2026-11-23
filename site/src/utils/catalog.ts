import products from "~/data/products.json";
import categories from "~/data/categories.json";
import fabrics from "~/data/fabrics.json";
import imageSizes from "~/data/image-sizes.json";

export type Product = (typeof products)[number];
export type Variant = Product["variants"][number];
export type Category = (typeof categories)[number];
export type Fabric = (typeof fabrics)[number];

export interface ImageInfo {
  w: number;
  h: number;
  widths: number[];
  color: string;
  /** Packshot on white: shown whole with a multiply blend; otherwise a room photo. */
  cutout?: boolean;
}

export const TBD = "t.b.d.";

export const allProducts = products as Product[];
export const allCategories = categories as Category[];
export const allFabrics = fabrics as Fabric[];

export const productBySlug = (slug: string) => allProducts.find((p) => p.slug === slug);
export const categoryBySlug = (slug: string) => allCategories.find((c) => c.slug === slug);
export const fabricById = (id: string | null | undefined) => (id ? allFabrics.find((f) => f.id === id) : undefined);
export const productsIn = (category: string) => allProducts.filter((p) => p.category === category);

export function imageInfo(key: string): ImageInfo | undefined {
  return (imageSizes as Record<string, ImageInfo>)[key];
}

const pln = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 });
/** 1149 -> "1 149 zł" (non-breaking space as the thousands separator). */
export const formatPrice = (value: number) => `${pln.format(value).replace(/\s/g, "\u00a0")}\u00a0zł`;

export function priceLabel(p: Product) {
  return p.priceMin === p.priceMax ? formatPrice(p.priceMin) : `od ${formatPrice(p.priceMin)}`;
}

export function variantsLabel(n: number) {
  if (n === 1) return "1 wersja";
  const last = n % 10;
  const teen = n % 100 >= 12 && n % 100 <= 14;
  return `${n} ${!teen && last >= 2 && last <= 4 ? "wersje" : "wersji"}`;
}

/** Colour swatch for a variant: named colour first, then the photo's average colour. */
const COLOURS: Record<string, string> = {
  musztardowy: "#c9971c",
  turkusowy: "#1c9a9b",
  czerwony: "#b8332a",
  czarny: "#202124",
  zielony: "#2f7a49",
  "pudrowy róż": "#e3aeb1",
  granatowy: "#1f2d57",
  morski: "#1a6a70",
  "butelkowa zieleń": "#1c4836",
  oliwkowy: "#77773a",
  "kość słoniowa": "#ece6d6",
};

export function variantColour(v: Variant) {
  if (v.colour && COLOURS[v.colour]) return COLOURS[v.colour];
  return imageInfo(v.images[0])?.color ?? "#999";
}

export function variantAlt(p: Product, v: Variant, index: number) {
  const parts = [p.name, v.label !== "Standard" ? v.label.toLowerCase() : ""].filter(Boolean).join(", ");
  return index === 0 ? parts : `${parts}, zdjęcie ${index + 1}`;
}

export const categoryName = (slug: string) => categoryBySlug(slug)?.name ?? slug;
