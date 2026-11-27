import type { CorpusEntry } from "./types";
import { normalizeText, splitSentences, tokenize } from "./normalize";

/**
 * Local claim extraction + corpus matching.
 *
 * This is the part that replaces a model call when no API key is present:
 * it is deterministic, auditable and fast enough to run inline.
 */

/** Entities that make a sentence worth checking at all. */
const ENTITY_HINTS = new Set<string>([
  "corona", "covid", "virus", "hospital", "doctor", "vaccine", "mask",
  "board", "result", "exam", "student", "school", "college", "admission",
  "bank", "aadhaar", "account", "upi", "paisa", "money", "cashback",
  "sarkar", "government", "scheme", "laptop", "free", "link", "otp",
  "bp", "pressure", "dawa", "medicine", "neem", "lehsun", "pyaaz",
  "paani", "water", "bimari", "disease", "flu", "tower", "5g", "network",
  "bachche", "children", "advisory", "parents", "health", "sehat",
  "कोरोना", "वायरस", "हॉस्पिटल", "अस्पताल", "डॉक्टर", "वैक्सीन",
  "बोर्ड", "रिज़ल्ट", "परीक्षा", "स्टूडेंट", "स्कूल", "बैंक", "आधार",
  "अकाउंट", "पैसा", "सरकार", "स्कीम", "लैपटॉप", "बीमारी", "दवा",
  "नीम", "लेहसुन", "प्याज़", "पानी", "फ्लू", "बच्चे", "माता-पिता",
]);

/** Verbs/particles that signal an assertion rather than chatter. */
const CLAIM_MARKERS = new Set<string>([
  "khatam", "theek", "failta", "failti", "failte", "fail", "spread",
  "spreads", "cure", "cures", "hoga", "hogi", "honge", "milega",
  "milegi", "milta", "milti", "band", "ban", "banned", "safe",
  "dangerous", "kill", "kills", "prevent", "prevents", "cause",
  "causes", "se", "due", "because",
  "खत्म", "ठीक", "फैलता", "फैलती", "फैल", "इलाज", "मुफ्त", "बंद",
  "होगा", "होगी", "मिलेगा", "मिलती", "सुरक्षित", "खतरनाक", "कारण",
  "वजह", "से", "बंद",
]);

const IMPERATIVE_START =
  /^(sabko|sab|please|plz|forward|share|bhejo|bhej|suno|sun|check|karo|karein|dhyan|jaldi|note|hello|hi|breaking)\b/u;

export type ClaimExtraction = {
  claim: string;
  score: number;
  candidates: number;
};

/**
 * Picks the single most "checkable" sentence from a rambling voice note.
 * A forwarded note is usually 4-6 sentences of throat-clearing wrapped
 * around one claim; this finds the claim.
 */
export function extractClaim(transcript: string): ClaimExtraction {
  const sentences = splitSentences(transcript).filter((s) => s.length > 0);
  if (sentences.length === 0) {
    return { claim: transcript.trim(), score: 0, candidates: 0 };
  }
  if (sentences.length === 1) {
    return { claim: sentences[0], score: 1, candidates: 1 };
  }

  let best = sentences[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const sentence of sentences) {
    const raw = normalizeText(sentence)
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean);
    const tokens = tokenize(sentence);
    if (tokens.length === 0) continue;

    let score = 0;
    for (const token of raw) {
      if (ENTITY_HINTS.has(token)) score += 2;
      if (CLAIM_MARKERS.has(token)) score += 1;
    }
    if (/\d/.test(sentence)) score += 1.5;
    score += Math.min(tokens.length, 10) * 0.12;
    if (IMPERATIVE_START.test(normalizeText(sentence))) score -= 2.5;
    if (tokens.length <= 2) score -= 1;

    if (score > bestScore) {
      bestScore = score;
      best = sentence;
    }
  }

  return { claim: best.trim(), score: bestScore, candidates: sentences.length };
}

export type Match = {
  entry: CorpusEntry;
  score: number;
  overlap: number;
};

const DEVA = /[\u0900-\u097F]/;
type Group = Map<string, number>;

const groupCache = new Map<string, Group[]>();

/**
 * Weighted token signatures, split by script.
 *
 * A note is written in one script, so Roman and Devanagari keywords are
 * scored as separate groups and the better group wins. Mixing them in one
 * pool halves recall for no reason.
 */
function buildGroups(entry: CorpusEntry): Group[] {
  const cached = groupCache.get(entry.id);
  if (cached) return cached;

  const roman: Group = new Map();
  const deva: Group = new Map();

  for (const keyword of entry.keywords) {
    const tokens = tokenize(keyword);
    if (tokens.length === 0) continue;
    const weight = tokens.length >= 2 ? 2.2 : 1;
    const target = tokens.some((token) => DEVA.test(token)) ? deva : roman;
    for (const token of tokens) {
      target.set(token, Math.max(target.get(token) ?? 0, weight));
    }
  }

  const groups = [roman, deva].filter((group) => group.size > 0);
  groupCache.set(entry.id, groups);
  return groups;
}

/**
 * Two tokens are the same when one is a prefix of the other, so
 * "coronavirus"/"corona" and "drinking"/"drink" match without a stemmer.
 */
function tokensMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.min(a.length, b.length) < 5) return false;
  return a.startsWith(b) || b.startsWith(a);
}

function scoreGroup(group: Group, claimTokens: string[]) {
  let total = 0;
  let hit = 0;
  let overlap = 0;

  for (const [token, weight] of group) {
    total += weight;
    const found = claimTokens.some((claimToken) => tokensMatch(token, claimToken));
    if (found) {
      hit += weight;
      overlap += 1;
    }
  }

  const recall = total > 0 ? hit / total : 0;
  const precision = claimTokens.length > 0 ? overlap / claimTokens.length : 0;
  return { score: recall * 0.75 + precision * 0.25, overlap };
}

/**
 * Scores the claim against every corpus entry.
 * Returns null when nothing is a confident match — which is the correct
 * behaviour, and the reason the refusal path exists.
 */
export function matchCorpus(
  claim: string,
  corpus: CorpusEntry[],
  threshold = 0.3,
): Match | null {
  const claimTokens = tokenize(claim);
  if (claimTokens.length === 0) return null;

  let best: Match | null = null;
  let runnerUp = 0;

  for (const entry of corpus) {
    let entryScore = 0;
    let entryOverlap = 0;

    for (const group of buildGroups(entry)) {
      const result = scoreGroup(group, claimTokens);
      if (result.score > entryScore) {
        entryScore = result.score;
        entryOverlap = result.overlap;
      }
    }

    if (!best || entryScore > best.score) {
      if (best) runnerUp = Math.max(runnerUp, best.score);
      best = { entry, score: entryScore, overlap: entryOverlap };
    } else {
      runnerUp = Math.max(runnerUp, entryScore);
    }
  }

  if (!best) return null;
  if (best.score < threshold) return null;
  if (best.overlap < 2) return null;
  // Two entries scoring almost the same means the note is too vague to call.
  if (runnerUp > 0 && best.score - runnerUp < 0.02) return null;

  return best;
}
