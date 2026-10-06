"use client";
import { Button } from "@/components/ui/Button";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="mx-auto max-w-md space-y-4 px-6 py-20"><h1 className="text-xl font-semibold">화면을 불러오지 못했어요</h1><p className="text-sm leading-6 text-muted-foreground">잠시 후 다시 시도해 주세요. 작성 중인 내용은 다시 시도하기 전에 복사해 두면 좋아요.</p><Button onClick={reset}>다시 시도</Button></div>; }
