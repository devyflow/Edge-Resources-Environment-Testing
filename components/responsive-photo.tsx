import Image from "next/image";
import type { CSSProperties } from "react";

type ResponsivePhotoProps = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  width?: number;
  height?: number;
};

export default function ResponsivePhoto({ src, alt, sizes, priority = false, className, style, width, height }: ResponsivePhotoProps) {
  if (src.startsWith("/")) {
    return <Image className={className} style={style} src={src} alt={alt} width={width ?? 2592} height={height ?? 1728} sizes={sizes} priority={priority} />;
  }

  return <img className={className} style={style} src={src} alt={alt} width={width} height={height} loading={priority ? "eager" : "lazy"} />;
}
