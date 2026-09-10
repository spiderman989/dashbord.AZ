import Image from "next/image";
import type { CSSProperties } from "react";
import { ImageIcon } from "lucide-react";

const crops: Record<string, [number, number, number, number]> = {
  building: [226, 776, 173, 79], analytics: [36, 776, 172, 79],
  meeting: [226, 900, 173, 73], training: [36, 900, 172, 73],
  hero: [852, 106, 312, 207],
};
export function AssetImage({ src, alt, className = "", priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  const crop = crops[src.replace("reference:", "")];
  if (src.startsWith("reference:") && crop) {
    const [x, y, width, height] = crop;
    const style: CSSProperties = { aspectRatio: `${width} / ${height}` };
    return <span className={`asset-image reference-image ${className}`} style={style} role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}><Image src="/assets/portal-reference.png" alt="" width={1448} height={1086} priority={priority} unoptimized style={{ width: `${1448 / width * 100}%`, height: `${1086 / height * 100}%`, left: `${-x / width * 100}%`, top: `${-y / height * 100}%` }} /></span>;
  }
  if (/^data:image\/(png|jpeg|webp);base64,/.test(src) || src.startsWith("/assets/")) return <span className={`asset-image uploaded-image ${className}`}><Image src={src} alt={alt} fill unoptimized sizes="(max-width: 768px) 100vw, 400px" /></span>;
  return <span className={`asset-image image-fallback ${className}`} role="img" aria-label={alt || "تصویر در دسترس نیست"}><ImageIcon size={34} /><span>تصویر در دسترس نیست</span></span>;
}
