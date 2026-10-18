// Deterministic generator for the quiz database.
//
//   node tools/generate.mjs --all               # every tools/data/<lang>.<theme>.mjs
//   node tools/generate.mjs ru.painters         # one theme
//   node tools/generate.mjs ru                  # every theme of one language
//
// Writes data/<lang>/<theme>.json.
//
// Data module schema (tools/data/<lang>.<theme>.mjs):
//   export default {
//     lang: 'ru', theme: 'Русские писатели', seed: 123,
//     templates: {
//       item:      ['...{v}...'],   // item -> key   (required)
//       secondary: ['...{v}...'],   // extra item -> key (optional)
//       key:       ['...{v}...'],   // key  -> 1 item (required)
//       keyMulti:  ['...{v}...'],   // key  -> 2 items (required)
//     },
//     groups:    [['Key', 'item1', 'item2', ...], ...],  // required
//     secondary: [['item', 'Key'], ...],                 // optional
//   }
//
// Invariants enforced here (hard failures, not warnings):
//   * keys are unique, items are unique, no item equals any key
//   * every option list has 4..6 items, no duplicate options
//   * options and answer of a question never share a string
//   * question texts are unique
//   * question count is 100..150

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'data');
const SRC_DIR = path.join(__dirname, 'data');
const LANGS = ['ru', 'en', 'zh', 'fr', 'es', 'ar'];
const SPEC_RE = /^(ru|en|zh|fr|es|ar)\.([a-z0-9_]+)\.mjs$/;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(rng, arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function pickN(rng, pool, n, exclude = new Set()) {
  const avail = pool.filter((x) => !exclude.has(x));
  if (avail.length < n) throw new Error(`not enough candidates: need ${n}, have ${avail.length}`);
  const copy = avail.slice();
  const out = [];
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (copy.length - i));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
    out.push(copy[i]);
  }
  return out;
}

function assertUnique(label, values) {
  const seen = new Set();
  for (const v of values) {
    if (seen.has(v)) throw new Error(`${label}: duplicate entry "${v}"`);
    seen.add(v);
  }
}

function assertTemplateList(cfg, name, required) {
  const list = cfg.templates?.[name];
  if (list === undefined) {
    if (required) throw new Error(`templates.${name} is required`);
    return;
  }
  if (!Array.isArray(list) || list.length === 0) throw new Error(`templates.${name} must be a non-empty array`);
  for (const tpl of list) {
    if (typeof tpl !== 'string' || !tpl.includes('{v}')) {
      throw new Error(`templates.${name}: every template needs a {v} placeholder, got "${tpl}"`);
    }
  }
}

function buildModel(cfg) {
  const withKeyQuestions = cfg.keyQuestions !== 0;
  const withItemQuestions = cfg.itemQuestions !== 0;
  assertTemplateList(cfg, 'item', withItemQuestions);
  assertTemplateList(cfg, 'key', withKeyQuestions);
  assertTemplateList(cfg, 'keyMulti', withKeyQuestions);
  assertTemplateList(cfg, 'secondary', false);

  if (!Array.isArray(cfg.groups) || cfg.groups.length < 3) throw new Error('groups must be an array of at least 3 groups');
  const keys = cfg.groups.map((g) => {
    if (!Array.isArray(g) || typeof g[0] !== 'string' || g.length < 2) {
      throw new Error(`each group must be [key, item, ...], got ${JSON.stringify(g)}`);
    }
    return g[0];
  });
  assertUnique('key', keys);

  const items = [];
  for (const [key, ...members] of cfg.groups) {
    for (const item of members) {
      if (typeof item !== 'string' || item.trim() === '') throw new Error(`group "${key}": bad item ${JSON.stringify(item)}`);
      items.push({ text: item, key });
    }
  }
  assertUnique('item', items.map((i) => i.text));

  const secondary = (cfg.secondary ?? []).map((pair) => {
    if (!Array.isArray(pair) || pair.length !== 2) throw new Error(`each secondary entry must be [item, key]`);
    const [item, key] = pair;
    if (!keys.includes(key)) throw new Error(`secondary item "${item}": unknown key "${key}"`);
    return { text: item, key };
  });
  assertUnique('secondary item', secondary.map((s) => s.text));
  assertTemplateList(cfg, 'secondary', secondary.length > 0);

  const keySet = new Set(keys);
  for (const { text } of [...items, ...secondary]) {
    if (keySet.has(text)) throw new Error(`item "${text}" collides with a key`);
  }
  const all = new Set();
  for (const { text } of [...items, ...secondary]) {
    if (all.has(text)) throw new Error(`"${text}" is used both as a primary and as a secondary item`);
    all.add(text);
  }
  return { keys, items, secondary };
}

function buildQuestions(cfg) {
  const { keys, items, secondary } = buildModel(cfg);
  const tpl = cfg.templates;
  const rng = mulberry32(cfg.seed);

  const counts = [5, 5, 6, 4];
  let countIdx = 0;
  const nextCount = () => counts[countIdx++ % counts.length];

  const questions = [];

  // 1. item -> key
  if (cfg.itemQuestions !== 0) {
    items.forEach((entry, i) => {
      questions.push({
        text: tpl.item[i % tpl.item.length].replace('{v}', entry.text),
        options: pickN(rng, keys, nextCount(), new Set([entry.key])),
        answer: [entry.key],
      });
    });
  }

  // 2. secondary item -> key
  secondary.forEach((entry, i) => {
    questions.push({
      text: tpl.secondary[i % tpl.secondary.length].replace('{v}', entry.text),
      options: pickN(rng, keys, nextCount(), new Set([entry.key])),
      answer: [entry.key],
    });
  });

  // 3. key -> item(s). More of these questions means more items are used both as an answer and as
  // a distractor, which is what the variant-crossing requirement is about, so aim for ~75% of keys
  // while keeping the file inside 100..150 questions.
  // A theme that mixes very different item kinds (works next to battles) sets keyQuestions: 0 so
  // that every option list stays homogeneous — "names"-style files: every answer and every
  // distractor is a person name.
  const base = questions.length;
  const perKey = Math.max(1, cfg.questionsPerKey ?? 1);
  let keyQuestions;
  if (cfg.keyQuestions === 0) {
    keyQuestions = 0;
  } else if (cfg.itemQuestions === 0) {
    // "works"-style file: the only family is key -> item(s). With questionsPerKey: 2 each key is
    // asked twice (once single-answer, once two-answer), so a file needs only ~60 creators.
    keyQuestions = Math.min(keys.length * perKey, 150);
    if (base + keyQuestions < 100) keyQuestions = Math.min(keys.length * perKey, 100 - base);
  } else {
    keyQuestions = Math.min(keys.length, Math.round(keys.length * 0.75));
    if (base + keyQuestions > 150) keyQuestions = Math.max(0, 150 - base);
    if (base + keyQuestions < 100) keyQuestions = Math.min(keys.length, 100 - base);
  }
  if (base + keyQuestions < 100 || base + keyQuestions > 150) {
    throw new Error(`data yields ${base} questions and ${keys.length} keys — cannot reach 100..150 questions`);
  }
  const foreignItemsBy = new Map(keys.map((k) => [k, items.filter((i) => i.key !== k).map((i) => i.text)]));
  // occurrences: each key may be asked up to `perKey` times (1st single-answer, 2nd two-answer).
  // A key with a single item cannot host a two-answer question, so it appears once only.
  const ownCount = new Map(keys.map((k) => [k, items.filter((i) => i.key === k).length]));
  const multiCapable = keys.filter((k) => ownCount.get(k) >= 2);
  const occurrences = shuffle(rng, keys.map((k) => ({ key: k, round: 0 })));
  for (let round = 1; round < perKey; round++) {
    for (const k of shuffle(rng, multiCapable)) occurrences.push({ key: k, round });
  }
  const keyPool = occurrences.slice(0, keyQuestions);
  // a question may have several correct answers: cfg.multiEvery = 2 means every second generated
  // key question offers two correct items of the same key (default: every third), and
  // cfg.multiEvery = 1 means EVERY key question asks for two items — useful for "works" files whose
  // item pool is so large that otherwise most titles never become an answer.
  const multiEvery = cfg.multiEvery ?? 3;
  keyPool.forEach(({ key, round }, k) => {
    const own = items.filter((i) => i.key === key).map((i) => i.text);
    // with questionsPerKey > 1 the first pass asks for one work and the second for two, so a key is
    // never asked the same way twice; otherwise fall back to the multiEvery rhythm
    const useMulti = own.length >= 2 && (perKey > 1 ? round > 0 : multiEvery === 1 || k % multiEvery === 1);
    const answer = useMulti ? pickN(rng, own, 2) : [own[Math.floor(rng() * own.length)]];
    const list = useMulti ? tpl.keyMulti : tpl.key;
    questions.push({
      text: list[(k + round) % list.length].replace('{v}', key),
      options: pickN(rng, foreignItemsBy.get(key), nextCount()),
      answer,
    });
  });

  if (questions.length < 100 || questions.length > 150) {
    throw new Error(`generated ${questions.length} questions, must be 100..150`);
  }

  assertUnique('question text', questions.map((q) => q.text));
  for (const q of questions) {
    if (q.options.length < 4 || q.options.length > 6) throw new Error(`bad option count in "${q.text}"`);
    if (new Set(q.options).size !== q.options.length) throw new Error(`duplicate option in "${q.text}"`);
    if (q.answer.length < 1) throw new Error(`empty answer in "${q.text}"`);
    if (q.answer.some((a) => q.options.includes(a))) throw new Error(`answer also used as option in "${q.text}"`);
  }

  return shuffle(rng, questions);
}

function crossingStats(questions) {
  const asAnswer = new Map();
  const asOption = new Map();
  const bump = (map, key) => map.set(key, (map.get(key) ?? 0) + 1);
  for (const q of questions) {
    for (const a of q.answer) bump(asAnswer, a);
    for (const o of q.options) bump(asOption, o);
  }
  const all = new Set([...asAnswer.keys(), ...asOption.keys()]);
  let both = 0;
  for (const v of all) if ((asAnswer.get(v) ?? 0) > 0 && (asOption.get(v) ?? 0) > 0) both++;
  return { distinct: all.size, both, ratio: both / all.size };
}

function resolveSpecs(args) {
  if (args.length === 0 || args.includes('--all')) {
    return fs.readdirSync(SRC_DIR).filter((f) => SPEC_RE.test(f)).sort().map((f) => f.replace(/\.mjs$/, ''));
  }
  const specs = [];
  for (const arg of args) {
    if (LANGS.includes(arg)) {
      for (const f of fs.readdirSync(SRC_DIR).filter((f) => SPEC_RE.test(f) && f.startsWith(`${arg}.`)).sort()) {
        specs.push(f.replace(/\.mjs$/, ''));
      }
    } else if (SPEC_RE.test(`${arg}.mjs`)) {
      specs.push(arg);
    } else {
      throw new Error(`bad spec "${arg}" — expected <ru|en|zh> or <lang>.<theme>`);
    }
  }
  return specs;
}

const specs = resolveSpecs(process.argv.slice(2));
let total = 0;
for (const spec of specs) {
  const cfg = (await import(`./data/${spec}.mjs`)).default;
  const [lang, theme] = spec.split('.');
  if (cfg.lang !== lang) throw new Error(`${spec}: cfg.lang is "${cfg.lang}"`);
  if (!cfg.theme || typeof cfg.theme !== 'string') throw new Error(`${spec}: cfg.theme is required`);
  const questions = buildQuestions(cfg);
  const outFile = path.join(OUT_DIR, lang, `${theme}.json`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify({ theme: cfg.theme, questions }, null, 2)}\n`, 'utf8');
  const stats = crossingStats(questions);
  total += questions.length;
  console.log(
    `${spec.padEnd(18)} ${String(questions.length).padStart(3)} questions -> data/${lang}/${theme}.json` +
      `  crossing ${stats.both}/${stats.distinct} (${(stats.ratio * 100).toFixed(1)}%)`,
  );
}
console.log(`${specs.length} theme file(s), ${total} questions total`);
