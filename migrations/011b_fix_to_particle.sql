-- Migration 011b: Fix と — "nếu; khi" vẫn hiển thị sau 011
--
-- Nguyên nhân: \b word boundary trong PostgreSQL POSIX regex (~*)
-- không match đúng với ký tự có dấu tiếng Việt (ế, ề, ô...).
-- Fix: dùng ILIKE thay cho regex để tìm theo meaning_vi.
--
-- Idempotent.

UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  vocabulary_id IN (
           SELECT id FROM vocabularies
           WHERE  primary_word = 'と' AND primary_kana = 'と'
       )
  AND  is_hidden = false
  AND  meaning_vi ILIKE '%nếu%';

-- Xác nhận
SELECT
    COUNT(*) FILTER (WHERE is_hidden = false) AS visible,
    COUNT(*) FILTER (WHERE is_hidden = true)  AS hidden,
    string_agg(meaning_vi, '; ' ORDER BY sense_index)
        FILTER (WHERE is_hidden = false)      AS còn_hiển_thị
FROM vocabulary_senses
WHERE vocabulary_id IN (
    SELECT id FROM vocabularies
    WHERE  primary_word = 'と' AND primary_kana = 'と'
);
