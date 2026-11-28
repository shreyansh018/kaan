import { NextResponse } from "next/server";
import { MAX_UPLOAD_BYTES, transcribeAudio } from "@/lib/transcribe";

export const runtime = "nodejs";
export const maxDuration = 60;

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function reply(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: JSON_HEADERS });
}

export async function POST(request: Request) {
  let form: FormData;

  try {
    form = await request.formData();
  } catch {
    return reply({ ok: false, reason: "empty" }, 400);
  }

  const file = form.get("file");

  // `form.get` is `File | string`; a text field named "file" is not an upload.
  if (!file || typeof file === "string") {
    return reply({ ok: false, reason: "empty" }, 400);
  }

  if (file.size === 0) {
    return reply({ ok: false, reason: "empty" }, 400);
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return reply({ ok: false, reason: "too_large" }, 413);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const result = await transcribeAudio({
    bytes,
    filename: file.name || "note.mp3",
    mimetype: file.type || "audio/mpeg",
  });

  return reply(result);
}
