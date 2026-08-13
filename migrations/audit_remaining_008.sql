-- Audit những case còn sót sau migration 008
-- Chạy để xem 62 để-prefix + 38 dup-semi còn lại là gì

-- ─── A. 62 "để " prefix còn lại ──────────────────────────────────
-- Phân loại: thực sự sai hay bị audit query đếm nhầm do protection list hẹp hơn function?
SELECT
    vs.meaning_vi,
    vs.meaning_en,
    -- Từ đầu tiên sau "để "
    split_part(trim(regexp_replace(vs.meaning_vi, '^để\s+', '')), ' ', 1) AS từ_sau_để,
    v.primary_word,
    v.primary_kana,
    v.jlpt
FROM vocabulary_senses vs
JOIN vocabularies v ON v.id = vs.vocabulary_id
WHERE vs.is_hidden = false
  AND vs.meaning_vi ~* '^để\s+'
  AND vs.meaning_vi !~* '^để (lại|ý|dành|tang|mặc|trống|nguyên|yên|không|bụng|chân|đó|riêng|nên|mà|thì)\s'
ORDER BY từ_sau_để, v.primary_word
LIMIT 70;

-- ─── B. 38 semicolon dup còn lại ─────────────────────────────────
-- Thường gặp: khác nhau do dấu câu cuối, khoảng trắng kép, hay ký tự đặc biệt
SELECT
    vs.meaning_vi,
    v.primary_word,
    v.primary_kana,
    -- Liệt kê từng phần tử của chuỗi để thấy chỗ trùng
    array_agg(lower(trim(p)) ORDER BY idx) AS các_phần_tử
FROM vocabulary_senses vs
JOIN vocabularies v ON v.id = vs.vocabulary_id
CROSS JOIN LATERAL unnest(string_to_array(vs.meaning_vi, ';')) WITH ORDINALITY AS t(p, idx)
WHERE vs.is_hidden = false
  AND vs.meaning_vi LIKE '%;%'
  AND (
      SELECT COUNT(*) - COUNT(DISTINCT lower(trim(p2)))
      FROM unnest(string_to_array(vs.meaning_vi, ';')) AS p2
  ) > 0
GROUP BY vs.id, vs.meaning_vi, v.primary_word, v.primary_kana
ORDER BY v.primary_word
LIMIT 40;
