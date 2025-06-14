
-- Add status and last_active_at columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN status TEXT,
ADD COLUMN last_active_at TIMESTAMPTZ;

-- Enable Row Level Security on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all profiles
CREATE POLICY "Allow authenticated users to view profiles" ON "public"."profiles"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile" ON "public"."profiles"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
