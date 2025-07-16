-- Add missing privacy settings columns to the profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_visibility TEXT NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends_only', 'private')),
ADD COLUMN IF NOT EXISTS location_sharing_enabled BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_location_on_profile BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_activity_status BOOLEAN NOT NULL DEFAULT TRUE;

-- Fix security definer functions to use proper search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_channel_creator_as_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.channel_members (channel_id, user_id, role)
  VALUES (NEW.id, NEW.creator_id, 'admin');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.find_or_create_conversation(p_other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_conversation_id uuid;
BEGIN
    -- Find an existing conversation with exactly these two participants by comparing sorted arrays of participant IDs.
    SELECT conversation_id INTO v_conversation_id
    FROM (
        SELECT
            cp.conversation_id,
            array_agg(cp.user_id ORDER BY cp.user_id) AS participants
        FROM conversation_participants AS cp
        GROUP BY cp.conversation_id
        HAVING count(cp.user_id) = 2
    ) AS convos
    WHERE convos.participants = ARRAY[LEAST(auth.uid(), p_other_user_id), GREATEST(auth.uid(), p_other_user_id)]
    LIMIT 1;

    -- If a conversation is found, return its ID
    IF v_conversation_id IS NOT NULL THEN
        RETURN v_conversation_id;
    END IF;

    -- If no conversation is found, create a new one
    INSERT INTO conversations DEFAULT VALUES RETURNING id INTO v_conversation_id;

    -- Add both users as participants to the new conversation
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (v_conversation_id, auth.uid()), (v_conversation_id, p_other_user_id);

    RETURN v_conversation_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_channel_admin(p_channel_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.channel_members
    WHERE channel_id = p_channel_id AND user_id = p_user_id AND role = 'admin'::public.channel_role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_channel_member(p_channel_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.channel_members
    WHERE channel_id = p_channel_id AND user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.mark_channel_as_read(p_channel_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.channel_last_read (user_id, channel_id, last_read_at)
  VALUES (auth.uid(), p_channel_id, now())
  ON CONFLICT (user_id, channel_id)
  DO UPDATE SET last_read_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_messages_as_read(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if the user is a participant of the conversation
  IF EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id AND user_id = auth.uid()
  ) THEN
    -- Update messages sent by the other user to mark them as read
    UPDATE public.messages
    SET read_at = now()
    WHERE conversation_id = p_conversation_id
      AND sender_id != auth.uid()
      AND read_at IS NULL;
  END IF;
END;
$$;