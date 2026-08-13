#!/usr/bin/env python3 -u
"""
Incremental grammar import — adds new records WITHOUT deleting existing data.

Usage:
  python3 scripts/import/add-grammars.py data-import/grammar-n4.json
  python3 scripts/import/add-grammars.py data-import/grammar-n4.json --dry-run

Skips records whose slug already exists in the DB.
"""

import os
import sys
import json
import time
import argparse
import requests

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
}
HEADERS_RETURN = {**HEADERS, "Prefer": "return=representation"}
HEADERS_MINIMAL = {**HEADERS, "Prefer": "return=minimal"}

# ── Helpers ───────────────────────────────────────────────────────────────────

def api(method, table, **kwargs):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    r = requests.request(method, url, headers=HEADERS_RETURN, **kwargs)
    if r.status_code not in (200, 201, 204):
        raise RuntimeError(f"{method} {table}: {r.status_code} {r.text[:200]}")
    return r.json() if r.text else []


def api_minimal(method, table, **kwargs):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    r = requests.request(method, url, headers=HEADERS_MINIMAL, **kwargs)
    if r.status_code not in (200, 201, 204):
        raise RuntimeError(f"{method} {table}: {r.status_code} {r.text[:200]}")


def insert_batch(table, rows, dry_run=False):
    if not rows or dry_run:
        return
    chunk = 200
    for i in range(0, len(rows), chunk):
        api("POST", table, json=rows[i:i+chunk])


def nt(v):
    if not isinstance(v, str):
        return None
    s = v.strip()
    return s if s else None

# ── Fetch existing slugs ──────────────────────────────────────────────────────

def fetch_existing_slugs():
    rows = api("GET", "grammars", params={"select": "slug,id", "limit": "5000"})
    return {r["slug"]: r["id"] for r in rows}


def fetch_all_patterns():
    rows = api("GET", "grammars", params={"select": "pattern,id", "limit": "5000"})
    result = {}
    for r in rows:
        result.setdefault(r["pattern"], []).append(r["id"])
    return result

# ── Main ──────────────────────────────────────────────────────────────────────

def import_file(filepath, dry_run=False):
    with open(filepath, encoding="utf-8") as f:
        raw = json.load(f)

    data = raw if isinstance(raw, list) else raw.get("grammars", raw.get("items", raw.get("data", [])))

    print(f"Loaded {len(data)} grammar items from {filepath}")

    existing = fetch_existing_slugs()
    print(f"Existing grammar records: {len(existing)}")

    # Filter out already-imported slugs
    to_import = [g for g in data if g.get("slug") not in existing]
    skipped = len(data) - len(to_import)

    print(f"To import: {len(to_import)} | Already exist (skip): {skipped}")

    if not to_import:
        print("Nothing to import.")
        return

    # ── Insert grammar rows ───────────────────────────────────────────────────
    sort_base = max(existing.values(), default=0) if existing else 0

    grammar_rows = []
    for i, g in enumerate(to_import):
        source_id = nt(g.get("id")) or g["slug"]
        grammar_rows.append({
            "slug": g["slug"],
            "source_id": source_id,
            "pattern": g["pattern"],
            "display_pattern": nt(g.get("display_pattern")),
            "reading": nt(g.get("reading")),
            "jlpt_level": g["jlpt_level"],
            "meaning_vi": nt(g.get("meaning_vi")),
            "meaning_en": nt(g.get("meaning_en")),
            "short_meaning_vi": nt(g.get("short_meaning_vi")),
            "explanation_vi": nt(g.get("explanation_vi")),
            "explanation_en": nt(g.get("explanation_en")),
            "nuance_vi": nt(g.get("nuance_vi")),
            "register": nt(g.get("register")),
            "ai_status": "done",
            "sort_order": sort_base + i + 1,
        })

    if dry_run:
        print(f"[DRY RUN] Would insert {len(grammar_rows)} grammar rows")
        for r in grammar_rows[:3]:
            print(f"  {r['slug']}: {r['pattern']}")
        return

    print(f"Inserting {len(grammar_rows)} grammar records...")
    inserted = api("POST", "grammars", json=grammar_rows)
    print(f"Inserted {len(inserted)} grammar records")

    # Build slug → db_id map
    slug_to_id = {r["slug"]: r["id"] for r in inserted}

    # ── Insert child tables ───────────────────────────────────────────────────
    formations, variants, examples = [], [], []
    notes, tags, common_pairs = [], [], []
    short_forms, differences, senses = [], [], []

    for g in to_import:
        gid = slug_to_id.get(g["slug"])
        if not gid:
            continue

        for gi, group in enumerate(g.get("formation") or []):
            for p in group.get("patterns") or []:
                left = nt(p.get("left"))
                remove = nt(p.get("remove"))
                right = nt(p.get("right"))
                if not any([left, remove, right]):
                    continue
                formations.append({
                    "grammar_id": gid,
                    "group_index": gi + 1,
                    "left_text": left,
                    "remove_text": remove,
                    "right_text": right,
                })

        for v in g.get("variants") or []:
            p = nt(v.get("pattern"))
            if p:
                variants.append({"grammar_id": gid, "pattern": p, "variant_type": nt(v.get("type"))})

        for ei, ex in enumerate(g.get("examples") or []):
            jp = nt(ex.get("sentence_jp") or ex.get("japanese") or ex.get("jp"))
            vi = nt(ex.get("translation_vi") or ex.get("vi"))
            if jp:
                examples.append({"grammar_id": gid, "japanese": jp, "translation_vi": vi, "example_order": ei + 1})

        for ni, note in enumerate(g.get("notes") or []):
            t = nt(note)
            if t:
                notes.append({"grammar_id": gid, "note_text": t, "sort_order": ni + 1})

        for tag in g.get("tags") or []:
            t = nt(tag)
            if t:
                tags.append({"grammar_id": gid, "tag": t})

        for cp in g.get("common_pairs") or []:
            expr = nt(cp) if isinstance(cp, str) else nt(cp.get("expression") or cp.get("pattern"))
            if expr:
                common_pairs.append({"grammar_id": gid, "expression": expr})

        for sf in g.get("short_forms") or []:
            p = nt(sf) if isinstance(sf, str) else nt(sf.get("pattern"))
            if p:
                short_forms.append({"grammar_id": gid, "pattern": p})

        for diff in g.get("differences") or []:
            compared = nt(diff.get("pattern") or diff.get("compared_pattern") or diff.get("grammar"))
            diff_text = nt(diff.get("difference_vi") or diff.get("difference_text") or diff.get("explanation_vi"))
            if compared and diff_text:
                differences.append({"grammar_id": gid, "compared_pattern": compared, "difference_text": diff_text})

        for sense_idx, sense in enumerate(g.get("senses") or [], start=1):
            meanings = nt(sense.get("meaning_vi"))
            if meanings:
                senses.append({
                    "grammar_id": gid,
                    "sense_index": sense.get("sense_index", sense_idx),
                    "meaning_vi": meanings,
                    "explanation_vi": nt(sense.get("explanation_vi")),
                    "nuance_vi": nt(sense.get("nuance_vi")),
                })

    print("Inserting child data...")
    insert_batch("grammar_formations", formations)
    insert_batch("grammar_variants", variants)
    insert_batch("grammar_examples", examples)
    insert_batch("grammar_notes", notes)
    insert_batch("grammar_tags", tags)
    insert_batch("grammar_common_pairs", common_pairs)
    insert_batch("grammar_short_forms", short_forms)
    insert_batch("grammar_differences", differences)
    if senses:
        insert_batch("grammar_senses", senses)

    # ── Resolve similar_grammar ───────────────────────────────────────────────
    print("Resolving similar_grammar links...")
    all_patterns = fetch_all_patterns()
    similar_rows = []
    seen_pairs = set()

    for g in to_import:
        gid = slug_to_id.get(g["slug"])
        if not gid:
            continue
        for pattern in g.get("similar_grammar") or []:
            target_ids = all_patterns.get(pattern, [])
            for tid in target_ids:
                if tid != gid:
                    pair = (min(gid, tid), max(gid, tid))
                    if pair not in seen_pairs:
                        similar_rows.append({"grammar_id": gid, "similar_grammar_id": tid})
                        seen_pairs.add(pair)

    if similar_rows:
        insert_batch("grammar_similar", similar_rows)
        print(f"Inserted {len(similar_rows)} similar_grammar links")

    print()
    print(f"Done!")
    print(f"  Grammars:    {len(inserted)}")
    print(f"  Formations:  {len(formations)}")
    print(f"  Examples:    {len(examples)}")
    print(f"  Notes:       {len(notes)}")
    print(f"  Tags:        {len(tags)}")
    print(f"  Variants:    {len(variants)}")
    print(f"  Short forms: {len(short_forms)}")
    print(f"  Common pairs:{len(common_pairs)}")
    print(f"  Differences: {len(differences)}")
    print(f"  Similar:     {len(similar_rows)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("file", help="Path to grammar JSON file")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    import_file(args.file, dry_run=args.dry_run)
