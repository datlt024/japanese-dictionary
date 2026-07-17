#!/usr/bin/env python3
"""
Patch script: fix batch6 senses conflict and insert missing similar_grammar links.

What happened:
- n2_133 (にして) had 2 senses without sense_index → both defaulted to 1 → conflict.
- similar_grammar for all batch6 records was not inserted (script halted before that).

This script:
1. Deletes the bad duplicate sense for n2_133
2. Re-inserts corrected senses for n2_133
3. Inserts similar_grammar links for all batch6 records
"""

import os
import sys
import json
import requests

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
}
HEADERS_RETURN = {**HEADERS, "Prefer": "return=representation"}
HEADERS_MINIMAL = {**HEADERS, "Prefer": "return=minimal"}

def api(method, table, **kwargs):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    r = requests.request(method, url, headers=HEADERS_RETURN, **kwargs)
    if r.status_code not in (200, 201, 204):
        raise RuntimeError(f"{method} {table}: {r.status_code} {r.text[:300]}")
    return r.json() if r.text else []

def api_minimal(method, table, **kwargs):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    r = requests.request(method, url, headers=HEADERS_MINIMAL, **kwargs)
    if r.status_code not in (200, 201, 204):
        raise RuntimeError(f"{method} {table}: {r.status_code} {r.text[:300]}")


# ── Step 1: Find grammar_id for n2_133 (にして, slug=ni-shite) ────────────────
print("Finding grammar_id for slug 'ni-shite'...")
rows = api("GET", "grammars", params={"slug": "eq.ni-shite", "select": "id,slug,pattern"})
if not rows:
    print("ERROR: Could not find 'ni-shite' in grammars table.")
    sys.exit(1)
ni_shite_id = rows[0]["id"]
print(f"  Found: id={ni_shite_id}, pattern={rows[0]['pattern']}")


# ── Step 2: Delete existing senses for ni-shite (the bad ones) ───────────────
print(f"Deleting existing grammar_senses for grammar_id={ni_shite_id}...")
api_minimal("DELETE", "grammar_senses", params={"grammar_id": f"eq.{ni_shite_id}"})
print("  Done.")


# ── Step 3: Insert corrected senses ──────────────────────────────────────────
correct_senses = [
    {
        "grammar_id": ni_shite_id,
        "sense_index": 1,
        "meaning_vi": "vào thời điểm... (mốc đặc biệt)",
        "explanation_vi": "Nhấn mạnh cột mốc quan trọng — đến A mới có B.",
        "nuance_vi": None,
    },
    {
        "grammar_id": ni_shite_id,
        "sense_index": 2,
        "meaning_vi": "thậm chí..., ngay cả... (nhấn mạnh)",
        "explanation_vi": "Nhấn mạnh ngay cả A cũng như vậy — bậc cao nhất cũng không ngoại lệ.",
        "nuance_vi": None,
    },
]
print(f"Inserting {len(correct_senses)} corrected senses for ni-shite...")
api("POST", "grammar_senses", json=correct_senses)
print("  Done.")


# ── Step 4: Get all batch6 grammar IDs by slug ───────────────────────────────
batch6_slugs = [
    "te-koso", "koto-ni-kanjo", "dake-no-koto-wa-aru", "wo-ふmaete",
    "ni-hikikaete", "ga-saigo", "nai-made-mo", "ni-tsuke-ni-tsuke",
    "ni-kotaete", "to-aimatte", "made-no-koto-da", "ni-atai-suru",
    "ni-tari-nai", "te-kanawanai", "ni-soutoUsuru", "to-itta",
    "te-sae-ireba", "mo-shimo", "nagara-ni", "ni-shite",
]

print(f"Fetching IDs for {len(batch6_slugs)} batch6 slugs...")
slug_to_id = {}
for slug in batch6_slugs:
    rows = api("GET", "grammars", params={"slug": f"eq.{slug}", "select": "id,slug,pattern"})
    if rows:
        slug_to_id[slug] = rows[0]["id"]
        print(f"  {slug} → {rows[0]['id']} ({rows[0]['pattern']})")
    else:
        print(f"  WARNING: slug '{slug}' not found!")

print(f"Found {len(slug_to_id)} / {len(batch6_slugs)} batch6 grammars.")


# ── Step 5: Load batch6 JSON to get similar_grammar ──────────────────────────
with open("data-import/grammar-n2-batch6.json") as f:
    batch6 = json.load(f)

grammars = batch6["grammars"]


# ── Step 6: Fetch ALL grammar patterns for similar_grammar resolution ─────────
print("Fetching all grammar patterns for similar_grammar resolution...")
all_grammars = []
offset = 0
limit = 1000
while True:
    rows = api("GET", "grammars", params={"select": "id,pattern", "limit": limit, "offset": offset})
    if not rows:
        break
    all_grammars.extend(rows)
    if len(rows) < limit:
        break
    offset += limit

pattern_to_ids = {}
for row in all_grammars:
    p = row["pattern"]
    pattern_to_ids.setdefault(p, []).append(row["id"])
print(f"  Loaded {len(all_grammars)} grammar records.")


# ── Step 7: Insert similar_grammar ───────────────────────────────────────────
print("Inserting similar_grammar links...")
similar_rows = []
seen_pairs = set()

for g in grammars:
    slug = g["slug"]
    gid = slug_to_id.get(slug)
    if not gid:
        continue
    for pattern in g.get("similar_grammar") or []:
        target_ids = pattern_to_ids.get(pattern, [])
        for tid in target_ids:
            if tid != gid:
                pair = (min(gid, tid), max(gid, tid))
                if pair not in seen_pairs:
                    similar_rows.append({"grammar_id": gid, "similar_grammar_id": tid})
                    seen_pairs.add(pair)

if similar_rows:
    # Insert in chunks to avoid request size limits
    chunk = 50
    for i in range(0, len(similar_rows), chunk):
        batch = similar_rows[i:i+chunk]
        api("POST", "grammar_similar", json=batch)
    print(f"  Inserted {len(similar_rows)} similar_grammar links.")
else:
    print("  No similar_grammar links to insert.")

print()
print("Patch complete!")
print(f"  Senses fixed:    ni-shite (2 senses)")
print(f"  Similar links:   {len(similar_rows)}")
