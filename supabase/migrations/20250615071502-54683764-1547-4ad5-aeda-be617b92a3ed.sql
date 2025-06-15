
-- Add language preference to profiles table
ALTER TABLE public.profiles
ADD COLUMN language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'es', 'fr'));
