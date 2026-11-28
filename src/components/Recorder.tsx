"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "./LangProvider";
import { IconMic } from "./icons";

/**
 * Live microphone input via the browser's Web Speech API.
 * It is an enhancement only: if the browser has no recogniser, the upload
 * control and the paste box below still work, so the product never depends
 * on it.
 */

type RecognitionResult = {
  isFinal: boolean;
  [index: number]: { transcript: string };
};

type RecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
};

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type RecognitionCtor = new () => Recognition;

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type Props = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
};

type ErrorKind = "mic" | "start" | null;

export function Recorder({ onTranscript, disabled }: Props) {
  const { t, lang } = useLang();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [live, setLive] = useState("");
  const [error, setError] = useState<ErrorKind>(null);
  const recRef = useRef<Recognition | null>(null);

  // Follow the interface language unless the user overrides it.
  const [recogLang, setRecogLang] = useState<string | null>(null);
  const effectiveLang = recogLang ?? (lang === "en" ? "en-IN" : "hi-IN");

  useEffect(() => {
    setSupported(getCtor() !== null);
    return () => {
      recRef.current?.abort();
    };
  }, []);

  function start() {
    const Ctor = getCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = effectiveLang;
    recognition.continuous = false;
    recognition.interimResults = true;

    let finalText = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) finalText += text + " ";
        else interim += text;
      }
      setLive((finalText + interim).trim());
    };

    recognition.onerror = () => {
      setListening(false);
      setError("mic");
    };

    recognition.onend = () => {
      setListening(false);
      const clean = finalText.trim();
      if (clean) onTranscript(clean);
    };

    recRef.current = recognition;
    setError(null);
    setLive("");
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
      setError("start");
    }
  }

  function stop() {
    recRef.current?.stop();
  }

  return (
    <div className="recorder">
      <div className="recorder-main">
        {supported === false ? (
          <div className="recorder-unsupported">
            <span className="recorder-unsupported-title">
              {t.recorderUnsupportedTitle}
            </span>
            <span>{t.recorderUnsupportedBody}</span>
          </div>
        ) : (
          <button
            type="button"
            className={`mic ${listening ? "is-listening" : ""}`}
            onClick={listening ? stop : start}
            disabled={disabled || supported === null}
            aria-label={listening ? t.recorderStopAria : t.recorderAria}
          >
            <IconMic size={22} />
          </button>
        )}

        <div className="recorder-copy">
          <span className="recorder-title">
            {listening ? t.recorderListening : t.recorderIdle}
          </span>
          <span className="recorder-sub">
            {listening ? t.recorderSubListening : t.recorderSubIdle}
          </span>
        </div>

        <select
          className="recorder-lang"
          value={effectiveLang}
          onChange={(event) => setRecogLang(event.target.value)}
          aria-label={t.recognitionLang}
        >
          <option value="hi-IN">हिंदी</option>
          <option value="en-IN">English</option>
        </select>
      </div>

      {listening && live ? <p className="recorder-live">{live}</p> : null}
      {error === "mic" ? <p className="recorder-error">{t.recorderErrorMic}</p> : null}
      {error === "start" ? <p className="recorder-error">{t.recorderErrorStart}</p> : null}
    </div>
  );
}
