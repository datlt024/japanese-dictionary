-- ============================================================
-- AUDIT: Đánh giá chất lượng vocabulary_senses sau cleanup
-- Chạy trong Supabase Dashboard > SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────────
-- 1. Tổng quan: hidden vs visible
-- ────────────────────────────────────────────────────────────────
SELECT
    CASE is_hidden WHEN true THEN 'Đã ẩn' ELSE 'Hiển thị' END AS trạng_thái,
    COUNT(*)                       AS số_sense,
    COUNT(DISTINCT vocabulary_id)  AS số_từ,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS tỷ_lệ
FROM vocabulary_senses
GROUP BY is_hidden
ORDER BY is_hidden;

-- ────────────────────────────────────────────────────────────────
-- 2. Phủ sóng tiếng Việt (visible senses)
-- ────────────────────────────────────────────────────────────────
SELECT
    COUNT(*)                                                                AS total_visible,
    COUNT(CASE WHEN meaning_vi IS NOT NULL AND meaning_vi != '' THEN 1 END) AS có_meaning_vi,
    COUNT(CASE WHEN meaning_vi IS NULL OR meaning_vi = ''       THEN 1 END) AS thiếu_meaning_vi,
    ROUND(
        COUNT(CASE WHEN meaning_vi IS NOT NULL AND meaning_vi != '' THEN 1 END) * 100.0
        / NULLIF(COUNT(*), 0), 1
    )                                                                       AS tỷ_lệ_có_vi
FROM vocabulary_senses
WHERE is_hidden = false;

-- ────────────────────────────────────────────────────────────────
-- 3. Từ vựng hoàn toàn không có meaning_vi (visible senses)
--    Đây là những từ hiển thị nhưng không dịch được sang tiếng Việt
-- ────────────────────────────────────────────────────────────────
SELECT
    v.primary_word,
    v.primary_kana,
    v.jlpt,
    vs.meaning_en,
    vs.part_of_speech
FROM vocabularies v
JOIN vocabulary_senses vs ON vs.vocabulary_id = v.id
WHERE vs.is_hidden = false
  AND (vs.meaning_vi IS NULL OR vs.meaning_vi = '')
  AND v.jlpt IN ('N5', 'N4', 'N3')   -- ưu tiên kiểm tra JLPT thấp
ORDER BY
    CASE v.jlpt WHEN 'N5' THEN 1 WHEN 'N4' THEN 2 WHEN 'N3' THEN 3 ELSE 9 END,
    v.primary_word
LIMIT 30;

-- ────────────────────────────────────────────────────────────────
-- 4. Phân phối số sense theo JLPT (trung bình, max, histogram)
-- ────────────────────────────────────────────────────────────────
SELECT
    COALESCE(v.jlpt, 'không có JLPT') AS jlpt,
    COUNT(DISTINCT v.id)               AS số_từ,
    ROUND(AVG(sc.cnt), 2)              AS tb_sense,
    MIN(sc.cnt)                        AS min_sense,
    MAX(sc.cnt)                        AS max_sense,
    COUNT(CASE WHEN sc.cnt = 1 THEN 1 END) AS từ_có_1_sense,
    COUNT(CASE WHEN sc.cnt = 2 THEN 1 END) AS từ_có_2_sense,
    COUNT(CASE WHEN sc.cnt >= 3 THEN 1 END) AS từ_có_3plus_sense
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
-- 5. Kiểm tra duplicate meaning_vi còn sót lại
--    (same meaning_vi, same vocabulary_id, cả hai visible)
-- ────────────────────────────────────────────────────────────────
SELECT
    v.primary_word,
    v.primary_kana,
    lower(trim(vs.meaning_vi)) AS nghia_trung_lap,
    COUNT(*) AS so_lan_xuat_hien
FROM vocabulary_senses vs
JOIN vocabularies v ON v.id = vs.vocabulary_id
WHERE vs.is_hidden = false
  AND vs.meaning_vi IS NOT NULL
  AND vs.meaning_vi != ''
GROUP BY v.id, v.primary_word, v.primary_kana, lower(trim(vs.meaning_vi))
HAVING COUNT(*) > 1
ORDER BY so_lan_xuat_hien DESC, v.primary_word
LIMIT 20;

-- ────────────────────────────────────────────────────────────────
-- 6. Sense aux-v còn lại đang visible (nếu có → 006 chưa chạy hoặc bị bỏ qua)
-- ────────────────────────────────────────────────────────────────
SELECT
    v.primary_word,
    v.primary_kana,
    vs.meaning_vi,
    vs.part_of_speech
FROM vocabulary_senses vs
JOIN vocabularies v ON v.id = vs.vocabulary_id
WHERE vs.is_hidden = false
  AND vs.part_of_speech IS NOT NULL
  AND (
        'aux-v'   = ANY(vs.part_of_speech)
     OR 'aux'     = ANY(vs.part_of_speech)
     OR 'aux-adj' = ANY(vs.part_of_speech)
  )
ORDER BY v.primary_word
LIMIT 30;

-- ────────────────────────────────────────────────────────────────
-- 7. Những lý do ẩn (breakdown theo điều kiện)
-- ────────────────────────────────────────────────────────────────
SELECT
    CASE
        WHEN misc IS NOT NULL AND (
             'arch'  = ANY(misc) OR 'obs'   = ANY(misc) OR 'rare' = ANY(misc)
          OR 'obsc'  = ANY(misc) OR 'hist'  = ANY(misc) OR 'dated'= ANY(misc)
          OR 'poet'  = ANY(misc)
        ) THEN 'cổ ngữ / hiếm / lịch sử'
        WHEN misc IS NOT NULL AND (
             'organization' = ANY(misc) OR 'company' = ANY(misc)
          OR 'work'         = ANY(misc) OR 'product' = ANY(misc)
        ) THEN 'tên riêng (tổ chức/sản phẩm)'
        WHEN part_of_speech IS NOT NULL AND (
             'aux-v' = ANY(part_of_speech) OR 'aux' = ANY(part_of_speech)
          OR 'aux-adj' = ANY(part_of_speech)
        ) THEN 'ngữ pháp phụ trợ (aux-v/aux)'
        WHEN meaning_vi IS NULL OR meaning_vi = '' THEN 'thiếu meaning_vi'
        ELSE 'bị ẩn bởi cap hoặc duplicate'
    END AS lý_do_ẩn,
    COUNT(*) AS số_sense
FROM vocabulary_senses
WHERE is_hidden = true
GROUP BY lý_do_ẩn
ORDER BY số_sense DESC;

-- ────────────────────────────────────────────────────────────────
-- 8. Từ JLPT N5/N4/N3 có sense quá ngắn (có thể lỗi dịch)
--    meaning_vi dưới 2 ký tự thường là lỗi
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
  AND length(trim(vs.meaning_vi)) <= 2
  AND v.jlpt IN ('N5', 'N4', 'N3')
ORDER BY length(vs.meaning_vi), v.jlpt
LIMIT 30;

-- ────────────────────────────────────────────────────────────────
-- 9. Tóm tắt theo lý do ẩn (cho báo cáo cuối)
-- ────────────────────────────────────────────────────────────────
SELECT
    'Tổng từ trong DB'              AS chỉ_số, COUNT(DISTINCT id)::text AS giá_trị FROM vocabularies
UNION ALL
SELECT 'Từ có ít nhất 1 sense visible', COUNT(DISTINCT vocabulary_id)::text
    FROM vocabulary_senses WHERE is_hidden = false
UNION ALL
SELECT 'Sense visible tổng cộng', COUNT(*)::text
    FROM vocabulary_senses WHERE is_hidden = false
UNION ALL
SELECT 'Sense đã ẩn tổng cộng', COUNT(*)::text
    FROM vocabulary_senses WHERE is_hidden = true
UNION ALL
SELECT 'Sense visible có meaning_vi', COUNT(*)::text
    FROM vocabulary_senses WHERE is_hidden = false AND meaning_vi IS NOT NULL AND meaning_vi != ''
UNION ALL
SELECT '% sense visible có meaning_vi',
    ROUND(
        (SELECT COUNT(*) FROM vocabulary_senses WHERE is_hidden=false AND meaning_vi IS NOT NULL AND meaning_vi!='')
        * 100.0
        / NULLIF((SELECT COUNT(*) FROM vocabulary_senses WHERE is_hidden=false), 0)
    , 1)::text || '%';
