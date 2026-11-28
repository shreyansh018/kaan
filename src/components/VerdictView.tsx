"use client";

import { useMemo, useState } from "react";
import type { CheckResult } from "@/lib/types";
import { VERDICT_LABEL } from "@/lib/verdict";
import { LangToggle } from "./LangToggle";
import { useLang } from "./LangProvider";
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
  const { t, lang } = useLang();
  const [copied, setCopied] = useState(false);

  const label = VERDICT_LABEL[result.verdict];
  const title = lang === "hi" ? result.title : result.titleEn;
  const claim = lang === "hi" ? result.claim : result.claimEn || result.claim;
  const script = lang === "hi" ? result.scriptHi : result.scriptEn;
  const audio = lang === "hi" ? result.audioUrl : (result.audioUrlEn ?? result.audioUrl);

  const shareText = useMemo(() => {
    const source = result.sources[0];
    return [
      claim,
      "",
      script,
      source ? `\nSource: ${source.name} (${source.date}) — ${source.url}` : "",
      "\n— checked by Kaan",
    ]
      .join("\n")
      .trim();
  }, [claim, script, result.sources]);

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
          {t.back}
        </button>

        <div className="topbar-right">
          <LangToggle />
          <span className="chip chip--engine">
            {result.engine === "llm" ? t.engineLlm : t.engineLocal}
          </span>
        </div>
      </header>

      <section className="verdict-head">
        <span className={`badge badge--${result.verdict}`}>
          <VerdictIcon verdict={result.verdict} />
          {label[lang]}
          <span className="badge-en">/ {lang === "hi" ? label.en : label.hi}</span>
        </span>
        <h1 className="verdict-title">{title}</h1>
        <p className="verdict-sub">
          {result.verdict === "unverified" ? t.verdictSubUnverified : t.verdictSubVerified}
        </p>
      </section>

      <div className="result-grid">
        <div className="result-main">
          <VerdictAudio result={result} />

          <section className="claim-card">
            <span className="eyebrow-sm">{t.claimEyebrow}</span>
            <p className="claim-hi">{claim}</p>
          </section>

          <div className="actions">
            <a
              className="btn btn--primary"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsApp size={17} />
              {t.whatsapp}
            </a>

            {audio ? (
              <a className="btn" href={audio} download={`kaan-${result.id}.mp3`}>
                <IconDownload size={16} />
                {t.audioBtn}
              </a>
            ) : null}

            <button type="button" className="btn btn--ghost" onClick={copy}>
              {copied ? t.copiedBtn : t.copyBtn}
            </button>
          </div>

          <p className="footnote">{t.footnote}</p>
        </div>

        <aside className="result-side">
          <section className="panel">
            <h2 className="panel-title">{t.sourcesTitle}</h2>
            {result.sources.length > 0 ? (
              <ul className="sources">
                {result.sources.map((source) => (
                  <li key={source.url} className="source">
                    <div className="source-top">
                      <strong>{source.name}</strong>
                      <span className="source-date">{source.date}</span>
                    </div>
                    <p className="source-note">
                      {lang === "hi" ? source.noteHi : source.noteEn}
                    </p>
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
              <p className="muted">{t.noSources}</p>
            )}
          </section>

          <section className="panel">
            <h2 className="panel-title">{t.transcriptTitle}</h2>
            <details className="details">
              <summary>{t.transcriptSummary}</summary>
              <p className="transcript">{result.transcript}</p>
            </details>
          </section>

          <section className="panel meta">
            <div>
              <span>{t.metaEngine}</span>
              <strong>{result.engine === "llm" ? t.engineLlm : t.engineLocal}</strong>
            </div>
            <div>
              <span>{t.metaMatch}</span>
              <strong>{Math.round(result.confidence * 100)}%</strong>
            </div>
            <div>
              <span>{t.metaChecked}</span>
              <strong>{t.registries(result.checkedAgainst.length)}</strong>
            </div>
            <div>
              <span>{t.metaTime}</span>
              <strong>{result.ms} ms</strong>
            </div>
          </section>

          <button type="button" className="btn btn--wide" onClick={onReset}>
            {t.newCheck}
          </button>
        </aside>
      </div>
    </main>
  );
}
