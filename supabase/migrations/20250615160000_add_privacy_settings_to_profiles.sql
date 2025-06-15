
-- Add new columns for privacy settings to the profiles table
ALTER TABLE public.profiles
ADD COLUMN profile_visibility TEXT NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends_only', 'private')),
ADD COLUMN location_sharing_enabled BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN show_location_on_profile BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN show_activity_status BOOLEAN NOT NULL DEFAULT TRUE;
