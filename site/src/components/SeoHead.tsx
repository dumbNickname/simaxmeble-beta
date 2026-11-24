import { Title, Meta, Link } from "@solidjs/meta";
import site from "~/data/site.json";
import { basePath } from "~/utils/base";
import { withTrailingSlash } from "~/utils/url";
import { imageInfo } from "~/utils/catalog";
import { largestWidth } from "./Picture";

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface SeoHeadProps {
  /** Full <title>; the site name is appended unless it already fits in 60 chars with it. */
  title: string;
  description: string;
  /** Path without base, e.g. "/produkty/fotel-grande/". */
  canonical?: string;
  /** Absolute canonical on another domain (content syndicated from the shop). */
  canonicalUrl?: string;
  /** Image key from image-sizes.json used for og:image and primaryImageOfPage. */
  image?: string;
  pageType?: "WebPage" | "CollectionPage" | "ItemPage" | "ContactPage" | "AboutPage" | "SearchResultsPage";
  breadcrumbs?: BreadcrumbItem[];
  /** Extra JSON-LD nodes (Product, ItemList, FAQPage...) added to the page graph. */
  graph?: object[];
  noindex?: boolean;
}

export const ORG_ID = `${site.url}/#organization`;
export const absolute = (path: string) => `${site.url}${withTrailingSlash(path)}`;
export const absoluteImage = (key: string) => `${site.url}/img/${key}-${largestWidth(key)}.jpg`;

export function organizationNode() {
  return {
    "@type": ["Organization", "FurnitureStore"],
    "@id": ORG_ID,
    name: site.name,
    legalName: site.legalName,
    description: "Pracownia mebli tapicerowanych na zamówienie: od pomysłu i projektu po gotowy mebel. Fotele, sofy, łóżka i siedziska dla domów i firm, szyte w Polsce.",
    slogan: site.tagline,
    url: `${site.url}/`,
    logo: { "@type": "ImageObject", url: `${site.url}/img/logo-simax-square.png`, width: 300, height: 300 },
    image: `${site.url}/logo.svg`,
    telephone: site.phone,
    email: site.email,
    priceRange: "$$",
    currenciesAccepted: "PLN",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.maps.place,
    // The stock shop is the same company on its own domain.
    sameAs: [site.maps.place, site.shop.replace(/\/?$/, "/")],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: site.phone,
      email: site.email,
      contactType: "sales",
      areaServed: "PL",
      availableLanguage: "pl",
    },
  };
}

export default function SeoHead(props: SeoHeadProps) {
  const fullTitle = () => {
    const t = props.title;
    return t.includes("SIMAX") || t.length > 48 ? t : `${t} | SIMAX meble`;
  };
  // The beta site is served under a base path and must never be indexed.
  const robots = () =>
    basePath ? "noindex, nofollow"
    : props.noindex ? "noindex, follow"
    : "index, follow, max-image-preview:large, max-snippet:-1";
  const ownUrl = () => (props.canonical ? absolute(props.canonical) : undefined);
  const url = () => props.canonicalUrl ?? ownUrl();
  const ogImage = () => (props.image ? absoluteImage(props.image) : `${site.url}/og.jpg`);
  const ogSize = () => {
    if (!props.image) return { w: 1200, h: 630 };
    const info = imageInfo(props.image);
    if (!info) return undefined;
    const w = largestWidth(props.image);
    return { w, h: Math.round((info.h * w) / info.w) };
  };

  const jsonLd = () => {
    const pageId = ownUrl() ?? `${site.url}/`;
    const graph: object[] = [
      organizationNode(),
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: `${site.url}/`,
        name: site.name,
        inLanguage: "pl-PL",
        publisher: { "@id": ORG_ID },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${site.url}/produkty/?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ];
    const page: Record<string, unknown> = {
      "@type": props.pageType ?? "WebPage",
      "@id": `${pageId}#webpage`,
      url: pageId,
      name: fullTitle(),
      description: props.description,
      isPartOf: { "@id": `${site.url}/#website` },
      about: { "@id": ORG_ID },
      inLanguage: "pl-PL",
    };
    if (props.image) {
      page.primaryImageOfPage = { "@type": "ImageObject", url: ogImage(), width: ogSize()?.w, height: ogSize()?.h };
    }
    if (props.breadcrumbs?.length) {
      page.breadcrumb = { "@id": `${pageId}#breadcrumb` };
      graph.push({
        "@type": "BreadcrumbList",
        "@id": `${pageId}#breadcrumb`,
        itemListElement: props.breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          ...(b.href ? { item: absolute(b.href) } : {}),
        })),
      });
    }
    graph.push(page, ...(props.graph ?? []));
    return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  };

  return (
    <>
      <Title>{fullTitle()}</Title>
      <Meta name="description" content={props.description} />
      <Meta name="robots" content={robots()} />
      {url() && <Link rel="canonical" href={url()!} />}
      <Meta property="og:locale" content="pl_PL" />
      <Meta property="og:type" content={props.pageType === "ItemPage" ? "product" : "website"} />
      <Meta property="og:site_name" content={site.name} />
      <Meta property="og:title" content={fullTitle()} />
      <Meta property="og:description" content={props.description} />
      {url() && <Meta property="og:url" content={url()!} />}
      <Meta property="og:image" content={ogImage()} />
      {ogSize() && <Meta property="og:image:width" content={String(ogSize()!.w)} />}
      {ogSize() && <Meta property="og:image:height" content={String(ogSize()!.h)} />}
      <Meta name="twitter:card" content="summary_large_image" />
      {!props.noindex && <script type="application/ld+json" innerHTML={jsonLd()} />}
    </>
  );
}
