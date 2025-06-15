
-- Add new columns for notification settings to the profiles table
ALTER TABLE public.profiles
ADD COLUMN email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN push_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN new_message_notifications BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN new_follower_notifications BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN event_reminder_notifications BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN group_activity_notifications BOOLEAN NOT NULL DEFAULT TRUE;
