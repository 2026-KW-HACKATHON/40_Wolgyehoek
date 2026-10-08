"use client";
import { createContext, useContext } from "react";
import type { Locale } from "./config";
import { messages, type Messages } from "./messages";

const I18nContext = createContext<{ locale: Locale; t: Messages }>({ locale: "ko", t: messages.ko });

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, t: messages[locale] }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
