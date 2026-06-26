#!/usr/bin/env node
/*
 * Grandriver Coatings — asset generator (Gemini image models)
 * -----------------------------------------------------------
 * Generates the brand logo emblem + before/after coating photos into ../assets.
 *
 * SECURITY: the API key is read ONLY from the environment. Never hardcode it,
 * never commit it. Run with:
 *
 *   GEMINI_API_KEY=your_key node scripts/generate-assets.mjs
 *
 * After running, ROTATE the key in Google AI Studio if it was ever shared.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error("Missing GEMINI_API_KEY env var. See file header for usage.");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "..", "assets");
mkdirSync(OUT, { recursive: true });

const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

// Brand palette baked into every prompt so output stays on-brand.
const BRAND =
  "Brand palette: deep glossy navy base, off-white, and one safety-orange accent, " +
  "with white / dark-blue / orange decorative vinyl flakes. Photorealistic, crisp, professional.";

const JOBS = [
  {
    file: "hero-floor.jpg",
    prompt:
      `A photorealistic wide shot of a freshly installed polyaspartic flake garage floor, ` +
      `glossy mirror-like finish reflecting overhead light, dense white, dark-blue and orange ` +
      `vinyl flakes across a deep navy base. Clean modern garage, dramatic lighting. ${BRAND}`,
  },
  {
    file: "ba-garage.jpg",
    prompt:
      `A single side-by-side BEFORE and AFTER comparison image of a residential garage floor. ` +
      `LEFT (before): dull grey cracked stained bare concrete slab. RIGHT (after): the same ` +
      `garage with a glossy flake-coated floor, white/dark-blue/orange flakes on a navy base, ` +
      `high gloss. Clear vertical divider down the middle. ${BRAND}`,
  },
  {
    file: "ba-basement.jpg",
    prompt:
      `A single side-by-side BEFORE and AFTER comparison image of a residential basement floor. ` +
      `LEFT (before): cold damp grey cracked concrete with efflorescence. RIGHT (after): warm ` +
      `finished basement with a glossy light-grey flake floor (white and grey flakes), clean and ` +
      `bright. Clear vertical divider down the middle. ${BRAND}`,
  },
  {
    file: "ba-commercial.jpg",
    prompt:
      `A single side-by-side BEFORE and AFTER comparison image of a commercial shop / warehouse ` +
      `floor. LEFT (before): worn stained grey concrete. RIGHT (after): seamless glossy charcoal ` +
      `flake floor with grey and white flakes, industrial showroom look. Clear vertical divider. ${BRAND}`,
  },
  {
    file: "logo-emblem.png",
    prompt:
      `A clean modern vector-style logo emblem on a pure white background for "Grandriver Coatings", ` +
      `a concrete floor coating company. A bold geometric letter "G" ring with a stylized flowing ` +
      `river of small flakes (white, dark blue, orange) pouring out of the opening of the G and ` +
      `underlining it. Minimal, premium, high contrast, centered, lots of white space. No text other ` +
      `than a small wordmark "GRANDRIVER COATINGS" in a clean bold sans-serif under the mark.`,
  },
];

async function generate(job) {
  const body = {
    contents: [{ role: "user", parts: [{ text: job.prompt }] }],
    generationConfig: { responseModalities: ["IMAGE"] },
  };
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${job.file}: HTTP ${res.status} ${t.slice(0, 300)}`);
  }
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) throw new Error(`${job.file}: no image in response`);
  const buf = Buffer.from(img.inlineData.data, "base64");
  const dest = resolve(OUT, job.file);
  writeFileSync(dest, buf);
  console.log(`✓ ${job.file} (${(buf.length / 1024).toFixed(0)} KB)`);
}

for (const job of JOBS) {
  try {
    await generate(job);
  } catch (e) {
    console.error(`✗ ${e.message}`);
  }
}
console.log("Done. Assets written to", OUT);
