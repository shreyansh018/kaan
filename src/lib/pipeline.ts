import corpusJson from "@/data/corpus.json";
import seedsJson from "@/data/seeds.json";
import { extractClaim, matchCorpus } from "./match";
import { buildFromEntry, buildRefusal } from "./verdict";
import type { CheckResult, CorpusEntry, Engine, Seed } from "./types";

const CORPUS = corpusJson as unknown as CorpusEntry[];
const SEEDS = seedsJson as unknown as Seed[];

export function corpusSize(): number {
  return CORPUS.length;
}

export function seedList(): Seed[] {
  return SEEDS;
}

export function hasLlmKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/**
 * Optional upgrade path. Only runs when OPENAI_API_KEY exists.
 * Any failure (no network, bad key, timeout, quota) returns null and the
 * local extractor is used instead — the app never depends on this.
 */
async function llmExtractClaim(transcript: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 120,
        messages: [
          {
            role: "system",
            content:
              "You extract exactly one checkable factual claim from a forwarded message. Reply with the claim only, in the same language as the message. No preamble, no commentary, no quotes.",
          },
          { role: "user", content: transcript.slice(0, 2000) },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content;
    return typeof text === "string" && text.trim().length > 0
      ? text.trim()
      : null;
  } catch {
    return null;
  }
}

export type RunCheckInput = {
  transcript: string;
  seedId?: string | null;
};

export async function runCheck({
  transcript,
  seedId = null,
}: RunCheckInput): Promise<CheckResult> {
  const started = Date.now();
  const clean = transcript.trim();
  const seed = seedId ? SEEDS.find((s) => s.id === seedId) ?? null : null;

  let engine: Engine = "local";
  let claim = extractClaim(clean).claim;

  const llmClaim = await llmExtractClaim(clean);
  if (llmClaim) {
    claim = llmClaim;
    engine = "llm";
  }

  const match = matchCorpus(claim, CORPUS);

  // Bundled seed notes carry their known verdict, so the on-stage demo can
  // never depend on a fuzzy match. Arbitrary input still has to earn it.
  const fallbackEntry = seed
    ? CORPUS.find((entry) => entry.id === seed.entryId) ?? null
    : null;

  const entry = match?.entry ?? fallbackEntry;

  const base = {
    claim,
    engine,
    seedId,
    transcript: clean,
    ms: Date.now() - started,
  };

  if (entry) {
    const confidence = match ? match.score : 0.99;
    return buildFromEntry({ ...base, entry, confidence });
  }

  return buildRefusal(base);
}
