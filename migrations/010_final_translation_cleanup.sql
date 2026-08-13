-- Migration 010: Cleanup cuối — tiền tố "một" + từ lặp thực sự sai
--
-- Vấn đề còn lại sau 007-009:
--
--   (A) "một [danh từ]" — ~797 sense — máy dịch "a/an" thành "một":
--       "một biểu thức; cụm từ"   →  "biểu thức; cụm từ"
--       "một khoảng thời gian"     →  "khoảng thời gian"
--       Bảo vệ: một lần, một mình, một chút, một số, một ít, một vài,
--               một cách (X), một phần, một khi, một lúc, ...
--
--   (B) Từ lặp thực sự sai (không phải từ láy):
--       "đóng cửa cửa hàng"   →  "đóng cửa hàng"      (5 case)
--       "nhện nhện"            →  "nhện"                (4 case — tên loài)
--       "chỉ chỉ"              →  "chỉ"                 (3 case)
--       "hình hình dấu phẩy"   →  "hình dấu phẩy"      (4 case)
--       "buồm buồm"            →  "cánh buồm"           (← ngữ nghĩa sai)
--
-- Idempotent.

-- ================================================================
-- Hàm phụ trợ: xoá tiền tố "một " giả mạo "a/an"
-- ================================================================
CREATE OR REPLACE FUNCTION yomi_remove_mot_prefix(v text)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    parts     text[];
    result    text[];
    p         text;
    fw        text;
    -- Giữ nguyên khi từ sau "một" tạo thành cụm từ cố định
    protected text[] := ARRAY[
        'lần','mình','chút','số','ít','vài','cách','phần',
        'loạt','thứ','khi','lúc','ai','điều','việc',
        'ngày','năm','giờ','phút','giây','tháng','tuần',
        'mặt','bên','loại','tập','bộ','nhóm','dạng',
        'hướng','chiều','trăm','nghìn','triệu'
    ];
BEGIN
    IF v IS NULL OR v = '' THEN RETURN v; END IF;
    parts  := string_to_array(v, ';');
    result := ARRAY[]::text[];
    FOREACH p IN ARRAY parts LOOP
        p := trim(p);
        IF p ~* '^một\s+\S' THEN
            fw := lower(split_part(trim(regexp_replace(p, '^một\s+', '', 'i')), ' ', 1));
            fw := regexp_replace(fw, '[;,.\s]+$', '');
            IF fw = ANY(protected) THEN
                result := result || p;
            ELSE
                result := result || trim(regexp_replace(p, '^một\s+', '', 'i'));
            END IF;
        ELSE
            result := result || p;
        END IF;
    END LOOP;
    RETURN array_to_string(result, '; ');
END;
$$;

-- ================================================================
-- Bước A: Xoá tiền tố "một [danh từ]" artifact
-- ================================================================
UPDATE vocabulary_senses
SET    meaning_vi = yomi_remove_mot_prefix(meaning_vi)
WHERE  is_hidden  = false
  AND  meaning_vi ~* '^một\s+\S'
  AND  meaning_vi IS DISTINCT FROM yomi_remove_mot_prefix(meaning_vi);

-- ================================================================
-- Bước B: Fix từ lặp thực sự sai
-- ================================================================

-- "đóng cửa cửa hàng" → "đóng cửa hàng"
UPDATE vocabulary_senses
SET    meaning_vi = REPLACE(meaning_vi, 'đóng cửa cửa hàng', 'đóng cửa hàng')
WHERE  is_hidden  = false
  AND  meaning_vi LIKE '%đóng cửa cửa hàng%';

-- "nhện nhện" → "nhện" (tên loài nhện mạt - Spider mite)
UPDATE vocabulary_senses
SET    meaning_vi = REGEXP_REPLACE(meaning_vi, 'nhện nhện\b', 'nhện', 'g')
WHERE  is_hidden  = false
  AND  meaning_vi LIKE '%nhện nhện%';

-- "chỉ chỉ" → "chỉ"
UPDATE vocabulary_senses
SET    meaning_vi = REGEXP_REPLACE(meaning_vi, '\bchỉ chỉ\b', 'chỉ', 'g')
WHERE  is_hidden  = false
  AND  meaning_vi LIKE '%chỉ chỉ%';

-- "hình hình dấu" → "hình dấu" (tomoe/thiết kế huy hiệu)
UPDATE vocabulary_senses
SET    meaning_vi = REPLACE(meaning_vi, 'hình hình dấu', 'hình dấu')
WHERE  is_hidden  = false
  AND  meaning_vi LIKE '%hình hình dấu%';

-- "buồm buồm" → "buồm" (sail - 三角帆 = tam giác buồm)
UPDATE vocabulary_senses
SET    meaning_vi = REPLACE(meaning_vi, 'buồm buồm', 'buồm')
WHERE  is_hidden  = false
  AND  meaning_vi LIKE '%buồm buồm%';

-- "bẫy bẫy" → "bẫy"
UPDATE vocabulary_senses
SET    meaning_vi = REPLACE(meaning_vi, 'bẫy bẫy', 'bẫy')
WHERE  is_hidden  = false
  AND  meaning_vi LIKE '%bẫy bẫy%';

-- "thành thành" (trở thành thành ... → artifact)
-- Chỉ fix case "thành thành " (có space sau) để không ảnh hưởng từ láy
UPDATE vocabulary_senses
SET    meaning_vi = REGEXP_REPLACE(meaning_vi, '\bthành thành\b', 'thành', 'g')
WHERE  is_hidden  = false
  AND  meaning_vi LIKE '%thành thành%'
  AND  meaning_vi !~* 'trở thành thành (công|phần|viên)';

-- ================================================================
-- Bước C: Chạy lại dedup (migrate 009 đã timeout, đảm bảo sạch)
-- ================================================================
UPDATE vocabulary_senses
SET    meaning_vi = yomi_dedup_semicolons(meaning_vi)
WHERE  is_hidden  = false
  AND  meaning_vi IS NOT NULL
  AND  (
      SELECT COUNT(*) - COUNT(DISTINCT lower(trim(p)))
      FROM   unnest(string_to_array(meaning_vi, ';')) AS p
  ) > 0;

-- ================================================================
-- Bước D: An toàn — mỗi từ còn ít nhất 1 sense
-- ================================================================
WITH all_hidden AS (
    SELECT vocabulary_id FROM vocabulary_senses
    WHERE  vocabulary_id IS NOT NULL
    GROUP  BY vocabulary_id
    HAVING bool_and(is_hidden) = true
),
first_per AS (
    SELECT DISTINCT ON (vocabulary_id) id
    FROM   vocabulary_senses
    WHERE  vocabulary_id IN (SELECT vocabulary_id FROM all_hidden)
    ORDER  BY vocabulary_id, sense_index ASC NULLS LAST, id ASC
)
UPDATE vocabulary_senses SET is_hidden = false
WHERE  id IN (SELECT id FROM first_per);

-- ================================================================
-- Thống kê cuối
-- ================================================================
SELECT
    COUNT(*) FILTER (WHERE is_hidden = false)                             AS total_visible,
    COUNT(*) FILTER (WHERE is_hidden = false AND meaning_vi ~* '^một\s') AS con_mot_prefix,
    COUNT(*) FILTER (
        WHERE is_hidden = false
          AND meaning_vi IS NOT NULL
          AND (SELECT COUNT(*) - COUNT(DISTINCT lower(trim(p)))
               FROM unnest(string_to_array(meaning_vi, ';')) AS p) > 0
    )                                                                      AS con_dup_semi,
    COUNT(*) FILTER (
        WHERE is_hidden = false
          AND meaning_vi ~* '^để\s+'
          AND meaning_vi !~* '^để (lại|ý|dành|tang|mặc|trống|nguyên|yên|không)\s'
    )                                                                      AS con_de_prefix
FROM vocabulary_senses;
