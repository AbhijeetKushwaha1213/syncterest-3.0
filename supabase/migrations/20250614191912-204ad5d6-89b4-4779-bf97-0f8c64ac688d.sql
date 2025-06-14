
-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation_participants table
CREATE TABLE public.conversation_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT conversation_participants_uq UNIQUE (conversation_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add a trigger to update conversations.updated_at when a new message is added
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();

-- RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert for authenticated users" ON public.conversations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can view conversations they are part of"
  ON public.conversations FOR SELECT
  USING (id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()));

-- RLS for conversation_participants
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants of conversations they are in"
  ON public.conversation_participants FOR SELECT
  USING (conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert participants into conversations they are in"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()));
  
CREATE POLICY "Users can only delete themselves from conversations"
  ON public.conversation_participants FOR DELETE
  USING (user_id = auth.uid());

-- RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()));

CREATE POLICY "Users can send messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
  );

-- Enable realtime
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_participants REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
