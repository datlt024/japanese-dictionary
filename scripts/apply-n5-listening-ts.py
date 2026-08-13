#!/usr/bin/env python3
"""
Apply timestamps from _n5_timestamps.json into n5-exam.ts.
Run after generate-n5-listening.py completes.

Usage (from project root):
    python3 scripts/apply-n5-listening-ts.py
"""

import json, re
from pathlib import Path

TS_FILE   = Path(__file__).parent / "_n5_timestamps.json"
DATA_FILE = Path(__file__).parent.parent / "src/features/dictionary/study/data/n5-exam.ts"

# Map from JSON key → (groupId, display) in n5-exam.ts
KEY_MAP = {
    "lq1_q1": ("lq1", "1ばん"),
    "lq1_q2": ("lq1", "2ばん"),
    "lq1_q3": ("lq1", "3ばん"),
    "lq1_q4": ("lq1", "4ばん"),
    "lq1_q5": ("lq1", "5ばん"),
    "lq1_q6": ("lq1", "6ばん"),
    "lq1_q7": ("lq1", "7ばん"),
    "lq2_q1": ("lq2", "1ばん"),
    "lq2_q2": ("lq2", "2ばん"),
    "lq2_q3": ("lq2", "3ばん"),
    "lq2_q4": ("lq2", "4ばん"),
    "lq2_q5": ("lq2", "5ばん"),
    "lq2_q6": ("lq2", "6ばん"),
    "lq3_q1": ("lq3", "1ばん"),
    "lq3_q2": ("lq3", "2ばん"),
    "lq3_q3": ("lq3", "3ばん"),
    "lq3_q4": ("lq3", "4ばん"),
    "lq3_q5": ("lq3", "5ばん"),
    "lq4_q1": ("lq4", "1ばん"),
    "lq4_q2": ("lq4", "2ばん"),
    "lq4_q3": ("lq4", "3ばん"),
    "lq4_q4": ("lq4", "4ばん"),
    "lq4_q5": ("lq4", "5ばん"),
    "lq4_q6": ("lq4", "6ばん"),
}

def apply():
    if not TS_FILE.exists():
        print(f"✗  Timestamps file not found: {TS_FILE}")
        print("   Run generate-n5-listening.py first.")
        return

    with open(TS_FILE, encoding='utf-8') as f:
        ts = json.load(f)

    src = DATA_FILE.read_text(encoding='utf-8')
    updated = 0

    for key, (group_id, display) in KEY_MAP.items():
        if key not in ts:
            print(f"  ⚠  {key} not in timestamps file, skipping")
            continue

        start = ts[key]["start"]
        end   = ts[key]["end"]

        # Match the block for this specific groupId + display, then replace 0,0 timestamps
        # Pattern: lines near groupId:"lq1" display:"1ばん" ... audioStart: 0, audioEnd: 0
        # We need to find the right block. Use a context-aware approach.

        # Build a pattern that matches the question block (any existing timestamps)
        escaped_group   = re.escape(group_id)
        escaped_display = re.escape(display)

        pattern = (
            r'(groupId:\s*"' + escaped_group + r'"[^}]*?'
            r'display:\s*"' + escaped_display + r'"[^}]*?)'
            r'audioStart:\s*\d+,\s*audioEnd:\s*\d+'
        )

        def replacer(m):
            return m.group(1) + f"audioStart: {start}, audioEnd: {end}"

        new_src, count = re.subn(pattern, replacer, src, count=1, flags=re.DOTALL)
        if count == 0:
            print(f"  ⚠  {key}: pattern not found (maybe already patched?)")
        else:
            src = new_src
            updated += 1
            print(f"  ✓  {key:10s}  {start}s → {end}s")

    DATA_FILE.write_text(src, encoding='utf-8')
    print(f"\n✓  Updated {updated}/24 questions in {DATA_FILE.name}")
    print("   Run: npm run lint")

if __name__ == "__main__":
    apply()
