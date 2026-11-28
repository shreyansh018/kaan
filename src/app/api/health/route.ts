import { NextResponse } from "next/server";
import { corpusSize, hasLlmKey } from "@/lib/pipeline";
import { transcribeConfigured } from "@/lib/transcribe";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      engine: hasLlmKey() ? "llm" : "local",
      corpus: corpusSize(),
      audio: "bundled",
      transcribe: transcribeConfigured() ? "whisper" : "bundled",
      version: "0.2.0",
    },
    { headers: { "content-type": "application/json; charset=utf-8" } },
  );
}
