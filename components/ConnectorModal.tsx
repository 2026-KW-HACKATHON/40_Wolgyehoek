"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { ConnectorPanel } from "@/app/connect/connect-guide";
import { useI18n } from "@/lib/i18n/client";
import { McpIcon } from "./McpIcon";

export function ConnectorModal({ open, onClose, tools }: { open: boolean; onClose: () => void; tools: string[] }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return <dialog ref={ref} onClose={onClose} onClick={(e) => e.target === e.currentTarget && onClose()} aria-labelledby="connector-title"
    className="m-auto w-[min(920px,calc(100vw-32px))] max-h-[min(860px,calc(100dvh-48px))] overflow-hidden rounded-[24px] bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/40">
    <div className="flex max-h-[inherit] flex-col">
      <header className="flex items-center gap-3 border-b border-border px-6 py-4">
        <McpIcon className="size-5" />
        <h2 id="connector-title" className="flex-1 text-lg font-extrabold">{t.connect.title}</h2>
        <button type="button" onClick={onClose} aria-label={t.common.close} className="flex size-9 items-center justify-center rounded-full hover:bg-muted"><X className="size-5" /></button>
      </header>
      <div className="overflow-y-auto px-6 py-6">
        <p className="mb-6 text-[15px] font-medium text-muted-foreground">{t.connect.lead}</p>
        <ConnectorPanel tools={tools} />
      </div>
    </div>
  </dialog>;
}
