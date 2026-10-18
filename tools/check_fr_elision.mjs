// French elision audit: «de Athènes» must be «d'Athènes».
// Only the preposition "de" before a vowel-initial word is checked — h-initial words are excluded
// because French distinguishes h muet (d'Helsinki) from h aspiré (de Hambourg), which needs a
// dictionary, and «La Haye» / «le mâle» are correct as they stand.
//   node tools/check_fr_elision.mjs [--strict]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'fr');
const VOWELS = 'aàâäeéèêëiîïoôöuùûüyœæ';
// Unicode-aware: only a real word boundary counts, so « possède une » is not read as « de une »
const rx = new RegExp(`(?<![\\p{L}\\p{N}])de\\s+([${VOWELS}])`, 'giu');

let flagged = 0;
let checked = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
  const doc = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const q of doc.questions) {
    checked++;
    const m = q.text.match(rx);
    if (m) {
      flagged++;
      console.log(`${f}: missing elision "${m[0]}" — « ${q.text} »`);
    }
  }
}
console.log(`${checked} French question(s) checked, ${flagged} missing elision`);
process.exit(process.argv.includes('--strict') && flagged > 0 ? 1 : 0);
