// Structural leak finder: reports (key, item) pairs where the item text contains its own key, or
// shares a long prefix with it. Those make the generated question trivial
// ("In which city is Dublin Castle located?" -> Dublin).
//
//   node tools/leaks.mjs            # every tools/data/*.mjs
//   node tools/leaks.mjs ru.cities
//
// Advisory: exit code 0 even when leaks are found (use --strict for exit 1).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, 'data');
const PREFIX = 5;

function sharedPrefix(a, b) {
  const max = Math.min(a.length, b.length);
  let n = 0;
  while (n < max && a[n] === b[n]) n++;
  return n;
}

// English titles are full of "The ...", so compare the content after the leading article —
// otherwise "the sleigh" looks like it shares a prefix with "The Snow Queen".
function normalize(text) {
  return text.toLowerCase().replace(/^(the|a|an)\s+/, '').trim();
}

const args = process.argv.slice(2).filter((a) => a !== '--strict');
const strict = process.argv.includes('--strict');
const specs = (args.length ? args : fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.mjs')).map((f) => f.replace(/\.mjs$/, ''))).sort();

let totalLeaks = 0;
for (const spec of specs) {
  const file = path.join(SRC_DIR, `${spec}.mjs`);
  if (!fs.existsSync(file)) {
    console.log(`SKIP ${spec} (no module)`);
    continue;
  }
  const cfg = (await import(`./data/${spec}.mjs`)).default;
  const leaks = [];
  for (const [key, ...items] of cfg.groups) {
    for (const item of items) {
      const k = normalize(key);
      const i = normalize(item);
      if (i.includes(k)) leaks.push([key, item, 'contains key']);
      else {
        const n = sharedPrefix(k, i);
        if (n >= PREFIX) leaks.push([key, item, `shares prefix "${i.slice(0, n)}"`]);
      }
    }
  }
  for (const [item, key] of cfg.secondary ?? []) {
    const k = normalize(key);
    const i = normalize(item);
    if (i.includes(k) || sharedPrefix(k, i) >= PREFIX) leaks.push([key, item, 'secondary item leaks key']);
  }
  totalLeaks += leaks.length;
  if (leaks.length === 0) {
    console.log(`OK    ${spec}`);
  } else {
    console.log(`LEAK  ${spec} — ${leaks.length} item(s) reveal their own key:`);
    for (const [key, item, why] of leaks) console.log(`        [${key}] <- "${item}" (${why})`);
  }
}

console.log(`\n${specs.length} module(s) scanned, ${totalLeaks} revealing item(s)`);
process.exit(strict && totalLeaks > 0 ? 1 : 0);
