"use client";

import { LANGS } from "@/lib/i18n";
import { useLang } from "./LangProvider";

export function LangToggle() {
  const { lang, setLang, t } = useLang();

  return (
    <div className="lang-toggle" role="group" aria-label={t.switchLabel}>
      {LANGS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`lang-btn ${lang === item.id ? "is-on" : ""}`}
          onClick={() => setLang(item.id)}
          aria-pressed={lang === item.id}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
