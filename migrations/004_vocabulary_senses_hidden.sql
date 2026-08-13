-- Migration 004: Hide archaic, rare, and duplicate vocabulary senses
-- Mục đích: Ẩn các sense ít dùng, cổ ngữ, và trùng lặp trong từ điển.
--           Trừ từ vựng thuộc sổ tay 第一課 đến 第五課.
--
-- Chạy file này trong: Supabase Dashboard > SQL Editor
-- Tất cả bước đều idempotent (an toàn khi chạy lại).

-- ────────────────────────────────────────────────────────────────
-- Bước 1: Thêm cột is_hidden
-- ────────────────────────────────────────────────────────────────
ALTER TABLE vocabulary_senses
    ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

-- ────────────────────────────────────────────────────────────────
-- Bước 2: Ẩn các sense mang nhãn cổ ngữ / hiếm / lỗi thời
--   misc @> ARRAY[...] kiểm tra array chứa giá trị JMdict:
--     arch  = archaism (cổ ngữ)
--     obs   = obsolete (từ không còn dùng)
--     rare  = rare usage (rất hiếm gặp)
--     obsc  = obscure (tối nghĩa, hầu như không dùng)
-- ────────────────────────────────────────────────────────────────
WITH protected_vocab AS (
    SELECT DISTINCT ni.item_id::integer AS vocab_id
    FROM notebook_items ni
    JOIN notebooks nb ON nb.id = ni.notebook_id
    WHERE ni.item_type = 'vocabulary'
      AND nb.name IN ('第一課', '第二課', '第三課', '第四課', '第五課')
      AND ni.item_id ~ '^[0-9]+$'
)
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  is_hidden = false
  AND  vocabulary_id NOT IN (SELECT vocab_id FROM protected_vocab)
  AND  (
         misc @> ARRAY['arch']::text[]
      OR misc @> ARRAY['obs']::text[]
      OR misc @> ARRAY['rare']::text[]
      OR misc @> ARRAY['obsc']::text[]
  );

-- ────────────────────────────────────────────────────────────────
-- Bước 3: Ẩn các sense bị trùng meaning_vi trong cùng một từ
--   Giữ lại sense có sense_index nhỏ nhất (thường là sense chính).
--   So sánh sau khi lower() + trim() để bỏ qua khác biệt về hoa thường / khoảng trắng.
-- ────────────────────────────────────────────────────────────────
WITH protected_vocab AS (
    SELECT DISTINCT ni.item_id::integer AS vocab_id
    FROM notebook_items ni
    JOIN notebooks nb ON nb.id = ni.notebook_id
    WHERE ni.item_type = 'vocabulary'
      AND nb.name IN ('第一課', '第二課', '第三課', '第四課', '第五課')
      AND ni.item_id ~ '^[0-9]+$'
),
dup_ids AS (
    SELECT vs.id
    FROM   vocabulary_senses vs
    WHERE  vs.is_hidden = false
      AND  vs.vocabulary_id NOT IN (SELECT vocab_id FROM protected_vocab)
      AND  vs.meaning_vi IS NOT NULL
      AND  vs.meaning_vi != ''
      AND  EXISTS (
             SELECT 1
             FROM   vocabulary_senses vs2
             WHERE  vs2.vocabulary_id = vs.vocabulary_id
               AND  vs2.id            != vs.id
               AND  vs2.is_hidden     = false
               AND  vs2.meaning_vi IS NOT NULL
               AND  lower(trim(vs2.meaning_vi)) = lower(trim(vs.meaning_vi))
               AND  vs2.sense_index   < vs.sense_index
           )
)
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  id IN (SELECT id FROM dup_ids);

-- ────────────────────────────────────────────────────────────────
-- Bước 4: Ẩn các sense không có meaning_vi (khi từ đó còn sense khác có nghĩa)
--   Tức là: nếu vocabulary đã có ít nhất một sense visible có meaning_vi,
--   thì các sense không có meaning_vi sẽ bị ẩn.
-- ────────────────────────────────────────────────────────────────
WITH protected_vocab AS (
    SELECT DISTINCT ni.item_id::integer AS vocab_id
    FROM notebook_items ni
    JOIN notebooks nb ON nb.id = ni.notebook_id
    WHERE ni.item_type = 'vocabulary'
      AND nb.name IN ('第一課', '第二課', '第三課', '第四課', '第五課')
      AND ni.item_id ~ '^[0-9]+$'
),
vocabs_with_vi AS (
    SELECT DISTINCT vocabulary_id
    FROM   vocabulary_senses
    WHERE  is_hidden = false
      AND  meaning_vi IS NOT NULL
      AND  meaning_vi != ''
)
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  is_hidden = false
  AND  vocabulary_id NOT IN (SELECT vocab_id FROM protected_vocab)
  AND  vocabulary_id IN (SELECT vocabulary_id FROM vocabs_with_vi)
  AND  (meaning_vi IS NULL OR meaning_vi = '');

-- ────────────────────────────────────────────────────────────────
-- Bước 5: An toàn — đảm bảo mỗi từ luôn còn ít nhất 1 sense hiển thị
--   Nếu toàn bộ sense của một từ bị ẩn, un-hide sense đầu tiên.
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
-- Thống kê sau khi chạy:
-- ────────────────────────────────────────────────────────────────
SELECT
    is_hidden,
    COUNT(*) AS sense_count,
    COUNT(DISTINCT vocabulary_id) AS vocab_count
FROM vocabulary_senses
GROUP BY is_hidden
ORDER BY is_hidden;
