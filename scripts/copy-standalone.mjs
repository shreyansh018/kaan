/**
 * Next.js `output: "standalone"` does not copy public/ or .next/static into
 * the standalone folder by itself. Docker does that with COPY layers; this
 * script does the same thing locally so `npm start` runs the exact artefact
 * the container runs.
 */

import { cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  console.log("[standalone] no standalone build found, skipping asset copy");
  process.exit(0);
}

const targets = [
  [path.join(root, "public"), path.join(standalone, "public")],
  [path.join(root, ".next", "static"), path.join(standalone, ".next", "static")],
];

for (const [from, to] of targets) {
  if (!existsSync(from)) continue;
  await mkdir(path.dirname(to), { recursive: true });
  await cp(from, to, { recursive: true });
}

console.log("[standalone] public/ and .next/static copied");
