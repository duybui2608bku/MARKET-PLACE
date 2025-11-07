export const SUPPORTED_LOCALES = ["en", "vi", "zh", "ko"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = "vi";


