"use client";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/Button";
export default function ErrorPage({ reset }: { reset: () => void }) { const { t } = useI18n(); return <div className="flex flex-col items-center gap-5 px-6 py-24 text-center"><h1 className="text-xl font-extrabold">{t.system.error}</h1><Button onClick={reset}>{t.system.retry}</Button></div>; }
