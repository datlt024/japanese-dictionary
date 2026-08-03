-- Migration 016: Sửa lỗi viết hoa sai trong meaning_vi của đại từ
--
-- Vấn đề: Khi dịch, "I" tiếng Anh (luôn viết hoa) bị dịch thành "TÔI"
-- thay vì "tôi". Tương tự một số danh từ khác bị viết hoa chữ đầu.
--
-- Phát hiện qua audit bộ đại từ (part_of_speech = 'pn').
--
-- Phạm vi:
--   - REPLACE 'TÔI' → 'tôi' trong toàn bộ visible senses
--   - Fix một số trường hợp viết hoa chữ đầu trong đại từ cụ thể
--
-- Idempotent — an toàn khi chạy lại.

-- ================================================================
-- 1. "TÔI" all-caps → "tôi"
--    (trong tiếng Việt không có quy tắc viết hoa toàn bộ từ này)
-- ================================================================
UPDATE vocabulary_senses
SET    meaning_vi = REPLACE(meaning_vi, 'TÔI', 'tôi')
WHERE  is_hidden = false
  AND  meaning_vi LIKE '%TÔI%';

-- ================================================================
-- 2. "Bạn" viết hoa chữ đầu → "bạn" (khi là nghĩa standalone)
--    Chỉ fix khi meaning_vi bắt đầu bằng "Bạn" hoặc chứa "; Bạn"
-- ================================================================
UPDATE vocabulary_senses
SET    meaning_vi = REPLACE(REPLACE(meaning_vi, '; Bạn', '; bạn'), 'Bạn;', 'bạn;')
WHERE  is_hidden = false
  AND  (meaning_vi LIKE '%; Bạn%' OR meaning_vi LIKE '%Bạn;%');

-- meaning_vi chỉ là "Bạn" đơn thuần
UPDATE vocabulary_senses
SET    meaning_vi = 'bạn'
WHERE  is_hidden = false
  AND  meaning_vi = 'Bạn';

-- ================================================================
-- 3. Một số từ cụ thể bị viết hoa sai
-- ================================================================

-- あの人 s1: "Người kia; người đó; anh kia; chị kia"
UPDATE vocabulary_senses
SET    meaning_vi = 'người kia; người đó; anh kia; chị kia'
WHERE  vocabulary_id = (
           SELECT id FROM vocabularies
           WHERE  primary_word = 'あの人' AND primary_kana = 'あのひと'
           ORDER BY id LIMIT 1
       )
  AND  sense_index = 1
  AND  meaning_vi ILIKE 'Người kia%';

-- あの方 s1: "Vị kia ..."
UPDATE vocabulary_senses
SET    meaning_vi = LOWER(LEFT(meaning_vi, 1)) || SUBSTRING(meaning_vi FROM 2)
WHERE  vocabulary_id = (
           SELECT id FROM vocabularies
           WHERE  primary_word = 'あの方' AND primary_kana = 'あのかた'
           ORDER BY id LIMIT 1
       )
  AND  sense_index = 1
  AND  LEFT(meaning_vi, 1) BETWEEN 'A' AND 'Z';

-- チミ s1: "Bạn; bạn bè; bạn"
UPDATE vocabulary_senses
SET    meaning_vi = 'bạn; bạn bè; bạn'
WHERE  vocabulary_id = (
           SELECT id FROM vocabularies
           WHERE  primary_word = 'チミ' AND primary_kana = 'チミ'
           ORDER BY id LIMIT 1
       )
  AND  sense_index = 1
  AND  meaning_vi ILIKE 'Bạn%';

-- ================================================================
-- Xác nhận số lượng đã fix
-- ================================================================
SELECT
    COUNT(*) FILTER (WHERE meaning_vi LIKE '%TÔI%' AND is_hidden = false) AS còn_TÔI_allcaps,
    COUNT(*) FILTER (WHERE meaning_vi = 'Bạn'     AND is_hidden = false) AS còn_Bạn_standalone,
    COUNT(*) FILTER (WHERE meaning_vi LIKE 'tôi%' AND is_hidden = false
                        AND part_of_speech @> ARRAY['pn'])               AS senses_tôi_lowercase
FROM vocabulary_senses;
