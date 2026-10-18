# THEME_SPEC — how to author a quiz theme

This document is the contract for every theme in `data/<lang>/<theme>.json`.
JSON is **generated**; you only author a small data module per language.

## 1. Pipeline

```
node tools/generate.mjs ru.painters     # tools/data/ru.painters.mjs -> data/ru/painters.json
node tools/validate.mjs  ru.painters    # re-checks the produced JSON against all TASK.md rules
```

`generate` fails loudly (non-zero exit) if an invariant is broken — fix and re-run until both
commands pass for all three languages of your theme. `node tools/generate.mjs --all` rebuilds
everything (do not run it while other agents work; run only your own specs).

**Never** hand-edit a `data/**/*.json` file, `tools/generate.mjs` or another theme's data module.

## 2. Data module schema — `tools/data/<lang>.<theme>.mjs`

```js
export default {
  lang: 'ru',                          // ru | en | zh — must match the file name
  theme: 'Русские художники',          // display name, IN THE LANGUAGE OF THE FILE
  seed: 77001,                         // any integer, unique per file
  templates: {
    item:      ['...{v}...'],          // item  -> key      (one question per item)
    key:       ['...{v}...'],          // key   -> 1 item
    keyMulti:  ['...{v}...'],          // key   -> 2 items
    secondary: ['...{v}...'],          // optional, only if `secondary` data is used
  },
  groups: [
    ['Key A', 'item 1', 'item 2', 'item 3'],
    ['Key B', 'item 4', 'item 5', 'item 6'],
    // ... 28-34 keys
  ],
  // optional second relation, same shape as the writers theme used for characters:
  // secondary: [['item', 'Key A'], ['item', 'Key B']],
  // optional: 0 = only "whose is this?" questions, so every option is a key (see §3a)
  // keyQuestions: 0,
};
```

### 3a. Two flavours of theme

**Domain theme** (default): key = author/painter/director, items = their works. The generator emits
both `item -> key` and `key -> item` questions; both option lists stay homogeneous because all items
of a theme are of the same kind (works).

**Names theme** (`keyQuestions: 0`): the file mixes professions — writers, composers, painters,
politicians — so items are of *different* kinds (a novel, a symphony, a painting, a battle). Only
`item -> key` questions are generated, therefore **every option and every answer is a person's name**
and the player cannot infer the answer from the profession. Needs ≥ 100 items (no key questions are
added), e.g. 34 keys × 3 items = 102 questions.

**Works theme** (`itemQuestions: 0`): the mirror image — all creators of one kind of output merged,
only `key -> item` questions are generated, therefore **every option is a work title** (a novel, an
opera and a painting in one list). Every key is asked about once; needs ≥ 100 keys. Set
`multiEvery: 2` so that every second question has **two correct answers** — the schema allows an
`answer` array with several elements and such questions are the interesting ones.

When authoring a names theme, mind two extra traps:

* an item must not be the work of two listed keys — e.g. «Руслан и Людмила» is both Pushkin's poem
  and Glinka's opera, so while both are keys it cannot be an item of either;
* never put a Roman numeral in a cyrillic file (`Пётр Первый`, not `Пётр I`) and never let an item
  contain its own key's name.

**Answer-space themes** (`keyQuestions: 0`) generalise the same idea to non-person answers: the key
is the value the player must pick and the items are the prompts —

| theme | key is | item is | question |
|---|---|---|---|
| `names` | a person | a work/deed/character | «С чьим именем связано X?» |
| `places` | a country | a city | «В какой стране находится X?» |
| `dates` | a century | an event | «В каком веке произошло X?» |
| `numbers` | a number | a quantity fact | «Сколько X?» |
| `animals` | an animal | a unique fact | «О каком животном речь: X?» |
| `colors` | a colour | a thing of that colour | «Какого цвета X?» |

They need **≥ 100 items** (no key questions are added) and **≥ 8 keys**; a small answer space
(12 centuries, 20 colours) is fine — the validator only demands that the crossing is strong
(≥ 40 % of values used both ways, which these files reach at 100 %).

Rules enforced by the generator (hard errors):

* every template string must contain `{v}`;
* keys unique, items unique, no item may equal a key;
* `groups` ≥ 3 entries, each `[key, item, ...]` with at least one item;
* question count must land in 100..150 — the generator adds `key -> item(s)` questions
  automatically (`keyQuestions ≈ keys/2`, extended up to `keys` when needed to reach 100);
  distractors are always taken from other keys, so a correct option can never leak into `options`.

### Volume target (aim here, it is verified)

* **28–34 keys**, each with **2–4 items** (3 is ideal) → ~90 items.
* Hard minimum: `keys + items >= 105`, otherwise the file cannot reach 100 questions.
* If a key legitimately has only 1–2 items, that is fine — add more keys instead.

## 3. Fairness rule (most important content rule)

Every item must belong to **exactly one** key, canonically and unambiguously.
A distractor is shown to the player as a wrong answer, so it must really be wrong for the
question asked:

* no item that two listed keys could both claim (e.g. shared dishes, works with double
  attribution, landmarks near two cities) — drop it, or drop one of the keys;
* no borderline/disputed attributions (prefer famous, uncontested facts);
* no item reused twice in the file, and no item equal to a key string.

## 4. Script purity (hard rule, checked per language)

Six languages: the three original ones plus the remaining UN languages `fr`, `es`, `ar`.

| file | every string must be | never contains |
|---|---|---|
| `ru` | Cyrillic | Latin, CJK, Arabic |
| `en` | Latin | Cyrillic, CJK, Arabic |
| `fr` | Latin (accents é è ê à ç ù ï allowed) | Cyrillic, CJK, Arabic |
| `es` | Latin (ñ á é í ó ú ü allowed) | Cyrillic, CJK, Arabic |
| `zh` | Chinese characters | Latin, Cyrillic, Arabic |
| `ar` | **Arabic script only** | Latin, Cyrillic, CJK |

* In `zh` avoid loanwords written with Latin letters (`T恤`, `卡拉OK`, `IP地址`) and Latin
  abbreviations — write the Chinese equivalent.
* In `ar` every foreign proper name must be transliterated into Arabic script (`باريس`, `لندن`,
  `شكسبير`) — a single Latin letter in the file is a hard failure.
* In `ru`/`zh` write numbers as words (`первое сентября`, `神舟五号`), not digits, where it reads
  naturally; in `fr`/`es` century names are words too (`le dix-neuvième siècle`, `el siglo diecinueve`).
* The `theme` string must also be pure and written in the file's language.

## 5. Grammar of the question templates

**Russian** — `{v}` is inserted in the nominative case, so a template must not put `{v}` into an
oblique case. Put `{v}` where a nominative noun fits:

* good: `Кто написал «{v}»?`, `Кто автор картины «{v}»?`, `Какие из этих картин написал {v}?`,
  `Кто является автором полотна «{v}»?`
* bad: `Перу {v} принадлежит...`, `у {v}`, `к {v}`, `с {v}`, `произведения {v}` — these need
  genitive/dative/instrumental and will read as broken Russian.
* If you need a "belongs to" phrasing, use a construction that keeps the nominative:
  `{v} — автор какой картины?` / `Автором какой из этих песен является {v}?`

**English** — any natural phrasing; keep the placeholder as a noun (`Who painted “{v}”?`,
`Which of these films did {v} direct?`).

**Chinese** — any natural phrasing; the placeholder is a bare name/title, wrap it in 《》 for
works when appropriate (`《{v}》的作者是谁？`, `下列哪部作品是{v}创作的？`).

Use 4–6 distinct phrasings per template list so questions do not read identically.
Every question text in a file must be unique — that holds automatically as long as keys and
items are unique.

## 6. Checklist before you finish a file

1. `node tools/generate.mjs <lang>.<theme>` exits 0 and prints `100..150 questions`.
2. `node tools/validate.mjs <lang>.<theme>` prints `ALL CHECKS PASSED`.
3. Facts are canonical and each item is true for exactly one key.
4. Strings are script-pure; the `theme` name is in the file's language.
5. You touched only `tools/data/<lang>.<theme>.mjs` for the three languages of your theme.
