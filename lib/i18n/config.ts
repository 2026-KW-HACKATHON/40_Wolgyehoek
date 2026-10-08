export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = "lang";
export const DEFAULT_LOCALE: Locale = "ko";
export const isLocale = (v: unknown): v is Locale => v === "ko" || v === "en";
