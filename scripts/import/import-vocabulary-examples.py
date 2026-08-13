#!/usr/bin/env python3 -u
"""
Import vocabulary example sentences from the EDRDG examples corpus (free, open-source).

Source: http://ftp.edrdg.org/pub/Nihongo/examples.utf.gz
  ~250k Japanese-English sentence pairs, tagged with word forms and readings.

Pipeline:
  1. Download & cache examples.utf (~35 MB uncompressed)
  2. Parse A/B pairs → extract Japanese sentence, English translation, ruby data
  3. Load all vocabulary primary_words from Supabase into memory
  4. Match sentence word annotations → vocabulary entries
  5. Batch-translate English → Vietnamese via Google Translate (free)
  6. Insert into vocabulary_examples table

Usage:
  python3 scripts/import/import-vocabulary-examples.py
  python3 scripts/import/import-vocabulary-examples.py --limit 500
  python3 scripts/import/import-vocabulary-examples.py --dry-run

Install deps:
  pip3 install deep-translator requests
"""

import gzip
import re
import os
import sys
import time
import argparse
from collections import defaultdict

import requests
from deep_translator import GoogleTranslator

# ── Credentials ──────────────────────────────────────────────────────────────

def load_env(path=".env.local"):
    if not os.path.exists(path):
        return
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            os.environ.setdefault(key.strip(), val.strip())

load_env()

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

# ── Config ────────────────────────────────────────────────────────────────────

EXAMPLES_URL   = "http://ftp.edrdg.org/pub/Nihongo/examples.utf.gz"
EXAMPLES_CACHE = "data/external/examples.utf"

MAX_PER_VOCAB   = 10    # max examples stored per vocabulary entry
TRANSLATE_BATCH = 50    # sentences per Google Translate call
TRANSLATE_DELAY = 0.3   # seconds between translate calls
INSERT_BATCH    = 200   # rows per Supabase insert call
LOG_EVERY       = 50    # log translate progress every N batches
SEPARATOR       = "\n||||\n"

translator = GoogleTranslator(source="en", target="vi")

# ── Download ──────────────────────────────────────────────────────────────────

def download_examples():
    os.makedirs("data/external", exist_ok=True)
    if os.path.exists(EXAMPLES_CACHE):
        size_mb = os.path.getsize(EXAMPLES_CACHE) / 1_048_576
        print(f"Using cached {EXAMPLES_CACHE} ({size_mb:.1f} MB)", flush=True)
        return

    gz_path = EXAMPLES_CACHE + ".gz"
    print(f"Downloading {EXAMPLES_URL} ...", flush=True)
    ret = os.system(f'curl -L --retry 3 --retry-delay 2 -o "{gz_path}" "{EXAMPLES_URL}"')
    if ret != 0:
        raise RuntimeError(f"curl download failed (exit {ret})")

    print("Decompressing ...", flush=True)
    with gzip.open(gz_path, "rb") as f_in, open(EXAMPLES_CACHE, "wb") as f_out:
        f_out.write(f_in.read())
    os.remove(gz_path)
    size_mb = os.path.getsize(EXAMPLES_CACHE) / 1_048_576
    print(f"Saved {EXAMPLES_CACHE} ({size_mb:.1f} MB)", flush=True)

# ── Parser ────────────────────────────────────────────────────────────────────
#
# Actual file format (A line then B line):
#   A: 彼は忙しい。\tHe is busy.#ID=12345
#   B: 彼(かれ)[01] は 忙しい(いそがしい) ...
#
# A line: Japanese sentence TAB English translation #ID=...
# B line: word annotations — base(reading)[sense]{surface} ...

# word with reading (and optional sense / surface)
_WORD_READING = re.compile(r'(\S+?)\(([^)#]+)\)(?:\[\d+\])?(?:\{[^}]+\})?')
# any word token (no reading) — to get base forms for matching
_WORD_BASE    = re.compile(r'([^\s(){}[\]#]+)(?:\[[^\]]+\])?(?:\{[^}]+\})?')
_HAS_KANJI    = re.compile(r'[一-龯㐀-䶿]')

def parse_examples_file():
    """
    Returns list of (japanese, english, ruby_list, word_set).

    ruby_list: [{base, reading}] — only for kanji words whose base form
               appears verbatim in the Japanese sentence.
    word_set:  set of base forms from annotations (for vocabulary matching).
    """
    results = []

    with open(EXAMPLES_CACHE, encoding="utf-8") as f:
        lines = f.readlines()

    i = 0
    while i < len(lines) - 1:
        la = lines[i].rstrip()
        lb = lines[i + 1].rstrip()
        i += 2

        if not la.startswith("A: ") or not lb.startswith("B: "):
            continue

        # ── A line: Japanese TAB English#ID=... ──────────────────────────────
        a_body = la[3:]
        if "\t" not in a_body:
            continue
        japanese, rest = a_body.split("\t", 1)
        # Strip #ID=... from English
        english = rest.split("#ID=")[0].strip()
        japanese = japanese.strip()

        if not japanese or not english:
            continue

        # ── B line: annotations ───────────────────────────────────────────────
        b_body = lb[3:]

        ruby  = []
        seen  = set()
        words = set()

        # Extract words with reading → ruby candidates
        for m in _WORD_READING.finditer(b_body):
            base, reading = m.group(1), m.group(2)
            # Clean up base form (remove trailing punctuation)
            base = base.strip("～〜")
            if not base:
                continue
            words.add(base)
            # Add ruby only for kanji words that appear verbatim in sentence
            if _HAS_KANJI.search(base) and base in japanese and base not in seen:
                ruby.append({"base": base, "reading": reading})
                seen.add(base)

        # Also collect base words without reading for vocabulary matching
        for m in _WORD_BASE.finditer(b_body):
            token = m.group(1).strip("～〜(){}[]")
            if token and not token.startswith("#"):
                words.add(token)

        if words:
            ruby.sort(key=lambda r: japanese.index(r["base"]) if r["base"] in japanese else 9999)
            results.append((japanese, english, ruby, words))

    return results

# ── Supabase helpers ──────────────────────────────────────────────────────────

def fetch_vocabulary_words():
    """Return {primary_word: [vocab_id, ...]} for all vocabulary entries."""
    print("Fetching vocabulary from Supabase ...", flush=True)
    vocab_index = defaultdict(list)
    offset, page = 0, 1000

    while True:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/vocabularies",
            headers=HEADERS,
            params={"select": "id,primary_word", "order": "id.asc",
                    "offset": str(offset), "limit": str(page)},
            timeout=30,
        )
        r.raise_for_status()
        rows = r.json()
        for row in rows:
            if row.get("primary_word"):
                vocab_index[row["primary_word"]].append(row["id"])
        offset += page
        if len(rows) < page:
            break
        if offset % 10000 == 0:
            print(f"  {offset} entries loaded ...", flush=True)

    print(f"Loaded {len(vocab_index)} unique vocabulary words", flush=True)
    return vocab_index

def fetch_existing_vocab_ids():
    """Return set of vocabulary_ids that already have at least one example."""
    done = set()
    offset, page = 0, 5000
    while True:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/vocabulary_examples",
            headers=HEADERS,
            params={"select": "vocabulary_id", "order": "vocabulary_id.asc",
                    "offset": str(offset), "limit": str(page)},
            timeout=30,
        )
        r.raise_for_status()
        rows = r.json()
        for row in rows:
            done.add(row["vocabulary_id"])
        offset += page
        if len(rows) < page:
            break
    return done

def insert_batch(rows, dry_run):
    if dry_run or not rows:
        return len(rows)
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/vocabulary_examples",
        headers=HEADERS,
        json=rows,
        timeout=30,
    )
    if r.status_code not in (200, 201):
        print(f"\n  [error] insert {r.status_code}: {r.text[:200]}", flush=True)
        return 0
    return len(rows)

# ── Translation ───────────────────────────────────────────────────────────────

def translate_texts(texts):
    if not texts:
        return []
    combined = SEPARATOR.join(texts)
    try:
        result = translator.translate(combined)
        parts = result.split("||||")
        translated = [p.strip() for p in parts]
        if len(translated) == len(texts):
            return translated
        raise ValueError(f"count mismatch {len(translated)} vs {len(texts)}")
    except Exception as e:
        print(f"\n  [warn] batch failed ({e}), falling back", flush=True)
        out = []
        for t in texts:
            try:
                out.append(translator.translate(t))
            except Exception:
                out.append(t)
            time.sleep(0.1)
        return out

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=None,
                        help="Max number of vocabulary entries to process")
    parser.add_argument("--dry-run", action="store_true",
                        help="Translate but do not write to DB")
    args = parser.parse_args()

    # 1. Ensure examples file is available
    download_examples()

    # 2. Parse all pairs
    print("\nParsing examples.utf ...", flush=True)
    pairs = parse_examples_file()
    print(f"Parsed {len(pairs):,} sentence pairs", flush=True)

    # 3. Load vocabulary
    vocab_index = fetch_vocabulary_words()

    # 4. Load existing examples to skip duplicates
    print("Checking existing vocabulary examples ...", flush=True)
    existing_ids = fetch_existing_vocab_ids()
    print(f"Already have examples for {len(existing_ids):,} vocabulary entries", flush=True)

    # 5. Match sentences → vocabulary entries
    print("\nMatching sentences to vocabulary ...", flush=True)
    examples_by_vocab: dict[int, list[tuple]] = defaultdict(list)

    for japanese, english, ruby, words in pairs:
        for word in words:
            for vocab_id in vocab_index.get(word, []):
                if vocab_id in existing_ids:
                    continue
                if len(examples_by_vocab[vocab_id]) < MAX_PER_VOCAB:
                    examples_by_vocab[vocab_id].append((japanese, english, ruby))

    vocab_ids = sorted(examples_by_vocab.keys())
    if args.limit:
        vocab_ids = vocab_ids[:args.limit]

    total_entries = sum(len(examples_by_vocab[v]) for v in vocab_ids)
    print(f"Matched {len(vocab_ids):,} vocabulary entries → {total_entries:,} examples", flush=True)

    if not vocab_ids:
        print("Nothing to insert.", flush=True)
        return

    # 6. Flatten → translate → insert
    print(f"\nTranslating {total_entries:,} sentences ...", flush=True)
    if args.dry_run:
        print("DRY RUN — no DB writes", flush=True)

    # Flatten all entries
    flat: list[dict] = []
    for vocab_id in vocab_ids:
        for order, (japanese, english, ruby) in enumerate(examples_by_vocab[vocab_id], 1):
            flat.append({
                "vocabulary_id": vocab_id,
                "sense_index": None,
                "japanese": japanese,
                "_english": english,   # temp field, removed before insert
                "translation_vi": "",
                "example_order": order,
                "ruby": ruby,
            })

    # Translate in batches
    english_texts = [r["_english"] for r in flat]
    translated_vi = []
    batch_count = 0

    for i in range(0, len(english_texts), TRANSLATE_BATCH):
        chunk = english_texts[i:i + TRANSLATE_BATCH]
        vi    = translate_texts(chunk)
        translated_vi.extend(vi)
        batch_count += 1
        if batch_count % LOG_EVERY == 0 or i + TRANSLATE_BATCH >= len(english_texts):
            done = min(i + TRANSLATE_BATCH, len(english_texts))
            pct  = done / len(english_texts) * 100
            print(f"  [{done}/{len(english_texts)}] {pct:.0f}%", flush=True)
        if i + TRANSLATE_BATCH < len(english_texts):
            time.sleep(TRANSLATE_DELAY)

    # Fill translated_vi and remove temp field
    insert_rows = []
    for row, vi in zip(flat, translated_vi):
        row["translation_vi"] = vi or row["_english"]
        del row["_english"]
        insert_rows.append(row)

    # Insert in batches
    print(f"\nInserting {len(insert_rows):,} rows ...", flush=True)
    total_inserted = 0
    errors = 0

    for i in range(0, len(insert_rows), INSERT_BATCH):
        chunk = insert_rows[i:i + INSERT_BATCH]
        try:
            n = insert_batch(chunk, args.dry_run)
            total_inserted += n
        except Exception as e:
            errors += 1
            print(f"\n  [error] batch at {i}: {e}", flush=True)
        if (i // INSERT_BATCH + 1) % 10 == 0 or i + INSERT_BATCH >= len(insert_rows):
            done = min(i + INSERT_BATCH, len(insert_rows))
            print(f"  Inserted {done}/{len(insert_rows)}", flush=True)

    print(f"\nDone.")
    print(f"  Vocabulary entries: {len(vocab_ids):,}")
    print(f"  Examples inserted:  {total_inserted:,}")
    print(f"  Errors:             {errors}")


if __name__ == "__main__":
    main()
