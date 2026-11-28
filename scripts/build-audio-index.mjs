/**
 * Builds src/data/audio-index.json — the fingerprint list the upload endpoint
 * uses to recognise a bundled demo note without any speech-to-text service.
 *
 * Why hashes and not "listen to the file": decoding audio in a keyless,
 * dependency-free container is not realistic, but recognising a file we
 * ourselves shipped is exact and honest. Anything else needs a real
 * transcription key, and the API says so instead of guessing.
 *
 * Usage: node scripts/build-audio-index.mjs
 */

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AUDIO_DIR = path.join(ROOT, "public", "audio");
const SEEDS_PATH = path.join(ROOT, "src", "data", "seeds.json");
const OUT_PATH = path.join(ROOT, "src", "data", "audio-index.json");

const MPEG1_BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const MPEG2_BITRATES = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
const SAMPLE_RATES = {
  3: [44100, 48000, 32000], // MPEG 1
  2: [22050, 24000, 16000], // MPEG 2
  0: [11025, 12000, 8000], // MPEG 2.5
};

/** Rough duration for CBR MP3s, which is what edge-tts produces. */
function mp3Duration(buffer) {
  let offset = 0;
  if (buffer.toString("latin1", 0, 3) === "ID3") {
    const size =
      ((buffer[6] & 0x7f) << 21) |
      ((buffer[7] & 0x7f) << 14) |
      ((buffer[8] & 0x7f) << 7) |
      (buffer[9] & 0x7f);
    offset = 10 + size;
  }

  for (let i = offset; i < buffer.length - 4; i += 1) {
    if (buffer[i] !== 0xff || (buffer[i + 1] & 0xe0) !== 0xe0) continue;

    const versionBits = (buffer[i + 1] >> 3) & 0x03;
    const layerBits = (buffer[i + 1] >> 1) & 0x03;
    const bitrateIndex = (buffer[i + 2] >> 4) & 0x0f;
    const rateIndex = (buffer[i + 2] >> 2) & 0x03;

    if (layerBits !== 0x01) continue; // Layer III only
    if (bitrateIndex === 0 || bitrateIndex === 15) continue;
    if (rateIndex === 3) continue;

    const table = versionBits === 3 ? MPEG1_BITRATES : MPEG2_BITRATES;
    const bitrate = table[bitrateIndex] * 1000;
    const sampleRate = SAMPLE_RATES[versionBits]?.[rateIndex];
    if (!bitrate || !sampleRate) continue;

    return (buffer.length - i) * 8 / bitrate;
  }

  return null;
}

const seeds = JSON.parse(readFileSync(SEEDS_PATH, "utf8"));
const byFile = new Map(seeds.map((seed) => [path.basename(seed.audio), seed]));

const index = [];
for (const file of readdirSync(AUDIO_DIR).sort()) {
  if (!file.endsWith(".mp3")) continue;
  const seed = byFile.get(file);
  if (!seed) continue;

  const buffer = readFileSync(path.join(AUDIO_DIR, file));
  const duration = mp3Duration(buffer);

  index.push({
    seedId: seed.id,
    file,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    bytes: buffer.length,
    durationSec: duration ? Number(duration.toFixed(1)) : null,
  });
}

writeFileSync(OUT_PATH, JSON.stringify(index, null, 2) + "\n", "utf8");
console.log(`audio-index: ${index.length} bundled notes`);
for (const item of index) {
  console.log(`  ${item.seedId.padEnd(10)} ${item.durationSec}s ${(item.bytes / 1024).toFixed(0)} KB ${item.sha256.slice(0, 12)}`);
}
