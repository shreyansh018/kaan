import refusalsJson from "@/data/refusals.json";
import type { CheckResult, CorpusEntry, Engine, Verdict } from "./types";

/**
 * Turns a matched corpus entry (or a failed match) into the object the UI
 * renders. All verdict wording lives here so the Hindi stays consistent.
 */

export const VERDICT_LABEL: Record<Verdict, { hi: string; en: string }> = {
  sach: { hi: "सच", en: "True" },
  galat: { hi: "गलत", en: "False" },
  unverified: { hi: "सत्यापित नहीं हो पाया", en: "Unverified" },
};

export const CHECKED_AGAINST = [
  "PIB Fact Check",
  "WHO",
  "Ministry of Health",
  "NPCI",
];

// One source of truth, shared with scripts/generate_audio.py.
const REFUSALS = refusalsJson as unknown as { hi: string; en: string };

export const REFUSAL_HI = REFUSALS.hi;
export const REFUSAL_EN = REFUSALS.en;

export const REFUSAL_AUDIO = "/audio/verdict-unverified.mp3";
export const REFUSAL_AUDIO_EN = "/audio/verdict-unverified-en.mp3";

export const REFUSAL_TITLE = "कोई verified सोर्स नहीं मिला";
export const REFUSAL_TITLE_EN = "No verified source found";

function newId(): string {
  try {
    return crypto.randomUUID().slice(0, 8);
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
}

type BuildArgs = {
  claim: string;
  engine: Engine;
  seedId: string | null;
  transcript: string;
  ms: number;
};

export function buildFromEntry(
  args: BuildArgs & { entry: CorpusEntry; confidence: number },
): CheckResult {
  const { entry, claim, confidence, engine, seedId, transcript, ms } = args;
  const audio = entry.audio ?? (entry.verdict === "unverified" ? REFUSAL_AUDIO : null);
  const audioEn =
    entry.audioEn ?? (entry.verdict === "unverified" ? REFUSAL_AUDIO_EN : null);

  return {
    id: newId(),
    verdict: entry.verdict,
    title: entry.title,
    titleEn: entry.titleEn,
    claim: entry.claimHi,
    claimEn: entry.claimEn,
    scriptHi: entry.scriptHi,
    scriptEn: entry.scriptEn,
    sources: entry.sources,
    audioUrl: audio,
    audioUrlEn: audioEn,
    engine,
    confidence: Number(confidence.toFixed(2)),
    checkedAgainst: CHECKED_AGAINST,
    seedId,
    transcript,
    ms,
  };
}

export function buildRefusal(args: BuildArgs): CheckResult {
  return {
    id: newId(),
    verdict: "unverified",
    title: REFUSAL_TITLE,
    titleEn: REFUSAL_TITLE_EN,
    claim: args.claim,
    claimEn: "",
    scriptHi: REFUSAL_HI,
    scriptEn: REFUSAL_EN,
    sources: [],
    audioUrl: REFUSAL_AUDIO,
    audioUrlEn: REFUSAL_AUDIO_EN,
    engine: args.engine,
    confidence: 0,
    checkedAgainst: CHECKED_AGAINST,
    seedId: args.seedId,
    transcript: args.transcript,
    ms: args.ms,
  };
}
