import site from "~/data/site.json";
import { absolute, absoluteImage, ORG_ID } from "~/components/SeoHead";
import { fabricById, type Product, type Variant } from "./catalog";

const RETURNS_ID = `${site.url}/#zwroty`;
const SHIPPING_ID = `${site.url}/#dostawa`;

export function returnPolicyNode() {
  const notPermitted = site.returnPolicy.type === "notPermitted";
  return {
    "@type": "MerchantReturnPolicy",
    "@id": RETURNS_ID,
    applicableCountry: "PL",
    returnPolicyCategory: notPermitted ? "https://schema.org/MerchantReturnNotPermitted" : "https://schema.org/MerchantReturnFiniteReturnWindow",
    ...(notPermitted
      ? {}
      : {
          merchantReturnDays: site.returnPolicy.days,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: site.returnPolicy.customerPaysReturn ? "https://schema.org/ReturnFeesCustomerResponsibility" : "https://schema.org/FreeReturn",
        }),
    url: absolute("/dostawa-i-zwroty/"),
  };
}

export function shippingNode() {
  const s = site.shipping;
  return {
    "@type": "OfferShippingDetails",
    "@id": SHIPPING_ID,
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "PL" },
    ...(s.costPLN != null ? { shippingRate: { "@type": "MonetaryAmount", value: s.costPLN, currency: "PLN" } } : {}),
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      ...(s.handlingDays ? { handlingTime: { "@type": "QuantitativeValue", minValue: s.handlingDays[0], maxValue: s.handlingDays[1], unitCode: "DAY" } } : {}),
      transitTime: { "@type": "QuantitativeValue", minValue: s.transitDays[0], maxValue: s.transitDays[1], unitCode: "DAY" },
    },
  };
}

const cm = (value: string) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? { "@type": "QuantitativeValue", value: n, unitCode: "CMT" } : undefined;
};

function dimensionProps(v: Variant) {
  const find = (name: string) => v.dimensions.find((d) => d.name === name)?.value;
  const width = find("Szerokość");
  const height = find("Wysokość całkowita");
  const depth = find("Głębokość całkowita");
  return {
    ...(width && cm(width) ? { width: cm(width) } : {}),
    ...(height && cm(height) ? { height: cm(height) } : {}),
    ...(depth && cm(depth) ? { depth: cm(depth) } : {}),
    additionalProperty: v.dimensions.map((d) => ({ "@type": "PropertyValue", name: d.name, value: d.value })),
  };
}

export const variantUrl = (p: Product, v: Variant) =>
  p.variants.length > 1 ? `${absolute(`/produkty/${p.slug}/`)}?wariant=${v.id}` : absolute(`/produkty/${p.slug}/`);

export const fabricLabel = (v: Variant) => fabricById(v.fabricId)?.name ?? v.fabricName ?? undefined;

function variantNode(p: Product, v: Variant, inGroup: boolean) {
  const url = variantUrl(p, v);
  const material = fabricLabel(v);
  return {
    "@type": "Product",
    "@id": `${url}#product`,
    sku: v.sku,
    name: inGroup ? `${p.name}, ${v.label.toLowerCase()}` : p.name,
    ...(inGroup ? { isVariantOf: { "@id": `${absolute(`/produkty/${p.slug}/`)}#product` } } : {}),
    image: v.images.map(absoluteImage),
    url,
    ...(v.colour ? { color: v.colour } : {}),
    ...(v.pattern ? { pattern: v.pattern } : {}),
    ...(material ? { material } : {}),
    ...dimensionProps(v),
    offers: {
      "@type": "Offer",
      url,
      price: v.price.toFixed(2),
      priceCurrency: "PLN",
      availability: "https://schema.org/MadeToOrder",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": ORG_ID },
      shippingDetails: { "@id": SHIPPING_ID },
      hasMerchantReturnPolicy: { "@id": RETURNS_ID },
    },
  };
}

export function productGraph(p: Product) {
  const url = absolute(`/produkty/${p.slug}/`);
  const common = {
    description: p.metaDescription,
    brand: { "@type": "Brand", name: "SIMAX" },
    manufacturer: { "@id": ORG_ID },
    category: p.category === "fotele" ? "Meble > Fotele" : p.category === "sofy" ? "Meble > Sofy" : p.category === "lozka" ? "Meble > Łóżka" : p.category === "krzesla" ? "Meble > Krzesła" : "Meble > Dodatki",
    countryOfOrigin: "PL",
  };
  const nodes: object[] = [returnPolicyNode(), shippingNode()];
  if (p.variants.length === 1) {
    nodes.push({ ...variantNode(p, p.variants[0], false), ...common, "@id": `${url}#product` });
    return nodes;
  }
  const variesBy = [
    p.variants.some((v) => v.colour) && "https://schema.org/color",
    p.variants.some((v) => v.pattern) && "https://schema.org/pattern",
    p.variants.some((v) => fabricLabel(v)) && "https://schema.org/material",
  ].filter(Boolean);
  nodes.push({
    "@type": "ProductGroup",
    "@id": `${url}#product`,
    name: p.name,
    url,
    productGroupID: p.slug,
    ...common,
    image: p.variants.map((v) => absoluteImage(v.images[0])),
    ...(variesBy.length ? { variesBy } : {}),
    hasVariant: p.variants.map((v) => ({ ...variantNode(p, v, true), brand: common.brand })),
  });
  return nodes;
}
