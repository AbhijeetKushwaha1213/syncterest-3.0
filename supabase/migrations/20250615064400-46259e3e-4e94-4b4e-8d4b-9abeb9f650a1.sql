
-- Create table to store blocked user relationships
CREATE TABLE public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_block UNIQUE (user_id, blocked_user_id)
);

-- Add comments to explain table and columns
COMMENT ON TABLE public.blocked_users IS 'Stores relationships of users who have blocked other users.';
COMMENT ON COLUMN public.blocked_users.user_id IS 'The user who is blocking someone.';
COMMENT ON COLUMN public.blocked_users.blocked_user_id IS 'The user who is being blocked.';

-- Enable Row Level Security
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Policies for blocked_users table
-- Users can see their own blocks
CREATE POLICY "select_own_blocks" ON public.blocked_users
FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own blocks
CREATE POLICY "insert_own_blocks" ON public.blocked_users
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can delete their own blocks (unblock)
CREATE POLICY "delete_own_blocks" ON public.blocked_users
FOR DELETE
USING (user_id = auth.uid());
