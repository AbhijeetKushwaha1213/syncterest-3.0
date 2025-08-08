
-- Allow users to create their own profile row (needed so onboarding can INSERT when profile is missing)
-- Safe to run multiple times: it creates policy only if it doesn't exist.

-- Ensure RLS is enabled (it already is, but this is idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON public.profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
