-- Migration 008: Dọn lỗi dịch hệ thống trên toàn bộ DB (~17,000+ sense)
--
-- Phát hiện từ scan 217,205 sense trong batch files:
--
--   • Trùng lặp trong danh sách ";"  : ~13,447 sense
--       "rõ ràng; hiển nhiên; rõ ràng; công khai"
--       → "rõ ràng; hiển nhiên; công khai"
--
--   • Tiền tố "để " sai (dịch "to")  : ~3,139 sense
--       "để nhận được sự hỗ trợ; để thực hiện"
--       → "nhận được sự hỗ trợ; thực hiện"
--       (Bảo vệ các cụm từ hợp lệ: để lại, để ý, để dành, để tang...)
--
--   • Ngoặc lặp lại "(word)"         : ~1,331 sense
--       "ném bóng tốt (tốt)", "người khéo léo (khéo léo)"
--       → "ném bóng tốt", "người khéo léo"
--
-- Idempotent — an toàn khi chạy lại.

-- ================================================================
-- Hàm phụ trợ
-- ================================================================

-- Hàm 1: Loại phần tử trùng trong chuỗi phân cách bởi ";"
-- Giữ thứ tự, không phân biệt hoa/thường, trim khoảng trắng
CREATE OR REPLACE FUNCTION yomi_dedup_semicolons(v text)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    parts   text[];
    seen    text[];
    result  text[];
    p       text;
BEGIN
    IF v IS NULL OR v = '' THEN RETURN v; END IF;
    parts  := string_to_array(v, ';');
    result := ARRAY[]::text[];
    seen   := ARRAY[]::text[];
    FOREACH p IN ARRAY parts LOOP
        p := trim(p);
        IF p = '' THEN CONTINUE; END IF;
        IF NOT (lower(p) = ANY(seen)) THEN
            result := result || p;
            seen   := seen   || lower(p);
        END IF;
    END LOOP;
    RETURN array_to_string(result, '; ');
END;
$$;

-- Hàm 2: Xoá tiền tố "để " dịch sai từ "to" trong tiếng Anh
-- Bảo vệ các cụm từ hợp lệ: để lại, để ý, để dành, để tang, để mặc, ...
CREATE OR REPLACE FUNCTION yomi_remove_de_prefix(v text)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    parts     text[];
    result    text[];
    p         text;
    fw        text;
    -- Từ đứng sau "để" mà vẫn là cụm từ hợp lệ trong tiếng Việt
    protected text[] := ARRAY[
        'lại', 'ý', 'dành', 'tang', 'mặc', 'trống', 'nguyên', 'yên',
        'không', 'bụng', 'răng', 'chân', 'đó', 'riêng', 'một', 'thì',
        'nên', 'mà', 'cho', 'cạnh', 'trong', 'ngoài', 'gần', 'xa',
        'trước', 'sau', 'trên', 'dưới', 'giữa', 'cùng', 'với'
    ];
BEGIN
    IF v IS NULL OR v = '' THEN RETURN v; END IF;
    parts  := string_to_array(v, ';');
    result := ARRAY[]::text[];
    FOREACH p IN ARRAY parts LOOP
        p := trim(p);
        IF p ~* '^để\s+\S' THEN
            -- Lấy từ đầu tiên sau "để "
            fw := lower(trim(regexp_replace(p, '^để\s+', '', 'i')));
            fw := split_part(fw, ' ', 1);
            fw := regexp_replace(fw, '[;,.\s]+$', '');
            IF fw = ANY(protected) THEN
                -- Giữ nguyên (cụm từ hợp lệ như "để lại", "để ý", "để dành")
                result := result || p;
            ELSE
                -- Bỏ tiền tố "để " sai
                result := result || trim(regexp_replace(p, '^để\s+', '', 'i'));
            END IF;
        ELSE
            result := result || p;
        END IF;
    END LOOP;
    RETURN array_to_string(result, '; ');
END;
$$;

-- Hàm 3: Xoá ngoặc đơn lặp lại nội dung đã có trong chuỗi
-- "ném bóng tốt (tốt)" → "ném bóng tốt"
-- "người khéo léo (khéo léo)" → "người khéo léo"
-- Chỉ xoá khi nội dung ngoặc (1–20 ký tự) xuất hiện y hệt trước ngoặc
CREATE OR REPLACE FUNCTION yomi_remove_paren_dup(v text)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    result text;
    m      text[];
    before text;
    inner_ text;
    after_ text;
    max_iter int := 10;
    i int := 0;
BEGIN
    IF v IS NULL OR v = '' THEN RETURN v; END IF;
    result := v;
    WHILE i < max_iter LOOP
        i := i + 1;
        m := regexp_match(result, '^(.*?)\s*\(([^)]{1,20})\)(.*)$');
        IF m IS NULL THEN EXIT; END IF;
        before := m[1];
        inner_ := m[2];
        after_ := coalesce(m[3], '');
        -- Nội dung ngoặc có xuất hiện nguyên văn trong phần trước?
        IF LOWER(before) LIKE '%' || LOWER(inner_) || '%' THEN
            result := trim(before) || after_;
        ELSE
            EXIT;  -- không phải lặp → dừng
        END IF;
    END LOOP;
    RETURN result;
END;
$$;

-- ================================================================
-- Bước 1: Xoá tiền tố "để " sai (ưu tiên trước dedup)
-- ================================================================
UPDATE vocabulary_senses
SET    meaning_vi = yomi_remove_de_prefix(meaning_vi)
WHERE  is_hidden  = false
  AND  meaning_vi IS NOT NULL
  AND  meaning_vi ~* '(^|;\s*)để\s+\S'
  AND  meaning_vi IS DISTINCT FROM yomi_remove_de_prefix(meaning_vi);

-- ================================================================
-- Bước 2: Loại bỏ trùng lặp trong danh sách ";"
-- ================================================================
UPDATE vocabulary_senses
SET    meaning_vi = yomi_dedup_semicolons(meaning_vi)
WHERE  is_hidden  = false
  AND  meaning_vi IS NOT NULL
  AND  meaning_vi LIKE '%;%'
  AND  meaning_vi IS DISTINCT FROM yomi_dedup_semicolons(meaning_vi);

-- ================================================================
-- Bước 3: Xoá ngoặc đơn lặp lại
-- ================================================================
UPDATE vocabulary_senses
SET    meaning_vi = yomi_remove_paren_dup(meaning_vi)
WHERE  is_hidden  = false
  AND  meaning_vi IS NOT NULL
  AND  meaning_vi ~ '\([^)]{2,20}\)'
  AND  meaning_vi IS DISTINCT FROM yomi_remove_paren_dup(meaning_vi);

-- ================================================================
-- Dọn hàm tạm (giữ lại nếu muốn dùng lại sau)
-- ================================================================
-- DROP FUNCTION IF EXISTS yomi_dedup_semicolons(text);
-- DROP FUNCTION IF EXISTS yomi_remove_de_prefix(text);
-- DROP FUNCTION IF EXISTS yomi_remove_paren_dup(text);

-- ================================================================
-- Thống kê sau khi chạy
-- ================================================================
SELECT
    COUNT(*) FILTER (WHERE is_hidden = false AND meaning_vi IS NOT NULL)   AS total_visible_with_vi,
    COUNT(*) FILTER (WHERE is_hidden = false AND meaning_vi LIKE '%;%')    AS có_nhiều_nghĩa,
    COUNT(*) FILTER (
        WHERE is_hidden = false
          AND meaning_vi IS NOT NULL
          AND meaning_vi ~* '(^|;\s*)để\s+\S'
    )                                                                       AS còn_de_prefix,
    COUNT(*) FILTER (
        WHERE is_hidden = false
          AND meaning_vi IS NOT NULL
          AND meaning_vi ~ '\([^)]{2,20}\)'
    )                                                                       AS có_ngoặc
FROM vocabulary_senses;

-- Spot-check: xem kết quả trên một số từ tiêu biểu
SELECT
    v.primary_word,
    v.primary_kana,
    string_agg(vs.meaning_vi, ' | ' ORDER BY vs.sense_index) AS nghia_vi
FROM vocabularies v
JOIN vocabulary_senses vs ON vs.vocabulary_id = v.id AND vs.is_hidden = false
WHERE v.primary_word IN ('明白', '合う', '出る', '取る', '使う', 'お世話になる', '好投', '好物', '巧者')
GROUP BY v.id, v.primary_word, v.primary_kana
ORDER BY v.primary_word;
