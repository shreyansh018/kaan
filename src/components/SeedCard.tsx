"use client";

import { useEffect, useRef, useState } from "react";
import type { Seed } from "@/lib/types";
import { IconArrowRight, IconPause, IconPlay } from "./icons";

type Props = {
  seed: Seed;
  onCheck: (seed: Seed) => void;
  disabled?: boolean;
};

export function SeedCard({ seed, onCheck, disabled }: Props) {
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
          aria-label={playing ? "Pause voice note" : "Play voice note"}
        >
          {playing ? <IconPause size={15} /> : <IconPlay size={15} />}
        </button>
        <span className="seed-lang">{seed.lang} · voice note</span>
      </div>

      <h3 className="seed-label">{seed.label}</h3>
      <p className="seed-text">{seed.transcriptEn}</p>

      <button
        type="button"
        className="seed-check"
        onClick={() => onCheck(seed)}
        disabled={disabled}
      >
        Check this note
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
