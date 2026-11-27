"use client";

import { useCallback, useEffect, useState } from "react";
import seedsData from "@/data/seeds.json";
import type { CheckResult, Seed } from "@/lib/types";
import { VERDICT_LABEL } from "@/lib/verdict";
import { CheckingView } from "@/components/CheckingView";
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
  const [phase, setPhase] = useState<Phase>("home");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [engine, setEngine] = useState<Engine>("local");
  const [corpusSize, setCorpusSize] = useState<number>(0);
  const [recent, setRecent] = useState<CheckResult[]>([]);

  useEffect(() => {
    fetch("/api/health")
      .then((response) => response.json())
      .then((data: { engine?: string; corpus?: number }) => {
        setEngine(data.engine === "llm" ? "llm" : "local");
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
        setError("पहले कोई नोट लिखें या बोलें। (Add a note first.)");
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
        setError("कुछ गड़बड़ हो गई। दोबारा कोशिश करें। (Something went wrong — try again.)");
        setPhase("home");
      } finally {
        timers.forEach((timer) => window.clearTimeout(timer));
      }
    },
    [saveRecent],
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
            <span>सुनो, फिर मानो</span>
          </div>
        </div>
        <span className={`chip ${engine === "llm" ? "chip--on" : ""}`}>
          {engine === "llm" ? "AI extraction on" : "Local matcher · no key needed"}
        </span>
      </header>

      <section className="hero">
        <p className="eyebrow">Round 2 · Build for Bharat · voice-first prototype</p>
        <h1>
          एक वॉइस नोट भेजिए।
          <br />
          <em>20 सेकंड में सच।</em>
        </h1>
        <p className="lede">
          Forwarded WhatsApp voice notes are how misinformation travels in India —
          and every fact-checker only reads text. Kaan listens to the note, finds
          the one checkable claim, and answers in the same language, with the
          source named aloud.
        </p>
      </section>

      <div className="grid">
        <section className="panel panel--main">
          <div className="panel-head">
            <h2 className="panel-title">Try a forwarded note</h2>
            <span className="panel-hint">3 bundled notes · works offline</span>
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

            <div className="composer-input">
              <label className="composer-label" htmlFor="note">
                या नोट लिखें / पेस्ट करें
              </label>
              <textarea
                id="note"
                className="textarea"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Forwarded note यहाँ पेस्ट करें… / paste the forwarded note here"
                rows={4}
              />
              <div className="composer-actions">
                <span className="counter">
                  {text.trim()
                    ? `${text.trim().split(/\s+/).length} words`
                    : "Hindi, Hinglish or English"}
                </span>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => void runCheck(text, null)}
                  disabled={!text.trim()}
                >
                  Check करें
                  <IconArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {error ? <p className="error">{error}</p> : null}
        </section>

        <aside className="side">
          <section className="panel">
            <h2 className="panel-title">कैसे काम करता है · how it works</h2>
            <ol className="steps">
              <li>
                <span className="step-num">1</span>
                <div>
                  <strong>Listen</strong>
                  <p>Transcribes the note in the language it was actually spoken in.</p>
                </div>
              </li>
              <li>
                <span className="step-num">2</span>
                <div>
                  <strong>One claim</strong>
                  <p>Pulls the single checkable assertion out of a 40-second ramble.</p>
                </div>
              </li>
              <li>
                <span className="step-num">3</span>
                <div>
                  <strong>Check &amp; speak</strong>
                  <p>Matches verified sources and replies in 20 seconds of audio.</p>
                </div>
              </li>
            </ol>
          </section>

          <section className="panel">
            <h2 className="panel-title">Kaan क्या नहीं करेगा</h2>
            <ul className="rules">
              <li>
                <span className="rule-icon rule-icon--no">
                  <IconX size={13} />
                </span>
                No verdict without a named source
              </li>
              <li>
                <span className="rule-icon rule-icon--no">
                  <IconX size={13} />
                </span>
                No politics, no medical advice
              </li>
              <li>
                <span className="rule-icon rule-icon--yes">
                  <IconCheck size={13} />
                </span>
                Refuses when it cannot verify
              </li>
            </ul>
          </section>

          {recent.length > 0 ? (
            <section className="panel">
              <h2 className="panel-title">हाल की जाँच · recent</h2>
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
                      <span className="recent-title">{item.title}</span>
                      <span className="recent-verdict">
                        {VERDICT_LABEL[item.verdict].en}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>

      <footer className="footer">
        <span>
          Kaan · Round 2 build · {corpusSize > 0 ? corpusSize : 10} curated verified
          claims · audio bundled, no API key required
        </span>
      </footer>
    </main>
  );
}
