// Markdown report over the whole quiz database: one row per theme, one column per language.
//
//   node tools/report.mjs            # markdown table on stdout
//   node tools/report.mjs --json     # machine-readable summary

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const LANGS = ['ru', 'en', 'zh', 'fr', 'es', 'ar'];

function readAll() {
  const perLang = new Map(LANGS.map((l) => [l, new Map()]));
  for (const lang of LANGS) {
    const dir = path.join(DATA_DIR, lang);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
      const doc = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      const qs = doc.questions;
      const asAnswer = new Set();
      const asOption = new Set();
      for (const q of qs) {
        for (const a of q.answer) asAnswer.add(a);
        for (const o of q.options) asOption.add(o);
      }
      const both = [...asAnswer].filter((v) => asOption.has(v)).length;
      const values = new Set([...asAnswer, ...asOption]).size;
      perLang.get(lang).set(f.replace(/\.json$/, ''), {
        theme: doc.theme,
        questions: qs.length,
        multi: qs.filter((q) => q.answer.length > 1).length,
        crossing: values ? both / values : 0,
      });
    }
  }
  return perLang;
}

const perLang = readAll();
const themes = [...new Set(LANGS.flatMap((l) => [...perLang.get(l).keys()]))].sort();

if (process.argv.includes('--json')) {
  const out = { themes, langs: {} };
  for (const lang of LANGS) out.langs[lang] = Object.fromEntries(perLang.get(lang));
  console.log(JSON.stringify(out, null, 2));
} else {
  console.log('| theme | ru | en | zh |');
  console.log('|---|---|---|---|');
  for (const theme of themes) {
    const cells = LANGS.map((lang) => {
      const e = perLang.get(lang).get(theme);
      return e ? `${e.questions} q · ${(e.crossing * 100).toFixed(1)}%` : '—';
    });
    console.log(`| \`${theme}\` | ${cells.join(' | ')} |`);
  }
  console.log('');
  console.log('| theme | ru display name | en display name | zh display name |');
  console.log('|---|---|---|---|');
  for (const theme of themes) {
    const names = LANGS.map((lang) => perLang.get(lang).get(theme)?.theme ?? '—');
    console.log(`| \`${theme}\` | ${names.join(' | ')} |`);
  }
  console.log('');
  for (const lang of LANGS) {
    const entries = [...perLang.get(lang).values()];
    const q = entries.reduce((s, e) => s + e.questions, 0);
    const multi = entries.reduce((s, e) => s + e.multi, 0);
    const mean = entries.length ? entries.reduce((s, e) => s + e.crossing, 0) / entries.length : 0;
    console.log(`${lang}: ${entries.length} themes, ${q} questions, ${multi} multi-answer, mean crossing ${(mean * 100).toFixed(1)}%`);
  }
}
