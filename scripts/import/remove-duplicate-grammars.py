#!/usr/bin/env python3
"""
Remove duplicate grammar records identified in the audit.
Deletes child records first, then the parent grammar record.

Usage:
  python3 scripts/import/remove-duplicate-grammars.py --dry-run
  python3 scripts/import/remove-duplicate-grammars.py
"""

import os
import sys
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

CHILD_TABLES = [
    "grammar_formations",
    "grammar_variants",
    "grammar_examples",
    "grammar_notes",
    "grammar_tags",
    "grammar_common_pairs",
    "grammar_short_forms",
    "grammar_differences",
    "grammar_senses",
]

# (id_to_delete, reason, keep_id)
DUPLICATES = [
    # ── Same-level duplicates ────────────────────────────────────────────────
    (1586, "かねない N2 same-level dup",         1430),
    (1587, "かねる N2 same-level dup",           1431),
    (1585, "がたい N2 same-level dup",           1429),
    (1582, "において N2 same-level dup",         1359),
    (1573, "に関して N2 same-level dup",         1365),
    (1584, "にもかかわらず N2 same-level dup",   1401),
    (1648, "ことか N2 same-level dup",           1418),
    (1840, "たりとも N1 same-level dup",         1728),
    (1820, "てやまない N1 same-level dup",       1734),
    (1904, "もさることながら N1 same-level dup", 1761),

    # ── N4 patterns wrongly added at N2/N3 ──────────────────────────────────
    (1583, "によって N2→N4",      1322),
    (1574, "に対して N2→N4",      1325),
    (1562, "てばかりいる N2→N4",  1361),
    (1709, "っぱなし N2→N4",      1458),
    (1714, "たびに N2→N4",        1349),
    (1698, "というのは N2→N4",    1355),
    (1542, "せいで N3→N4",        1338),
    (1513, "ようとする N3→N4",    1313),

    # ── N3 patterns wrongly added at N2 ─────────────────────────────────────
    (1718, "からこそ N2→N3",          1523),
    (1561, "からといって N2→N3",      1403),
    (1567, "ことになっている N2→N3",  1490),
    (1557, "さえ〜ば N2→N3",          1448),
    (1619, "それどころか N2→N3",      1409),
    (1723, "つつ N2→N3",              1488),
    (1685, "ているところだ N2→N3",    1376),
    (1568, "てからでないと N2→N3",    1491),
    (1572, "てしょうがない N2→N3",    1388),
    (1658, "というものだ N2→N3",      1492),
    (1694, "とともに N2→N3",          1425),
    (1570, "とはいえ N2→N3",          1402),
    (1555, "につれて N2→N3",          1423),
    (1697, "に限らず N2→N3",          1382),
    (1577, "に反して N2→N3",          1486),
    (1576, "をきっかけに N2→N3",      1477),
    (1575, "をめぐって N2→N3",        1422),
    (1558, "ものの N2→N3",            1353),
    (1580, "わけだ N2→N3",            1335),
    (1581, "わけではない N2→N3",      1336),
    (1579, "わけにはいかない N2→N3",  1337),

    # ── N2 patterns wrongly added at N1 ─────────────────────────────────────
    (1907, "あたかも N1→N2",              1613),
    (1893, "いかにも N1→N2",              1661),
    (1802, "ずくめ N1→N2",               1617),
    (1831, "といえども N1→N2",            1608),
    (1883, "といっても過言ではない N1→N2", 1679),
    (1920, "ともなく N1→N2",              1700),
    (1864, "はさておき N1→N2",            1710),
    (1919, "には及ばない N1→N2",          1671),
    (1787, "のみか N1→N2",               1655),
    (1762, "をものともせず N1→N2",        1624),
    (1856, "とみえて N1→N2",              1653),
    (1803, "を皮切りに N1→N2",            1595),
    (1837, "にとどまらず N1→N2",          1702),
    (1899, "のみならず N1→N3",            1484),
    (1651, "もさることながら N2 (slug破損)", 1761),
    (1625, "ようでは N2→N1",              1863),

    # ── N1 patterns wrongly added at N2/N3 ──────────────────────────────────
    (1659, "ともあろうものが N2→N1", 1823),
    (1652, "なりとも N2→N1",        1771),
    (1532, "ならではの N3→N1",      1844),
]


def fetch_info(gid):
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/grammars",
        headers=HEADERS,
        params={"id": f"eq.{gid}", "select": "id,slug,pattern,jlpt_level"},
    )
    rows = r.json()
    return rows[0] if rows else None


def delete_grammar(gid, dry_run=False):
    if dry_run:
        return True

    # Delete from child tables
    for table in CHILD_TABLES:
        r = requests.delete(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers=HEADERS,
            params={"grammar_id": f"eq.{gid}"},
        )
        if r.status_code not in (200, 204):
            print(f"    WARNING {table}: {r.status_code} {r.text[:80]}")

    # grammar_similar has two FK columns
    for param in ("grammar_id", "similar_grammar_id"):
        r = requests.delete(
            f"{SUPABASE_URL}/rest/v1/grammar_similar",
            headers=HEADERS,
            params={param: f"eq.{gid}"},
        )
        if r.status_code not in (200, 204):
            print(f"    WARNING grammar_similar ({param}): {r.status_code}")

    # Delete the main record
    r = requests.delete(
        f"{SUPABASE_URL}/rest/v1/grammars",
        headers=HEADERS,
        params={"id": f"eq.{gid}"},
    )
    if r.status_code not in (200, 204):
        print(f"    ERROR grammars: {r.status_code} {r.text[:120]}")
        return False
    return True


def main():
    dry_run = "--dry-run" in sys.argv
    mode = "[DRY RUN] " if dry_run else ""
    print(f"{mode}Xóa {len(DUPLICATES)} bản ghi trùng lặp\n")

    # Pre-flight: verify every ID exists and check keep_id also exists
    print("=== Kiểm tra trước khi xóa ===")
    verified, missing, keep_missing = [], [], []
    for (del_id, reason, keep_id) in DUPLICATES:
        info = fetch_info(del_id)
        keep_info = fetch_info(keep_id)
        if info is None:
            missing.append((del_id, reason))
            continue
        if keep_info is None:
            keep_missing.append((keep_id, reason))
            continue
        verified.append((del_id, reason, keep_id, info, keep_info))
        print(f"  ✓ DELETE {del_id} ({info['jlpt_level']} {info['pattern']}) | KEEP {keep_id} ({keep_info['jlpt_level']} {keep_info['pattern']})")

    if missing:
        print(f"\nKhông tìm thấy {len(missing)} ID (đã xóa trước?):")
        for (gid, reason) in missing:
            print(f"  - {gid}: {reason}")
    if keep_missing:
        print(f"\nKhông tìm thấy {len(keep_missing)} keep_id:")
        for (gid, reason) in keep_missing:
            print(f"  - {gid}: {reason}")

    print(f"\nSẽ xóa: {len(verified)} | Không tồn tại: {len(missing)}\n")

    if not verified:
        print("Không còn gì để xóa.")
        return

    # Execute deletions
    print("=== Tiến hành xóa ===")
    success, errors = 0, 0
    for (del_id, reason, keep_id, info, keep_info) in verified:
        label = f"{info['jlpt_level']} {info['pattern']} (slug={info['slug']})"
        if dry_run:
            print(f"  [DRY RUN] Sẽ xóa {del_id} — {label}")
            success += 1
            continue
        ok = delete_grammar(del_id)
        if ok:
            print(f"  ✓ Xóa {del_id} — {label}")
            success += 1
        else:
            print(f"  ✗ Lỗi {del_id} — {label}")
            errors += 1

    # Final count
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/grammars",
        headers={**HEADERS, "Prefer": "count=exact"},
        params={"select": "id", "limit": "1"},
    )
    total = r.headers.get("content-range", "?/?").split("/")[-1]

    print(f"\n{'=== Kết quả ===' if not dry_run else '=== Dry run hoàn thành ==='}")
    print(f"Xóa thành công: {success}")
    if errors:
        print(f"Lỗi:            {errors}")
    if not dry_run:
        print(f"Tổng DB còn lại: {total} bản ghi")


if __name__ == "__main__":
    main()
