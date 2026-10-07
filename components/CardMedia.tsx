import Image from "next/image";
import type { Media } from "@/lib/domain/types";
import { cardSurface } from "@/lib/surface";
import { BrandMark } from "./BrandMark";

export function CardBackdrop({ cardId, media, playing = true }: { cardId: string; media?: Media; playing?: boolean }) {
  if (media?.kind === "IMAGE") {
    return <Image src={`/media/${media.id}`} alt="" fill unoptimized draggable={false} sizes="480px" className="pointer-events-none select-none object-cover" />;
  }
  if (media?.kind === "VIDEO") {
    return <video key={media.id} src={`/media/${media.id}`} autoPlay={playing} muted loop playsInline preload={playing ? "auto" : "metadata"} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full object-cover" />;
  }
  return <>
    <div aria-hidden="true" className="absolute inset-0" style={{ background: cardSurface(cardId) }} />
    <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgb(255_240_200/.22),transparent_45%)]" />
    <BrandMark className="pointer-events-none absolute -right-12 top-10 size-72 rotate-[14deg] opacity-[0.12]" />
  </>;
}
