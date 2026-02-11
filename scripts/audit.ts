#!/usr/bin/env npx tsx
/**
 * Run a Lighthouse audit on a URL without auth or DB.
 * Usage: pnpm run audit <url>
 *        pnpm run audit https://example.com
 *        pnpm run audit https://example.com --out report.json
 */

import { runLighthouseAudit } from '../src/lib/server/lighthouse.js';
import { writeFileSync } from "fs";

const url = process.argv[2];
const outIdx = process.argv.indexOf("--out");
const outPath = outIdx !== -1 ? process.argv[outIdx + 1] : null;

if (!url) {
  console.error("Usage: pnpm run audit <url> [--out report.json]");
  process.exit(1);
}

async function main() {
  console.log(`Auditing ${url}...`);
  const result = await runLighthouseAudit(url as string);

  console.log("\nScores:");
  console.log("  Performance:   ", result.performance, "%");
  console.log("  SEO:           ", result.seo, "%");
  console.log("  Best Practices:", result.bestPractices, "%");
  console.log("  Accessibility: ", result.accessibility, "%");
  const overall = Math.round(
    (result.performance + result.seo + result.bestPractices + result.accessibility) / 4
  );
  console.log("  Overall:       ", overall, "%");

  if (outPath) {
    writeFileSync(outPath, JSON.stringify(result.raw, null, 2), "utf-8");
    console.log(`\nFull report written to ${outPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
