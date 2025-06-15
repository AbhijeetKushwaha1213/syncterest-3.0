
-- Add read_at column to messages table to track when a message is read
ALTER TABLE public.messages
ADD COLUMN read_at TIMESTAMPTZ;

-- Function to mark messages as read for a given conversation
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- A composite type to structure the return data for conversations list
DROP TYPE IF EXISTS public.conversation_details CASCADE;
CREATE TYPE public.conversation_details AS (
    id uuid,
    created_at timestamptz,
    updated_at timestamptz,
    other_participant jsonb,
    last_message jsonb,
    unread_count bigint
);

-- Function to get all conversations for a user with details like
-- the other participant, the last message, and a count of unread messages.
-- This replaces the more complex client-side logic and is more efficient.
CREATE OR REPLACE FUNCTION public.get_conversations_for_user(p_user_id uuid)
RETURNS SETOF public.conversation_details
LANGUAGE sql
STABLE
AS $$
SELECT
    c.id,
    c.created_at,
    c.updated_at,
    (SELECT to_jsonb(p) FROM profiles p WHERE p.id = cp.user_id) AS other_participant,
    (
        SELECT jsonb_build_object('content', m.content, 'created_at', m.created_at)
        FROM messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
    ) AS last_message,
    (
        SELECT COUNT(*)
        FROM messages m
        WHERE m.conversation_id = c.id
          AND m.sender_id != p_user_id
          AND m.read_at IS NULL
    ) AS unread_count
FROM
    conversations c
JOIN
    -- Join to find the other participant in the conversation
    conversation_participants cp ON c.id = cp.conversation_id AND cp.user_id != p_user_id
WHERE
    -- Filter to only conversations the requesting user is part of
    c.id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = p_user_id)
ORDER BY
    c.updated_at DESC;
$$;
