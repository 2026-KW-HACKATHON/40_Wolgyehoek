"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Copy } from "lucide-react";
import { MCP_CLIENTS, MCP_URL } from "@/lib/mcp/clients";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export function CodeBlock({ code, wrap = false }: { code: string; wrap?: boolean }) {
  const { t } = useI18n();
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
    <button type="button" onClick={copy} aria-label={copied ? t.connect.copied : t.connect.copy}
      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-lg bg-background ring-1 ring-border hover:bg-[var(--muted-hover)]">
      {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4 text-muted-foreground" />}
    </button>
  </div>;
}

export function ConnectGuide() {
  const { t } = useI18n();
  const [id, setId] = useState(MCP_CLIENTS[0].id);
  const client = MCP_CLIENTS.find((c) => c.id === id) ?? MCP_CLIENTS[0];
  const note = t.connect.notes[client.id];
  return <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
    <div role="tablist" aria-label={t.connect.apps} className="flex min-w-0 gap-2 overflow-x-auto [scrollbar-width:none] md:flex-col">
      {MCP_CLIENTS.map((c) => <button key={c.id} type="button" role="tab" aria-selected={c.id === id} onClick={() => setId(c.id)}
        className={cn("flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-bold transition-colors",
          c.id === id ? "bg-muted ring-1 ring-border" : "hover:bg-muted")}>
        <span className="flex size-9 items-center justify-center rounded-xl bg-background ring-1 ring-border">
          <Image src={c.logo} alt="" width={20} height={20} unoptimized />
        </span>
        {c.name}
      </button>)}
    </div>

    <div role="tabpanel" className="min-w-0 rounded-[18px] border border-border p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Image src={client.logo} alt="" width={24} height={24} unoptimized />
        <h3 className="text-lg font-extrabold">{client.name}</h3>
        {note && <span className="text-sm text-muted-foreground">{note}</span>}
      </div>
      <ol className="mt-5 space-y-4">
        {client.steps.map((s, i) => <li key={i} className="flex gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">{i + 1}</span>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-[15px] font-semibold leading-6">{t.connect.steps[client.id]?.[i]}</p>
            {i === 0 && client.install && <a href={client.install} className="bg-brand inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-bold text-white">
              <Image src={client.logo} alt="" width={16} height={16} unoptimized className="invert" />{t.connect.installCursor}
            </a>}
            {s.code && <CodeBlock code={s.code} />}
          </div>
        </li>)}
      </ol>
    </div>
  </div>;
}

export function ConnectorPanel({ tools }: { tools: string[] }) {
  const { t } = useI18n();
  return <div className="space-y-8">
    <section className="max-w-[640px] space-y-2">
      <p className="text-sm font-bold text-muted-foreground">{t.connect.serverUrl}</p>
      <CodeBlock code={MCP_URL} />
      <p className="text-sm text-muted-foreground">{t.connect.noAuth}</p>
    </section>

    <ConnectGuide />

    <section className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
      <p className="pt-3 text-sm font-bold text-muted-foreground">{t.connect.ask}</p>
      <div className="min-w-0 space-y-3">
        <CodeBlock code={t.connect.example} wrap />
        <div className="flex flex-wrap gap-1.5">{tools.map((name) => <code key={name} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{name}</code>)}</div>
      </div>
    </section>
  </div>;
}
