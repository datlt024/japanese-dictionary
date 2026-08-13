-- Migration 009: Fix 38 dup-semi còn lại sau 008
--
-- Nguyên nhân: migration 008 timeout ở giữa khi update 247k rows → 38 rows không được xử lý.
-- Solution: chạy lại cùng UPDATE nhưng với WHERE filter chính xác hơn (không gọi function 2 lần).
-- Idempotent — an toàn khi chạy lại.
--
-- Yêu cầu: hàm yomi_dedup_semicolons() đã được tạo bởi migration 008.

UPDATE vocabulary_senses
SET    meaning_vi = yomi_dedup_semicolons(meaning_vi)
WHERE  is_hidden  = false
  AND  meaning_vi IS NOT NULL
  AND  (
      SELECT COUNT(*) - COUNT(DISTINCT lower(trim(p)))
      FROM   unnest(string_to_array(meaning_vi, ';')) AS p
  ) > 0;

-- Xác nhận: phải về 0
SELECT
    'Còn lỗi dup semi' AS loại,
    COUNT(*)           AS số_lượng
FROM vocabulary_senses
WHERE is_hidden = false
  AND meaning_vi IS NOT NULL
  AND (
      SELECT COUNT(*) - COUNT(DISTINCT lower(trim(p)))
      FROM   unnest(string_to_array(meaning_vi, ';')) AS p
  ) > 0;
