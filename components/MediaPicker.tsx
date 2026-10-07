"use client";
import Image from "next/image";
import { useRef } from "react";
import { ImagePlus, LoaderCircle, Play, X } from "lucide-react";
import { MEDIA_LIMIT_BYTES, MEDIA_MAX, type Media } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export type PickedMedia = { key: string; kind: Media["kind"]; preview: string; id?: string; error?: string };

async function upload(file: File): Promise<Media> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/media", { method: "POST", body });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message ?? "올리지 못했어요. 다시 시도해 주세요.");
  return data as Media;
}

export function MediaPicker({ items, onChange }: { items: PickedMedia[]; onChange: (update: (items: PickedMedia[]) => PickedMedia[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const failed = items.find(i => i.error);

  function add(files: FileList | null) {
    if (!files) return;
    const room = MEDIA_MAX - items.length;
    for (const file of Array.from(files).slice(0, room)) {
      const kind = file.type.startsWith("video/") ? "VIDEO" : file.type.startsWith("image/") ? "IMAGE" : null;
      const key = crypto.randomUUID();
      const preview = URL.createObjectURL(file);
      if (!kind) { onChange(list => [...list, { key, kind: "IMAGE", preview, error: "사진이나 영상만 올릴 수 있어요." }]); continue; }
      if (file.size > MEDIA_LIMIT_BYTES[kind]) { onChange(list => [...list, { key, kind, preview, error: kind === "IMAGE" ? "사진은 10MB 이하로 올려 주세요." : "영상은 50MB 이하로 올려 주세요." }]); continue; }
      onChange(list => [...list, { key, kind, preview }]);
      upload(file).then(
        media => onChange(list => list.map(i => i.key === key ? { ...i, id: media.id, kind: media.kind } : i)),
        (e: Error) => onChange(list => list.map(i => i.key === key ? { ...i, error: e.message } : i)),
      );
    }
    if (input.current) input.current.value = "";
  }

  function remove(key: string) {
    onChange(list => list.filter(i => { if (i.key === key) URL.revokeObjectURL(i.preview); return i.key !== key; }));
  }

  return <div>
    <div className="grid grid-cols-4 gap-2">
      {items.map(i => <div key={i.key} className={cn("relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted", i.error && "ring-2 ring-destructive")}>
        {i.kind === "IMAGE" ? <Image src={i.preview} alt="" fill unoptimized className="object-cover" /> : <><video src={i.preview} muted playsInline preload="metadata" className="absolute inset-0 size-full object-cover" /><Play aria-hidden="true" className="absolute bottom-2 left-2 size-4 fill-white text-white drop-shadow" /></>}
        {!i.id && !i.error && <span role="status" aria-label="올리는 중" className="absolute inset-0 flex items-center justify-center bg-black/35 text-white"><LoaderCircle className="size-6 animate-spin motion-reduce:animate-none" /></span>}
        <button type="button" onClick={() => remove(i.key)} aria-label="첨부 삭제" className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur"><X className="size-4" /></button>
      </div>)}
      {items.length < MEDIA_MAX && <button type="button" onClick={() => input.current?.click()} aria-label="사진·영상 추가" className="flex aspect-[3/4] items-center justify-center rounded-2xl border-2 border-dashed border-border text-[var(--text-4)] transition-colors hover:border-primary hover:text-primary">
        <ImagePlus className="size-7" />
      </button>}
    </div>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm" multiple hidden onChange={e => add(e.target.files)} />
    {failed && <p role="alert" className="mt-2 text-sm text-destructive">{failed.error}</p>}
  </div>;
}
