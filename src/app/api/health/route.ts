import { NextResponse } from "next/server";
import { corpusSize, hasLlmKey } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      engine: hasLlmKey() ? "llm" : "local",
      corpus: corpusSize(),
      audio: "bundled",
      version: "0.1.0",
    },
    { headers: { "content-type": "application/json; charset=utf-8" } },
  );
}
