-- Migration 018: Đồng bộ vocabulary_search_index cho dãy こそあど
--
-- Vấn đề sau migration 017:
--   1. こっち/そっち/あっち/どっち (id 434404–434407) thiếu hoàn toàn trong search_index
--   2. こう/どう/どれ vẫn có word_text là kanji cũ (斯う/如何/何れ) thay vì kana
--
-- Kết quả: search_vocabularies_rpc không trả về entry mới.
-- Migration này đồng bộ vocabulary_search_index để search hoạt động đúng.
--
-- Idempotent — an toàn khi chạy lại.

BEGIN;

-- ================================================================
-- 1. Cập nhật word_text + search_text cho 3 entry đã đổi kanji→kana
-- ================================================================
UPDATE vocabulary_search_index
SET
    word_text   = 'こう',
    search_text = 'こう こう ' || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 370
  AND word_text = '斯う';

UPDATE vocabulary_search_index
SET
    word_text   = 'どう',
    search_text = 'どう どう ' || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 773
  AND word_text = '如何';

UPDATE vocabulary_search_index
SET
    word_text   = 'どれ',
    search_text = 'どれ どれ ' || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 808
  AND word_text = '何れ';

-- ================================================================
-- 2. INSERT こっち (id=434404)
-- ================================================================
INSERT INTO vocabulary_search_index
    (vocabulary_id, search_text, word_text, kana_text, romaji_text,
     meaning_vi_text, meaning_en_text, priority_score)
VALUES
    (434404,
     'こっち こっち this way (casual); here',
     'こっち', 'こっち', 'kocchi',
     'phía này (thân mật); hướng này; đây',
     'this way (casual); here',
     100)
ON CONFLICT (vocabulary_id) DO UPDATE SET
    word_text       = EXCLUDED.word_text,
    kana_text       = EXCLUDED.kana_text,
    search_text     = EXCLUDED.search_text,
    romaji_text     = EXCLUDED.romaji_text,
    meaning_vi_text = EXCLUDED.meaning_vi_text,
    meaning_en_text = EXCLUDED.meaning_en_text,
    priority_score  = EXCLUDED.priority_score;

-- ================================================================
-- 3. INSERT そっち (id=434405)
-- ================================================================
INSERT INTO vocabulary_search_index
    (vocabulary_id, search_text, word_text, kana_text, romaji_text,
     meaning_vi_text, meaning_en_text, priority_score)
VALUES
    (434405,
     'そっち そっち that way (casual); there',
     'そっち', 'そっち', 'socchi',
     'phía đó (thân mật); hướng đó; đó',
     'that way (casual); there',
     100)
ON CONFLICT (vocabulary_id) DO UPDATE SET
    word_text       = EXCLUDED.word_text,
    kana_text       = EXCLUDED.kana_text,
    search_text     = EXCLUDED.search_text,
    romaji_text     = EXCLUDED.romaji_text,
    meaning_vi_text = EXCLUDED.meaning_vi_text,
    meaning_en_text = EXCLUDED.meaning_en_text,
    priority_score  = EXCLUDED.priority_score;

-- ================================================================
-- 4. INSERT あっち (id=434406)
-- ================================================================
INSERT INTO vocabulary_search_index
    (vocabulary_id, search_text, word_text, kana_text, romaji_text,
     meaning_vi_text, meaning_en_text, priority_score)
VALUES
    (434406,
     'あっち あっち that way over there (casual)',
     'あっち', 'あっち', 'acchi',
     'phía kia (thân mật); hướng kia; kia',
     'that way over there (casual)',
     100)
ON CONFLICT (vocabulary_id) DO UPDATE SET
    word_text       = EXCLUDED.word_text,
    kana_text       = EXCLUDED.kana_text,
    search_text     = EXCLUDED.search_text,
    romaji_text     = EXCLUDED.romaji_text,
    meaning_vi_text = EXCLUDED.meaning_vi_text,
    meaning_en_text = EXCLUDED.meaning_en_text,
    priority_score  = EXCLUDED.priority_score;

-- ================================================================
-- 5. INSERT どっち (id=434407)
-- ================================================================
INSERT INTO vocabulary_search_index
    (vocabulary_id, search_text, word_text, kana_text, romaji_text,
     meaning_vi_text, meaning_en_text, priority_score)
VALUES
    (434407,
     'どっち どっち which (of two) (casual)',
     'どっち', 'どっち', 'docchi',
     'cái nào; phía nào (thân mật)',
     'which (of two) (casual)',
     100)
ON CONFLICT (vocabulary_id) DO UPDATE SET
    word_text       = EXCLUDED.word_text,
    kana_text       = EXCLUDED.kana_text,
    search_text     = EXCLUDED.search_text,
    romaji_text     = EXCLUDED.romaji_text,
    meaning_vi_text = EXCLUDED.meaning_vi_text,
    meaning_en_text = EXCLUDED.meaning_en_text,
    priority_score  = EXCLUDED.priority_score;

-- ================================================================
-- Xác nhận kết quả
-- ================================================================
SELECT
    v.primary_word,
    v.primary_kana,
    si.word_text,
    si.kana_text,
    si.priority_score
FROM   vocabulary_search_index si
JOIN   vocabularies v ON v.id = si.vocabulary_id
WHERE  si.vocabulary_id IN (370, 773, 808, 434404, 434405, 434406, 434407)
ORDER  BY si.kana_text;

COMMIT;
