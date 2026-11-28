"""
Generates the bundled Hindi and English audio for Kaan.

Why commit audio into the repo instead of synthesising at runtime?
Because the build must run with zero API keys and zero network access.
The demo notes and the verdicts therefore ship as real MP3 files.

The forwarded notes are always Hindi — that is the artefact being checked.
The verdict follows the interface language, so each entry gets a Hindi and an
English recording.

Requires : pip install edge-tts
Usage    : python scripts/generate_audio.py
           python scripts/generate_audio.py lemon-corona   # one entry only
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
VERDICT_VOICE_HI = "hi-IN-SwaraNeural"
VERDICT_VOICE_EN = "en-IN-NeerjaNeural"


async def synth(text: str, voice: str, rate: str, out: Path) -> None:
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(str(out))
    print(f"  {out.name:<36} {out.stat().st_size // 1024:>4} KB")


async def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    # Optional argument: regenerate only the given entry ids, so editing one
    # verdict does not re-synthesise (and churn) every file.
    only = set(sys.argv[1:])

    seeds = json.loads((DATA / "seeds.json").read_text(encoding="utf-8"))
    corpus = json.loads((DATA / "corpus.json").read_text(encoding="utf-8"))
    refusals = json.loads((DATA / "refusals.json").read_text(encoding="utf-8"))

    if only:
        seeds = [seed for seed in seeds if seed["id"] in only]
        corpus = [entry for entry in corpus if entry["id"] in only]
        missing = only - {item["id"] for item in seeds} - {item["id"] for item in corpus}
        missing -= {"unverified"}
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

    print("Verdict audio, Hindi (slower and calmer — this is the answer):")
    for entry in corpus:
        await synth(
            entry["scriptHi"],
            VERDICT_VOICE_HI,
            "-2%",
            OUT / f"verdict-{entry['id']}.mp3",
        )

    print("Verdict audio, English (same answer, interface language):")
    for entry in corpus:
        await synth(
            entry["scriptEn"],
            VERDICT_VOICE_EN,
            "-2%",
            OUT / f"verdict-{entry['id']}-en.mp3",
        )

    if not only or "unverified" in only:
        print("Refusal audio:")
        await synth(refusals["hi"], VERDICT_VOICE_HI, "-2%", OUT / "verdict-unverified.mp3")
        await synth(refusals["en"], VERDICT_VOICE_EN, "-2%", OUT / "verdict-unverified-en.mp3")

    print(f"\nDone. {len(list(OUT.glob('*.mp3')))} files in public/audio")


if __name__ == "__main__":
    asyncio.run(main())
