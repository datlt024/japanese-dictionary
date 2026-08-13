CREATE TABLE user_vocabulary_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vocabulary_id integer NOT NULL,
    note_text text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, vocabulary_id)
);

ALTER TABLE user_vocabulary_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own vocabulary notes"
    ON user_vocabulary_notes
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
