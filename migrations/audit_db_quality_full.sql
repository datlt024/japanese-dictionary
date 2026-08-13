-- ============================================================
-- AUDIT: Kiểm tra chất lượng dịch toàn bộ DB (~200k từ)
-- Chạy trong Supabase Dashboard > SQL Editor
--
-- Mục đích: Phát hiện lỗi hệ thống có thể fix bằng SQL,
--   không phải kiểm tra thủ công từng từ.
-- ============================================================

-- ────────────────────────────────────────────────────────────────
-- 1. Tổng quan: visible sense / meaning_vi coverage
-- ────────────────────────────────────────────────────────────────
SELECT
    COUNT(*)                                                                   AS total_visible,
    COUNT(*) FILTER (WHERE meaning_vi IS NOT NULL AND meaning_vi != '')        AS có_vi,
    COUNT(*) FILTER (WHERE meaning_vi IS NULL OR meaning_vi = '')              AS thiếu_vi,
    COUNT(*) FILTER (WHERE meaning_vi LIKE '%;%')                              AS có_nhiều_nghĩa,
    ROUND(AVG(length(meaning_vi)) FILTER (WHERE meaning_vi IS NOT NULL), 1)   AS tb_độ_dài_vi
FROM vocabulary_senses
WHERE is_hidden = false;

-- ────────────────────────────────────────────────────────────────
-- 2. Lỗi hệ thống: đếm từng loại pattern lỗi
-- ────────────────────────────────────────────────────────────────
SELECT
    SUM(CASE WHEN meaning_vi ~* '(^|;\s*)để\s+[^lýđdtmnkcrgb]'
             THEN 1 ELSE 0 END)                                AS de_prefix_lỗi,
    SUM(CASE WHEN meaning_vi LIKE '%;%'
             AND lower(meaning_vi) ~ '(\w[\wÀ-ỹ]{3,})[^;]*;\s*\1'
             THEN 1 ELSE 0 END)                                AS dup_trong_semi,
    SUM(CASE WHEN meaning_vi ~ '\([^)]{2,20}\)'
             THEN 1 ELSE 0 END)                                AS có_ngoặc_đơn,
    SUM(CASE WHEN meaning_vi ~* '\b[a-zA-Z]{5,}\b'
             AND meaning_vi !~* '\b(nhật|việt|anh|pháp|đức|nga|hàn|trung|kanji|katakana|hiragana|jlpt|anime|manga|sushi|ramen|tofu|kimono|sake|zen|haiku)\b'
             THEN 1 ELSE 0 END)                                AS english_lẫn_vào,
    SUM(CASE WHEN length(meaning_vi) > 120 THEN 1 ELSE 0 END) AS quá_dài_120,
    SUM(CASE WHEN length(trim(meaning_vi)) <= 2 THEN 1 ELSE 0 END) AS quá_ngắn
FROM vocabulary_senses
WHERE is_hidden = false
  AND meaning_vi IS NOT NULL;

-- ────────────────────────────────────────────────────────────────
-- 3. "để " prefix lỗi — xem 30 ví dụ
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
  AND vs.meaning_vi ~* '^để\s+'
  AND vs.meaning_vi !~* '^để (lại|ý|dành|tang|mặc|trống|nguyên|yên|không|bụng|chân|đó|riêng|nên|mà|thì)\s'
ORDER BY
    CASE v.jlpt WHEN 'N5' THEN 1 WHEN 'N4' THEN 2 WHEN 'N3' THEN 3
                WHEN 'N2' THEN 4 WHEN 'N1' THEN 5 ELSE 6 END,
    v.primary_word
LIMIT 30;

-- ────────────────────────────────────────────────────────────────
-- 4. Trùng lặp trong chuỗi ";" — 30 ví dụ tệ nhất
-- ────────────────────────────────────────────────────────────────
SELECT
    v.primary_word,
    v.primary_kana,
    vs.meaning_vi,
    -- Đếm số phần bị trùng
    (
        SELECT COUNT(*) - COUNT(DISTINCT lower(trim(p)))
        FROM unnest(string_to_array(vs.meaning_vi, ';')) AS p
    ) AS số_bản_sao
FROM vocabulary_senses vs
JOIN vocabularies v ON v.id = vs.vocabulary_id
WHERE vs.is_hidden = false
  AND vs.meaning_vi LIKE '%;%'
  AND (
      SELECT COUNT(*) - COUNT(DISTINCT lower(trim(p)))
      FROM unnest(string_to_array(vs.meaning_vi, ';')) AS p
  ) > 0
ORDER BY số_bản_sao DESC, v.primary_word
LIMIT 30;

-- ────────────────────────────────────────────────────────────────
-- 5. Ngoặc đơn lặp — 20 ví dụ
-- ────────────────────────────────────────────────────────────────
SELECT
    v.primary_word,
    v.primary_kana,
    vs.meaning_vi
FROM vocabulary_senses vs
JOIN vocabularies v ON v.id = vs.vocabulary_id
WHERE vs.is_hidden = false
  AND vs.meaning_vi ~ '\s\(\w[\wÀ-ỹ\s]{1,18}\)'
ORDER BY v.primary_word
LIMIT 20;

-- ────────────────────────────────────────────────────────────────
-- 6. Phân phối số sense visible theo JLPT sau cleanup
-- ────────────────────────────────────────────────────────────────
SELECT
    COALESCE(v.jlpt, 'không JLPT') AS jlpt,
    COUNT(DISTINCT v.id)            AS số_từ,
    ROUND(AVG(sc.cnt), 2)          AS tb_sense_mỗi_từ,
    MAX(sc.cnt)                    AS max_sense,
    COUNT(CASE WHEN sc.cnt = 1 THEN 1 END) AS từ_1_sense,
    COUNT(CASE WHEN sc.cnt BETWEEN 2 AND 4 THEN 1 END) AS từ_2_4_sense,
    COUNT(CASE WHEN sc.cnt >= 5  THEN 1 END) AS từ_5plus_sense
FROM vocabularies v
JOIN (
    SELECT vocabulary_id, COUNT(*) AS cnt
    FROM   vocabulary_senses
    WHERE  is_hidden = false
    GROUP  BY vocabulary_id
) sc ON sc.vocabulary_id = v.id
GROUP BY v.jlpt
ORDER BY
    CASE v.jlpt WHEN 'N5' THEN 1 WHEN 'N4' THEN 2 WHEN 'N3' THEN 3
                WHEN 'N2' THEN 4 WHEN 'N1' THEN 5 ELSE 6 END;

-- ────────────────────────────────────────────────────────────────
-- 7. Nghĩa quá dài (> 120 ký tự) — có thể là giải thích, không phải dịch
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
  AND length(vs.meaning_vi) > 120
ORDER BY length(vs.meaning_vi) DESC
LIMIT 25;

-- ────────────────────────────────────────────────────────────────
-- 8. Nghĩa giống hệt nhau trên nhiều từ khác nhau (top 30)
--    Ví dụ: nhiều từ đều có sense = "dừng lại" → có thể quá chung chung
-- ────────────────────────────────────────────────────────────────
SELECT
    meaning_vi,
    COUNT(DISTINCT vocabulary_id) AS số_từ_khác_nhau,
    COUNT(*)                      AS số_lần_xuất_hiện
FROM vocabulary_senses
WHERE is_hidden = false
  AND meaning_vi IS NOT NULL
  AND length(meaning_vi) BETWEEN 3 AND 30
GROUP BY meaning_vi
HAVING COUNT(DISTINCT vocabulary_id) >= 50
ORDER BY số_từ_khác_nhau DESC
LIMIT 30;

-- ────────────────────────────────────────────────────────────────
-- 9. N5/N4 quality spot-check: kiểm tra tất cả từ N5 (không random)
-- ────────────────────────────────────────────────────────────────
SELECT
    v.primary_word,
    v.primary_kana,
    COUNT(vs.id) AS số_sense,
    string_agg(vs.meaning_vi, ' | ' ORDER BY vs.sense_index) AS tất_cả_nghĩa,
    bool_or(vs.meaning_vi ~* '^để\s')                        AS có_lỗi_de,
    bool_or(
        EXISTS(
            SELECT 1 FROM unnest(string_to_array(vs.meaning_vi, ';')) p
            GROUP BY lower(trim(p)) HAVING COUNT(*) > 1
        )
    )                                                         AS có_lỗi_dup
FROM vocabularies v
JOIN vocabulary_senses vs ON vs.vocabulary_id = v.id AND vs.is_hidden = false
WHERE v.jlpt = 'N5'
GROUP BY v.id, v.primary_word, v.primary_kana
ORDER BY v.primary_word;

-- ────────────────────────────────────────────────────────────────
-- 10. Tóm tắt số lỗi còn lại (chạy lại sau migration 008 để xác nhận = 0)
-- ────────────────────────────────────────────────────────────────
SELECT
    'Còn lỗi de prefix'  AS loại,
    COUNT(*) AS số_lượng
FROM vocabulary_senses
WHERE is_hidden = false
  AND meaning_vi ~* '^để\s+'
  AND meaning_vi !~* '^để (lại|ý|dành|tang|mặc|trống|nguyên|yên|không|bụng|chân|đó|riêng|nên|mà|thì)\s'
UNION ALL
SELECT
    'Còn lỗi dup semi' AS loại,
    COUNT(*) AS số_lượng
FROM vocabulary_senses
WHERE is_hidden = false
  AND meaning_vi LIKE '%;%'
  AND (
      SELECT COUNT(*) - COUNT(DISTINCT lower(trim(p)))
      FROM unnest(string_to_array(meaning_vi, ';')) AS p
  ) > 0
UNION ALL
SELECT
    'Sense visible tổng' AS loại,
    COUNT(*) AS số_lượng
FROM vocabulary_senses
WHERE is_hidden = false;
