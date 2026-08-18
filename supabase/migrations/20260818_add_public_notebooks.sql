-- Add public notebook fields to notebooks table
ALTER TABLE notebooks
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS public_category TEXT,
    ADD COLUMN IF NOT EXISTS public_description TEXT,
    ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;

-- Index for fast querying of public notebooks
CREATE INDEX IF NOT EXISTS notebooks_public_idx ON notebooks (is_public, display_order)
    WHERE is_public = true;

-- Allow all authenticated users to read public notebooks
DROP POLICY IF EXISTS "Users can see their own notebooks" ON notebooks;
CREATE POLICY "Users can see their own or public notebooks" ON notebooks
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

-- Allow all authenticated users to read items from public notebooks
CREATE POLICY "Anyone can read items from public notebooks" ON notebook_items
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM notebooks
            WHERE notebooks.id = notebook_items.notebook_id
              AND notebooks.is_public = true
        )
    );
