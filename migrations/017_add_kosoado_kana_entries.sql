-- Migration 017: Chuẩn hóa entry kana cho dãy こそあど
--
-- Vấn đề:
--   1. こっち, そっち, あっち, どっち — không có entry kana thuần trong DB
--   2. こう (斯う), どれ (何れ), どう (如何) — có entry nhưng primary_word là kanji
--   3. 此方 (こなた) — dạng cổ, gây nhầm lẫn khi tìm kiếm
--
-- Giải pháp:
--   1. Đổi primary_word → hiragana cho 3 entry hiện có
--   2. Ẩn 此方(こなた)
--   3. INSERT entry kana thuần cho 4 từ còn thiếu
--
-- Idempotent — an toàn khi chạy lại.

BEGIN;

-- ================================================================
-- 1. Đổi primary_word kanji → hiragana
--    Giữ nguyên id, jlpt, senses — chỉ đổi cách hiển thị từ
-- ================================================================
UPDATE vocabularies SET primary_word = 'こう' WHERE id = 370  AND primary_word = '斯う';
UPDATE vocabularies SET primary_word = 'どれ' WHERE id = 808  AND primary_word = '何れ';
UPDATE vocabularies SET primary_word = 'どう' WHERE id = 773  AND primary_word = '如何';

-- ================================================================
-- 2. Ẩn toàn bộ senses của 此方(こなた) id=385
--    Từ cổ, không liên quan đến こっち hiện đại
-- ================================================================
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  vocabulary_id = 385
  AND  is_hidden = false;

-- ================================================================
-- 3. INSERT こっち
-- ================================================================
DO $$
DECLARE v_id INT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM vocabularies WHERE primary_word = 'こっち' AND primary_kana = 'こっち'
  ) THEN
    INSERT INTO vocabularies (primary_word, primary_kana, jlpt, ruby, source)
    VALUES ('こっち', 'こっち', 'N4', '[]', 'manual')
    RETURNING id INTO v_id;

    INSERT INTO vocabulary_senses (vocabulary_id, sense_index, meaning_vi, meaning_en, part_of_speech, is_hidden)
    VALUES (v_id, 1, 'phía này (thân mật); hướng này; đây', 'this way (casual); here', ARRAY['pn'], false);

    INSERT INTO vocabulary_readings (vocabulary_id, reading, is_primary)
    VALUES (v_id, 'こっち', true);
  END IF;
END $$;

-- ================================================================
-- 4. INSERT そっち
-- ================================================================
DO $$
DECLARE v_id INT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM vocabularies WHERE primary_word = 'そっち' AND primary_kana = 'そっち'
  ) THEN
    INSERT INTO vocabularies (primary_word, primary_kana, jlpt, ruby, source)
    VALUES ('そっち', 'そっち', 'N4', '[]', 'manual')
    RETURNING id INTO v_id;

    INSERT INTO vocabulary_senses (vocabulary_id, sense_index, meaning_vi, meaning_en, part_of_speech, is_hidden)
    VALUES (v_id, 1, 'phía đó (thân mật); hướng đó; đó', 'that way (casual); there', ARRAY['pn'], false);

    INSERT INTO vocabulary_readings (vocabulary_id, reading, is_primary)
    VALUES (v_id, 'そっち', true);
  END IF;
END $$;

-- ================================================================
-- 5. INSERT あっち
-- ================================================================
DO $$
DECLARE v_id INT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM vocabularies WHERE primary_word = 'あっち' AND primary_kana = 'あっち'
  ) THEN
    INSERT INTO vocabularies (primary_word, primary_kana, jlpt, ruby, source)
    VALUES ('あっち', 'あっち', 'N4', '[]', 'manual')
    RETURNING id INTO v_id;

    INSERT INTO vocabulary_senses (vocabulary_id, sense_index, meaning_vi, meaning_en, part_of_speech, is_hidden)
    VALUES (v_id, 1, 'phía kia (thân mật); hướng kia; kia', 'that way over there (casual)', ARRAY['pn'], false);

    INSERT INTO vocabulary_readings (vocabulary_id, reading, is_primary)
    VALUES (v_id, 'あっち', true);
  END IF;
END $$;

-- ================================================================
-- 6. INSERT どっち
-- ================================================================
DO $$
DECLARE v_id INT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM vocabularies WHERE primary_word = 'どっち' AND primary_kana = 'どっち'
  ) THEN
    INSERT INTO vocabularies (primary_word, primary_kana, jlpt, ruby, source)
    VALUES ('どっち', 'どっち', 'N4', '[]', 'manual')
    RETURNING id INTO v_id;

    INSERT INTO vocabulary_senses (vocabulary_id, sense_index, meaning_vi, meaning_en, part_of_speech, is_hidden)
    VALUES (v_id, 1, 'cái nào; phía nào (thân mật)', 'which (of two) (casual)', ARRAY['pn'], false);

    INSERT INTO vocabulary_readings (vocabulary_id, reading, is_primary)
    VALUES (v_id, 'どっち', true);
  END IF;
END $$;

-- ================================================================
-- Xác nhận kết quả
-- ================================================================
SELECT
  v.primary_word,
  v.primary_kana,
  v.jlpt,
  v.source,
  (SELECT string_agg(s.meaning_vi, ' / ' ORDER BY s.sense_index)
   FROM vocabulary_senses s
   WHERE s.vocabulary_id = v.id AND s.is_hidden = false) AS nghia_vi
FROM   vocabularies v
WHERE  v.primary_kana IN ('こっち','そっち','あっち','どっち','こう','どれ','どう')
  AND  v.primary_word = v.primary_kana
ORDER  BY v.primary_kana;

COMMIT;
