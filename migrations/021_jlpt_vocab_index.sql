-- Composite index: jlpt + id covers both the WHERE filter and ORDER BY id,
-- eliminating a full table scan AND the post-filter sort in paginated queries.
CREATE INDEX IF NOT EXISTS idx_vocabularies_jlpt_id
    ON vocabularies (jlpt, id)
    WHERE jlpt IS NOT NULL;

-- Keep the simpler partial index for COUNT(*) queries that don't need the id column.
CREATE INDEX IF NOT EXISTS idx_vocabularies_jlpt
    ON vocabularies (jlpt)
    WHERE jlpt IS NOT NULL;

-- Index on vocabulary_senses.vocabulary_id for the .in() batch lookup.
CREATE INDEX IF NOT EXISTS idx_vocabulary_senses_vocabulary_id
    ON vocabulary_senses (vocabulary_id);

-- Composite: vocabulary_id + sense_index for ordered sense fetches.
CREATE INDEX IF NOT EXISTS idx_vocabulary_senses_vocab_sense
    ON vocabulary_senses (vocabulary_id, sense_index);
