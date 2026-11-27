# Kaan — 3-minute demo script

**Target: 2:50. Hard limit 3:00.** Record in one take if possible; a single cut
is more convincing than polish.

Record at 1920×1080, browser at 100% zoom, bookmarks bar hidden (`Ctrl+Shift+B`).
Capture **system audio** — the whole point is that the answer is spoken.

---

## Before you hit record

1. `docker compose down` then `docker compose up --build` from a clean terminal.
   Leave the terminal visible — judges should see the one command.
2. Open `http://localhost:3000` in a fresh window, DevTools closed.
3. Clear recent checks so the sidebar is empty on first frame:
   DevTools → Application → Local Storage → delete `kaan.recent.v1` → reload.
4. Have the paste-box text ready in a scratch file:
   `Kal raat aasman mein naya sitara dikha, isse sab bimariyan khatam ho jayengi. Sabko forward karo.`
5. System volume at ~70% so the Hindi voice is clearly audible on the recording.

---

## 0:00 – 0:18 · The problem (screen: home page, don't scroll)

> "This is a forwarded WhatsApp voice note."

*(Play seed 1 audio for ~5 seconds, then pause it.)*

> "Forty seconds of Hindi. No text, no link, no way to check it. In India this is
> how misinformation actually travels — because the people who forward it don't
> read English, and they don't read articles.
>
> Every fact-checker in the country answers in text. So the correction dies at
> the edge of the group. Kaan answers in the same shape it arrived: audio."

---

## 0:18 – 0:32 · It runs with one command

*(Cut to the terminal.)*

> "One command. No API keys, no `.env`, no network calls — the corpus and all the
> Hindi audio are in the repo."

*(Show `docker compose up`, then cut back to the browser and reload.)*

> "Port 3000. This is the whole product."

---

## 0:32 – 1:05 · The happy path

*(Click **Check this note** on "नींबू पानी से कोरोना". Let the three-step
checking animation play — do not talk over it, it's only 1.6 seconds.)*

> "A 40-second note goes in. Kaan pulls out the one claim that can actually be
> checked — lemon water cures corona — and matches it against verified sources."

*(Verdict screen appears. Point at the badge.)*

> "**Galat.** Not because a model guessed — because WHO's COVID mythbusters page
> says so, and the source and date are printed right there."

*(Press play on the verdict audio. Let it run ~10 seconds, then lower the volume
under the next line.)*

> "And the answer is spoken, in Hindi, with the source named aloud — so it can go
> straight back into the group it came from."

---

## 1:05 – 1:32 · The refusal — the part that matters

*(Click back. Paste the scratch text into the box. Click **Check करें**.)*

> "Now the harder case. A note Kaan has never seen."

*(Verdict screen: unverified.)*

> "It says: *we could not verify this.* It does not guess. No verdict without a
> named source — and that rule is enforced in code, not in a prompt."

*(Point at the checked-against list and the 0% match.)*

> "It tells you what it checked, and it asks for the original source. A
> fact-checker that invents an answer once is worse than no fact-checker at all —
> so refusing is a real answer here, with its own screen and its own voice."

---

## 1:32 – 1:58 · Real input, not a demo seed

*(Back. Type or speak into the recorder — press the mic, say one line, stop.)*

> "This isn't a scripted path. Type it, paste it, or just speak it — the mic uses
> the browser's speech recognition, so there's no server-side model to pay for."

*(Use the second seed: "बोर्ड रिज़ल्ट दो हफ़्ते पहले".)*

> "Here's a different one — board results out two weeks early. Kaan refuses this
> too, because no official date exists yet. Correct behaviour, not a failure."

---

## 1:58 – 2:22 · Why this shape works

*(Back to home. Point at the three cards and the sidebar.)*

> "Three claims, ten verified sources, two languages, one script running in a
> container.
>
> The matching is ours — weighted token signatures, split by script, so
> Devanagari, Roman Hindi and English all hit the same entry. A check takes one
> to five milliseconds, locally. No model call, no bill, no outage."

---

## 2:22 – 2:45 · What happens when things break

*(Point at the chip top-right: "Local matcher · no key needed".)*

> "Every dependency has a fallback. Speech recognition is optional — every note
> ships with its transcript. Text-to-speech is optional — the verdict audio is
> pre-generated and committed. An LLM key only upgrades claim extraction; if the
> call fails, the local extractor runs and the chip stays on local.
>
> If a source goes offline, its claims get pulled and those notes return
> *unverified* — which is still a correct answer."

---

## 2:45 – 2:55 · Close

*(Back to the home page, full frame.)*

> "Kaan. सुनो, फिर मानो — listen, then believe.
>
> One language, one vertical, one district to start. The repo and the deck are
> both public, and it runs with one command."

---

## Fallbacks if something misbehaves on camera

| Problem | Fix |
| --- | --- |
| Verdict audio doesn't play | Click once anywhere first (autoplay policy), then play. |
| Mic permission dialog | Deny it and use the paste box — say "or paste it" and move on. |
| Font looks like boxes | Devanagari fallback missing; re-record on the same machine that built the deck (Nirmala UI / Noto Sans Devanagari present). |
| Checking animation feels slow | It's a fixed 1.6 s floor for legibility; don't cut it, it reads as work being done. |

## Do not say

- Don't claim it checks "the whole internet" — the corpus is 10 curated claims.
- Don't call the refusal a limitation. It is the safety argument.
- Don't say "AI-powered" as the headline. The claim is *audio in, audio out*.
