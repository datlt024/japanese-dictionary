-- Migration 015: Sửa 2 sense còn bị để nguyên tiếng Anh (chưa dịch)
--
-- Phát hiện qua audit toàn bộ 247,194 visible senses (scripts/shared/audit-db-quality.ts)
-- Đây là 2 sense duy nhất có meaning_vi == meaning_en (chưa được dịch sang tiếng Việt).
--
-- Idempotent — an toàn khi chạy lại.

-- ================================================================
-- 1. お見舞い申し上げる sense 1
--    EN: "to express one's deepest sympathies"
--    → nghĩa: kính gửi lời thăm hỏi/chia buồn sâu sắc
-- ================================================================
UPDATE vocabulary_senses
SET    meaning_vi = 'kính gửi lời chia buồn sâu sắc; bày tỏ sự chia buồn chân thành'
WHERE  vocabulary_id = (
           SELECT id FROM vocabularies
           WHERE  primary_word = 'お見舞い申し上げる'
             AND  primary_kana = 'おみまいもうしあげる'
           ORDER BY id LIMIT 1
       )
  AND  sense_index = 1
  AND  meaning_vi = 'to express one''s deepest sympathies';

-- ================================================================
-- 2. 関心が高まる sense 1
--    EN: "to take a growing interest in"
--    → nghĩa: ngày càng quan tâm đến; mối quan tâm ngày càng tăng
-- ================================================================
UPDATE vocabulary_senses
SET    meaning_vi = 'ngày càng quan tâm đến; mối quan tâm ngày càng tăng'
WHERE  vocabulary_id = (
           SELECT id FROM vocabularies
           WHERE  primary_word = '関心が高まる'
             AND  primary_kana = 'かんしんがたかまる'
           ORDER BY id LIMIT 1
       )
  AND  sense_index = 1
  AND  meaning_vi = 'to take a growing interest in';

-- ================================================================
-- Xác nhận
-- ================================================================
SELECT
    v.primary_word,
    v.primary_kana,
    vs.sense_index,
    vs.meaning_vi,
    vs.meaning_en
FROM vocabularies v
JOIN vocabulary_senses vs ON vs.vocabulary_id = v.id
WHERE v.primary_word IN ('お見舞い申し上げる', '関心が高まる')
  AND v.primary_kana IN ('おみまいもうしあげる', 'かんしんがたかまる')
ORDER BY v.primary_word, vs.sense_index;
