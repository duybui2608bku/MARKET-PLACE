"use client";

import React, { createContext, useContext, useMemo } from "react";

type Messages = Record<string, any>;

type I18nContextValue = {
  locale: string;
  messages: Messages;
  t: (key: string, fallback?: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getByPath(obj: any, path: string) {
  return path.split(".").reduce((acc, part) => (acc && acc[part] != null ? acc[part] : undefined), obj);
}

export function I18nProvider({ locale, messages, children }: { locale: string; messages: Messages; children: React.ReactNode }) {
  const value = useMemo<I18nContextValue>(() => {
    return {
      locale,
      messages,
      t: (key: string, fallback?: string) => {
        const val = getByPath(messages, key);
        if (typeof val === "string") return val;
        return fallback ?? key;
      },
    };
  }, [locale, messages]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used within I18nProvider");
  return ctx.t;
}

export function useLocale() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useLocale must be used within I18nProvider");
  return ctx.locale;
}


