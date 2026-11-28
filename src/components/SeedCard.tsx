"use client";

import { useEffect, useRef, useState } from "react";
import type { Seed } from "@/lib/types";
import { useLang } from "./LangProvider";
import { IconArrowRight, IconPause, IconPlay } from "./icons";

type Props = {
  seed: Seed;
  onCheck: (seed: Seed) => void;
  disabled?: boolean;
};

export function SeedCard({ seed, onCheck, disabled }: Props) {
  const { t, lang } = useLang();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  function toggle(event: React.MouseEvent) {
    event.stopPropagation();
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      return;
    }
    el.currentTime = 0;
    void el.play().catch(() => setPlaying(false));
    setPlaying(true);
  }

  return (
    <article className="seed">
      <div className="seed-top">
        <button
          type="button"
          className="seed-play"
          onClick={toggle}
          aria-label={playing ? t.seedPause : t.seedPlay}
        >
          {playing ? <IconPause size={15} /> : <IconPlay size={15} />}
        </button>
        <span className="seed-lang">
          {seed.lang} · {t.seedKind}
        </span>
      </div>

      <h3 className="seed-label">{lang === "hi" ? seed.label : seed.labelEn}</h3>
      <p className="seed-text">
        {lang === "hi" ? seed.transcript : seed.transcriptEn}
      </p>

      <button
        type="button"
        className="seed-check"
        onClick={() => onCheck(seed)}
        disabled={disabled}
      >
        {t.seedCheck}
        <IconArrowRight size={15} />
      </button>

      <audio
        ref={audioRef}
        src={seed.audio}
        preload="none"
        onEnded={() => setPlaying(false)}
      />
    </article>
  );
}
