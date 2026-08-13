#!/usr/bin/env python3 -u
"""
Fetch all vocabulary_collocations with missing meaning_vi from Supabase,
translate to Vietnamese via Google Translate (free, deep-translator), and update in place.

Usage:
  python3 scripts/generate/translate-collocation-vi.py
  python3 scripts/generate/translate-collocation-vi.py --dry-run
  python3 scripts/generate/translate-collocation-vi.py --limit 500

Install: pip3 install deep-translator requests
"""

import os
import sys
import time
import argparse
import requests
from deep_translator import GoogleTranslator


def load_env(path: str = ".env.local") -> None:
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

PAGE_SIZE       = 1000
TRANSLATE_BATCH = 50
TRANSLATE_DELAY = 0.3
UPDATE_BATCH    = 50
LOG_EVERY       = 500

SEPARATOR = "\n||||\n"
translator = GoogleTranslator(source="en", target="vi")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}


def fetch_pending(limit: int = 0) -> list[dict]:
    all_rows: list[dict] = []
    offset = 0
    print(f"Fetching collocations with missing meaning_vi...", flush=True)

    while True:
        page_limit = PAGE_SIZE
        if limit > 0:
            remaining = limit - len(all_rows)
            if remaining <= 0:
                break
            page_limit = min(PAGE_SIZE, remaining)

        url = f"{SUPABASE_URL}/rest/v1/vocabulary_collocations"
        r = requests.get(
            url,
            headers=HEADERS,
            params={
                "select":     "id,expression_jp,meaning_en",
                "meaning_vi": "is.null",
                "meaning_en": "not.is.null",
                "order":      "id.asc",
                "offset":     str(offset),
                "limit":      str(page_limit),
            },
            timeout=30,
        )
        r.raise_for_status()
        rows = r.json()
        if not rows:
            break

        all_rows.extend(rows)
        offset += PAGE_SIZE
        print(f"  Fetched {len(all_rows)}...", flush=True)

        if len(rows) < page_limit:
            break

    print(f"Total pending: {len(all_rows)}", flush=True)
    return all_rows


def translate_batch(texts: list[str]) -> list[str]:
    if not texts:
        return []
    combined = SEPARATOR.join(texts)
    try:
        result = translator.translate(combined)
        parts = result.split("||||")
        translated = [p.strip() for p in parts]
        if len(translated) == len(texts):
            return translated
        raise ValueError(f"count mismatch: {len(translated)} vs {len(texts)}")
    except Exception as e:
        print(f"  [warn] batch failed ({e}), falling back to individual", flush=True)
        out = []
        for t in texts:
            try:
                out.append(translator.translate(t))
                time.sleep(0.1)
            except Exception:
                out.append(t)
        return out


def translate_rows(rows: list[dict]) -> list[dict]:
    meanings_en = [r["meaning_en"] for r in rows]
    translated: list[str] = []

    for i in range(0, len(meanings_en), TRANSLATE_BATCH):
        chunk = meanings_en[i:i + TRANSLATE_BATCH]
        result = translate_batch(chunk)
        translated.extend(result)
        if i + TRANSLATE_BATCH < len(meanings_en):
            time.sleep(TRANSLATE_DELAY)

    out = []
    for row, meaning_vi in zip(rows, translated):
        out.append({
            "id": row["id"],
            "expression_jp": row["expression_jp"],
            "meaning_vi": meaning_vi,
        })
    return out


def update_batch(updates: list[dict], dry_run: bool) -> int:
    errors = 0
    for item in updates:
        if dry_run:
            print(f"  [dry] {item['expression_jp']} → {item['meaning_vi']}")
            continue
        url = f"{SUPABASE_URL}/rest/v1/vocabulary_collocations?id=eq.{item['id']}"
        r = requests.patch(
            url,
            headers=HEADERS,
            json={"meaning_vi": item["meaning_vi"]},
            timeout=15,
        )
        if r.status_code not in (200, 204):
            print(f"  [error] id={item['id']}: {r.status_code} {r.text[:100]}")
            errors += 1
    return errors


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Translate but don't write to DB")
    parser.add_argument("--limit", type=int, default=0, help="Max rows to process (0 = all)")
    args = parser.parse_args()

    rows = fetch_pending(limit=args.limit)
    total = len(rows)
    if total == 0:
        print("No pending collocations.")
        return

    done = 0
    errors = 0

    print(f"\nTranslating {total} collocations...", flush=True)
    if args.dry_run:
        print("DRY RUN — no DB writes")
    print()

    for i in range(0, total, UPDATE_BATCH):
        chunk = rows[i:i + UPDATE_BATCH]
        translated = translate_rows(chunk)
        errors += update_batch(translated, args.dry_run)
        done += len(chunk)

        if done % LOG_EVERY == 0 or done >= total:
            pct = done / total * 100
            print(f"  [{done}/{total}] {pct:.1f}% | errors: {errors}", flush=True)

    print()
    print("Done.")
    print(f"Translated: {done}")
    print(f"Errors: {errors}")


if __name__ == "__main__":
    main()
