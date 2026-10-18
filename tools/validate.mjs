// Validator for the quiz database.
//
//   node tools/validate.mjs                       -> every data/<lang>/<theme>.json
//   node tools/validate.mjs ru                    -> every theme of one language
//   node tools/validate.mjs ru.painters zh.tales  -> specific theme files
//
// Exit code 1 when any check fails.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const LANGS = ['ru', 'en', 'zh', 'fr', 'es', 'ar'];
const SLUG_RE = /^[a-z0-9_]+$/;

const RE_LATIN = /[A-Za-z]/;
const RE_CYRILLIC = /[\u0400-\u04FF]/;
const RE_CJK = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/;
const RE_ARABIC = /[\u0600-\u06FF\u0750-\u077F]/;

function langProblems(lang, s) {
  const problems = [];
  const hasLatin = RE_LATIN.test(s);
  const hasCyr = RE_CYRILLIC.test(s);
  const hasCjk = RE_CJK.test(s);
  const hasAr = RE_ARABIC.test(s);
  if (lang === 'ru') {
    if (hasLatin) problems.push('latin letters');
    if (hasCjk) problems.push('CJK characters');
    if (hasAr) problems.push('arabic characters');
    if (!hasCyr) problems.push('no cyrillic');
  } else if (lang === 'en' || lang === 'fr' || lang === 'es') {
    if (hasCyr) problems.push('cyrillic letters');
    if (hasCjk) problems.push('CJK characters');
    if (hasAr) problems.push('arabic characters');
    if (!hasLatin) problems.push('no latin letters');
  } else if (lang === 'zh') {
    if (hasLatin) problems.push('latin letters');
    if (hasCyr) problems.push('cyrillic letters');
    if (hasAr) problems.push('arabic characters');
    if (!hasCjk) problems.push('no CJK characters');
  } else if (lang === 'ar') {
    if (hasLatin) problems.push('latin letters');
    if (hasCyr) problems.push('cyrillic letters');
    if (hasCjk) problems.push('CJK characters');
    if (!hasAr) problems.push('no arabic characters');
  }
  return problems;
}

function validateFile(lang, theme, file) {
  const errors = [];
  const notes = [];
  const label = `${lang}/${theme}`;

  if (!fs.existsSync(file)) return { label, errors: [`missing file ${path.relative(ROOT, file)}`], notes };

  // 1. JSON parses
  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return { label, errors: [`JSON parse error: ${e.message}`], notes };
  }

  if (typeof doc !== 'object' || doc === null || Array.isArray(doc)) errors.push('root must be an object');
  if (typeof doc.theme !== 'string' || doc.theme.trim() === '') errors.push('theme must be a non-empty string');
  else for (const p of langProblems(lang, doc.theme)) errors.push(`theme: ${p}`);
  if (!Array.isArray(doc.questions)) {
    errors.push('questions must be an array');
    return { label, errors, notes };
  }
  const questions = doc.questions;

  // 7. count
  if (questions.length < 100 || questions.length > 150) {
    errors.push(`question count ${questions.length} outside 100..150`);
  }

  const checkStr = (s, where) => {
    for (const p of langProblems(lang, s)) errors.push(`${where}: "${s}" -> ${p}`);
  };

  const texts = new Map();
  const asAnswer = new Map();
  const asOption = new Map();
  const bump = (map, key) => map.set(key, (map.get(key) ?? 0) + 1);
  let answersTotal = 0;
  let multiAnswer = 0;
  const leaks = [];

  questions.forEach((q, i) => {
    const where = `q[${i}]`;
    if (typeof q !== 'object' || q === null || Array.isArray(q)) {
      errors.push(`${where}: question must be an object`);
      return;
    }
    // 2. required fields
    for (const field of ['text', 'options', 'answer']) {
      if (!(field in q)) errors.push(`${where}: missing field "${field}"`);
    }
    if (typeof q.text !== 'string' || q.text.trim() === '') {
      errors.push(`${where}: text must be a non-empty string`);
      return;
    }
    if (texts.has(q.text)) errors.push(`${where}: duplicate question text (also at q[${texts.get(q.text)}])`);
    else texts.set(q.text, i);
    checkStr(q.text, `${where}.text`);

    // 3. options 4..6 strings
    if (!Array.isArray(q.options)) {
      errors.push(`${where}: options must be an array`);
      return;
    }
    if (q.options.length < 4 || q.options.length > 6) {
      errors.push(`${where}: options count ${q.options.length} outside 4..6`);
    }
    const optSeen = new Set();
    q.options.forEach((o, j) => {
      if (typeof o !== 'string' || o.trim() === '') {
        errors.push(`${where}.options[${j}]: must be a non-empty string`);
        return;
      }
      checkStr(o, `${where}.options[${j}]`);
      if (optSeen.has(o)) errors.push(`${where}.options[${j}]: duplicate option "${o}"`);
      optSeen.add(o);
      bump(asOption, o);
    });

    // 4. answer non-empty array of strings
    if (!Array.isArray(q.answer)) {
      errors.push(`${where}: answer must be an array`);
      return;
    }
    if (q.answer.length < 1) errors.push(`${where}: answer must have at least 1 element`);
    if (q.answer.length > 1) multiAnswer++;
    const ansSeen = new Set();
    q.answer.forEach((a, j) => {
      if (typeof a !== 'string' || a.trim() === '') {
        errors.push(`${where}.answer[${j}]: must be a non-empty string`);
        return;
      }
      checkStr(a, `${where}.answer[${j}]`);
      if (ansSeen.has(a)) errors.push(`${where}.answer[${j}]: duplicate answer "${a}"`);
      ansSeen.add(a);
      bump(asAnswer, a);
    });
    answersTotal += q.answer.length;

    // 5. disjoint options / answer
    for (const a of q.answer) {
      if (optSeen.has(a)) errors.push(`${where}: "${a}" is both an answer and an option`);
    }
    const union = [...q.options, ...q.answer];
    if (new Set(union).size !== union.length) errors.push(`${where}: options+answer union contains duplicates`);

    // quality diagnostic (not a TASK.md rule): a question must not spell out its own answer
    for (const a of q.answer) {
      if (q.text.includes(a)) leaks.push(`${where}: "${q.text}" contains its own answer "${a}"`);
    }
  });

  // 8. crossing between questions
  const all = new Set([...asAnswer.keys(), ...asOption.keys()]);
  let both = 0;
  for (const v of all) if ((asAnswer.get(v) ?? 0) > 0 && (asOption.get(v) ?? 0) > 0) both++;
  const ratio = all.size === 0 ? 0 : both / all.size;
  notes.push(
    `Q=${questions.length} values=${all.size} both-ways=${both} (${(ratio * 100).toFixed(1)}%) answers=${answersTotal} multi-answer=${multiAnswer}`,
  );
  if (leaks.length > 0) {
    notes.push(`self-answering=${leaks.length}`);
    for (const l of leaks.slice(0, 3)) notes.push(`warn ${l}`);
  }
  // a small answer space (12 centuries, 20 colours) is fine as long as the crossing is strong
  if (both < 8 || ratio < 0.4) {
    errors.push(`weak variant crossing: only ${both} values (${(ratio * 100).toFixed(1)}%) appear both as answer and as distractor`);
  }

  return { label, errors, notes, texts: [...texts.keys()] };
}

function collectAll() {
  const all = [];
  if (!fs.existsSync(DATA_DIR)) return all;
  for (const lang of fs.readdirSync(DATA_DIR).filter((d) => LANGS.includes(d)).sort()) {
    const dir = path.join(DATA_DIR, lang);
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
      all.push({ lang, theme: f.replace(/\.json$/, ''), file: path.join(dir, f) });
    }
  }
  return all;
}

function resolveTargets(args) {
  const all = collectAll();
  if (args.length === 0) return all;
  const targets = [];
  for (const arg of args) {
    if (LANGS.includes(arg)) {
      targets.push(...all.filter((t) => t.lang === arg));
    } else {
      const [lang, theme] = arg.split('.');
      if (!LANGS.includes(lang) || !theme || !SLUG_RE.test(theme)) throw new Error(`bad filter "${arg}"`);
      const hit = all.find((t) => t.lang === lang && t.theme === theme);
      if (!hit) throw new Error(`no data file for "${arg}"`);
      targets.push(hit);
    }
  }
  return targets;
}

// file naming rule: latin slugs only, grouped by language folder
const targets = resolveTargets(process.argv.slice(2));
let failed = 0;
let passing = 0;
const seenElsewhere = new Map(); // question text -> label of the file that already had it
const crossFileDupes = [];

for (const t of targets) {
  if (!SLUG_RE.test(t.theme)) {
    failed++;
    console.log(`FAIL ${t.label.padEnd(22)} illegal theme file name (must be a latin slug)`);
    continue;
  }
  const { label, errors, notes, texts } = validateFile(t.lang, t.theme, t.file);
  for (const text of texts ?? []) {
    const owner = seenElsewhere.get(text);
    if (owner !== undefined && owner !== label) crossFileDupes.push(`"${text}" appears in ${owner} and ${label}`);
    else seenElsewhere.set(text, label);
  }
  if (errors.length === 0) {
    passing++;
    console.log(`PASS ${label.padEnd(22)} ${notes.join(' | ')}`);
  } else {
    failed++;
    console.log(`FAIL ${label.padEnd(22)} ${errors.length} problem(s)`);
    for (const e of errors.slice(0, 25)) console.log(`   - ${e}`);
    if (errors.length > 25) console.log(`   ... and ${errors.length - 25} more`);
  }
}

if (crossFileDupes.length > 0) {
  failed++;
  console.log(`FAIL cross-file  ${crossFileDupes.length} question(s) duplicated between theme files`);
  for (const d of crossFileDupes.slice(0, 10)) console.log(`   - ${d}`);
  if (crossFileDupes.length > 10) console.log(`   ... and ${crossFileDupes.length - 10} more`);
}

if (targets.length === 0) console.log('NOTE: no data files found');
console.log(`${passing}/${targets.length} theme file(s) passed`);
console.log(failed === 0 ? 'ALL CHECKS PASSED' : `${failed} file(s) failed`);
process.exit(failed === 0 ? 0 : 1);
