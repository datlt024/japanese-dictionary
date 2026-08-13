-- Migration 007: Sửa chất lượng bản dịch meaning_vi
--
-- Mục đích: Viết lại bản dịch bị dịch máy kém (3–7/10) và ẩn các
--   sense không cần thiết cho người học:
--
--   • 行く / いく  — viết lại toàn bộ 10 sense (3/10), ẩn sense 10 (aux-v)
--   • 来る / くる  — sửa sense 2,5; ẩn sense 3 (aux-v)
--   • 好き / すき  — ẩn sense 5 (dâm đãng; quá thô tục với người học)
--   • 嫌い / きらい — ẩn sense 2,3 (nghĩa cổ/hiếm gặp)
--   • 入る / いる  — ẩn sense 4,5 (dùng làm hậu tố, mang tính ngữ pháp)
--   • 働く / はたらく — ẩn sense 4 (thuật ngữ ngôn ngữ học, không thực dụng)
--   • 分かる / わかる — ẩn sense 3 (thán từ [int], không phải nghĩa từ vựng)
--   • 終わる / おわる — ẩn sense 3 (dùng làm hậu tố [suf])
--
-- Idempotent — an toàn khi chạy lại.

-- ================================================================
-- Phần 1: 行く / いく — viết lại bản dịch (sense 1–9, 11, 12)
-- ================================================================
UPDATE vocabulary_senses
SET meaning_vi = CASE sense_index
    WHEN 1  THEN 'đi; di chuyển đến; hướng về phía'
    WHEN 2  THEN 'đi qua; đi dọc theo'
    WHEN 3  THEN 'diễn ra; tiến triển; hòa hợp'
    WHEN 4  THEN 'làm theo cách; thử; chọn'
    WHEN 5  THEN 'trôi qua (thời gian, mùa)'
    WHEN 6  THEN 'chảy; lan tỏa'
    WHEN 8  THEN 'đạt đến; lên đến (mức độ, tuổi tác)'
    WHEN 9  THEN 'lan đến; truyền đến'
    WHEN 11 THEN 'đạt cực khoái (tiếng lóng)'
    WHEN 12 THEN 'phê; ảo giác (ma túy, tiếng lóng)'
    ELSE meaning_vi
END
WHERE vocabulary_id = (
    SELECT id FROM vocabularies
    WHERE primary_word = '行く' AND primary_kana = 'いく'
    ORDER BY id LIMIT 1
)
  AND sense_index IN (1, 2, 3, 4, 5, 6, 8, 9, 11, 12);

-- ================================================================
-- Phần 2: 行く / いく — ẩn sense 10 (aux-v: tiếp tục...; dần dần...)
-- ================================================================
UPDATE vocabulary_senses
SET is_hidden = true
WHERE vocabulary_id = (
    SELECT id FROM vocabularies
    WHERE primary_word = '行く' AND primary_kana = 'いく'
    ORDER BY id LIMIT 1
)
  AND sense_index = 10;

-- ================================================================
-- Phần 3: 来る / くる — sửa sense 2 và 5
-- ================================================================
UPDATE vocabulary_senses
SET meaning_vi = CASE sense_index
    WHEN 2 THEN 'quay lại; trở về'
    WHEN 5 THEN 'khi đề cập đến; về chuyện'
    ELSE meaning_vi
END
WHERE vocabulary_id = (
    SELECT id FROM vocabularies
    WHERE primary_word = '来る' AND primary_kana = 'くる'
    ORDER BY id LIMIT 1
)
  AND sense_index IN (2, 5);

-- ================================================================
-- Phần 4: 来る / くる — ẩn sense 3 (aux-v: trở nên; bắt đầu)
-- ================================================================
UPDATE vocabulary_senses
SET is_hidden = true
WHERE vocabulary_id = (
    SELECT id FROM vocabularies
    WHERE primary_word = '来る' AND primary_kana = 'くる'
    ORDER BY id LIMIT 1
)
  AND sense_index = 3;

-- ================================================================
-- Phần 5: 好き / すき — ẩn sense 5 (dâm đãng; ham muốn)
-- ================================================================
UPDATE vocabulary_senses
SET is_hidden = true
WHERE vocabulary_id = (
    SELECT id FROM vocabularies
    WHERE primary_word = '好き' AND primary_kana = 'すき'
    ORDER BY id LIMIT 1
)
  AND sense_index = 5;

-- ================================================================
-- Phần 6: 嫌い / きらい — ẩn sense 2,3 (nghĩa cổ/hiếm)
-- ================================================================
UPDATE vocabulary_senses
SET is_hidden = true
WHERE vocabulary_id = (
    SELECT id FROM vocabularies
    WHERE primary_word = '嫌い' AND primary_kana = 'きらい'
    ORDER BY id LIMIT 1
)
  AND sense_index IN (2, 3);

-- ================================================================
-- Phần 7: 入る / いる — ẩn sense 4,5 (hậu tố ngữ pháp)
-- ================================================================
UPDATE vocabulary_senses
SET is_hidden = true
WHERE vocabulary_id = (
    SELECT id FROM vocabularies
    WHERE primary_word = '入る' AND primary_kana = 'いる'
    ORDER BY id LIMIT 1
)
  AND sense_index IN (4, 5);

-- ================================================================
-- Phần 8: 働く / はたらく — ẩn sense 4 (thuật ngữ chia động từ)
-- ================================================================
UPDATE vocabulary_senses
SET is_hidden = true
WHERE vocabulary_id = (
    SELECT id FROM vocabularies
    WHERE primary_word = '働く' AND primary_kana = 'はたらく'
    ORDER BY id LIMIT 1
)
  AND sense_index = 4;

-- ================================================================
-- Phần 9: 分かる / わかる — ẩn sense 3 (thán từ [int])
-- ================================================================
UPDATE vocabulary_senses
SET is_hidden = true
WHERE vocabulary_id = (
    SELECT id FROM vocabularies
    WHERE primary_word = '分かる' AND primary_kana = 'わかる'
    ORDER BY id LIMIT 1
)
  AND sense_index = 3;

-- ================================================================
-- Phần 10: 終わる / おわる — ẩn sense 3 (hậu tố [suf])
-- ================================================================
UPDATE vocabulary_senses
SET is_hidden = true
WHERE vocabulary_id = (
    SELECT id FROM vocabularies
    WHERE primary_word = '終わる' AND primary_kana = 'おわる'
    ORDER BY id LIMIT 1
)
  AND sense_index = 3;

-- ================================================================
-- Bước an toàn: khôi phục từ nào bị ẩn toàn bộ (không nên xảy ra)
-- ================================================================
WITH all_hidden AS (
    SELECT vocabulary_id
    FROM   vocabulary_senses
    WHERE  vocabulary_id IS NOT NULL
    GROUP  BY vocabulary_id
    HAVING bool_and(is_hidden) = true
),
first_per_vocab AS (
    SELECT DISTINCT ON (vocabulary_id) id
    FROM   vocabulary_senses
    WHERE  vocabulary_id IN (SELECT vocabulary_id FROM all_hidden)
    ORDER  BY vocabulary_id, sense_index ASC NULLS LAST, id ASC
)
UPDATE vocabulary_senses
SET    is_hidden = false
WHERE  id IN (SELECT id FROM first_per_vocab);

-- ================================================================
-- Xác nhận kết quả
-- ================================================================
SELECT
    v.primary_word,
    v.primary_kana,
    vs.sense_index,
    vs.meaning_vi,
    vs.is_hidden
FROM vocabularies v
JOIN vocabulary_senses vs ON vs.vocabulary_id = v.id
WHERE v.primary_word IN ('行く', '来る', '好き', '嫌い', '入る', '働く', '分かる', '終わる')
  AND v.primary_kana IN ('いく', 'くる', 'すき', 'きらい', 'いる', 'はたらく', 'わかる', 'おわる')
ORDER BY v.primary_word, vs.sense_index;
