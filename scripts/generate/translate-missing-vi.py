#!/usr/bin/env python3 -u
"""
Fetch all vocabulary_senses with missing meaning_vi from Supabase,
translate to Vietnamese via Google Translate, and update in place.

Usage:
  python3 scripts/generate/translate-missing-vi.py
  python3 scripts/generate/translate-missing-vi.py --dry-run

Install: pip3 install deep-translator requests
"""

import json
import os
import sys
import time
import argparse
import requests
from deep_translator import GoogleTranslator

# ── Load credentials from .env.local ──────────────────────────────────────
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

# ── Config ────────────────────────────────────────────────────────────────
PAGE_SIZE        = 1000   # senses fetched per Supabase request
TRANSLATE_BATCH  = 50     # meanings per Google Translate call
TRANSLATE_DELAY  = 0.3    # seconds between translate calls
UPDATE_BATCH     = 50     # senses updated per PATCH batch
LOG_EVERY        = 500    # log progress every N senses

SEPARATOR = "\n||||\n"
translator = GoogleTranslator(source="en", target="vi")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

# ── Supabase helpers ───────────────────────────────────────────────────────

def fetch_missing_senses() -> list[dict]:
    """Fetch all senses where meaning_vi is null or empty, with meaning_en."""
    all_rows = []
    offset   = 0
    print("Fetching missing senses from Supabase...", flush=True)

    while True:
        params = {
            "select": "id,meaning_en",
            "or":     "(meaning_vi.is.null,meaning_vi.eq.)",
            "not.meaning_en": "is.null",
            "meaning_en": "neq.",
            "order":  "id.asc",
            "offset": str(offset),
            "limit":  str(PAGE_SIZE),
        }
        # Supabase REST API filter syntax
        url = f"{SUPABASE_URL}/rest/v1/vocabulary_senses"
        r = requests.get(url, headers={**HEADERS, "Range-Unit": "items",
                                        "Range": f"{offset}-{offset+PAGE_SIZE-1}"},
                         params={
                             "select": "id,meaning_en",
                             "order":  "id.asc",
                         },
                         timeout=30)

        # Filter in params separately to avoid conflicts
        r = requests.get(
            url,
            headers={**HEADERS},
            params={
                "select":     "id,meaning_en",
                "or":         "(meaning_vi.is.null,meaning_vi.eq.)",
                "meaning_en": "neq.",
                "order":      "id.asc",
                "offset":     str(offset),
                "limit":      str(PAGE_SIZE),
            },
            timeout=30,
        )
        r.raise_for_status()
        rows = r.json()
        if not rows:
            break
        all_rows.extend(rows)
        offset += PAGE_SIZE
        print(f"  Fetched {len(all_rows)} senses so far...", flush=True)
        if len(rows) < PAGE_SIZE:
            break

    print(f"Total missing senses to translate: {len(all_rows)}", flush=True)
    return all_rows


def update_senses_batch(updates: list[dict], dry_run: bool) -> int:
    """Update a batch of senses via individual PATCH calls (Supabase REST)."""
    errors = 0
    for item in updates:
        if dry_run:
            continue
        url = f"{SUPABASE_URL}/rest/v1/vocabulary_senses?id=eq.{item['id']}"
        payload = {
            "meaning_vi":        item["meaning_vi"],
            "meaning_vi_glosses": item["meaning_vi_glosses"],
            "meaning_vi_status": "machine",
            "meaning_vi_source": "ai",
        }
        r = requests.patch(url, headers=HEADERS, json=payload, timeout=15)
        if r.status_code not in (200, 204):
            print(f"  [error] id={item['id']}: {r.status_code} {r.text[:100]}")
            errors += 1
    return errors


# ── Translation helpers ───────────────────────────────────────────────────

def translate_batch(texts: list[str]) -> list[str]:
    if not texts:
        return []
    combined = SEPARATOR.join(texts)
    try:
        result = translator.translate(combined)
        parts  = result.split("||||")
        translated = [p.strip() for p in parts]
        if len(translated) == len(texts):
            return translated
        raise ValueError(f"count mismatch: {len(translated)} vs {len(texts)}")
    except Exception as e:
        print(f"  [warn] batch translate failed ({e}), falling back to individual")
        out = []
        for t in texts:
            try:
                out.append(translator.translate(t))
                time.sleep(0.1)
            except Exception:
                out.append(t)
        return out


def make_gloss(meaning_vi: str) -> list[dict]:
    if not meaning_vi:
        return []
    return [{"index": 1, "meaning": meaning_vi, "examples": []}]


def translate_rows(rows: list[dict]) -> list[dict]:
    """Translate meaning_en for each row, return list with meaning_vi added."""
    meanings_en = [r["meaning_en"] for r in rows]
    translated  = []

    for i in range(0, len(meanings_en), TRANSLATE_BATCH):
        chunk  = meanings_en[i:i + TRANSLATE_BATCH]
        result = translate_batch(chunk)
        translated.extend(result)
        if i + TRANSLATE_BATCH < len(meanings_en):
            time.sleep(TRANSLATE_DELAY)

    out = []
    for row, meaning_vi in zip(rows, translated):
        out.append({
            "id":                 row["id"],
            "meaning_vi":         meaning_vi,
            "meaning_vi_glosses": make_gloss(meaning_vi),
        })
    return out


# ── Main ──────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true",
                        help="Translate but don't write to DB")
    args = parser.parse_args()

    rows = fetch_missing_senses()
    total  = len(rows)
    done   = 0
    errors = 0

    print(f"\nTranslating {total} senses...")
    if args.dry_run:
        print("DRY RUN — no DB writes")
    print()

    for i in range(0, total, UPDATE_BATCH):
        chunk         = rows[i:i + UPDATE_BATCH]
        translated    = translate_rows(chunk)
        errors       += update_senses_batch(translated, args.dry_run)
        done         += len(chunk)

        if done % LOG_EVERY == 0 or done >= total:
            pct = done / total * 100
            print(f"  [{done}/{total}] {pct:.1f}% | errors: {errors}", flush=True)

    print()
    print("Done.")
    print(f"Senses translated: {done}")
    print(f"Errors: {errors}")


if __name__ == "__main__":
    main()
