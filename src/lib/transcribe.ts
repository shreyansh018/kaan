import { createHash } from "node:crypto";
import audioIndexJson from "@/data/audio-index.json";
import seedsJson from "@/data/seeds.json";
import type { Seed, TranscribeResult } from "./types";

/**
 * Turning an uploaded audio file into text.
 *
 * Two paths, in this order:
 *
 *  1. Fingerprint. If the file is byte-identical to a bundled demo note we
 *     already have the transcript for, use it. This is exact, needs no
 *     network, no key and no model — and it is the honest answer for a file
 *     we ourselves shipped.
 *
 *  2. Whisper. If a key is configured, send the file to a hosted Whisper
 *     endpoint. Any audio works here, including the user's own recording.
 *
 * With neither, the API returns `no_engine` rather than guessing. The UI turns
 * that into "paste the text instead", which still completes the check.
 */

type IndexEntry = {
  seedId: string;
  file: string;
  sha256: string;
  bytes: number;
  durationSec: number | null;
};

const INDEX = audioIndexJson as unknown as IndexEntry[];
const SEEDS = seedsJson as unknown as Seed[];

/** Vercel rejects bodies over 4.5 MB, so stay comfortably under it. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export function transcribeConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY);
}

function endpoint(): { url: string; key: string; model: string } | null {
  const openai = process.env.OPENAI_API_KEY;
  if (openai) {
    return {
      url: "https://api.openai.com/v1/audio/transcriptions",
      key: openai,
      model: process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1",
    };
  }

  const groq = process.env.GROQ_API_KEY;
  if (groq) {
    return {
      url: "https://api.groq.com/openai/v1/audio/transcriptions",
      key: groq,
      model: process.env.GROQ_TRANSCRIBE_MODEL || "whisper-large-v3",
    };
  }

  return null;
}

/** Returns the transcript, or null if the call failed for any reason. */
async function whisper(input: {
  bytes: Buffer;
  filename: string;
  mimetype: string;
}): Promise<string | null> {
  const target = endpoint();
  if (!target) return null;

  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(input.bytes)], {
      type: input.mimetype || "audio/mpeg",
    }),
    input.filename || "note.mp3",
  );
  form.append("model", target.model);
  form.append("response_format", "json");

  try {
    const response = await fetch(target.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${target.key}` },
      body: form,
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { text?: unknown };
    return typeof data.text === "string" && data.text.trim().length > 0
      ? data.text.trim()
      : null;
  } catch {
    return null;
  }
}

export async function transcribeAudio(input: {
  bytes: Buffer;
  filename: string;
  mimetype: string;
}): Promise<TranscribeResult> {
  if (input.bytes.length === 0) return { ok: false, reason: "empty" };
  if (input.bytes.length > MAX_UPLOAD_BYTES) return { ok: false, reason: "too_large" };

  const sha256 = createHash("sha256").update(input.bytes).digest("hex");
  const known = INDEX.find((entry) => entry.sha256 === sha256);

  if (known) {
    const seed = SEEDS.find((item) => item.id === known.seedId);
    if (seed) {
      return {
        ok: true,
        transcript: seed.transcript,
        method: "bundled",
        seedId: seed.id,
        label: seed.label,
        durationSec: known.durationSec,
      };
    }
  }

  const transcript = await whisper(input);
  if (transcript) {
    return {
      ok: true,
      transcript,
      method: "whisper",
      seedId: null,
      label: null,
      durationSec: null,
    };
  }

  // Distinguish "no engine at all" from "engine present but it failed", so the
  // UI can tell the user something true in both cases.
  return {
    ok: false,
    reason: transcribeConfigured() ? "error" : "no_engine",
  };
}
