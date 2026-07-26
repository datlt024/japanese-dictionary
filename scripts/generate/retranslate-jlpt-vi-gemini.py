#!/usr/bin/env python3
"""
Re-translate JLPT N5–N1 vocabulary senses using Google Gemini API (free tier).
Context-aware: sends word + kana + meaning_en + POS together so model can
choose the best Vietnamese equivalent instead of blindly translating English.

Free tier limits: 15 req/min, 1500 req/day  →  we use 12 req/min (5s delay).

Usage:
  python3 scripts/generate/retranslate-jlpt-vi-gemini.py            # all JLPT
  python3 scripts/generate/retranslate-jlpt-vi-gemini.py 2000       # limit 2000

Requires:
  pip3 install requests
  GEMINI_API_KEY in .env.local
"""

import json
import os
import sys
import time
import re
from pathlib import Path

import requests

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
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
    sys.exit(1)

if not GEMINI_API_KEY:
    print("ERROR: Missing GEMINI_API_KEY in .env.local")
    sys.exit(1)

SUPABASE_HEADERS = {
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
BATCH_SIZE   = 25    # senses per Gemini request — fits well in token budget
DELAY        = 6.0   # seconds between Gemini calls → ~10 req/min (free limit: 15)
UPDATE_BATCH = 50    # senses per Supabase upsert (small = more reliable)
MODEL        = "models/gemini-flash-lite-latest"
GEMINI_URL   = f"https://generativelanguage.googleapis.com/v1beta/{MODEL}:generateContent"

PROMPT_PATH  = Path("prompts/vocabulary-vi.txt")

# ---------------------------------------------------------------------------
# Load prompt prefix (everything up to and including the marker line)
# ---------------------------------------------------------------------------

PROMPT_MARKER = "Bây giờ hãy dịch batch sau:"

def load_prompt_prefix() -> str:
    text = PROMPT_PATH.read_text(encoding="utf-8")
    idx = text.find(PROMPT_MARKER)
    if idx == -1:
        raise RuntimeError(f"Marker not found in {PROMPT_PATH}")
    return text[: idx + len(PROMPT_MARKER)].strip()

PROMPT_PREFIX = load_prompt_prefix()

# ---------------------------------------------------------------------------
# Supabase helpers
# ---------------------------------------------------------------------------

def fetch_jlpt_senses() -> list[dict]:
    """
    Fetch JLPT senses not yet translated by Gemini.
    Uses cursor pagination (id > last_id) so filtering client-side doesn't break offsets.
    """
    all_rows: list[dict] = []
    last_id = 0
    fetched_pages = 0

    print("Fetching JLPT senses from Supabase (skipping already-Gemini-translated)...")

    while len(all_rows) < LIMIT:
        params = {
            "select": "id,meaning_en,part_of_speech,meaning_vi_source,vocabularies!inner(primary_word,primary_kana,jlpt)",
            "meaning_vi_status": "in.(pending,machine)",
            "vocabularies.jlpt": "not.is.null",
            "id": f"gt.{last_id}",
            "order": "id.asc",
            "limit": PAGE_SIZE,
        }
        resp = requests.get(
            f"{SUPABASE_URL}/rest/v1/vocabulary_senses",
            headers={**SUPABASE_HEADERS, "Prefer": "count=none"},
            params=params,
            timeout=30,
        )
        resp.raise_for_status()
        rows = resp.json()

        if not rows:
            break

        fetched_pages += 1
        last_id = rows[-1]["id"]  # advance cursor past all fetched rows

        # Skip senses already translated by Gemini
        new_rows = [
            r for r in rows
            if r.get("meaning_en") and r.get("meaning_vi_source") != "gemini"
        ]
        slots = LIMIT - len(all_rows)
        all_rows.extend(new_rows[:slots])
        print(f"  Page {fetched_pages}: kept {len(new_rows)}/{len(rows)}, total kept: {len(all_rows)}")

        if len(rows) < PAGE_SIZE:
            break

    return all_rows


def patch_sense(sense_id: int, meaning_vi: str) -> bool:
    """Update a single sense row via PATCH — used as fallback when batch upsert fails."""
    try:
        resp = requests.patch(
            f"{SUPABASE_URL}/rest/v1/vocabulary_senses",
            headers=SUPABASE_HEADERS,
            params={"id": f"eq.{sense_id}"},
            json={"meaning_vi": meaning_vi, "meaning_vi_status": "machine", "meaning_vi_source": "gemini"},
            timeout=15,
        )
        return resp.ok
    except Exception:
        return False


def upsert_senses(updates: list[dict], retries: int = 3) -> int:
    if not updates:
        return 0
    delay = 10.0
    for attempt in range(retries + 1):
        try:
            resp = requests.post(
                f"{SUPABASE_URL}/rest/v1/vocabulary_senses",
                headers={**SUPABASE_HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal"},
                data=json.dumps(updates, ensure_ascii=False),
                timeout=60,
            )
            resp.raise_for_status()
            return len(updates)
        except requests.exceptions.HTTPError:
            if attempt < retries and (resp.status_code >= 500 or resp.status_code == 429):
                print(f"  [warn] Supabase HTTP {resp.status_code}, retry in {delay:.0f}s...")
                time.sleep(delay)
                delay *= 2
            else:
                # Batch failed — fall back to individual PATCH requests
                print(f"  [warn] Batch upsert failed after {retries} retries, falling back to individual updates...")
                saved = 0
                for row in updates:
                    if patch_sense(row["id"], row["meaning_vi"]):
                        saved += 1
                    else:
                        print(f"  [error] Failed to update sense_id={row['id']}")
                    time.sleep(0.1)
                return saved
    return 0

# ---------------------------------------------------------------------------
# Gemini helpers
# ---------------------------------------------------------------------------

def call_gemini(prompt: str, retries: int = 8) -> str:
    """Call Gemini and return raw text. Retries on 429/5xx with backoff."""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.1,
        },
    }
    delay = 30.0  # start longer — 429 bursts often last >15s
    for attempt in range(retries + 1):
        try:
            resp = requests.post(
                GEMINI_URL,
                params={"key": GEMINI_API_KEY},
                json=payload,
                timeout=60,
            )
        except requests.exceptions.ConnectionError as e:
            if attempt < retries:
                print(f"  [warn] Connection error, retry in {delay:.0f}s... ({e})")
                time.sleep(delay)
                delay = min(delay * 2, 300)
                continue
            raise

        if resp.status_code == 429 or resp.status_code >= 500:
            if attempt < retries:
                print(f"  [warn] HTTP {resp.status_code}, retry in {delay:.0f}s...")
                time.sleep(delay)
                delay = min(delay * 2, 300)  # cap at 5 min
                continue
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    return ""


def translate_batch(items: list[dict]) -> list[dict]:
    """
    items: list of {sense_id, word, kana, meaning_en, pos}
    returns: list of {sense_id, meaning_vi}
    """
    prompt = f"{PROMPT_PREFIX}\n{json.dumps(items, ensure_ascii=False)}"
    raw = call_gemini(prompt)
    if not raw:
        return []

    # Strip markdown code fences if model added them
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    raw = re.sub(r"\s*```$", "", raw.strip())

    try:
        parsed = json.loads(raw)
        if not isinstance(parsed, list):
            print(f"  [warn] non-list response: {raw[:120]}")
            return []
        results = []
        for item in parsed:
            if isinstance(item.get("sense_id"), int) and isinstance(item.get("meaning_vi"), str) and item["meaning_vi"].strip():
                results.append({"sense_id": item["sense_id"], "meaning_vi": item["meaning_vi"].strip()})
        return results
    except json.JSONDecodeError as e:
        print(f"  [warn] JSON parse error: {e} — raw: {raw[:200]}")
        return []

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    senses = fetch_jlpt_senses()
    if not senses:
        print("No JLPT senses to translate.")
        return

    total = len(senses)
    print(f"\nTotal senses to translate: {total}")
    print(f"Batch size: {BATCH_SIZE} senses/request, delay: {DELAY}s → ~{60/DELAY:.0f} req/min\n")

    items = [
        {
            "sense_id": r["id"],
            "word": r["vocabularies"]["primary_word"],
            "kana": r["vocabularies"].get("primary_kana"),
            "meaning_en": r["meaning_en"],
            "pos": r.get("part_of_speech") or [],
        }
        for r in senses
    ]

    translated: list[dict] = []
    pending_upsert: list[dict] = []
    updated_total = 0
    batch_num = 0
    total_batches = (len(items) + BATCH_SIZE - 1) // BATCH_SIZE

    for i in range(0, len(items), BATCH_SIZE):
        chunk = items[i : i + BATCH_SIZE]
        batch_num += 1

        results = translate_batch(chunk)
        translated.extend(results)

        if results:
            for r in results:
                pending_upsert.append({
                    "id": r["sense_id"],
                    "meaning_vi": r["meaning_vi"],
                    "meaning_vi_status": "machine",
                    "meaning_vi_source": "gemini",
                })

        done = min(i + BATCH_SIZE, total)
        print(f"  [{batch_num}/{total_batches}] Translated {done}/{total} — this batch: {len(results)}/{len(chunk)}")

        # Flush to Supabase every UPDATE_BATCH senses
        if len(pending_upsert) >= UPDATE_BATCH:
            updated_total += upsert_senses(pending_upsert)
            print(f"    → Saved {updated_total} to DB so far")
            pending_upsert.clear()

        if i + BATCH_SIZE < len(items):
            time.sleep(DELAY)

    # Flush remaining
    if pending_upsert:
        updated_total += upsert_senses(pending_upsert)

    print(f"\nDone.")
    print(f"  Fetched:    {total}")
    print(f"  Translated: {len(translated)}")
    print(f"  Saved to DB:{updated_total}")
    skipped = total - len(translated)
    if skipped:
        print(f"  Skipped (parse errors): {skipped}")


if __name__ == "__main__":
    main()
