import { basePath } from "~/utils/base";
import { imageInfo } from "~/utils/catalog";

interface PictureProps {
  image: string;
  alt: string;
  /** `sizes` attribute; defaults to a card in a 3-column grid. */
  sizes?: string;
  /** Above-the-fold image: eager + high fetch priority. */
  priority?: boolean;
  class?: string;
  imgClass?: string;
}

export const imageUrl = (key: string, width: number, ext: "avif" | "jpg" = "jpg") => `${basePath}/img/${key}-${width}.${ext}`;

export function largestWidth(key: string) {
  const info = imageInfo(key);
  return info ? info.widths[info.widths.length - 1] : 800;
}

export default function Picture(props: PictureProps) {
  const info = () => imageInfo(props.image);
  const widths = () => info()?.widths ?? [480, 800, 1200];
  const srcset = (ext: "avif" | "jpg") => widths().map((w) => `${imageUrl(props.image, w, ext)} ${w}w`).join(", ");
  const fallback = () => widths().find((w) => w >= 800) ?? widths()[widths().length - 1];
  const sizes = () => props.sizes ?? "(min-width: 1100px) 360px, (min-width: 700px) 45vw, 92vw";

  return (
    <picture class={props.class} data-fit={info()?.cutout === false ? "photo" : "cutout"} style={info() ? { "--ph": info()!.color } : undefined}>
      <source type="image/avif" srcset={srcset("avif")} sizes={sizes()} />
      <img
        class={props.imgClass}
        src={imageUrl(props.image, fallback())}
        srcset={srcset("jpg")}
        sizes={sizes()}
        width={info()?.w}
        height={info()?.h}
        alt={props.alt}
        loading={props.priority ? "eager" : "lazy"}
        fetchpriority={props.priority ? "high" : undefined}
        decoding={props.priority ? "sync" : "async"}
      />
    </picture>
  );
}
