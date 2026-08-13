-- Migration 003: Xoá các JSON column trong grammars đã có normalized child tables
--
-- QUAN TRỌNG: Chỉ chạy sau khi đã xác nhận child tables có đầy đủ dữ liệu.
-- Columns bị xoá đều có bảng con tương ứng (grammar_formations, grammar_examples, ...):
--   formation        → grammar_formations
--   examples         → grammar_examples
--   variants         → grammar_variants
--   notes            → grammar_notes
--   tags             → grammar_tags (col tags là string[], không phải grammar_tags)
--   common_pairs     → grammar_common_pairs
--   short_forms      → grammar_short_forms
--   differences      → grammar_differences
--   similar_grammar  → grammar_similar
--   reading_rules    → không có child table, không dùng trong code
--
-- GIỮ LẠI:
--   special_cases    → JSON column này vẫn được dùng trong app (không có child table)

alter table grammars
    drop column if exists formation,
    drop column if exists examples,
    drop column if exists variants,
    drop column if exists notes,
    drop column if exists tags,
    drop column if exists common_pairs,
    drop column if exists short_forms,
    drop column if exists differences,
    drop column if exists similar_grammar,
    drop column if exists reading_rules;
