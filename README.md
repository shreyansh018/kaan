# Kaan — सुनो, फिर मानो

**A voice-first fact-check for forwarded WhatsApp voice notes in India.**

Forward a suspicious voice note. Kaan finds the one checkable claim, checks it
against verified sources, and answers in 20 seconds of audio — in the same
language, with the source named aloud.

> Round 2 build · Build for Bharat · Theme: *Everyday access for all*

**Live:** <https://kaan-sandy.vercel.app> · **Repo:** <https://github.com/shreyansh018/kaan>

---

## The problem this attacks

In India, misinformation does not arrive as an article. It arrives as a
40-second forwarded WhatsApp voice note — an uncle's "hospital advisory", an
election rumour, a fake home remedy — in Hindi, Bhojpuri or Tamil.

Every fact-checker in the country works in **text and English**. By the time an
article is published, the note has already reached five family groups. And the
person listening often cannot read the correction at all.

**This is a format problem, not a truth problem.** The correction fails because
it is the wrong shape. Kaan is the same shape as the misinformation: audio in,
audio out, in the same language, inside the same thread.

## Run it

### Docker (one command, no keys)

```bash
docker compose up
```

Open <http://localhost:3000>.

The app starts with **no `.env` file and no secret keys**. The corpus and all
Hindi audio are bundled in the repo.

### Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

### Production locally (same artefact as the container)

```bash
npm run build        # also copies public/ + .next/static into .next/standalone
npm start            # node .next/standalone/server.js
```

## Try the demo path

Three real Hindi voice notes are bundled. Press play to hear the forward, then
**Check this note**:

| Note | Verdict |
| --- | --- |
| नींबू पानी से कोरोना | **गलत** — WHO mythbusters |
| बोर्ड रिज़ल्ट दो हफ़्ते पहले | **सत्यापित नहीं हो पाया** — no official date found |
| हॉस्पिटल की फ़र्ज़ी advisory | **गलत** — no official handle; PIB has flagged this pattern |

Or paste / type any note. Anything that does not match a verified claim returns
the refusal path instead of a guess — that is the product working correctly.

## How it works

```
voice note / text
      │
      ▼
claim extraction        lib/match.ts      one checkable assertion from 4-6 sentences
      │
      ▼
corpus matching         lib/match.ts      weighted token signatures, split by script
      │
      ▼
verdict + sources       lib/verdict.ts    Hindi script, named source, refusal path
      │
      ▼
audio answer            public/audio/     bundled MP3 for known claims,
                                          browser SpeechSynthesis otherwise
```

### Keyless by design

Every stage has a zero-key path. A key only upgrades it:

| Stage | Default (what judges see) | If `OPENAI_API_KEY` is set |
| --- | --- | --- |
| Speech → text | Bundled transcripts; live mic via browser Web Speech API | Whisper / Groq |
| Claim extraction | Rule-based scoring in `lib/match.ts` | LLM extraction |
| Matching | Local `corpus.json` (10 curated claims) | Same corpus |
| Verdict voice | Bundled Hindi MP3s; SpeechSynthesis for new text | ElevenLabs / Google TTS |

If the optional LLM call fails for any reason — no network, bad key, timeout,
quota — the local extractor runs instead and the UI chip stays on
**Local matcher**. The app never depends on it.

### The refusal path

Kaan refuses to guess. When no verified source matches, it says so, lists what
it checked, and asks for the original source. **No verdict without a named
source** is enforced in code, not in a prompt.

## Project structure

```
src/
├── app/
│   ├── page.tsx                 # home + state machine (home → checking → result)
│   ├── globals.css              # design system
│   └── api/
│       ├── check/route.ts       # POST transcript → verdict
│       └── health/route.ts      # engine + corpus size (drives the UI chip)
├── components/
│   ├── SeedCard.tsx             # bundled voice note + play
│   ├── Recorder.tsx             # Web Speech API mic input
│   ├── CheckingView.tsx         # 3-step progress
│   ├── VerdictAudio.tsx         # audio hero (bundled MP3 or SpeechSynthesis)
│   ├── VerdictView.tsx          # badge, sources, forward actions
│   └── icons.tsx
├── lib/
│   ├── match.ts                 # claim extraction + corpus matching
│   ├── verdict.ts               # Hindi verdict + refusal wording
│   ├── normalize.ts             # Devanagari / Roman / English tokenisation
│   ├── pipeline.ts              # orchestration + optional LLM upgrade
│   └── types.ts
└── data/
    ├── corpus.json              # 10 verified claims with sources and dates
    └── seeds.json               # 3 bundled demo notes
```

## Regenerating the audio

The Hindi voice files are committed so the app works offline. To rebuild them:

```bash
pip install edge-tts
python scripts/generate_audio.py
```

## Scope

This is a working prototype of one core flow, not a full product.

**Built:** voice note in → one claim → verified source → spoken verdict →
forwardable audio → refusal path.

**Deliberately not built:** accounts, history sync, WhatsApp Business API,
dialect detection beyond Hindi, multi-claim analysis, politics.

## Honest limits

- The corpus is **10 curated claims**, not the open web. Novel local claims
  correctly return *unverified* — high refusal rates are expected, not a bug.
- Delivery depends on WhatsApp in production; this build simulates the forward
  with upload + a `wa.me` share link.
- Being confidently wrong is the biggest risk. Mitigations: named sources only,
  refusal as a first-class answer, and human review before a claim enters the
  corpus.
