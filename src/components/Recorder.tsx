"use client";

import { useEffect, useRef, useState } from "react";
import { IconMic } from "./icons";

/**
 * Live microphone input via the browser's Web Speech API.
 * It is an enhancement only: if the browser has no recogniser, the paste
 * box below still works, so the product never depends on it.
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

export function Recorder({ onTranscript, disabled }: Props) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [live, setLive] = useState("");
  const [lang, setLang] = useState("hi-IN");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<Recognition | null>(null);

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
    recognition.lang = lang;
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
      setError("Mic se sun nahi paye. Neeche likhkar bhej dein.");
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
      setError("Mic shuru nahi ho paya. Neeche likhkar bhej dein.");
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
              Live recording is not available in this browser
            </span>
            <span>
              Chrome and Edge support it. You can still paste or type the note
              below — the check works exactly the same.
            </span>
          </div>
        ) : (
          <button
            type="button"
            className={`mic ${listening ? "is-listening" : ""}`}
            onClick={listening ? stop : start}
            disabled={disabled || supported === null}
            aria-label={listening ? "Stop recording" : "Record a voice note"}
          >
            <IconMic size={22} />
          </button>
        )}

        <div className="recorder-copy">
          <span className="recorder-title">
            {listening ? "सुन रहे हैं…" : "बोलिए"}
          </span>
          <span className="recorder-sub">
            {listening
              ? "Speak the forwarded note out loud, then tap to stop."
              : "Or type / paste the note on the right."}
          </span>
        </div>

        <select
          className="recorder-lang"
          value={lang}
          onChange={(event) => setLang(event.target.value)}
          aria-label="Recognition language"
        >
          <option value="hi-IN">हिंदी</option>
          <option value="en-IN">English</option>
        </select>
      </div>

      {listening && live ? <p className="recorder-live">{live}</p> : null}
      {error ? <p className="recorder-error">{error}</p> : null}
    </div>
  );
}
