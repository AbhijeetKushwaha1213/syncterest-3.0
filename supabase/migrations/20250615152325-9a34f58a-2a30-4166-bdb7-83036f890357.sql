
-- Create a table for channel message reactions
CREATE TABLE public.channel_message_reactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES public.channel_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (message_id, user_id, emoji)
);

-- Enable Row Level Security
ALTER TABLE public.channel_message_reactions ENABLE ROW LEVEL SECURITY;

-- Set replica identity to full for realtime
ALTER TABLE public.channel_message_reactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_message_reactions;

-- POLICY: Users can view reactions in channels they are a member of
CREATE POLICY "Users can view reactions in their channels"
ON public.channel_message_reactions FOR SELECT
USING (
    public.is_channel_member(
        (SELECT channel_id FROM public.channel_messages WHERE id = message_id),
        auth.uid()
    )
);

-- POLICY: Users can insert reactions in channels they are a member of
CREATE POLICY "Users can insert their own reactions in channels"
ON public.channel_message_reactions FOR INSERT
WITH CHECK (
    user_id = auth.uid() AND
    public.is_channel_member(
        (SELECT channel_id FROM public.channel_messages WHERE id = message_id),
        auth.uid()
    )
);

-- POLICY: Users can delete their own reactions
CREATE POLICY "Users can delete their own reactions"
ON public.channel_message_reactions FOR DELETE
USING (user_id = auth.uid());
