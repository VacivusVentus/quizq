// Remove fr.works items whose title is also a work of ANOTHER listed creator (rule-2 defects).
// Handles both single- and double-quoted modules. Safe to delete after running.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'fr.works.mjs');
const lines = fs.readFileSync(p, 'utf8').split('\n');

// [creator whose item goes, item] — the canonical side keeps the title
const DROP = [
  ['Camille Claudel', 'La Valse'],
  ['Gabriel Fauré', 'Pelléas et Mélisande'],
  ['Claude Chabrol', 'Madame Bovary'],
  ['Jacques Rivette', 'La Religieuse'],
  ['Julien Duvivier', 'Au Bonheur des dames'],
];

for (const [creator, item] of DROP) {
  const idx = lines.findIndex((l) => l.trimStart().startsWith(`["${creator}"`) || l.trimStart().startsWith(`['${creator}'`));
  if (idx === -1) throw new Error(`group not found: ${creator}`);
  let line = lines[idx];
  const variants = [`", "${item}"`, `', '${item}'`, `, "${item}"`, `, '${item}'`];
  let done = false;
  for (const v of variants) {
    if (line.includes(v)) {
      line = line.replace(v, '');
      done = true;
      break;
    }
  }
  if (!done) throw new Error(`item "${item}" not found in group ${creator}`);
  lines[idx] = line;
  console.log(`${creator}: dropped "${item}"`);
}
fs.writeFileSync(p, lines.join('\n'), 'utf8');
console.log('done');
