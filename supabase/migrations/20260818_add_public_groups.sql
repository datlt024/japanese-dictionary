-- Add public fields to notebook_groups
ALTER TABLE notebook_groups
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS public_description TEXT,
    ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS notebook_groups_public_idx ON notebook_groups (is_public, display_order)
    WHERE is_public = true;

-- Allow reading notebooks that belong to a public group
CREATE POLICY "Notebooks in public groups are readable by all" ON notebooks
    FOR SELECT USING (
        group_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM notebook_groups
            WHERE notebook_groups.id = group_id
              AND notebook_groups.is_public = true
        )
    );

-- Allow reading items from notebooks that belong to a public group
CREATE POLICY "Items in public-group notebooks are readable by all" ON notebook_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM notebooks
            JOIN notebook_groups ON notebook_groups.id = notebooks.group_id
            WHERE notebooks.id = notebook_items.notebook_id
              AND notebook_groups.is_public = true
        )
    );
