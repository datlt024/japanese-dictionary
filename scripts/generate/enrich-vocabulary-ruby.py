#!/usr/bin/env python3 -u
"""
Enrich ruby (furigana) for all vocabulary_examples using pykakasi.
The import script only annotates a few words; this fills in all kanji.

Usage:
  python3 scripts/generate/enrich-vocabulary-ruby.py
  python3 scripts/generate/enrich-vocabulary-ruby.py --dry-run
  python3 scripts/generate/enrich-vocabulary-ruby.py --offset 5000

Install: pip3 install pykakasi requests
"""

import re
import os
import sys
import json
import time
import argparse
import requests
import pykakasi

# ── Env ──────────────────────────────────────────────────────────────────────

def load_env(path=".env.local"):
    if not os.path.exists(path):
        return
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip())

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

PAGE_SIZE    = 2000
UPDATE_BATCH = 100
LOG_EVERY    = 4000

_HAS_KANJI = re.compile(r"[一-龯㐀-䶿]")
_IS_KANA   = re.compile(r"[ぁ-んァ-ン]")

kks = pykakasi.kakasi()

# ── Ruby generation ───────────────────────────────────────────────────────────

def extract_ruby_token(orig: str, hira: str):
    """
    Given a pykakasi token, return {base, reading} if orig contains kanji.
    Strips trailing kana suffix shared between orig and hira so that
    e.g. "励ん"/"はげん" → {base:"励", reading:"はげ"}
    and  "彼は"/"かれは" → {base:"彼", reading:"かれ"}
    """
    if not _HAS_KANJI.search(orig):
        return None

    # Find trailing kana chars in orig
    i = len(orig) - 1
    while i >= 0 and _IS_KANA.match(orig[i]):
        i -= 1

    kanji_part  = orig[:i + 1]
    kana_suffix = orig[i + 1:]

    if not kanji_part:
        return None

    if kana_suffix and hira.endswith(kana_suffix):
        reading = hira[: -len(kana_suffix)]
    else:
        reading = hira

    if not reading:
        return None

    return {"base": kanji_part, "reading": reading}


def generate_ruby(sentence: str) -> list[dict]:
    """Return list of {base, reading} for all kanji tokens in sentence."""
    ruby = []
    seen = set()

    for token in kks.convert(sentence):
        orig = token["orig"]
        hira = token["hira"]

        item = extract_ruby_token(orig, hira)
        if item and item["base"] not in seen and item["base"] in sentence:
            ruby.append(item)
            seen.add(item["base"])

    return ruby

# ── Supabase helpers ──────────────────────────────────────────────────────────

def _request_with_retry(method: str, url: str, retries: int = 5, **kwargs):
    delay = 2
    for attempt in range(retries):
        try:
            r = requests.request(method, url, **kwargs)
            r.raise_for_status()
            return r
        except Exception as e:
            if attempt == retries - 1:
                raise
            print(f"  [retry {attempt+1}/{retries}] {e} — waiting {delay}s", flush=True)
            time.sleep(delay)
            delay = min(delay * 2, 30)


def fetch_page(offset: int) -> list[dict]:
    r = _request_with_retry(
        "GET",
        f"{SUPABASE_URL}/rest/v1/vocabulary_examples",
        headers=HEADERS,
        params={
            "select": "id,japanese,ruby",
            "order":  "id.asc",
            "offset": str(offset),
            "limit":  str(PAGE_SIZE),
        },
        timeout=30,
    )
    return r.json()


def update_batch(updates: list[dict], dry_run: bool) -> int:
    errors = 0
    for item in updates:
        if dry_run:
            continue
        try:
            _request_with_retry(
                "PATCH",
                f"{SUPABASE_URL}/rest/v1/vocabulary_examples?id=eq.{item['id']}",
                headers=HEADERS,
                json={"ruby": item["ruby"]},
                timeout=15,
            )
        except Exception as e:
            print(f"  [error] id={item['id']}: {e}", flush=True)
            errors += 1
    return errors

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--offset", type=int, default=0,
                        help="Start from this row offset (for resuming)")
    args = parser.parse_args()

    print("Enriching vocabulary_examples ruby with pykakasi...", flush=True)
    if args.dry_run:
        print("DRY RUN — no DB writes", flush=True)
    print()

    offset = args.offset
    total_processed = 0
    total_updated = 0
    total_skipped = 0
    total_errors = 0
    pending_updates: list[dict] = []

    while True:
        rows = fetch_page(offset)
        if not rows:
            break

        for row in rows:
            sentence = row["japanese"]
            existing = row["ruby"] if isinstance(row["ruby"], list) else []
            if isinstance(row["ruby"], str):
                try:
                    existing = json.loads(row["ruby"])
                except Exception:
                    existing = []

            new_ruby = generate_ruby(sentence)

            # Only update if new ruby has more entries than existing
            if len(new_ruby) <= len(existing):
                total_skipped += 1
                total_processed += 1
                continue

            pending_updates.append({"id": row["id"], "ruby": new_ruby})
            total_processed += 1

            if len(pending_updates) >= UPDATE_BATCH:
                errs = update_batch(pending_updates, args.dry_run)
                total_updated += len(pending_updates)
                total_errors += errs
                pending_updates = []

        offset += PAGE_SIZE

        if total_processed % LOG_EVERY == 0 or len(rows) < PAGE_SIZE:
            print(
                f"  [{total_processed}] updated: {total_updated} | "
                f"skipped: {total_skipped} | errors: {total_errors}",
                flush=True,
            )

    # Flush remaining
    if pending_updates:
        errs = update_batch(pending_updates, args.dry_run)
        total_updated += len(pending_updates)
        total_errors += errs

    print()
    print("Done.")
    print(f"Processed : {total_processed}")
    print(f"Updated   : {total_updated}")
    print(f"Skipped   : {total_skipped}")
    print(f"Errors    : {total_errors}")


if __name__ == "__main__":
    main()
