-- Migration 005: Mở rộng cleanup senses
-- Sửa lại bước ẩn cổ ngữ (dùng ANY thay @>), thêm các nhãn mới,
-- và giới hạn số sense hiển thị theo JLPT level.
--
-- Chạy sau khi đã chạy 004.
-- Idempotent: an toàn khi chạy lại.

-- ────────────────────────────────────────────────────────────────
-- Helper: protected vocabulary IDs (sổ tay 第一課–第五課)
-- Dùng NOT EXISTS thay NOT IN để tránh lỗi khi subquery có NULL.
-- ────────────────────────────────────────────────────────────────

-- ────────────────────────────────────────────────────────────────
-- Bước A: Ẩn cổ ngữ / hiếm / lỗi thời / thơ ca / lịch sử
--   Chạy lại với ANY() và NOT EXISTS để fix lỗi của migration 004.
--   Thêm: hist (lịch sử), dated (lỗi thời), poet (thơ ca cổ)
-- ────────────────────────────────────────────────────────────────
UPDATE vocabulary_senses vs
SET    is_hidden = true
WHERE  vs.is_hidden = false
  AND  vs.misc IS NOT NULL
  AND  (
         'arch'  = ANY(vs.misc)
      OR 'obs'   = ANY(vs.misc)
      OR 'rare'  = ANY(vs.misc)
      OR 'obsc'  = ANY(vs.misc)
      OR 'hist'  = ANY(vs.misc)
      OR 'dated' = ANY(vs.misc)
      OR 'poet'  = ANY(vs.misc)
  )
  AND  NOT EXISTS (
         SELECT 1
         FROM   notebook_items ni
         JOIN   notebooks nb ON nb.id = ni.notebook_id
         WHERE  ni.item_type = 'vocabulary'
           AND  nb.name IN ('第一課', '第二課', '第三課', '第四課', '第五課')
           AND  ni.item_id ~ '^[0-9]+$'
           AND  ni.item_id::integer = vs.vocabulary_id
       );

-- ────────────────────────────────────────────────────────────────
-- Bước B: Ẩn sense là tên tổ chức, công ty, tác phẩm, sản phẩm
--   Đây là tên riêng không phải từ vựng để học.
-- ────────────────────────────────────────────────────────────────
UPDATE vocabulary_senses vs
SET    is_hidden = true
WHERE  vs.is_hidden = false
  AND  vs.misc IS NOT NULL
  AND  (
         'organization' = ANY(vs.misc)
      OR 'company'      = ANY(vs.misc)
      OR 'work'         = ANY(vs.misc)
      OR 'product'      = ANY(vs.misc)
  )
  AND  NOT EXISTS (
         SELECT 1
         FROM   notebook_items ni
         JOIN   notebooks nb ON nb.id = ni.notebook_id
         WHERE  ni.item_type = 'vocabulary'
           AND  nb.name IN ('第一課', '第二課', '第三課', '第四課', '第五課')
           AND  ni.item_id ~ '^[0-9]+$'
           AND  ni.item_id::integer = vs.vocabulary_id
       );

-- ────────────────────────────────────────────────────────────────
-- Bước C: Giới hạn số sense theo JLPT level
--   Giữ lại N sense đầu tiên (theo sense_index), ẩn phần còn lại.
--   Ngưỡng:  N5 → 5,  N4 → 6,  N3 → 7,  N2 → 8,  N1 → 10,  null → 8
--   Không áp dụng cho từ vựng trong sổ tay 第一課–第五課.
-- ────────────────────────────────────────────────────────────────
WITH sense_cap AS (
    SELECT vs.id,
           ROW_NUMBER() OVER (
               PARTITION BY vs.vocabulary_id
               ORDER BY vs.sense_index ASC NULLS LAST, vs.id ASC
           ) AS rn,
           CASE v.jlpt
               WHEN 'N5' THEN 5
               WHEN 'N4' THEN 6
               WHEN 'N3' THEN 7
               WHEN 'N2' THEN 8
               WHEN 'N1' THEN 10
               ELSE 8
           END AS max_visible
    FROM   vocabulary_senses vs
    JOIN   vocabularies v ON v.id = vs.vocabulary_id
    WHERE  vs.is_hidden = false
      AND  vs.vocabulary_id IS NOT NULL
),
to_cap AS (
    SELECT sc.id
    FROM   sense_cap sc
    WHERE  sc.rn > sc.max_visible
      AND  NOT EXISTS (
               SELECT 1
               FROM   notebook_items ni
               JOIN   notebooks nb ON nb.id = ni.notebook_id
               JOIN   vocabulary_senses vs2 ON vs2.id = sc.id
               WHERE  ni.item_type = 'vocabulary'
                 AND  nb.name IN ('第一課', '第二課', '第三課', '第四課', '第五課')
                 AND  ni.item_id ~ '^[0-9]+$'
                 AND  ni.item_id::integer = vs2.vocabulary_id
           )
)
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  id IN (SELECT id FROM to_cap);

-- ────────────────────────────────────────────────────────────────
-- Bước D: Ẩn duplicate meaning_vi còn sót (chạy lại)
-- ────────────────────────────────────────────────────────────────
WITH dup_ids AS (
    SELECT vs.id
    FROM   vocabulary_senses vs
    WHERE  vs.is_hidden = false
      AND  vs.meaning_vi IS NOT NULL
      AND  vs.meaning_vi != ''
      AND  vs.vocabulary_id IS NOT NULL
      AND  EXISTS (
             SELECT 1
             FROM   vocabulary_senses vs2
             WHERE  vs2.vocabulary_id = vs.vocabulary_id
               AND  vs2.id            != vs.id
               AND  vs2.is_hidden     = false
               AND  vs2.meaning_vi    IS NOT NULL
               AND  lower(trim(vs2.meaning_vi)) = lower(trim(vs.meaning_vi))
               AND  vs2.sense_index   < vs.sense_index
           )
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
WHERE  id IN (SELECT id FROM dup_ids);

-- ────────────────────────────────────────────────────────────────
-- Bước E: An toàn — đảm bảo mỗi từ còn ít nhất 1 sense hiển thị
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
-- Thống kê sau khi chạy
-- ────────────────────────────────────────────────────────────────
SELECT
    is_hidden,
    COUNT(*)                     AS sense_count,
    COUNT(DISTINCT vocabulary_id) AS vocab_count
FROM vocabulary_senses
GROUP BY is_hidden
ORDER BY is_hidden;

-- Top 20 từ còn nhiều senses nhất sau cleanup:
SELECT
    v.primary_word,
    v.primary_kana,
    v.jlpt,
    COUNT(vs.id) AS visible_senses
FROM vocabularies v
JOIN vocabulary_senses vs ON vs.vocabulary_id = v.id AND vs.is_hidden = false
GROUP BY v.id, v.primary_word, v.primary_kana, v.jlpt
HAVING COUNT(vs.id) >= 5
ORDER BY visible_senses DESC
LIMIT 20;
