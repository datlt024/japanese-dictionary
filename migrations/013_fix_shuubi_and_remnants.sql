-- Migration 013: Fix lỗi còn sót sau audit toàn diện
--
-- Sau khi scan 217k senses và loại trừ từ láy hợp lệ + false positives,
-- chỉ còn 1 lỗi dịch thực sự được xác nhận:
--
-- 守備 (しゅび) sense 2: "chắn chắn"
--   → dịch sai từ "fielding; defense"
--   → "chắn chắn" không có nghĩa trong tiếng Việt (không phải từ láy chuẩn)
--   → đúng phải là "phòng thủ; phòng ngự"
--
-- Idempotent.

UPDATE vocabulary_senses
SET    meaning_vi = 'phòng thủ; phòng ngự'
WHERE  vocabulary_id = (
           SELECT id FROM vocabularies
           WHERE  primary_word = '守備' AND primary_kana = 'しゅび'
           ORDER BY id LIMIT 1
       )
  AND  meaning_vi ILIKE '%chắn chắn%';

-- Xác nhận
SELECT
    v.primary_word,
    v.primary_kana,
    vs.sense_index,
    vs.meaning_vi
FROM vocabularies v
JOIN vocabulary_senses vs ON vs.vocabulary_id = v.id
WHERE v.primary_word = '守備' AND v.primary_kana = 'しゅび'
ORDER BY vs.sense_index;
