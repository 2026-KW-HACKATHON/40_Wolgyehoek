"use client";
import "./globals.css";
import { useSyncExternalStore } from "react";
import { messages } from "@/lib/i18n/messages";
import { LOCALE_COOKIE } from "@/lib/i18n/config";
const subscribe = () => () => {};
const browserLocale = () => document.cookie.split(";").some((part) => part.trim() === `${LOCALE_COOKIE}=en`) ? "en" : "ko";
const serverLocale = () => "ko" as const;
import { Button } from "@/components/ui/Button";
export default function GlobalError({ reset }: { reset: () => void }) { const locale = useSyncExternalStore(subscribe, browserLocale, serverLocale); const t = messages[locale]; return <html lang={locale}><body><main className="mx-auto max-w-md space-y-4 px-6 py-20"><h1 className="text-xl font-semibold">{t.system.connection}</h1><p className="text-sm text-muted-foreground">{t.system.tryLater}</p><Button onClick={reset}>{t.system.retry}</Button></main></body></html>; }
