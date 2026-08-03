-- Migration 019: Đổi primary_word kanji → hiragana cho nhóm trạng từ thông dụng
--
-- Các từ này thường được viết bằng kana trong văn bản hiện đại.
-- Giữ nguyên id, jlpt, senses — chỉ đổi cách hiển thị.
-- Đồng thời cập nhật vocabulary_search_index và xóa ruby kanji cũ.
--
-- Bao gồm cả 3 entry từ migration 017 (こう/どう/どれ) vốn còn ruby kanji.
--
-- Idempotent — an toàn khi chạy lại.

BEGIN;

-- ================================================================
-- 1. Cập nhật vocabularies.primary_word
-- ================================================================
UPDATE vocabularies SET primary_word = 'とても'    WHERE id = 749    AND primary_word = '迚も';
UPDATE vocabularies SET primary_word = 'ちょっと'  WHERE id = 14607  AND primary_word = '一寸';
UPDATE vocabularies SET primary_word = 'たくさん'  WHERE id = 38768  AND primary_word = '沢山';
UPDATE vocabularies SET primary_word = 'たぶん'    WHERE id = 38024  AND primary_word = '多分';
UPDATE vocabularies SET primary_word = 'ちょうど'  WHERE id = 39872  AND primary_word = '丁度';
UPDATE vocabularies SET primary_word = 'ほとんど'  WHERE id = 48972  AND primary_word = '殆ど';
UPDATE vocabularies SET primary_word = 'まず'      WHERE id = 36019  AND primary_word = '先ず';
UPDATE vocabularies SET primary_word = 'もちろん'  WHERE id = 50279  AND primary_word = '勿論';
UPDATE vocabularies SET primary_word = 'やっと'    WHERE id = 1125   AND primary_word = '漸と';
UPDATE vocabularies SET primary_word = 'なるほど'  WHERE id = 34930  AND primary_word = '成る程';
UPDATE vocabularies SET primary_word = 'なかなか'  WHERE id = 56311  AND primary_word = '中々';
UPDATE vocabularies SET primary_word = 'しばらく'  WHERE id = 28061  AND primary_word = '暫く';
UPDATE vocabularies SET primary_word = 'とにかく'  WHERE id = 41477  AND primary_word = '兎に角';
UPDATE vocabularies SET primary_word = 'ついに'    WHERE id = 34625  AND primary_word = '遂に';
UPDATE vocabularies SET primary_word = 'やがて'    WHERE id = 1118   AND primary_word = '軈て';
UPDATE vocabularies SET primary_word = 'そのまま'  WHERE id = 37833  AND primary_word = '其の儘';
UPDATE vocabularies SET primary_word = 'やはり'    WHERE id = 162310 AND primary_word = '矢張り';
UPDATE vocabularies SET primary_word = 'ますます'  WHERE id = 56756  AND primary_word = '益々';
UPDATE vocabularies SET primary_word = 'かつて'    WHERE id = 54536  AND primary_word = '嘗て';

-- ================================================================
-- 2. Cập nhật vocabulary_search_index.word_text + search_text
-- ================================================================
UPDATE vocabulary_search_index
SET word_text = 'とても',   search_text = 'とても とても '   || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 749    AND word_text = '迚も';

UPDATE vocabulary_search_index
SET word_text = 'ちょっと', search_text = 'ちょっと ちょっと ' || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 14607  AND word_text = '一寸';

UPDATE vocabulary_search_index
SET word_text = 'たくさん', search_text = 'たくさん たくさん ' || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 38768  AND word_text = '沢山';

UPDATE vocabulary_search_index
SET word_text = 'たぶん',   search_text = 'たぶん たぶん '   || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 38024  AND word_text = '多分';

UPDATE vocabulary_search_index
SET word_text = 'ちょうど', search_text = 'ちょうど ちょうど ' || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 39872  AND word_text = '丁度';

UPDATE vocabulary_search_index
SET word_text = 'ほとんど', search_text = 'ほとんど ほとんど ' || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 48972  AND word_text = '殆ど';

UPDATE vocabulary_search_index
SET word_text = 'まず',     search_text = 'まず まず '       || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 36019  AND word_text = '先ず';

UPDATE vocabulary_search_index
SET word_text = 'もちろん', search_text = 'もちろん もちろん ' || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 50279  AND word_text = '勿論';

UPDATE vocabulary_search_index
SET word_text = 'やっと',   search_text = 'やっと やっと '   || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 1125   AND word_text = '漸と';

UPDATE vocabulary_search_index
SET word_text = 'なるほど', search_text = 'なるほど なるほど ' || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 34930  AND word_text = '成る程';

UPDATE vocabulary_search_index
SET word_text = 'なかなか', search_text = 'なかなか なかなか ' || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 56311  AND word_text = '中々';

UPDATE vocabulary_search_index
SET word_text = 'しばらく', search_text = 'しばらく しばらく ' || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 28061  AND word_text = '暫く';

UPDATE vocabulary_search_index
SET word_text = 'とにかく', search_text = 'とにかく とにかく ' || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 41477  AND word_text = '兎に角';

UPDATE vocabulary_search_index
SET word_text = 'ついに',   search_text = 'ついに ついに '   || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 34625  AND word_text = '遂に';

UPDATE vocabulary_search_index
SET word_text = 'やがて',   search_text = 'やがて やがて '   || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 1118   AND word_text = '軈て';

UPDATE vocabulary_search_index
SET word_text = 'そのまま', search_text = 'そのまま そのまま ' || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 37833  AND word_text = '其の儘';

UPDATE vocabulary_search_index
SET word_text = 'やはり',   search_text = 'やはり やはり '   || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 162310 AND word_text = '矢張り';

UPDATE vocabulary_search_index
SET word_text = 'ますます', search_text = 'ますます ますます ' || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 56756  AND word_text = '益々';

UPDATE vocabulary_search_index
SET word_text = 'かつて',   search_text = 'かつて かつて '   || COALESCE(meaning_en_text, '')
WHERE vocabulary_id = 54536  AND word_text = '嘗て';

-- ================================================================
-- 3. Xóa ruby kanji — tất cả entry kana-only không cần furigana
--    Bao gồm 3 entry từ migration 017 (こう/どう/どれ)
-- ================================================================
UPDATE vocabularies
SET ruby = '[]'
WHERE id IN (
    -- migration 017
    370, 773, 808,
    -- migration 019
    749, 14607, 38768, 38024, 39872, 48972, 36019, 50279,
    1125, 34930, 56311, 28061, 41477, 34625, 1118, 37833,
    162310, 56756, 54536
)
AND ruby != '[]'::jsonb;

-- ================================================================
-- Xác nhận kết quả
-- ================================================================
SELECT
    v.id,
    v.primary_word,
    v.primary_kana,
    v.jlpt,
    si.word_text AS idx_word,
    v.ruby
FROM   vocabularies v
JOIN   vocabulary_search_index si ON si.vocabulary_id = v.id
WHERE  v.id IN (370,773,808,749,14607,38768,38024,39872,48972,36019,50279,
                1125,34930,56311,28061,41477,34625,1118,37833,
                162310,56756,54536)
ORDER  BY v.primary_kana;

COMMIT;
