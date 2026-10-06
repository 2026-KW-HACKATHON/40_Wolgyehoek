"use client";
import "./globals.css";
import { Button } from "@/components/ui/Button";
export default function GlobalError({ reset }: { reset: () => void }) { return <html lang="ko"><body><main className="mx-auto max-w-md space-y-4 px-6 py-20"><h1 className="text-xl font-semibold">동네서랍에 연결하지 못했어요</h1><p className="text-sm text-muted-foreground">잠시 후 다시 시도해 주세요.</p><Button onClick={reset}>다시 시도</Button></main></body></html>; }
