-- Single-round-trip function: returns paginated vocab rows with first Vietnamese meaning.
-- Uses a correlated subquery per row — fast with idx_vocabularies_jlpt_id (vocab scan)
-- and idx_vocabulary_senses_vocab_sense (sense lookup).
CREATE OR REPLACE FUNCTION get_jlpt_vocab_page(
    p_level text,
    p_from  int,
    p_to    int
)
RETURNS TABLE (
    id           integer,
    primary_word text,
    primary_kana text,
    meaning_vi   text
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        v.id,
        v.primary_word,
        v.primary_kana,
        (
            SELECT s.meaning_vi
            FROM   vocabulary_senses s
            WHERE  s.vocabulary_id = v.id
              AND  s.is_hidden     = false
              AND  s.meaning_vi    IS NOT NULL
            ORDER  BY s.sense_index
            LIMIT  1
        ) AS meaning_vi
    FROM  vocabularies v
    WHERE v.jlpt = p_level
    ORDER BY v.id
    LIMIT  (p_to - p_from + 1)
    OFFSET p_from
$$;
