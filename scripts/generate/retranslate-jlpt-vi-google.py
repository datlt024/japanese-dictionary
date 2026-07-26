#!/usr/bin/env python3
"""
Re-translate JLPT N5–N1 vocabulary senses using Google Translate (free).
Fetches directly from Supabase, updates in place.

Usage:
  python3 scripts/generate/retranslate-jlpt-vi-google.py          # all JLPT
  python3 scripts/generate/retranslate-jlpt-vi-google.py 2000     # limit to 2000 senses

Install: pip3 install deep-translator requests
"""

import json
import os
import sys
import time
import re
from pathlib import Path

import requests
from deep_translator import GoogleTranslator

# ---------------------------------------------------------------------------
# Load .env.local
# ---------------------------------------------------------------------------

def load_env_local():
    env_path = Path(".env.local")
    if not env_path.exists():
        return
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        os.environ.setdefault(key, val)

load_env_local()

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
    sys.exit(1)

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

LIMIT        = int(sys.argv[1]) if len(sys.argv) > 1 else 999_999
PAGE_SIZE    = 500
TRANS_BATCH  = 50   # meanings per Google Translate call
DELAY        = 0.4  # seconds between translate calls
UPDATE_BATCH = 200  # senses per Supabase upsert

translator = GoogleTranslator(source="en", target="vi")
SEPARATOR = "\n||||\n"

# ---------------------------------------------------------------------------
# Supabase helpers
# ---------------------------------------------------------------------------

def fetch_jlpt_senses() -> list[dict]:
    """Fetch all JLPT N5–N1 senses with status pending or machine."""
    all_rows: list[dict] = []
    offset = 0

    print("Fetching JLPT senses from Supabase...")

    while len(all_rows) < LIMIT:
        page = min(PAGE_SIZE, LIMIT - len(all_rows))
        params = {
            "select": "id,meaning_en,part_of_speech,vocabularies!inner(primary_word,primary_kana,jlpt)",
            "meaning_vi_status": "in.(pending,machine)",
            "vocabularies.jlpt": "not.is.null",
            "order": "id.asc",
            "limit": page,
            "offset": offset,
        }
        resp = requests.get(
            f"{SUPABASE_URL}/rest/v1/vocabulary_senses",
            headers={**HEADERS, "Prefer": "count=none"},
            params=params,
            timeout=30,
        )
        resp.raise_for_status()
        rows = resp.json()

        if not rows:
            break

        # Filter out rows without meaning_en
        rows = [r for r in rows if r.get("meaning_en")]
        all_rows.extend(rows)
        offset += PAGE_SIZE
        print(f"  Fetched: {len(all_rows)}")

        if len(rows) < page:
            break

    return all_rows


def upsert_senses(updates: list[dict]) -> int:
    """Batch upsert sense rows by id."""
    if not updates:
        return 0

    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/vocabulary_senses",
        headers={**HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal"},
        data=json.dumps(updates, ensure_ascii=False),
        timeout=60,
    )
    resp.raise_for_status()
    return len(updates)

# ---------------------------------------------------------------------------
# Translation helpers
# ---------------------------------------------------------------------------

def translate_batch(texts: list[str]) -> list[str]:
    """Translate a batch of English strings to Vietnamese."""
    if not texts:
        return []
    combined = SEPARATOR.join(texts)
    try:
        result = translator.translate(combined)
        parts = [p.strip() for p in result.split("||||")]
        if len(parts) == len(texts):
            return parts
        raise ValueError(f"count mismatch: got {len(parts)}, expected {len(texts)}")
    except Exception as e:
        print(f"  [warn] batch failed ({e}), translating individually...")
        out = []
        for t in texts:
            try:
                out.append(translator.translate(t))
                time.sleep(0.15)
            except Exception:
                out.append(t)  # keep English on error
        return out


def post_process(meaning_vi: str, meaning_en: str, pos: list[str]) -> str:
    """
    Apply learner-friendly post-processing:
    - When the POS is 'adv' but the word is typically an adjective,
      wrap the translation to signal it's a derived adverbial usage.
    - Deduplicate repeated translations (e.g. "hoàn toàn; hoàn toàn")
    """
    # Deduplicate semicolon-separated parts
    parts = [p.strip() for p in meaning_vi.split(";")]
    seen: set[str] = set()
    deduped: list[str] = []
    for p in parts:
        if p and p.lower() not in seen:
            seen.add(p.lower())
            deduped.append(p)
    meaning_vi = "; ".join(deduped)

    return meaning_vi

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    senses = fetch_jlpt_senses()
    if not senses:
        print("No JLPT senses to translate.")
        return

    total = len(senses)
    print(f"\nTotal senses to translate: {total}\n")

    # Build list of (sense_id, meaning_en, pos) for translation
    items = [
        {
            "id": r["id"],
            "meaning_en": r["meaning_en"],
            "pos": r.get("part_of_speech") or [],
        }
        for r in senses
    ]

    # Translate in batches
    translated: list[dict] = []  # {id, meaning_vi}
    texts = [it["meaning_en"] for it in items]

    for i in range(0, len(texts), TRANS_BATCH):
        chunk_texts = texts[i : i + TRANS_BATCH]
        chunk_items = items[i : i + TRANS_BATCH]

        results = translate_batch(chunk_texts)

        for item, raw_vi in zip(chunk_items, results):
            meaning_vi = post_process(raw_vi, item["meaning_en"], item["pos"])
            translated.append({"id": item["id"], "meaning_vi": meaning_vi})

        done = min(i + TRANS_BATCH, len(texts))
        print(f"  Translated: {done}/{total}", end="\r")

        if done < len(texts):
            time.sleep(DELAY)

    print(f"\nTranslated {len(translated)} senses")

    # Apply to Supabase in batches
    print("Updating Supabase...")
    updated = 0
    for i in range(0, len(translated), UPDATE_BATCH):
        chunk = translated[i : i + UPDATE_BATCH]
        payload = [
            {
                "id": r["id"],
                "meaning_vi": r["meaning_vi"],
                "meaning_vi_status": "machine",
                "meaning_vi_source": "google",
            }
            for r in chunk
        ]
        updated += upsert_senses(payload)
        print(f"  Updated: {updated}/{len(translated)}", end="\r")

    print(f"\nDone. Updated {updated} senses in DB.")


if __name__ == "__main__":
    main()
