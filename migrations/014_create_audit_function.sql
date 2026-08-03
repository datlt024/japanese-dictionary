-- Migration 014: Tạo hàm audit chất lượng vocabulary_senses
-- Dùng bởi scripts/shared/audit-db-quality.ts
-- Idempotent — an toàn khi chạy lại.

CREATE OR REPLACE FUNCTION yomi_audit_meaning_vi()
RETURNS TABLE(
    sense_id    INT,
    word        TEXT,
    kana        TEXT,
    jlpt        TEXT,
    sense_index INT,
    meaning_vi  TEXT,
    meaning_en  TEXT,
    pos         TEXT[],
    issue_type  TEXT,
    detail      TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- ────────────────────────────────────────────────────────────────────────
    -- 1. Tiếng Anh còn sót: không có dấu tiếng Việt, có ít nhất 2 từ ASCII
    --    (tất cả từ tiếng Việt thực đều chứa ít nhất 1 ký tự có dấu)
    -- ────────────────────────────────────────────────────────────────────────
    RETURN QUERY
    SELECT
        vs.id,
        v.primary_word,
        v.primary_kana,
        v.jlpt,
        vs.sense_index,
        vs.meaning_vi,
        vs.meaning_en,
        vs.part_of_speech,
        'english_leftover'::TEXT,
        ('no VI diacritics, ' || length(vs.meaning_vi) || 'c')::TEXT
    FROM vocabulary_senses vs
    JOIN vocabularies v ON v.id = vs.vocabulary_id
    WHERE vs.is_hidden = false
      AND vs.meaning_vi IS NOT NULL
      -- Không có dấu tiếng Việt (kể cả chữ thường lẫn hoa)
      AND vs.meaning_vi !~ '[àáâãèéêìíòóôõùúýăđơưạảấầẩẫậắằẳẵặẹẻẽếềệểễỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĂĐƠƯ]'
      -- Không phải ký tự Nhật
      AND vs.meaning_vi !~ '[぀-ヿ一-鿿]'
      -- Có ít nhất 2 từ ASCII liên tiếp (3+ ký tự mỗi từ)
      AND vs.meaning_vi ~ '[a-z][a-z][a-z]+ [a-z][a-z][a-z]+'
      -- Không phải viết tắt kỹ thuật ngắn (CD, PC, OK...)
      AND length(vs.meaning_vi) > 8;

    -- ────────────────────────────────────────────────────────────────────────
    -- 2. Meaning_vi quá dài (>150 ký tự) — cần review thủ công
    -- ────────────────────────────────────────────────────────────────────────
    RETURN QUERY
    SELECT
        vs.id,
        v.primary_word,
        v.primary_kana,
        v.jlpt,
        vs.sense_index,
        vs.meaning_vi,
        vs.meaning_en,
        vs.part_of_speech,
        'too_long'::TEXT,
        ('len=' || length(vs.meaning_vi))::TEXT
    FROM vocabulary_senses vs
    JOIN vocabularies v ON v.id = vs.vocabulary_id
    WHERE vs.is_hidden = false
      AND length(vs.meaning_vi) > 150
    ORDER BY length(vs.meaning_vi) DESC;

END;
$$;
