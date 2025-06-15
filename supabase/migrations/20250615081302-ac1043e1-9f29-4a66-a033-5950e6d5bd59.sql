
-- Create a table to store message reactions
CREATE TABLE public.reactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (message_id, user_id, emoji)
);

-- Add a foreign key to the users table
ALTER TABLE public.reactions
  ADD CONSTRAINT reactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE;
  
-- Set replica identity to full to include previous data on updates, which is good for realtime
ALTER TABLE public.reactions REPLICA IDENTITY FULL;

-- Enable Row Level Security
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- POLICY: Users can view reactions in their conversations
CREATE POLICY "Users can view reactions in their conversations"
ON public.reactions FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.messages m
        JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
        WHERE m.id = reactions.message_id AND cp.user_id = auth.uid()
    )
);

-- POLICY: Users can add their own reactions
CREATE POLICY "Users can insert their own reactions"
ON public.reactions FOR INSERT
WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
        SELECT 1
        FROM public.messages m
        JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
        WHERE m.id = reactions.message_id AND cp.user_id = auth.uid()
    )
);

-- POLICY: Users can delete their own reactions
CREATE POLICY "Users can delete their own reactions"
ON public.reactions FOR DELETE
USING (user_id = auth.uid());
