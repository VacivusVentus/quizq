"""Independent re-validation of the quiz database (separate implementation from tools/validate.mjs).

    python tools/validate_independent.py                  # every data/<lang>/<theme>.json
    python tools/validate_independent.py ru en            # only these languages
    python tools/validate_independent.py ru.painters      # a single theme file
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
LANGS = ["ru", "en", "zh", "fr", "es", "ar"]
SLUG = re.compile(r"^[a-z0-9_]+$")

LATIN = re.compile(r"[A-Za-z]")
CYRILLIC = re.compile(r"[\u0400-\u04FF]")
CJK = re.compile(r"[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]")
ARABIC = re.compile(r"[\u0600-\u06FF\u0750-\u077F]")


def script_problems(lang, value):
    latin, cyr, cjk, ara = LATIN.search(value), CYRILLIC.search(value), CJK.search(value), ARABIC.search(value)
    if lang == "ru":
        bad = latin or cjk or ara or not cyr
    elif lang in ("en", "fr", "es"):
        bad = cyr or cjk or ara or not latin
    elif lang == "zh":
        bad = latin or cyr or ara or not cjk
    else:  # ar
        bad = latin or cyr or cjk or not ara
    if not bad:
        return []
    found = [n for n, rx in (("latin", LATIN), ("cyrillic", CYRILLIC), ("cjk", CJK), ("arabic", ARABIC)) if rx.search(value)]
    return [f"expected script for '{lang}', found: {found or 'none'}"]


def check(lang, theme, path):
    errors = []
    if not path.exists():
        return [f"missing {path}"], ""

    raw = path.read_text(encoding="utf-8")
    try:
        doc = json.loads(raw)
    except Exception as exc:  # noqa: BLE001
        return [f"invalid JSON: {exc}"], ""

    if not isinstance(doc, dict):
        return ["root is not an object"], ""
    theme_name = doc.get("theme")
    if not isinstance(theme_name, str) or not theme_name.strip():
        errors.append("theme missing/empty")
    else:
        errors += [f"theme: {p}" for p in script_problems(lang, theme_name)]

    questions = doc.get("questions")
    if not isinstance(questions, list):
        return errors + ["questions missing or not a list"], ""

    if not 100 <= len(questions) <= 150:
        errors.append(f"count {len(questions)} outside 100..150")

    seen_texts = {}
    answer_count = {}
    option_count = {}
    answered_total = 0

    for i, q in enumerate(questions):
        if not isinstance(q, dict):
            errors.append(f"q[{i}] not an object")
            continue
        missing = {"text", "options", "answer"} - set(q)
        if missing:
            errors.append(f"q[{i}] missing fields {sorted(missing)}")
            continue
        text, options, answer = q["text"], q["options"], q["answer"]

        if not isinstance(text, str) or not text.strip():
            errors.append(f"q[{i}] bad text")
            continue
        if text in seen_texts:
            errors.append(f"q[{i}] duplicate text (first at q[{seen_texts[text]}])")
        else:
            seen_texts[text] = i
        errors += [f"q[{i}].text: {p}" for p in script_problems(lang, text)]

        if not isinstance(options, list):
            errors.append(f"q[{i}] options not a list")
            continue
        if not 4 <= len(options) <= 6:
            errors.append(f"q[{i}] has {len(options)} options (need 4..6)")
        if len(set(options)) != len(options):
            errors.append(f"q[{i}] duplicate options")
        for j, opt in enumerate(options):
            if not isinstance(opt, str) or not opt.strip():
                errors.append(f"q[{i}].options[{j}] bad string")
                continue
            errors += [f"q[{i}].options[{j}]: {p}" for p in script_problems(lang, opt)]
            option_count[opt] = option_count.get(opt, 0) + 1

        if not isinstance(answer, list) or len(answer) == 0:
            errors.append(f"q[{i}] answer must be a non-empty list")
            continue
        if len(set(answer)) != len(answer):
            errors.append(f"q[{i}] duplicate answers")
        answered_total += len(answer)
        for j, ans in enumerate(answer):
            if not isinstance(ans, str) or not ans.strip():
                errors.append(f"q[{i}].answer[{j}] bad string")
                continue
            errors += [f"q[{i}].answer[{j}]: {p}" for p in script_problems(lang, ans)]
            answer_count[ans] = answer_count.get(ans, 0) + 1
            if ans in options:
                errors.append(f"q[{i}] '{ans}' is both answer and option")

        union = list(options) + list(answer)
        if len(set(union)) != len(union):
            errors.append(f"q[{i}] union of options+answer has duplicates")

    values = set(answer_count) | set(option_count)
    both = {v for v in values if v in answer_count and v in option_count}
    ratio = len(both) / len(values) if values else 0.0
    if len(both) < 8 or ratio < 0.4:
        errors.append(f"weak crossing: {len(both)}/{len(values)} values used both ways")

    multi = sum(1 for q in questions if isinstance(q.get("answer"), list) and len(q["answer"]) > 1)
    summary = (
        f"Q={len(questions)} values={len(values)} both-ways={len(both)} "
        f"({ratio * 100:.1f}%) answers={answered_total} multi-answer={multi}"
    )
    return errors, summary


def collect(args):
    files = []
    for lang in LANGS:
        d = DATA_DIR / lang
        if not d.is_dir():
            continue
        for f in sorted(d.glob("*.json")):
            files.append((lang, f.stem, f))
    if not args:
        return files
    picked = []
    for arg in args:
        if arg in LANGS:
            picked += [t for t in files if t[0] == arg]
        else:
            lang, _, theme = arg.partition(".")
            hit = [t for t in files if t[0] == lang and t[1] == theme]
            if not hit:
                raise SystemExit(f"no data file for '{arg}'")
            picked += hit
    return picked


status = 0
targets = collect(sys.argv[1:])
if not targets:
    print("NOTE: no data files found")
for lang, theme, path in targets:
    if not SLUG.match(theme):
        status = 1
        print(f"FAIL {lang}/{theme} — illegal file name (must be a latin slug)")
        continue
    errs, summary = check(lang, theme, path)
    if errs:
        status = 1
        print(f"FAIL {lang}/{theme} — {len(errs)} problem(s)")
        for e in errs[:25]:
            print(f"   - {e}")
        if len(errs) > 25:
            print(f"   ... and {len(errs) - 25} more")
    else:
        print(f"PASS {lang}/{theme:<16} {summary}")

print(f"{len(targets)} file(s) checked")
print("INDEPENDENT CHECKS PASSED" if status == 0 else "INDEPENDENT CHECKS FAILED")
sys.exit(status)
