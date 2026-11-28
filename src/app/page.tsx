"use client";

import { useCallback, useEffect, useState } from "react";
import seedsData from "@/data/seeds.json";
import type { CheckResult, Seed } from "@/lib/types";
import { VERDICT_LABEL } from "@/lib/verdict";
import { AudioUpload } from "@/components/AudioUpload";
import { CheckingView } from "@/components/CheckingView";
import { LangToggle } from "@/components/LangToggle";
import { useLang } from "@/components/LangProvider";
import { Recorder } from "@/components/Recorder";
import { SeedCard } from "@/components/SeedCard";
import { VerdictView } from "@/components/VerdictView";
import { IconArrowRight, IconCheck, IconHelp, IconX } from "@/components/icons";

const SEEDS = seedsData as unknown as Seed[];
const RECENT_KEY = "kaan.recent.v1";

type Phase = "home" | "checking" | "result";
type Engine = "local" | "llm";

function RecentDot({ verdict }: { verdict: CheckResult["verdict"] }) {
  if (verdict === "galat") return <IconX size={13} />;
  if (verdict === "sach") return <IconCheck size={13} />;
  return <IconHelp size={13} />;
}

export default function HomePage() {
  const { t, lang } = useLang();
  const [phase, setPhase] = useState<Phase>("home");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [engine, setEngine] = useState<Engine>("local");
  const [corpusSize, setCorpusSize] = useState<number>(0);
  const [uploadEngine, setUploadEngine] = useState(false);
  const [recent, setRecent] = useState<CheckResult[]>([]);

  useEffect(() => {
    fetch("/api/health")
      .then((response) => response.json())
      .then((data: { engine?: string; corpus?: number; transcribe?: string }) => {
        setEngine(data.engine === "llm" ? "llm" : "local");
        setUploadEngine(data.transcribe === "whisper");
        if (typeof data.corpus === "number") setCorpusSize(data.corpus);
      })
      .catch(() => {
        /* health is cosmetic — the app still works */
      });
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw) as CheckResult[]);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  const saveRecent = useCallback((item: CheckResult) => {
    setRecent((previous) => {
      const next = [item, ...previous.filter((entry) => entry.id !== item.id)].slice(0, 4);
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* storage may be full or blocked */
      }
      return next;
    });
  }, []);

  const runCheck = useCallback(
    async (transcript: string, seedId: string | null) => {
      const clean = transcript.trim();
      if (!clean) {
        setError(t.errorEmpty);
        return;
      }

      setError(null);
      setPhase("checking");
      setStep(0);

      const timers = [
        window.setTimeout(() => setStep(1), 500),
        window.setTimeout(() => setStep(2), 1050),
      ];

      try {
        const [response] = await Promise.all([
          fetch("/api/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript: clean, seedId }),
          }),
          new Promise((resolve) => window.setTimeout(resolve, 1600)),
        ]);

        const data = (await response.json()) as CheckResult & { error?: string };

        if (!response.ok || data.error) {
          throw new Error(typeof data.error === "string" ? data.error : "check_failed");
        }

        setResult(data);
        setPhase("result");
        saveRecent(data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        setError(t.errorGeneric);
        setPhase("home");
      } finally {
        timers.forEach((timer) => window.clearTimeout(timer));
      }
    },
    [saveRecent, t],
  );

  /** An uploaded file becomes the note, and the check runs straight away. */
  const onUploaded = useCallback(
    (transcript: string, seedId: string | null) => {
      setText(transcript);
      void runCheck(transcript, seedId);
    },
    [runCheck],
  );

  function reset() {
    setPhase("home");
    setResult(null);
    setStep(0);
  }

  if (phase === "checking") {
    return <CheckingView step={step} />;
  }

  if (phase === "result" && result) {
    return <VerdictView result={result} onReset={reset} />;
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">क</span>
          <div className="brand-text">
            <strong>Kaan</strong>
            <span>{t.brandTag}</span>
          </div>
        </div>

        <div className="topbar-right">
          <LangToggle />
          <span className={`chip ${engine === "llm" ? "chip--on" : ""}`}>
            {engine === "llm" ? t.chipLlm : t.chipLocal}
          </span>
        </div>
      </header>

      <section className="hero">
        <h1>
          {t.heroLine1}
          <br />
          <em>{t.heroLine2}</em>
        </h1>
        <p className="lede">{t.lede}</p>
      </section>

      <div className="grid">
        <section className="panel panel--main">
          <div className="panel-head">
            <h2 className="panel-title">{t.tryTitle}</h2>
            <span className="panel-hint">{t.tryHint}</span>
          </div>

          <div className="seeds">
            {SEEDS.map((seed) => (
              <SeedCard
                key={seed.id}
                seed={seed}
                onCheck={(item) => void runCheck(item.transcript, item.id)}
                disabled={phase !== "home"}
              />
            ))}
          </div>

          <div className="composer">
            <Recorder onTranscript={(value) => setText(value)} disabled={phase !== "home"} />

            <AudioUpload
              onTranscript={onUploaded}
              disabled={phase !== "home"}
              engineOn={uploadEngine}
            />

            <div className="composer-input">
              <label className="composer-label" htmlFor="note">
                {t.composerLabel}
              </label>
              <textarea
                id="note"
                className="textarea"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={t.composerPlaceholder}
                rows={4}
              />
              <div className="composer-actions">
                <span className="counter">
                  {text.trim() ? t.words(text.trim().split(/\s+/).length) : t.langHint}
                </span>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => void runCheck(text, null)}
                  disabled={!text.trim()}
                >
                  {t.checkBtn}
                  <IconArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {error ? <p className="error">{error}</p> : null}
        </section>

        <aside className="side">
          <section className="panel">
            <h2 className="panel-title">{t.howTitle}</h2>
            <ol className="steps">
              {t.steps.map((item, index) => (
                <li key={item.title}>
                  <span className="step-num">{index + 1}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="panel">
            <h2 className="panel-title">{t.rulesTitle}</h2>
            <ul className="rules">
              {t.rules.map((rule, index) => (
                <li key={rule}>
                  <span
                    className={`rule-icon ${
                      index === t.rules.length - 1 ? "rule-icon--yes" : "rule-icon--no"
                    }`}
                  >
                    {index === t.rules.length - 1 ? (
                      <IconCheck size={13} />
                    ) : (
                      <IconX size={13} />
                    )}
                  </span>
                  {rule}
                </li>
              ))}
            </ul>
          </section>

          {recent.length > 0 ? (
            <section className="panel">
              <h2 className="panel-title">{t.recentTitle}</h2>
              <ul className="recent">
                {recent.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setResult(item);
                        setPhase("result");
                      }}
                    >
                      <span className={`recent-dot recent-dot--${item.verdict}`}>
                        <RecentDot verdict={item.verdict} />
                      </span>
                      <span className="recent-title">
                        {lang === "hi" ? item.title : item.titleEn || item.title}
                      </span>
                      <span className="recent-verdict">
                        {VERDICT_LABEL[item.verdict][lang]}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>

    </main>
  );
}
