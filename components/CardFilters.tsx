"use client";
import { useI18n } from "@/lib/i18n/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Tabs, TabsList, TabsTrigger } from "./ui/Tabs";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Search } from "lucide-react";
export function CardFilters({ tab, q }: { tab: string; q: string }) {
  const { t } = useI18n();
  const router = useRouter(); const [pending, start] = useTransition();
  return <div className="flex w-full flex-wrap items-center justify-between gap-3 py-2" aria-busy={pending}>
    <Tabs value={tab} variant="underline" onValueChange={value => start(() => router.push(`/?${new URLSearchParams({ tab: value, q })}`))}>
      <TabsList aria-label={t.explore.cardStatus}><TabsTrigger value="all">{t.explore.all}</TabsTrigger><TabsTrigger value="open">{t.common.cardStatus.open}</TabsTrigger><TabsTrigger value="done">{t.explore.done}</TabsTrigger></TabsList>
    </Tabs>
    <form action="/" className="flex w-full items-center gap-2 sm:w-auto"><input type="hidden" name="tab" value={tab} /><Input name="q" defaultValue={q} aria-label={t.explore.cardSearch} placeholder={t.explore.searchPlaceholder} size="sm" className="sm:w-52" /><Button type="submit" size="sm" variant="outline" aria-label={t.explore.search}><Search /><span className="sr-only sm:not-sr-only">{t.explore.search}</span></Button></form>
  </div>;
}
