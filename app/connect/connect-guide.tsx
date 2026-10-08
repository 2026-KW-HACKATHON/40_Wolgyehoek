"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Copy } from "lucide-react";
import type { McpClient } from "@/lib/mcp/clients";
import { cn } from "@/lib/utils";

export function CodeBlock({ code, wrap = false }: { code: string; wrap?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }
  return <div className="relative rounded-xl border border-border bg-muted">
    <pre className={cn("overflow-x-auto px-4 py-3 pr-12 font-mono text-[13px] leading-relaxed", wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre")}>{code}</pre>
    <button type="button" onClick={copy} aria-label={copied ? "복사됨" : "복사"}
      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-lg bg-background ring-1 ring-border hover:bg-[var(--muted-hover)]">
      {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4 text-muted-foreground" />}
    </button>
  </div>;
}

export function ConnectGuide({ clients }: { clients: McpClient[] }) {
  const [id, setId] = useState(clients[0].id);
  const client = clients.find((c) => c.id === id) ?? clients[0];
  return <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
    <div role="tablist" aria-label="연결할 앱" className="flex min-w-0 gap-2 overflow-x-auto [scrollbar-width:none] md:flex-col">
      {clients.map((c) => <button key={c.id} type="button" role="tab" aria-selected={c.id === id} onClick={() => setId(c.id)}
        className={cn("flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-bold transition-colors",
          c.id === id ? "bg-muted ring-1 ring-border" : "hover:bg-muted")}>
        <span className="flex size-9 items-center justify-center rounded-xl bg-background ring-1 ring-border">
          <Image src={c.logo} alt="" width={20} height={20} unoptimized />
        </span>
        {c.name}
      </button>)}
    </div>

    <div role="tabpanel" className="min-w-0 rounded-[18px] border border-border p-5 md:p-6">
      <div className="flex items-center gap-3">
        <Image src={client.logo} alt="" width={24} height={24} unoptimized />
        <h2 className="text-lg font-extrabold">{client.name}</h2>
        {client.note && <span className="text-sm text-muted-foreground">{client.note}</span>}
      </div>
      <ol className="mt-5 space-y-4">
        {client.steps.map((s, i) => <li key={s.title} className="flex gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">{i + 1}</span>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-[15px] font-semibold leading-6">{s.title}</p>
            {i === 0 && client.install && <a href={client.install} className="bg-brand inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-bold text-white">
              <Image src={client.logo} alt="" width={16} height={16} unoptimized className="invert" />Cursor에 설치
            </a>}
            {s.code && <CodeBlock code={s.code} />}
          </div>
        </li>)}
      </ol>
    </div>
  </div>;
}
