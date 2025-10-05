-- Fix for missing interest_tags column in groups table
-- This ensures the column exists even if previous migrations didn't run properly

-- Add interest_tags column if it doesn't exist
ALTER TABLE IF EXISTS public.groups 
ADD COLUMN IF NOT EXISTS interest_tags text[] NOT NULL DEFAULT '{}';

-- Ensure the GIN index exists for better performance
CREATE INDEX IF NOT EXISTS idx_groups_interest_tags ON public.groups USING GIN (interest_tags);

-- Verify column exists and has correct constraints
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'groups' 
        AND column_name = 'interest_tags'
        AND table_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'interest_tags column still missing from groups table';
    END IF;
    
    RAISE NOTICE 'interest_tags column exists and is properly configured';
END $$;