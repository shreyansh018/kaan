"use client";

import { useMemo, useState } from "react";
import type { CheckResult } from "@/lib/types";
import { VERDICT_LABEL } from "@/lib/verdict";
import { VerdictAudio } from "./VerdictAudio";
import {
  IconArrowLeft,
  IconCheck,
  IconDownload,
  IconExternal,
  IconHelp,
  IconWhatsApp,
  IconX,
} from "./icons";

type Props = {
  result: CheckResult;
  onReset: () => void;
};

function VerdictIcon({ verdict }: { verdict: CheckResult["verdict"] }) {
  if (verdict === "galat") return <IconX size={16} />;
  if (verdict === "sach") return <IconCheck size={16} />;
  return <IconHelp size={16} />;
}

export function VerdictView({ result, onReset }: Props) {
  const [copied, setCopied] = useState(false);
  const label = VERDICT_LABEL[result.verdict];

  const shareText = useMemo(() => {
    const source = result.sources[0];
    return [
      result.claim,
      "",
      result.scriptHi,
      source ? `\nSource: ${source.name} (${source.date}) — ${source.url}` : "",
      "\n— checked by Kaan",
    ]
      .join("\n")
      .trim();
  }, [result]);

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="shell result">
      <header className="topbar topbar--result">
        <button type="button" className="back" onClick={onReset}>
          <IconArrowLeft size={16} />
          नया नोट
        </button>
        <span className="chip chip--engine">
          {result.engine === "llm" ? "AI extraction" : "Local matcher"}
        </span>
      </header>

      <section className="verdict-head">
        <span className={`badge badge--${result.verdict}`}>
          <VerdictIcon verdict={result.verdict} />
          {label.hi}
          <span className="badge-en">/ {label.en}</span>
        </span>
        <h1 className="verdict-title">{result.title}</h1>
        <p className="verdict-sub">
          {result.verdict === "unverified"
            ? "सोर्स नहीं मिला, इसलिए हमने सच या झूठ नहीं कहा — बिना सोर्स के कोई verdict नहीं।"
            : "एक claim मिला, verified सोर्स से मिलाया गया, और जवाब आपकी भाषा में।"}
        </p>
      </section>

      <div className="result-grid">
        <div className="result-main">
          <VerdictAudio result={result} />

          <section className="claim-card">
            <span className="eyebrow-sm">एक claim मिला · one claim found</span>
            <p className="claim-hi">{result.claim}</p>
            {result.claimEn ? <p className="claim-en">{result.claimEn}</p> : null}
          </section>

          <div className="actions">
            <a
              className="btn btn--primary"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsApp size={17} />
              WhatsApp पर भेजें
            </a>

            {result.audioUrl ? (
              <a
                className="btn"
                href={result.audioUrl}
                download={`kaan-${result.id}.mp3`}
              >
                <IconDownload size={16} />
                Audio
              </a>
            ) : null}

            <button type="button" className="btn btn--ghost" onClick={copy}>
              {copied ? "Copy हो गया ✓" : "Copy verdict"}
            </button>
          </div>

          <p className="footnote">
            जवाब audio में है ताकि इसे वापस उसी ग्रुप में भेजा जा सके — जहाँ से नोट
            आया था। Voice is the delivery format, not a feature.
          </p>
        </div>

        <aside className="result-side">
          <section className="panel">
            <h2 className="panel-title">सोर्स · Sources</h2>
            {result.sources.length > 0 ? (
              <ul className="sources">
                {result.sources.map((source) => (
                  <li key={source.url} className="source">
                    <div className="source-top">
                      <strong>{source.name}</strong>
                      <span className="source-date">{source.date}</span>
                    </div>
                    <p className="source-note">{source.noteHi}</p>
                    <p className="source-note source-note--en">{source.noteEn}</p>
                    <a
                      className="source-link"
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {new URL(source.url).hostname}
                      <IconExternal size={13} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">
                कोई verified सोर्स नहीं मिला। इसीलिए Kaan ने सच या झूठ नहीं कहा —
                बिना सोर्स के कोई verdict नहीं।
              </p>
            )}
          </section>

          <section className="panel">
            <h2 className="panel-title">नोट का transcript</h2>
            <details className="details">
              <summary>पूरा नोट देखें · full transcript</summary>
              <p className="transcript">{result.transcript}</p>
            </details>
          </section>

          <section className="panel meta">
            <div>
              <span>Engine</span>
              <strong>{result.engine === "llm" ? "AI extraction" : "Local matcher"}</strong>
            </div>
            <div>
              <span>Match</span>
              <strong>{Math.round(result.confidence * 100)}%</strong>
            </div>
            <div>
              <span>Checked</span>
              <strong>{result.checkedAgainst.length} registries</strong>
            </div>
            <div>
              <span>Time</span>
              <strong>{result.ms} ms</strong>
            </div>
          </section>

          <button type="button" className="btn btn--wide" onClick={onReset}>
            नया नोट check करें
          </button>
        </aside>
      </div>
    </main>
  );
}
