import Image from "next/image";
import { cn } from "@/lib/utils";

// 원본: public/brand/*.svg (설명은 public/brand/README.md)
export function BrandMark({ className }: { className?: string }) {
  return <Image src="/brand/glyph.svg" alt="" aria-hidden="true" width={64} height={64} unoptimized className={cn("size-8 shrink-0 select-none", className)} draggable={false} />;
}

export function BrandLogo({ className }: { className?: string }) {
  return <Image src="/brand/mark.svg" alt="" aria-hidden="true" width={64} height={64} unoptimized priority className={cn("size-8 shrink-0", className)} />;
}
