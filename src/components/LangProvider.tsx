"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { COPY, type Copy, type Lang } from "@/lib/i18n";

const STORAGE_KEY = "kaan.lang.v1";

type LangContextValue = {
  lang: Lang;
  setLang: (next: Lang) => void;
  /** The copy for the current language. */
  t: Copy;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  // Hindi first: it is who the product is for. The stored choice wins on mount.
  const [lang, setLangState] = useState<Lang>("hi");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "hi" || stored === "en") setLangState(stored);
    } catch {
      /* private mode / storage blocked — Hindi is a fine default */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* not fatal: the toggle still works for this session */
    }
  }, []);

  const value = useMemo<LangContextValue>(
    () => ({ lang, setLang, t: COPY[lang] }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error("useLang must be used inside <LangProvider>");
  }
  return context;
}
