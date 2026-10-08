"use client";

import { useState } from "react";

export function CopyUrl({ url }: { url: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <code className="min-w-0 break-all text-sm sm:text-base">{url}</code>
        <button type="button" onClick={copy} className="h-12 shrink-0 rounded-xl bg-brand px-6 font-semibold text-primary-foreground hover:opacity-90">
          {status === "copied" ? "복사 완료" : "URL 복사"}
        </button>
      </div>
      <p role="status" className="mt-3 min-h-5 text-sm text-muted-foreground">
        {status === "copied" ? "커넥터 URL을 복사했습니다." : status === "failed" ? "복사하지 못했습니다. 위 URL을 선택해 직접 복사해 주세요." : ""}
      </p>
    </div>
  );
}
