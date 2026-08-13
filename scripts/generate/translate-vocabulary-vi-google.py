#!/usr/bin/env python3
"""
Translate vocabulary meanings using Google Translate (free, via deep-translator).
Processes entry-batch files and writes to translated/ folder.

Usage:
  python3 scripts/generate/translate-vocabulary-vi-google.py [start] [end]
  python3 scripts/generate/translate-vocabulary-vi-google.py         # all
  python3 scripts/generate/translate-vocabulary-vi-google.py 136 500 # batches 136-500

Install: pip3 install deep-translator
"""

import json
import os
import sys
import glob
import time
import re
from deep_translator import GoogleTranslator

ENTRY_DIR  = "data/vocabulary-vi/entry-batches"
OUTPUT_DIR = "data/vocabulary-vi/translated"
SEPARATOR  = "\n||||\n"   # unique separator for batch translation
BATCH_SIZE = 50           # meanings per Google Translate call
DELAY      = 0.3          # seconds between calls

translator = GoogleTranslator(source="en", target="vi")


def batch_number_to_filename(n: int) -> str:
    digits = len(str(n))
    pad = 4 + digits
    return f"batch-{str(n).zfill(pad)}.json"


def translate_batch(texts: list[str]) -> list[str]:
    """Translate a list of English texts to Vietnamese in one call."""
    if not texts:
        return []
    combined = SEPARATOR.join(texts)
    try:
        result = translator.translate(combined)
        parts = result.split("||||")
        # align counts
        translated = [p.strip() for p in parts]
        if len(translated) == len(texts):
            return translated
        # misaligned: translate individually as fallback
        raise ValueError(f"count mismatch: {len(translated)} vs {len(texts)}")
    except Exception as e:
        print(f"  [warn] batch translate failed ({e}), falling back to individual")
        results = []
        for t in texts:
            try:
                results.append(translator.translate(t))
                time.sleep(0.1)
            except Exception:
                results.append(t)  # keep English on error
        return results


def make_keywords(meaning_vi: str) -> list[str]:
    parts = [p.strip() for p in meaning_vi.split(";")]
    seen = set()
    kw = []
    for p in parts:
        if p and p not in seen:
            seen.add(p)
            kw.append(p)
    return kw[:4]


def make_gloss(meaning_vi: str) -> list[dict]:
    if not meaning_vi:
        return []
    return [{"index": 1, "meaning": meaning_vi, "examples": []}]


def translate_entries(entries: list[dict]) -> list[dict]:
    """Translate all senses in a list of vocabulary entries."""
    # Collect all meanings
    all_meanings: list[str] = []
    index_map: list[tuple[int, int]] = []  # (entry_idx, sense_idx)

    for ei, entry in enumerate(entries):
        for si, sense in enumerate(entry.get("senses", [])):
            m = (sense.get("meaning_en", "") or "").strip()
            if m:
                all_meanings.append(m)
                index_map.append((ei, si))

    # Translate in batches
    translated_all: list[str] = []
    for i in range(0, len(all_meanings), BATCH_SIZE):
        chunk = all_meanings[i:i + BATCH_SIZE]
        result = translate_batch(chunk)
        translated_all.extend(result)
        if i + BATCH_SIZE < len(all_meanings):
            time.sleep(DELAY)

    # Build output
    # Initialize translated senses structure
    sense_translations: dict[tuple[int, int], str] = {}
    for idx, (ei, si) in enumerate(index_map):
        if idx < len(translated_all):
            sense_translations[(ei, si)] = translated_all[idx]

    output = []
    for ei, entry in enumerate(entries):
        senses_out = []
        for si, sense in enumerate(entry.get("senses", [])):
            meaning_vi = sense_translations.get((ei, si), "")
            if not meaning_vi:
                meaning_vi = sense.get("meaning_en", "") or ""
                confidence = "low"
            else:
                # Check if translation actually changed
                meaning_en = (sense.get("meaning_en", "") or "").lower()
                if meaning_vi.lower().strip() == meaning_en.strip():
                    confidence = "low"
                else:
                    confidence = "high"

            senses_out.append({
                "sense_id": sense["sense_id"],
                "meaning_vi": meaning_vi,
                "confidence": confidence,
                "search_keywords": make_keywords(meaning_vi),
                "meaning_vi_glosses": make_gloss(meaning_vi),
            })

        output.append({
            "vocabulary_id": entry["vocabulary_id"],
            "word": entry.get("word", ""),
            "kana": entry.get("kana", ""),
            "senses": senses_out,
        })

    return output


def get_done_batch_nums() -> set[int]:
    """Return set of batch numbers that are already high-quality (confidence > low)."""
    # For now, just return empty set to re-translate everything
    # (we want to upgrade from dictionary-based low-confidence to Google Translate)
    return set()


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    all_batch_files = sorted(glob.glob(os.path.join(ENTRY_DIR, "entry-batch-*.json")))
    total = len(all_batch_files)

    if len(sys.argv) >= 3:
        start = int(sys.argv[1])
        end = int(sys.argv[2])
    elif len(sys.argv) == 2:
        start = int(sys.argv[1])
        end = total
    else:
        start = 1
        end = total

    print(f"Translating entry-batches {start}–{end} of {total}")
    print(f"Batch size: {BATCH_SIZE} meanings per Google Translate call")
    print(f"Delay: {DELAY}s between calls")
    print()

    processed = 0
    total_senses = 0
    errors = 0

    for batch_num in range(start, end + 1):
        fname = f"entry-batch-{str(batch_num).zfill(5)}.json"
        fpath = os.path.join(ENTRY_DIR, fname)

        if not os.path.exists(fpath):
            continue

        try:
            with open(fpath) as fp:
                entries = json.load(fp)

            translated = translate_entries(entries)

            out_fname = batch_number_to_filename(batch_num)
            out_path = os.path.join(OUTPUT_DIR, out_fname)
            with open(out_path, "w", encoding="utf-8") as fp:
                json.dump(translated, fp, ensure_ascii=False, indent=2)

            senses_in_batch = sum(len(e.get("senses", [])) for e in entries)
            total_senses += senses_in_batch
            processed += 1

            if processed % 50 == 0:
                print(f"  [{processed}] batch-{batch_num} done | total senses: {total_senses}")

        except Exception as e:
            errors += 1
            print(f"  [error] batch-{batch_num}: {e}")
            time.sleep(1)

    print(f"\nDone.")
    print(f"Batches processed: {processed}")
    print(f"Total senses: {total_senses}")
    print(f"Errors: {errors}")


if __name__ == "__main__":
    main()
