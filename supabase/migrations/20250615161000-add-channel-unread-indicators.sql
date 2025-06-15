
-- Create a table to track the last time a user read messages in a channel.
CREATE TABLE public.channel_last_read_times (
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

-- Enable RLS and Realtime
ALTER TABLE public.channel_last_read_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_last_read_times REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_last_read_times;

-- Policies for channel_last_read_times
CREATE POLICY "Users can manage their own last_read_at timestamps."
  ON public.channel_last_read_times
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to mark a channel as read
CREATE OR REPLACE FUNCTION public.mark_channel_as_read(p_channel_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Check if user is a member
  IF EXISTS (
    SELECT 1 FROM channel_members WHERE channel_id = p_channel_id AND user_id = auth.uid()
  ) THEN
    -- Upsert the last read time
    INSERT INTO channel_last_read_times (channel_id, user_id, last_read_at)
    VALUES (p_channel_id, auth.uid(), now())
    ON CONFLICT (channel_id, user_id)
    DO UPDATE SET last_read_at = now();
  END IF;
END;
$$;

-- A composite type to structure the return data for joined channels list
DROP TYPE IF EXISTS public.channel_with_unread CASCADE;
CREATE TYPE public.channel_with_unread AS (
    id UUID,
    created_at TIMESTAMPTZ,
    name TEXT,
    description TEXT,
    genre public.channel_genre,
    visibility public.channel_visibility,
    creator_id UUID,
    image_url TEXT,
    color TEXT,
    logo_letter TEXT,
    unread_count BIGINT
);

-- Function to get all joined channels for a user with unread counts.
CREATE OR REPLACE FUNCTION public.get_joined_channels_with_unread(p_user_id uuid)
RETURNS SETOF public.channel_with_unread
LANGUAGE sql
STABLE
AS $$
SELECT
    c.id,
    c.created_at,
    c.name,
    c.description,
    c.genre,
    c.visibility,
    c.creator_id,
    c.image_url,
    c.color,
    c.logo_letter,
    (
        SELECT COUNT(*)
        FROM public.channel_messages msg
        WHERE msg.channel_id = c.id
        AND msg.user_id != p_user_id -- Don't count my own messages
        AND msg.created_at > COALESCE(
            (SELECT last_read_at FROM public.channel_last_read_times WHERE channel_id = c.id AND user_id = p_user_id),
            '1970-01-01T00:00:00Z'::timestamptz -- if never read, count all messages
        )
    ) AS unread_count
FROM
    public.channels c
WHERE
    c.id IN (SELECT channel_id FROM public.channel_members WHERE user_id = p_user_id)
ORDER BY
    c.name;
$$;
