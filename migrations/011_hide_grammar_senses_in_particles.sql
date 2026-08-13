-- Migration 011: Ẩn nghĩa ngữ pháp lẫn vào từ vựng của các trợ từ
--
-- Vấn đề: Các trợ từ (と、に、が、も、や、こそ、さえ、で) có cả nghĩa từ vựng
-- thuần lẫn nghĩa chỉ xuất hiện trong cấu trúc ngữ pháp (V-ると → "nếu",
-- V-ないで → "mà không", さえ〜ば → "miễn là"...). Nghĩa ngữ pháp đã được
-- xử lý riêng trong bảng grammars — không cần hiển thị trong vocabulary.
--
-- Nguyên tắc quyết định:
--   GIỮ: nghĩa của trợ từ không phụ thuộc vào hình thức chia của động từ đứng trước
--   ẨN:  nghĩa chỉ có trong cấu trúc "V-[dạng]-particle" (cấu trúc ngữ pháp)
--
-- Idempotent — an toàn khi chạy lại.
-- ================================================================

-- ================================================================
-- 1. と — nghĩa điều kiện "nếu/khi" chỉ xuất hiện trong V-ると
--    GIỮ: "và; với; cùng với" (trợ từ nối danh từ), "trích dẫn lời nói"
--    ẨN:  "nếu; khi; sau đó" (conditional → grammar V-ると)
--         "ngay khi" (literary → grammar)
-- ================================================================
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  vocabulary_id IN (
           SELECT id FROM vocabularies
           WHERE  primary_word = 'と' AND primary_kana = 'と'
       )
  AND  is_hidden = false
  AND  (
           meaning_en ~*  '\bif\b.*\bwhen\b'          -- "if; when; (and) then"
        OR meaning_en ~*  '\bconditional\b'
        OR meaning_en ~*  '\bhypothetical\b'
        OR meaning_en ~*  '\bno sooner\b'
        OR meaning_en ~*  '\bupon\b'
        OR (meaning_vi ~* '\bnếu\b' AND meaning_vi !~ 'với')
       )
  AND  meaning_en NOT ILIKE '%quotat%'
  AND  meaning_en NOT ILIKE '%together%'
  AND  meaning_en NOT ILIKE '%at the same time%';

-- ================================================================
-- 2. に — sense "nếu như; mặc dù" (sense_index 9)
--    Đây là dùng に trong cấu trúc như にしては、にもかかわらず — ngữ pháp
--    GIỮ: địa điểm, hướng, thời điểm, lý do, mỗi/per
-- ================================================================
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  vocabulary_id IN (
           SELECT id FROM vocabularies
           WHERE  primary_word = 'に' AND primary_kana = 'に'
       )
  AND  is_hidden = false
  AND  (
           sense_index = 9
        OR (meaning_en ~* '\bif only\b' AND meaning_en ~* '\balthough\b')
        OR meaning_en ~*  '\bin spite of\b'
       );

-- ================================================================
-- 3. が — senses mô tả hành vi ngữ pháp phức tạp, không phải nghĩa hạt nhân
--    GIỮ: [1] chủ ngữ, [2] sở hữu, [3] nhưng/tuy nhiên, [4] và, [5] giới thiệu
--    ẨN:  [6] "bất kể; liệu...hay không" (〜かどうか type grammar)
--         [7] "chỉ ra mong muốn hoặc hy vọng" (〜たいが type grammar)
--         [8] làm dịu tuyên bố (discourse filler — rất nâng cao, ít học)
--         [9] biểu thị nghi ngờ (discourse particle nâng cao)
--         [10] biểu thị khinh miệt (discourse particle nâng cao)
-- ================================================================
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  vocabulary_id IN (
           SELECT id FROM vocabularies
           WHERE  primary_word = 'が' AND primary_kana = 'が'
       )
  AND  is_hidden = false
  AND  sense_index IN (6, 7, 8, 9, 10);

-- fallback bằng meaning_en
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  vocabulary_id IN (
           SELECT id FROM vocabularies
           WHERE  primary_word = 'が' AND primary_kana = 'が'
       )
  AND  is_hidden = false
  AND  (
           meaning_en ~* '\bregardless of\b'
        OR meaning_en ~* '\bwhether or not\b'
        OR meaning_en ~* '\b(desire|hope|wish)\b'
        OR meaning_en ~* '\bsoften\b'
        OR meaning_en ~* '\bdoubt\b'
        OR meaning_en ~* '\bcontempt\b'
        OR meaning_en ~* '\bdisdain\b'
       );

-- ================================================================
-- 4. も — sense "ngay cả khi; mặc dù" (sense_index 4)
--    Đây là nghĩa của 〜ても (grammar) chứ không phải も đơn thuần
--    GIỮ: [1] cũng/ngoài ra, [2] cả A lẫn B, [3] thậm chí/xa như, [5] hơn nữa
-- ================================================================
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  vocabulary_id IN (
           SELECT id FROM vocabularies
           WHERE  primary_word = 'も' AND primary_kana = 'も'
       )
  AND  is_hidden = false
  AND  (
           sense_index = 4
        OR (meaning_en ~* '\beven if\b' AND meaning_en ~* '\balthough\b')
       );

-- ================================================================
-- 5. や — sense "không sớm hơn...; ngay khi" (sense_index 2, văn ngữ)
--    Cấu trúc V-や hay V-やいなや trong văn học — ngữ pháp nâng cao
--    GIỮ: [1] "những thứ như...; và...và" (liệt kê ví dụ)
-- ================================================================
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  vocabulary_id IN (
           SELECT id FROM vocabularies
           WHERE  primary_word = 'や' AND primary_kana = 'や'
       )
  AND  is_hidden = false
  AND  (
           sense_index = 2
        OR meaning_en ~* '\bno sooner (than|…)\b'
        OR meaning_en ~* '\bthe moment\b'
        OR meaning_en ~* '\bupon doing\b'
        OR meaning_en ~* '\bscarcely\b'
       );

-- ================================================================
-- 6. こそ — sense [2] "mặc dù; trong khi" (cấu trúc こそあれ, こそすれ)
--    GIỮ: [1] nhấn mạnh "chính là; đặc biệt",
--         [3] "chính vì...", [4] "không có gì..."
-- ================================================================
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  vocabulary_id IN (
           SELECT id FROM vocabularies
           WHERE  primary_word = 'こそ' AND primary_kana = 'こそ'
       )
  AND  is_hidden = false
  AND  (
           sense_index = 2
        OR (meaning_en ~* '\balthough\b' AND meaning_en ~* '\bwhile\b')
        OR meaning_en ~* '\bin spite of\b'
       );

-- ================================================================
-- 7. さえ — sense [2] "(nếu) chỉ; miễn là" (cấu trúc さえ〜ば)
--    GIỮ: [1] "thậm chí; ngay cả", [3] "bên cạnh đó; trên hết"
-- ================================================================
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  vocabulary_id IN (
           SELECT id FROM vocabularies
           WHERE  primary_word = 'さえ' AND primary_kana = 'さえ'
       )
  AND  is_hidden = false
  AND  (
           sense_index = 2
        OR meaning_en ~* '\bif only\b'
        OR meaning_en ~* '\bas long as\b'
        OR meaning_en ~* '\bprovided( that)?\b'
       );

-- ================================================================
-- 8. で — entry thứ 2: "mà không làm..." (cấu trúc V-ないで)
--    Đây là một entry riêng của で với nghĩa ngữ pháp V-ないで
--    Ẩn bằng meaning pattern vì không biết chính xác entry nào
-- ================================================================
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  vocabulary_id IN (
           SELECT id FROM vocabularies
           WHERE  primary_word = 'で' AND primary_kana = 'で'
       )
  AND  is_hidden = false
  AND  (
           meaning_en ~* '\bwithout (V-ing|doing|performing)\b'
        OR meaning_en ~* '\bnot doing\b'
        OR meaning_vi ~* 'mà không làm'
       );

-- ================================================================
-- 9. ては — toàn bộ entry là cấu trúc ngữ pháp
--    [1] nếu (〜ては → điều kiện/cấm)
--    [2] từ...; nếu bạn định... (〜ては → điều kiện)
--    [3] cái này đến cái khác; hành động lặp (〜ては〜 lặp lại)
--    [4] thêm nhấn mạnh
--    Ẩn sense [2,3,4], giữ [1] vì không thể ẩn hết
-- ================================================================
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  vocabulary_id IN (
           SELECT id FROM vocabularies
           WHERE  primary_word = 'ては' AND primary_kana = 'ては'
       )
  AND  is_hidden = false
  AND  sense_index IN (2, 3, 4);

-- fallback
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  vocabulary_id IN (
           SELECT id FROM vocabularies
           WHERE  primary_word = 'ては' AND primary_kana = 'ては'
       )
  AND  is_hidden = false
  AND  (
           meaning_en ~* '\bif you (are going|intend)\b'
        OR meaning_en ~* '\bone after another\b'
        OR meaning_en ~* '\brepeat\b'
        OR meaning_en ~* '\bstrong emphasis\b'
       );

-- ================================================================
-- 10. ても — giữ nguyên (nghĩa "ngay cả khi; mặc dù" CHÍNH LÀ định nghĩa
--     của ても — không ẩn vì sẽ không còn nghĩa gì để hiển thị)
-- ================================================================
-- (no changes for ても)

-- ================================================================
-- 11. An toàn: đảm bảo mỗi vocabulary entry còn ít nhất 1 sense visible
-- ================================================================
WITH all_hidden AS (
    SELECT vocabulary_id
    FROM   vocabulary_senses
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
UPDATE vocabulary_senses
SET    is_hidden = false
WHERE  id IN (SELECT id FROM first_per);

-- ================================================================
-- Thống kê: kết quả của từng trợ từ
-- ================================================================
SELECT
    v.primary_word                                                                  AS particle,
    COUNT(*) FILTER (WHERE vs.is_hidden = false)                                   AS visible,
    COUNT(*) FILTER (WHERE vs.is_hidden = true)                                    AS hidden,
    string_agg(vs.meaning_vi, '; ' ORDER BY vs.sense_index)
        FILTER (WHERE vs.is_hidden = false)                                         AS nghia_hien_thi
FROM vocabularies v
JOIN vocabulary_senses vs ON vs.vocabulary_id = v.id
WHERE v.primary_word IN ('と','に','が','も','や','こそ','さえ','で','ては','ても',
                          'は','を','から','より','まで','だけ','しか','ば','たら')
  AND v.primary_kana = v.primary_word
GROUP BY v.primary_word
ORDER BY
    CASE v.primary_word
        WHEN 'と' THEN 1  WHEN 'に' THEN 2  WHEN 'が' THEN 3
        WHEN 'は' THEN 4  WHEN 'を' THEN 5  WHEN 'で' THEN 6
        WHEN 'も' THEN 7  WHEN 'から' THEN 8 WHEN 'より' THEN 9
        WHEN 'まで' THEN 10 WHEN 'だけ' THEN 11 WHEN 'しか' THEN 12
        WHEN 'こそ' THEN 13 WHEN 'さえ' THEN 14 WHEN 'や' THEN 15
        WHEN 'ば' THEN 16  WHEN 'たら' THEN 17 WHEN 'ては' THEN 18
        WHEN 'ても' THEN 19 ELSE 99
    END;
