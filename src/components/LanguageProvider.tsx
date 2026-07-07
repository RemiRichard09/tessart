"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_LANG, DICTS, type Dict, type Lang } from "@/lib/dictionaries";
import { makeFormatters, type Formatters } from "@/lib/format";

interface I18nValue {
  lang: Lang;
  t: Dict;
  fmt: Formatters;
  setLang: (lang: Lang) => void;
}

const STORAGE_KEY = "tessart-lang";

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "fr" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      t: DICTS[lang],
      fmt: makeFormatters(lang),
      setLang: (l: Lang) => {
        setLangState(l);
        window.localStorage.setItem(STORAGE_KEY, l);
      },
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}

/** FR / EN toggle pills. */
export function LanguageSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center rounded-lg border border-edge bg-card p-0.5 text-xs font-semibold"
    >
      {(["fr", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-md px-2.5 py-1 uppercase transition-colors ${
            lang === l ? "bg-card-2 text-txt" : "text-txt-3 hover:text-txt-2"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
