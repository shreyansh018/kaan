"use client";

import { useRef, useState } from "react";
import type { TranscribeResult } from "@/lib/types";
import { useLang } from "./LangProvider";
import { IconUpload } from "./icons";

/**
 * Upload a forwarded voice note instead of speaking it.
 *
 * This is the path for anyone who cannot speak, and for the much more common
 * case: the note arrived in the group and you want to check it without
 * re-recording it yourself.
 *
 * The endpoint reports *how* it understood the file, and the UI repeats that
 * honestly — a bundled note is recognised by fingerprint, anything else needs
 * a transcription key.
 */

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPT = "audio/*,.mp3,.m4a,.wav,.ogg,.opus,.webm,.aac,.flac";

type Status =
  | { kind: "idle" }
  | { kind: "working"; name: string }
  | { kind: "matched"; label: string }
  | { kind: "transcribed"; text: string }
  | { kind: "noEngine" }
  | { kind: "error"; message: string };

type Props = {
  onTranscript: (transcript: string, seedId: string | null) => void;
  disabled?: boolean;
  /** True when a Whisper key is configured, so any audio can be transcribed. */
  engineOn: boolean;
};

export function AudioUpload({ onTranscript, disabled, engineOn }: Props) {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [over, setOver] = useState(false);

  const busy = status.kind === "working";

  async function handle(file: File) {
    if (file.size > MAX_BYTES) {
      setStatus({ kind: "error", message: t.uploadTooBig });
      return;
    }

    setStatus({ kind: "working", name: file.name });

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/transcribe", { method: "POST", body });
      const data = (await response.json()) as TranscribeResult;

      if (data.ok) {
        if (data.method === "bundled") {
          setStatus({ kind: "matched", label: data.label ?? file.name });
        } else {
          setStatus({ kind: "transcribed", text: data.transcript });
        }
        onTranscript(data.transcript, data.seedId);
        return;
      }

      if (data.reason === "no_engine") {
        setStatus({ kind: "noEngine" });
      } else if (data.reason === "too_large") {
        setStatus({ kind: "error", message: t.uploadTooBig });
      } else {
        setStatus({ kind: "error", message: t.uploadFailed });
      }
    } catch {
      setStatus({ kind: "error", message: t.uploadFailed });
    }
  }

  function pick() {
    inputRef.current?.click();
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so choosing the same file twice still fires a change event.
    event.target.value = "";
    if (file) void handle(file);
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setOver(false);
    if (disabled || busy) return;
    const file = event.dataTransfer.files?.[0];
    if (file) void handle(file);
  }

  return (
    <div className="upload-wrap">
      <div
        className={`upload ${over ? "is-over" : ""} ${disabled ? "is-disabled" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !busy) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <div className="upload-copy">
          <span className="upload-title">
            {busy ? t.uploadWorking : over ? t.uploadDrop : t.uploadTitle}
          </span>
          <span className="upload-hint">{t.uploadHint}</span>
        </div>

        <button
          type="button"
          className="btn btn--ghost upload-btn"
          onClick={pick}
          disabled={disabled || busy}
        >
          <IconUpload size={15} />
          {t.uploadChoose}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={onChange}
          className="upload-input"
          tabIndex={-1}
        />
      </div>

      <div className="upload-foot">
        <span className={`upload-engine ${engineOn ? "is-on" : ""}`}>
          {engineOn ? t.uploadKeyOn : t.uploadKeyOff}
        </span>

        {status.kind === "matched" ? (
          <span className="upload-status is-ok">
            ✓ {t.uploadMatched} · {status.label}
          </span>
        ) : null}

        {status.kind === "transcribed" ? (
          <span className="upload-status is-ok">
            ✓ {t.uploadTranscribed}: “{status.text.slice(0, 60)}
            {status.text.length > 60 ? "…" : ""}”
          </span>
        ) : null}

        {status.kind === "error" ? (
          <span className="upload-status is-bad">{status.message}</span>
        ) : null}
      </div>

      {status.kind === "noEngine" ? (
        <div className="upload-note">
          <strong>{t.uploadNoEngineTitle}</strong>
          <p>{t.uploadNoEngineBody}</p>
        </div>
      ) : null}
    </div>
  );
}
