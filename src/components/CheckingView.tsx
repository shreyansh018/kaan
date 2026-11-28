"use client";

import { COPY } from "@/lib/i18n";
import { useLang } from "./LangProvider";

export function CheckingView({ step }: { step: number }) {
  const { t, lang } = useLang();

  return (
    <main className="shell checking">
      <div className="checking-card">
        <div className="spinner" aria-hidden="true" />
        <h1 className="checking-title">{t.checkingTitle}</h1>
        <p className="checking-sub">{t.checkingSub}</p>

        <ol className="checking-steps">
          {t.checkingSteps.map((label, index) => {
            const state = index < step ? "done" : index === step ? "active" : "todo";
            return (
              <li key={label} className={`checking-step is-${state}`}>
                <span className="checking-dot" aria-hidden="true">
                  {state === "done" ? "✓" : index + 1}
                </span>
                <span className="checking-text">
                  <span className="checking-hi">{label}</span>
                  {lang === "hi" ? (
                    <span className="checking-en">{COPY.en.checkingSteps[index]}</span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </main>
  );
}
