// Russian template sanity check: {v} is inserted in the NOMINATIVE, so a template must not place
// it after a case-governing preposition (перу {v}, у {v}, с {v} ...), which reads as broken Russian.
//
//   node tools/check_grammar.mjs            # every tools/data/ru.*.mjs
//   node tools/check_grammar.mjs ru.painters
//
// Exit code 1 when a suspicious template is found.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, 'data');

const GOVERNS = [
  'у', 'к', 'ко', 'с', 'со', 'от', 'ото', 'до', 'для', 'о', 'об', 'обо', 'при', 'над', 'под', 'за',
  'из', 'изо', 'без', 'возле', 'около', 'против', 'благодаря', 'согласно', 'вокруг', 'мимо',
  'перу', 'пера', 'перед', 'между', 'ради', 'сквозь', 'через', 'после', 'кроме', 'внутри',
];
const RE_BEFORE = new RegExp(`(^|[^\\p{L}])(${GOVERNS.join('|')})[ \\t]+\\{v\\}`, 'iu');

const args = process.argv.slice(2);
const files = (args.length
  ? args.map((a) => `${a}.mjs`)
  : fs.readdirSync(SRC_DIR).filter((f) => f.startsWith('ru.') && f.endsWith('.mjs'))
).filter((f) => fs.existsSync(path.join(SRC_DIR, f)));

let flagged = 0;
let checked = 0;
for (const file of files) {
  const cfg = (await import(`./data/${file}`)).default;
  const groups = Object.entries(cfg.templates ?? {});
  for (const [name, list] of groups) {
    for (const tpl of list) {
      checked++;
      const m = tpl.match(RE_BEFORE);
      if (m) {
        flagged++;
        console.log(`SUSPECT ${file} templates.${name}: "${tpl}"  ({v} after "${m[2]}")`);
      }
    }
  }
}
console.log(`${checked} Russian template(s) checked across ${files.length} data module(s), ${flagged} suspect`);
process.exit(flagged === 0 ? 0 : 1);
