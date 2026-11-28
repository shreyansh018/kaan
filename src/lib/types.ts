export type Verdict = "sach" | "galat" | "unverified";

export type Source = {
  name: string;
  date: string;
  url: string;
  noteHi: string;
  noteEn: string;
};

export type CorpusEntry = {
  id: string;
  title: string;
  titleEn: string;
  /** Signature tokens used by the local matcher (Hindi + English). */
  keywords: string[];
  verdict: Verdict;
  claimHi: string;
  claimEn: string;
  scriptHi: string;
  scriptEn: string;
  sources: Source[];
  /** Bundled verdict audio, committed to the repo. */
  audio?: string;
  /** The same verdict, spoken in English for the English interface. */
  audioEn?: string;
};

export type Seed = {
  id: string;
  label: string;
  labelEn: string;
  lang: string;
  voice: string;
  audio: string;
  transcript: string;
  transcriptEn: string;
  entryId: string;
};

export type Engine = "local" | "llm";

export type CheckResult = {
  id: string;
  verdict: Verdict;
  title: string;
  titleEn: string;
  claim: string;
  claimEn: string;
  scriptHi: string;
  scriptEn: string;
  sources: Source[];
  audioUrl: string | null;
  audioUrlEn: string | null;
  engine: Engine;
  confidence: number;
  checkedAgainst: string[];
  seedId: string | null;
  transcript: string;
  ms: number;
};

/** What /api/transcribe reports back after an audio upload. */
export type TranscribeResult =
  | {
      ok: true;
      transcript: string;
      method: "whisper" | "bundled";
      seedId: string | null;
      label: string | null;
      durationSec: number | null;
    }
  | {
      ok: false;
      reason: "no_engine" | "too_large" | "empty" | "error";
    };
