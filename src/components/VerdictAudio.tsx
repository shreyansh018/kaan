"use client";

import { useEffect, useRef, useState } from "react";
import type { CheckResult } from "@/lib/types";
import { useLang } from "./LangProvider";
import { IconPause, IconPlay } from "./icons";

const BARS = Array.from({ length: 34 }, (_, index) => {
  const height = 14 + Math.round(28 * Math.abs(Math.sin((index + 1) * 1.31)));
  return height;
});

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VerdictAudio({ result }: { result: CheckResult }) {
  const { t, lang } = useLang();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [voiceWarning, setVoiceWarning] = useState(false);

  // The verdict follows the interface language; the Hindi recording is the
  // fallback if an English one is missing.
  const src = lang === "hi" ? result.audioUrl : (result.audioUrlEn ?? result.audioUrl);
  const bundled = Boolean(src);
  const script = lang === "hi" ? result.scriptHi : result.scriptEn;
  const speechLang = lang === "hi" ? "hi-IN" : "en-IN";

  useEffect(() => {
    if (!bundled) return;
    const el = audioRef.current;
    if (!el) return;

    const onTime = () => {
      setCurrent(el.currentTime);
      setProgress(el.duration ? el.currentTime / el.duration : 0);
    };
    const onMeta = () => setDuration(el.duration || 0);
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
      setCurrent(0);
    };

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnd);
    };
  }, [bundled, src]);

  // Switching language mid-playback should not leave the old recording running.
  useEffect(() => {
    setPlaying(false);
    setProgress(0);
    setCurrent(0);
    setDuration(0);
    setVoiceWarning(false);
    audioRef.current?.pause();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [src, script]);

  async function toggle() {
    if (bundled) {
      const el = audioRef.current;
      if (!el) return;
      if (playing) {
        el.pause();
        setPlaying(false);
        return;
      }
      try {
        await el.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
      return;
    }

    // No bundled audio: fall back to the device's own voice.
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoiceWarning(true);
      return;
    }

    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = speechLang;
    utterance.rate = 0.95;

    const match = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith(speechLang.slice(0, 2)));

    if (match) {
      utterance.voice = match;
    } else {
      setVoiceWarning(true);
      return;
    }

    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);

    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  }

  return (
    <section className="audio-card">
      <div className="audio-top">
        <button
          type="button"
          className={`audio-play ${playing ? "is-playing" : ""}`}
          onClick={toggle}
          aria-label={playing ? t.audioPauseAria : t.audioPlayAria}
        >
          {playing ? <IconPause size={22} /> : <IconPlay size={22} />}
        </button>

        <div className="audio-middle">
          <span className="audio-label">{t.audioLabel}</span>
          <div className={`wave ${playing ? "is-playing" : ""}`} aria-hidden="true">
            {BARS.map((height, index) => (
              <span
                key={index}
                className="bar"
                style={{ height, "--i": index } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        <span className="audio-time">
          {formatTime(current)} / {formatTime(duration)}
        </span>
      </div>

      <div className="audio-progress" aria-hidden="true">
        <span style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>

      <p className="audio-hi">{script}</p>

      {voiceWarning ? <p className="audio-warn">{t.audioWarn}</p> : null}

      {bundled ? (
        <audio
          key={src}
          ref={audioRef}
          src={src ?? undefined}
          preload="metadata"
        />
      ) : null}
    </section>
  );
}
