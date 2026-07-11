-- Vocabulary examples: individual example sentences linked to a vocabulary entry
-- Each example can optionally be tied to a specific sense (sense_index)
-- ruby field stores furigana data: [{"base": "日本", "reading": "にほん"}, ...]

CREATE TABLE IF NOT EXISTS vocabulary_examples (
    id BIGSERIAL PRIMARY KEY,
    vocabulary_id BIGINT NOT NULL REFERENCES vocabularies(id) ON DELETE CASCADE,
    sense_index INT,
    japanese TEXT NOT NULL,
    translation_vi TEXT NOT NULL,
    example_order INT NOT NULL DEFAULT 1,
    ruby JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_vocabulary_examples_vocabulary_id
    ON vocabulary_examples (vocabulary_id);
