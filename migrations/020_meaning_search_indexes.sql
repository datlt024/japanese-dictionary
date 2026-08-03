-- Migration 020: Thêm GIN trigram index cho tìm kiếm nghĩa tiếng Việt / tiếng Anh
--
-- Không có index này, ILIKE '%keyword%' trên vocabulary_senses gây full table scan
-- và dẫn đến "canceling statement due to statement timeout".
--
-- Yêu cầu extension pg_trgm (đã có sẵn trên Supabase).

-- Bật pg_trgm nếu chưa có
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index cho tìm kiếm nghĩa tiếng Việt
CREATE INDEX IF NOT EXISTS idx_vocab_senses_meaning_vi_trgm
    ON vocabulary_senses USING gin(meaning_vi gin_trgm_ops)
    WHERE meaning_vi IS NOT NULL AND is_hidden = false;

-- Index cho tìm kiếm nghĩa tiếng Anh
CREATE INDEX IF NOT EXISTS idx_vocab_senses_meaning_en_trgm
    ON vocabulary_senses USING gin(meaning_en gin_trgm_ops)
    WHERE meaning_en IS NOT NULL AND is_hidden = false;
