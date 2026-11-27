"""
Generates the bundled Hindi audio for Kaan.

Why commit audio into the repo instead of synthesising at runtime?
Because the build must run with zero API keys and zero network access.
The demo notes and the verdicts therefore ship as real MP3 files.

Requires : pip install edge-tts
Usage    : python scripts/generate_audio.py
"""

import asyncio
import json
import sys
from pathlib import Path

try:
    import edge_tts
except ImportError:
    sys.exit("edge-tts is missing. Run: pip install edge-tts")

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "src" / "data"
OUT = ROOT / "public" / "audio"

NOTE_VOICE = "hi-IN-MadhurNeural"
VERDICT_VOICE = "hi-IN-SwaraNeural"

# Keep in sync with REFUSAL_HI in src/lib/verdict.ts
REFUSAL_HI = (
    "हम इसे verify नहीं कर पाए। हमने PIB Fact Check, WHO और स्वास्थ्य मंत्रालय के "
    "verified रिकॉर्ड चेक किए, लेकिन इस दावे का कोई भरोसेमंद सोर्स नहीं मिला। "
    "बिना सोर्स के हम सच या झूठ नहीं कहेंगे। अगर आपके पास ओरिजिनल सोर्स है, तो भेजें।"
)


async def synth(text: str, voice: str, rate: str, out: Path) -> None:
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(str(out))
    print(f"  {out.name:<34} {out.stat().st_size // 1024:>4} KB")


async def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    # Optional argument: regenerate only the given entry ids, so editing one
    # verdict does not re-synthesise (and churn) all fourteen files.
    only = set(sys.argv[1:])

    seeds = json.loads((DATA / "seeds.json").read_text(encoding="utf-8"))
    corpus = json.loads((DATA / "corpus.json").read_text(encoding="utf-8"))

    if only:
        seeds = [seed for seed in seeds if seed["id"] in only]
        corpus = [entry for entry in corpus if entry["id"] in only]
        missing = only - {item["id"] for item in seeds} - {item["id"] for item in corpus}
        if missing:
            sys.exit(f"unknown id(s): {', '.join(sorted(missing))}")

    print("Forwarded voice notes (slightly hurried, like a real WhatsApp forward):")
    for seed in seeds:
        await synth(
            seed["transcript"],
            seed.get("voice", NOTE_VOICE),
            "+6%",
            OUT / f"note-{seed['id']}.mp3",
        )

    print("Verdict audio (slower and calmer — this is the answer):")
    for entry in corpus:
        await synth(
            entry["scriptHi"],
            VERDICT_VOICE,
            "-2%",
            OUT / f"verdict-{entry['id']}.mp3",
        )

    if not only or "unverified" in only:
        print("Refusal audio:")
        await synth(REFUSAL_HI, VERDICT_VOICE, "-2%", OUT / "verdict-unverified.mp3")

    print(f"\nDone. {len(list(OUT.glob('*.mp3')))} files in public/audio")


if __name__ == "__main__":
    asyncio.run(main())
