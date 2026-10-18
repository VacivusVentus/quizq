// QA report for the quiz database: per-file stats, quality diagnostics and random sampling of
// questions for eyeballing.
//
//   node tools/qa.mjs                        # all files, stats + diagnostics
//   node tools/qa.mjs ru.cinema --sample 3   # stats + 3 sample questions
//   node tools/qa.mjs --sample 2             # sample 2 questions from every file
//
// Diagnostics (advisory, not TASK.md rules):
//   self-answering  — the question text spells out its own answer;
//   guessable       — a word in the text shares a >=5-character prefix with the answer
//                     (e.g. item "Казанский кремль" answering key "Казань").

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const LANGS = ['ru', 'en', 'zh', 'fr', 'es', 'ar'];
const PREFIX = 5;
// words that are never an entity giveaway (English/Russian function words), to keep the
// prefix heuristic from firing on e.g. "these" vs "Theseus"
const STOPWORDS = new Set([
  'these', 'those', 'there', 'their', 'this', 'that', 'which', 'where', 'when', 'what', 'with',
  'from', 'into', 'about', 'whose', 'character', 'characters', 'city', 'cities', 'movie', 'movies',
  'автором', 'каких', 'какой', 'который', 'которые', 'герой', 'героя', 'персонаж', 'персонажа',
  'город', 'городе', 'города', 'картина', 'картины', 'произведение', 'произведения', 'фильм', 'фильма',
]);

function collect(args) {
  const all = [];
  for (const lang of LANGS) {
    const dir = path.join(DATA_DIR, lang);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
      all.push({ lang, theme: f.replace(/\.json$/, ''), file: path.join(dir, f) });
    }
  }
  if (!args.length) return all;
  const picked = [];
  for (const arg of args) {
    if (LANGS.includes(arg)) picked.push(...all.filter((t) => t.lang === arg));
    else {
      const hit = all.filter((t) => `${t.lang}.${t.theme}` === arg);
      if (!hit.length) throw new Error(`no data file for "${arg}"`);
      picked.push(...hit);
    }
  }
  return picked;
}

function words(text) {
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

function diagnostics(questions) {
  const selfAnswering = [];
  const guessable = [];
  for (const q of questions) {
    for (const a of q.answer) {
      if (q.text.includes(a)) selfAnswering.push({ text: q.text, answer: a });
      const low = a.toLowerCase();
      if (low.length < PREFIX) continue;
      for (const w of words(q.text)) {
        if (w === low) continue;
        let n = 0;
        const max = Math.min(w.length, low.length);
        while (n < max && w[n] === low[n]) n++;
        if (n >= PREFIX) {
          guessable.push({ text: q.text, answer: a, shared: w.slice(0, n) });
          break;
        }
      }
    }
  }
  return { selfAnswering, guessable };
}

const args = process.argv.slice(2);
const sampleIdx = args.indexOf('--sample');
const sampleN = sampleIdx === -1 ? 0 : Number(args[sampleIdx + 1] ?? 1);
const rest = args.filter((a, i) => i !== sampleIdx && i !== sampleIdx + 1);
const targets = collect(rest);

let totalQ = 0;
let sumRatio = 0;
let flags = 0;

for (const t of targets) {
  const doc = JSON.parse(fs.readFileSync(t.file, 'utf8'));
  const questions = doc.questions;
  totalQ += questions.length;

  const answerCount = new Map();
  const optionCount = new Map();
  for (const q of questions) {
    for (const a of q.answer) answerCount.set(a, (answerCount.get(a) ?? 0) + 1);
    for (const o of q.options) optionCount.set(o, (optionCount.get(o) ?? 0) + 1);
  }
  const values = new Set([...answerCount.keys(), ...optionCount.keys()]);
  let both = 0;
  for (const v of values) if (answerCount.has(v) && optionCount.has(v)) both++;
  const ratio = values.size ? both / values.size : 0;
  sumRatio += ratio;

  const optLens = {};
  for (const q of questions) optLens[q.options.length] = (optLens[q.options.length] ?? 0) + 1;
  const multi = questions.filter((q) => q.answer.length > 1).length;
  const distinctAnswers = new Set(questions.flatMap((q) => q.answer)).size;
  const d = diagnostics(questions);
  flags += d.selfAnswering.length + d.guessable.length;

  console.log(
    `${(t.lang + '/' + t.theme).padEnd(22)} Q=${String(questions.length).padStart(3)}` +
      ` opts=${JSON.stringify(optLens)} multi=${multi}` +
      ` distinct-answers=${String(distinctAnswers).padStart(3)}` +
      ` crossing=${(ratio * 100).toFixed(1)}%` +
      ` self-answering=${d.selfAnswering.length} guessable=${d.guessable.length}`,
  );
  for (const g of d.guessable.slice(0, 2)) {
    console.log(`    guessable: "${g.text}" -> "${g.answer}" (shared "${g.shared}")`);
  }

  if (sampleN > 0) {
    const picks = new Set();
    for (let i = 0; i < sampleN; i++) picks.add(Math.floor((i + 0.5) * questions.length / sampleN));
    for (const i of picks) {
      const q = questions[i];
      console.log(`    [${i}] ${q.text}`);
      console.log(`        options: ${q.options.join(' | ')}`);
      console.log(`        ANSWER : ${q.answer.join(' | ')}`);
    }
  }
}

console.log(
  `\n${targets.length} file(s), ${totalQ} questions total, mean crossing ${(sumRatio / Math.max(1, targets.length) * 100).toFixed(1)}%, ` +
    `${flags} advisory flag(s) (self-answering + guessable)`,
);
