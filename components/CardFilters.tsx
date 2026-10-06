"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Tabs, TabsList, TabsTrigger } from "./ui/Tabs";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Search } from "lucide-react";
export function CardFilters({ tab, q }: { tab: string; q: string }) {
  const router = useRouter(); const [pending, start] = useTransition();
  return <div className="flex w-full flex-wrap items-center justify-between gap-3 py-2" aria-busy={pending}>
    <Tabs value={tab} variant="underline" onValueChange={value => start(() => router.push(`/?${new URLSearchParams({ tab: value, q })}`))}>
      <TabsList aria-label="카드 상태"><TabsTrigger value="all">전체</TabsTrigger><TabsTrigger value="open">검증 중</TabsTrigger><TabsTrigger value="done">결론·종료</TabsTrigger></TabsList>
    </Tabs>
    <form action="/" className="flex w-full items-center gap-2 sm:w-auto"><input type="hidden" name="tab" value={tab} /><Input name="q" defaultValue={q} aria-label="카드 검색" placeholder="아이디어, 장소 검색" size="sm" className="sm:w-52" /><Button type="submit" size="sm" variant="outline" aria-label="검색"><Search /><span className="sr-only sm:not-sr-only">검색</span></Button></form>
  </div>;
}
