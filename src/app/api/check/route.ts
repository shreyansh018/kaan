import { NextResponse } from "next/server";
import { runCheck } from "@/lib/pipeline";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const payload = body as { transcript?: unknown; seedId?: unknown };
  const transcript =
    typeof payload?.transcript === "string" ? payload.transcript.trim() : "";

  if (!transcript) {
    return NextResponse.json({ error: "empty_transcript" }, { status: 400 });
  }

  if (transcript.length > 4000) {
    return NextResponse.json({ error: "too_long" }, { status: 413 });
  }

  const seedId = typeof payload?.seedId === "string" ? payload.seedId : null;
  const result = await runCheck({ transcript, seedId });

  return NextResponse.json(result, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
