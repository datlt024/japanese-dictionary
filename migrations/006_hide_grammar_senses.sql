-- Migration 006: Ẩn các sense ngữ pháp (auxiliary verb/adjective)
-- Mục đích: Ẩn các sense trong JMdict bị tag là aux-v / aux / aux-adj —
--           đây là các cách dùng mang tính ngữ pháp (てみる, ておく, てしまう,
--           ていく, てくる, てあげる, v.v.), không phải nghĩa từ vựng thuần túy.
--
-- Điều kiện an toàn: chỉ ẩn khi từ đó còn ít nhất 1 sense từ vựng thực (không
--           phải aux) để không ẩn hết cả những từ chuyên dùng làm trợ động từ
--           như ます, だ, です, た.
--
-- Chạy sau 004 và 005.  Idempotent.

-- ────────────────────────────────────────────────────────────────
-- Bước A: Ẩn sense ngữ pháp (aux-v / aux / aux-adj)
-- ────────────────────────────────────────────────────────────────
WITH
-- Từ vựng trong sổ tay được bảo vệ
protected_vocab AS (
    SELECT DISTINCT ni.item_id::integer AS vocab_id
    FROM   notebook_items ni
    JOIN   notebooks nb ON nb.id = ni.notebook_id
    WHERE  ni.item_type = 'vocabulary'
      AND  nb.name IN ('第一課', '第二課', '第三課', '第四課', '第五課')
      AND  ni.item_id ~ '^[0-9]+$'
),

-- Từ vựng còn ít nhất 1 sense "thực" (không phải aux / aux-v / aux-adj)
-- Đảm bảo chúng ta không ẩn hết sense của những từ như ます, だ, た
vocabs_with_lexical_sense AS (
    SELECT DISTINCT vocabulary_id
    FROM   vocabulary_senses
    WHERE  is_hidden       = false
      AND  vocabulary_id   IS NOT NULL
      AND  (
               part_of_speech IS NULL
            OR (
                   NOT ('aux'     = ANY(part_of_speech))
               AND NOT ('aux-v'   = ANY(part_of_speech))
               AND NOT ('aux-adj' = ANY(part_of_speech))
            )
      )
),

-- Sense cần ẩn
grammar_senses AS (
    SELECT vs.id
    FROM   vocabulary_senses vs
    WHERE  vs.is_hidden     = false
      AND  vs.vocabulary_id IS NOT NULL
      AND  vs.part_of_speech IS NOT NULL
      AND  (
               'aux-v'   = ANY(vs.part_of_speech)
            OR 'aux'     = ANY(vs.part_of_speech)
            OR 'aux-adj' = ANY(vs.part_of_speech)
      )
      AND  vs.vocabulary_id IN  (SELECT vocabulary_id FROM vocabs_with_lexical_sense)
      AND  NOT EXISTS (
               SELECT 1
               FROM   notebook_items ni
               JOIN   notebooks nb ON nb.id = ni.notebook_id
               WHERE  ni.item_type = 'vocabulary'
                 AND  nb.name IN ('第一課', '第二課', '第三課', '第四課', '第五課')
                 AND  ni.item_id ~ '^[0-9]+$'
                 AND  ni.item_id::integer = vs.vocabulary_id
           )
)
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  id IN (SELECT id FROM grammar_senses);

-- ────────────────────────────────────────────────────────────────
-- Bước B: An toàn — đảm bảo mỗi từ còn ít nhất 1 sense hiển thị
-- ────────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────────
-- Thống kê
-- ────────────────────────────────────────────────────────────────
SELECT
    is_hidden,
    COUNT(*)                      AS sense_count,
    COUNT(DISTINCT vocabulary_id) AS vocab_count
FROM   vocabulary_senses
GROUP  BY is_hidden
ORDER  BY is_hidden;

-- Kiểm tra một vài từ điển hình để xác nhận kết quả đúng:
SELECT
    v.primary_word,
    v.primary_kana,
    vs.meaning_vi,
    vs.part_of_speech,
    vs.is_hidden
FROM   vocabularies v
JOIN   vocabulary_senses vs ON vs.vocabulary_id = v.id
WHERE  v.primary_word IN ('見る', '行く', '来る', '置く', '上げる', 'いく', 'くる', 'おく')
ORDER  BY v.primary_word, vs.sense_index;
