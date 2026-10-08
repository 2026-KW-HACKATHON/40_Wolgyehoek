import type { Metadata } from "next";
import { toolCatalog } from "@/lib/mcp/catalog";
import { EXAMPLE_PROMPT, MCP_CLIENTS, MCP_URL } from "@/lib/mcp/clients";
import { CodeBlock, ConnectGuide } from "./connect-guide";

export const metadata: Metadata = {
  title: "AI 앱 연결 · 동네서랍",
  description: "Claude·ChatGPT·Cursor·Claude Code·Codex에서 동네서랍의 문제와 선례를 물어보세요.",
};

export default function ConnectPage() {
  return <div className="mx-auto w-full max-w-[1200px] space-y-8 px-4 pt-8 md:px-8">
    <header>
      <h1 className="text-[34px] font-black tracking-[-0.04em]">AI 앱 연결</h1>
      <p className="mt-2 text-[17px] font-medium text-muted-foreground">쓰던 AI 앱에서 문제·선례·지역 리포트를 바로 물어보세요.</p>
    </header>

    <section className="max-w-[640px] space-y-2">
      <p className="text-sm font-bold text-muted-foreground">서버 URL</p>
      <CodeBlock code={MCP_URL} />
      <p className="text-sm text-muted-foreground">로그인·API 키 없이 연결돼요.</p>
    </section>

    <ConnectGuide clients={MCP_CLIENTS} />

    <section className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
      <p className="pt-3 text-sm font-bold text-muted-foreground">물어보기</p>
      <div className="min-w-0 space-y-3">
        <CodeBlock code={EXAMPLE_PROMPT} wrap />
        <div className="flex flex-wrap gap-1.5">{toolCatalog.map((t) => <code key={t.name} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{t.name}</code>)}</div>
      </div>
    </section>
  </div>;
}
