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

export const REFUSAL_HI =
  "हम इसे verify नहीं कर पाए। हमने PIB Fact Check, WHO और स्वास्थ्य मंत्रालय के verified रिकॉर्ड चेक किए, लेकिन इस दावे का कोई भरोसेमंद सोर्स नहीं मिला। बिना सोर्स के हम सच या झूठ नहीं कहेंगे। अगर आपके पास ओरिजिनल सोर्स है, तो भेजें।";

export const REFUSAL_EN =
  "We couldn't verify this. We checked PIB Fact Check, WHO and Ministry of Health records and found no credible source for this claim. Without a source we won't call it true or false. If you have the original source, send it.";

export const REFUSAL_AUDIO = "/audio/verdict-unverified.mp3";

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

export function buildFromEntry(args: BuildArgs & { entry: CorpusEntry; confidence: number }): CheckResult {
  const { entry, claim, confidence, engine, seedId, transcript, ms } = args;
  const audio =
    entry.audio ??
    (entry.verdict === "unverified" ? REFUSAL_AUDIO : null);

  return {
    id: newId(),
    verdict: entry.verdict,
    title: entry.title,
    claim: entry.claimHi,
    claimEn: entry.claimEn,
    scriptHi: entry.scriptHi,
    scriptEn: entry.scriptEn,
    sources: entry.sources,
    audioUrl: audio,
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
    title: "कोई verified सोर्स नहीं मिला",
    claim: args.claim,
    claimEn: "",
    scriptHi: REFUSAL_HI,
    scriptEn: REFUSAL_EN,
    sources: [],
    audioUrl: REFUSAL_AUDIO,
    engine: args.engine,
    confidence: 0,
    checkedAgainst: CHECKED_AGAINST,
    seedId: args.seedId,
    transcript: args.transcript,
    ms: args.ms,
  };
}
