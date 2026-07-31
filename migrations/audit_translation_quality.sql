-- ============================================================
-- AUDIT: Chất lượng bản dịch meaning_vi
-- ============================================================

-- ────────────────────────────────────────────────────────────────
-- 1. Phân phối độ dài meaning_vi
--    Ngắn quá (< 3 ký tự) hoặc dài quá (> 80 ký tự) đều đáng ngờ
-- ────────────────────────────────────────────────────────────────
SELECT
    CASE
        WHEN length(meaning_vi) <= 2  THEN '≤2 ký tự (khả năng lỗi)'
        WHEN length(meaning_vi) <= 5  THEN '3–5 ký tự'
        WHEN length(meaning_vi) <= 15 THEN '6–15 ký tự (lý tưởng)'
        WHEN length(meaning_vi) <= 40 THEN '16–40 ký tự (chấp nhận được)'
        WHEN length(meaning_vi) <= 80 THEN '41–80 ký tự (hơi dài)'
        ELSE                               '>80 ký tự (có thể là giải thích, không phải dịch)'
    END AS nhóm_độ_dài,
    COUNT(*) AS số_sense,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS tỷ_lệ
FROM vocabulary_senses
WHERE is_hidden = false
  AND meaning_vi IS NOT NULL
GROUP BY nhóm_độ_dài
ORDER BY MIN(length(meaning_vi));

-- ────────────────────────────────────────────────────────────────
-- 2. Nghĩa có lẫn tiếng Anh (dấu hiệu dịch kém hoặc chưa dịch)
--    Tìm pattern "to X", " the ", " and ", dấu nháy kép kiểu English
-- ────────────────────────────────────────────────────────────────
SELECT
    v.primary_word,
    v.primary_kana,
    v.jlpt,
    vs.meaning_vi,
    vs.meaning_en
FROM vocabulary_senses vs
JOIN vocabularies v ON v.id = vs.vocabulary_id
WHERE vs.is_hidden = false
  AND vs.meaning_vi IS NOT NULL
  AND (
        vs.meaning_vi ~* '^to '
     OR vs.meaning_vi ~* ' to '
     OR vs.meaning_vi ~* '\bthe\b'
     OR vs.meaning_vi ~* '\band\b'
     OR vs.meaning_vi ~* '\bor\b'
     OR vs.meaning_vi ~* '\bof\b'
     OR vs.meaning_vi ~* '\ba\b '
     OR vs.meaning_vi ~* '[a-zA-Z]{4,}'   -- chuỗi tiếng Anh liên tiếp ≥ 4 ký tự
  )
ORDER BY
    CASE v.jlpt WHEN 'N5' THEN 1 WHEN 'N4' THEN 2 WHEN 'N3' THEN 3
                WHEN 'N2' THEN 4 WHEN 'N1' THEN 5 ELSE 6 END,
    v.primary_word
LIMIT 40;

-- ────────────────────────────────────────────────────────────────
-- 3. Nghĩa quá ngắn (≤ 3 ký tự) — tất cả JLPT
--    Thường là lỗi: ký tự đơn, "…", "-", "—", hoặc dịch thiếu
-- ────────────────────────────────────────────────────────────────
SELECT
    v.primary_word,
    v.primary_kana,
    v.jlpt,
    vs.meaning_vi,
    vs.meaning_en,
    length(vs.meaning_vi) AS độ_dài
FROM vocabulary_senses vs
JOIN vocabularies v ON v.id = vs.vocabulary_id
WHERE vs.is_hidden = false
  AND vs.meaning_vi IS NOT NULL
  AND length(trim(vs.meaning_vi)) <= 3
ORDER BY length(vs.meaning_vi), v.jlpt NULLS LAST
LIMIT 40;

-- ────────────────────────────────────────────────────────────────
-- 4. Nghĩa quá dài (> 80 ký tự) — dấu hiệu giải thích thay vì dịch
--    Từ điển nên có nghĩa ngắn gọn, không phải câu giải thích dài
-- ────────────────────────────────────────────────────────────────
SELECT
    v.primary_word,
    v.primary_kana,
    v.jlpt,
    vs.meaning_vi,
    length(vs.meaning_vi) AS độ_dài
FROM vocabulary_senses vs
JOIN vocabularies v ON v.id = vs.vocabulary_id
WHERE vs.is_hidden = false
  AND vs.meaning_vi IS NOT NULL
  AND length(vs.meaning_vi) > 80
ORDER BY length(vs.meaning_vi) DESC
LIMIT 30;

-- ────────────────────────────────────────────────────────────────
-- 5. Các nghĩa phổ biến nhất (top 40)
--    Nhìn vào list này để đánh giá pattern: có tự nhiên không,
--    có bị lặp pattern máy móc không?
-- ────────────────────────────────────────────────────────────────
SELECT
    meaning_vi,
    COUNT(*)                      AS số_lần_xuất_hiện,
    COUNT(DISTINCT vocabulary_id) AS số_từ_khác_nhau
FROM vocabulary_senses
WHERE is_hidden = false
  AND meaning_vi IS NOT NULL
GROUP BY meaning_vi
ORDER BY số_lần_xuất_hiện DESC
LIMIT 40;

-- ────────────────────────────────────────────────────────────────
-- 6. Sample ngẫu nhiên từ N5 để review thủ công
--    Đây là các từ cơ bản nhất — chất lượng dịch phải cao nhất
-- ────────────────────────────────────────────────────────────────
SELECT
    v.primary_word,
    v.primary_kana,
    string_agg(vs.meaning_vi, ' | ' ORDER BY vs.sense_index) AS tất_cả_nghĩa_vi,
    string_agg(vs.meaning_en, ' | ' ORDER BY vs.sense_index) AS tất_cả_nghĩa_en
FROM vocabularies v
JOIN vocabulary_senses vs ON vs.vocabulary_id = v.id AND vs.is_hidden = false
WHERE v.jlpt = 'N5'
GROUP BY v.id, v.primary_word, v.primary_kana
ORDER BY random()
LIMIT 30;

-- ────────────────────────────────────────────────────────────────
-- 7. So sánh meaning_vi vs meaning_en: tìm trường hợp giống nhau
--    (dịch không đổi → có thể là fallback chưa dịch)
-- ────────────────────────────────────────────────────────────────
SELECT
    v.primary_word,
    v.primary_kana,
    v.jlpt,
    vs.meaning_vi,
    vs.meaning_en
FROM vocabulary_senses vs
JOIN vocabularies v ON v.id = vs.vocabulary_id
WHERE vs.is_hidden = false
  AND vs.meaning_vi IS NOT NULL
  AND vs.meaning_en IS NOT NULL
  AND lower(trim(vs.meaning_vi)) = lower(trim(vs.meaning_en))
ORDER BY v.jlpt NULLS LAST, v.primary_word
LIMIT 30;

-- ────────────────────────────────────────────────────────────────
-- 8. Từ vựng N5/N4 nên có — kiểm tra một vài từ cụ thể
--    Xem bản dịch của các từ thường gặp nhất có ổn không
-- ────────────────────────────────────────────────────────────────
SELECT
    v.primary_word,
    v.primary_kana,
    vs.sense_index,
    vs.meaning_vi,
    vs.meaning_en,
    vs.part_of_speech
FROM vocabularies v
JOIN vocabulary_senses vs ON vs.vocabulary_id = v.id AND vs.is_hidden = false
WHERE v.primary_word IN (
    '食べる', '飲む', '行く', '来る', '見る', '聞く', '話す', '書く', '読む',
    '買う', '売る', '作る', '使う', '思う', '知る', '分かる', '始める',
    '終わる', '出る', '入る', '帰る', '起きる', '寝る', '働く', '勉強する',
    '大きい', '小さい', '新しい', '古い', '高い', '安い', '好き', '嫌い'
)
ORDER BY v.primary_word, vs.sense_index;
