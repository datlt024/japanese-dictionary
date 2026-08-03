-- ================================================================
-- AUDIT CUỐI: Kiểm tra chất lượng DB sau migrations 007-013
-- Chạy toàn bộ file trong Supabase SQL Editor
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- 1. TỔNG QUAN
-- ────────────────────────────────────────────────────────────────
SELECT
    COUNT(*)                                                           AS total_senses,
    COUNT(*) FILTER (WHERE is_hidden = false)                          AS visible,
    COUNT(*) FILTER (WHERE is_hidden = true)                           AS hidden,
    COUNT(*) FILTER (WHERE is_hidden = false AND meaning_vi IS NOT NULL) AS visible_có_vi,
    COUNT(*) FILTER (WHERE is_hidden = false AND (meaning_vi IS NULL OR meaning_vi = '')) AS visible_thiếu_vi,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE is_hidden = false AND meaning_vi IS NOT NULL)
        / NULLIF(COUNT(*) FILTER (WHERE is_hidden = false), 0), 1
    )                                                                  AS pct_có_vi
FROM vocabulary_senses;

-- ────────────────────────────────────────────────────────────────
-- 2. PHÂN PHỐI THEO JLPT
-- ────────────────────────────────────────────────────────────────
SELECT
    COALESCE(v.jlpt, 'Không JLPT') AS jlpt,
    COUNT(DISTINCT v.id)            AS số_từ,
    SUM(sc.visible)                 AS visible_senses,
    SUM(sc.hidden)                  AS hidden_senses,
    ROUND(AVG(sc.visible), 1)       AS avg_sense_mỗi_từ
FROM vocabularies v
JOIN (
    SELECT vocabulary_id,
           COUNT(*) FILTER (WHERE is_hidden = false) AS visible,
           COUNT(*) FILTER (WHERE is_hidden = true)  AS hidden
    FROM   vocabulary_senses
    GROUP  BY vocabulary_id
) sc ON sc.vocabulary_id = v.id
GROUP BY v.jlpt
ORDER BY CASE v.jlpt WHEN 'N5' THEN 1 WHEN 'N4' THEN 2 WHEN 'N3' THEN 3
                     WHEN 'N2' THEN 4 WHEN 'N1' THEN 5 ELSE 6 END;

-- ────────────────────────────────────────────────────────────────
-- 3. KIỂM TRA LỖI HỆ THỐNG (KẾT QUẢ PHẢI = 0)
-- ────────────────────────────────────────────────────────────────
SELECT
    -- Tiền tố "để [verb]" sai (migration 008 đã xử lý)
    COUNT(*) FILTER (
        WHERE is_hidden = false
          AND meaning_vi ~* '^để\s+\S'
          AND meaning_vi !~* '^để (lại|ý|dành|tang|mặc|trống|nguyên|yên|không|bụng|răng|chân|đó|riêng|nên|mà|thì|cho|cạnh|trong|ngoài|gần|xa|trước|sau|trên|dưới|giữa|cùng|với|lộ|ngỏ|cử|đặt|sẵn|một)\s'
    )                                   AS de_prefix_lỗi,

    -- Dedup trong ";" (migration 008+009 đã xử lý)
    COUNT(*) FILTER (
        WHERE is_hidden = false
          AND meaning_vi IS NOT NULL
          AND (
              SELECT COUNT(*) - COUNT(DISTINCT lower(trim(p)))
              FROM   unnest(string_to_array(meaning_vi, ';')) AS p
          ) > 0
    )                                   AS dedup_semi_lỗi,

    -- Tiền tố "một [noun]" sai (migration 010 đã xử lý)
    COUNT(*) FILTER (
        WHERE is_hidden = false
          AND meaning_vi ~* '^một\s+\S'
          AND meaning_vi !~* '^một (lần|mình|chút|số|ít|vài|cách|phần|loạt|thứ|khi|lúc|ai|điều|việc|ngày|năm|giờ|phút|giây|tháng|tuần|mặt|bên|loại|tập|bộ|nhóm|dạng|hướng|chiều|trăm|nghìn|triệu)\s'
    )                                   AS mot_prefix_lỗi,

    -- "được sử dụng hết" (migration 012 đã xử lý)
    COUNT(*) FILTER (
        WHERE is_hidden = false
          AND (meaning_vi ILIKE '%được sử dụng hết%' OR meaning_vi ILIKE '%được tiêu thụ%')
    )                                   AS duoc_su_dung_lỗi,

    -- "chắn chắn" trong 守備 (migration 013)
    COUNT(*) FILTER (
        WHERE is_hidden = false
          AND vocabulary_id IN (SELECT id FROM vocabularies WHERE primary_word = '守備')
          AND meaning_vi ILIKE '%chắn chắn%'
    )                                   AS chuubi_lỗi,

    -- と particle còn "nếu" (migration 011b)
    COUNT(*) FILTER (
        WHERE is_hidden = false
          AND vocabulary_id IN (SELECT id FROM vocabularies WHERE primary_word = 'と' AND primary_kana = 'と')
          AND meaning_vi ILIKE '%nếu%'
    )                                   AS to_particle_grammar_lỗi,

    -- に particle còn sense 9 (migration 011)
    COUNT(*) FILTER (
        WHERE is_hidden = false
          AND vocabulary_id IN (SELECT id FROM vocabularies WHERE primary_word = 'に' AND primary_kana = 'に')
          AND sense_index = 9
    )                                   AS ni_particle_sense9_còn,

    -- Tổng visible
    COUNT(*) FILTER (WHERE is_hidden = false) AS total_visible

FROM vocabulary_senses;

-- ────────────────────────────────────────────────────────────────
-- 4. KIỂM TRA CÁC TRỢ TỪ QUAN TRỌNG (migration 011)
-- ────────────────────────────────────────────────────────────────
SELECT
    v.primary_word                                                    AS particle,
    COUNT(*) FILTER (WHERE vs.is_hidden = false)                      AS visible,
    COUNT(*) FILTER (WHERE vs.is_hidden = true)                       AS hidden,
    string_agg(vs.meaning_vi, ' | ' ORDER BY vs.sense_index)
        FILTER (WHERE vs.is_hidden = false)                           AS nghĩa_hiển_thị
FROM vocabularies v
JOIN vocabulary_senses vs ON vs.vocabulary_id = v.id
WHERE v.primary_word IN ('と','に','が','は','を','で','も','から','より','まで',
                         'だけ','しか','こそ','さえ','や','ば','たら','ては','ても')
  AND v.primary_kana = v.primary_word
GROUP BY v.primary_word
ORDER BY CASE v.primary_word
    WHEN 'と' THEN 1  WHEN 'に' THEN 2  WHEN 'が' THEN 3
    WHEN 'は' THEN 4  WHEN 'を' THEN 5  WHEN 'で' THEN 6
    WHEN 'も' THEN 7  WHEN 'から' THEN 8 WHEN 'より' THEN 9
    WHEN 'まで' THEN 10 WHEN 'だけ' THEN 11 WHEN 'しか' THEN 12
    WHEN 'こそ' THEN 13 WHEN 'さえ' THEN 14 WHEN 'や' THEN 15
    WHEN 'ば' THEN 16  WHEN 'たら' THEN 17 WHEN 'ては' THEN 18
    WHEN 'ても' THEN 19 ELSE 99 END;

-- ────────────────────────────────────────────────────────────────
-- 5. SPOT-CHECK N5 — toàn bộ từ N5
-- ────────────────────────────────────────────────────────────────
SELECT
    v.primary_word,
    v.primary_kana,
    COUNT(vs.id) FILTER (WHERE vs.is_hidden = false)   AS visible_senses,
    COUNT(vs.id) FILTER (WHERE vs.is_hidden = true)    AS hidden_senses,
    string_agg(vs.meaning_vi, ' | ' ORDER BY vs.sense_index)
        FILTER (WHERE vs.is_hidden = false)             AS nghĩa
FROM vocabularies v
JOIN vocabulary_senses vs ON vs.vocabulary_id = v.id
WHERE v.jlpt = 'N5'
GROUP BY v.id, v.primary_word, v.primary_kana
ORDER BY v.primary_word
LIMIT 60;

-- ────────────────────────────────────────────────────────────────
-- 6. KIỂM TRA TỪ ĐÃ FIX (migration 007, 012)
-- ────────────────────────────────────────────────────────────────
SELECT
    v.primary_word,
    v.primary_kana,
    vs.sense_index,
    vs.is_hidden,
    vs.meaning_vi
FROM vocabularies v
JOIN vocabulary_senses vs ON vs.vocabulary_id = v.id
WHERE v.primary_word IN ('行く','来る','好き','嫌い','尽きる','無くなる','溶ける','召す','模様','守備')
  AND v.primary_kana IN ('いく','くる','すき','きらい','つきる','なくなる','とける','めす','もよう','しゅび')
ORDER BY v.primary_word, vs.sense_index;
