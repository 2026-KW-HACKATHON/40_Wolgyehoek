"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { setLocale } from "@/app/locale-actions";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const next = locale === "ko" ? "en" : "ko";
  return <button type="button" disabled={pending} aria-label={t.shell.switchLabel} lang={next}
    onClick={() => start(async () => { await setLocale(next); router.refresh(); })}
    className={cn("flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-[15px] font-bold text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground", pending && "opacity-60")}>
    <Languages className="size-4" strokeWidth={2.4} /><span className="hidden sm:inline">{t.shell.switchTo}</span>
  </button>;
}
