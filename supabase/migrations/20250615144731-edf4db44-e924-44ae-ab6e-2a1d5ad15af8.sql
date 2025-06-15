
-- Phase 1: Channel Infrastructure (Corrected)

-- 1. Create ENUM types for better data consistency
CREATE TYPE public.channel_genre AS ENUM ('general', 'music', 'reading', 'gaming', 'tech');
CREATE TYPE public.channel_visibility AS ENUM ('public', 'private');
CREATE TYPE public.channel_role AS ENUM ('admin', 'moderator', 'member');

-- 2. Create all tables first
CREATE TABLE public.channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  genre public.channel_genre NOT NULL DEFAULT 'general',
  visibility public.channel_visibility NOT NULL DEFAULT 'public',
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  image_url TEXT,
  color TEXT,
  logo_letter TEXT
);

CREATE TABLE public.channel_members (
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  role public.channel_role NOT NULL DEFAULT 'member',
  PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE public.channel_messages (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT
);

-- 3. Enable Row Level Security on all tables
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for the `channels` table
CREATE POLICY "Public channels are viewable by everyone."
  ON public.channels FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Private channels are viewable by members."
  ON public.channels FOR SELECT
  USING (
    visibility = 'private' AND
    id IN (
      SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create channels."
  ON public.channels FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Channel creators can update their channels."
  ON public.channels FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Channel creators can delete their channels."
    ON public.channels FOR DELETE
    USING (auth.uid() = creator_id);

-- 5. Create Policies for the `channel_members` table
CREATE POLICY "Channel members can be viewed by other members."
  ON public.channel_members FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join public channels."
  ON public.channel_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.channels WHERE id = channel_members.channel_id AND visibility = 'public')
  );

CREATE POLICY "Users can leave channels."
  ON public.channel_members FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Channel admins can manage members."
  ON public.channel_members FOR ALL
  USING (
    EXISTS (
        SELECT 1 FROM public.channel_members cm
        WHERE cm.channel_id = channel_members.channel_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
  );

-- 6. Create Policies for the `channel_messages` table
CREATE POLICY "Channel members can view messages."
  ON public.channel_messages FOR SELECT
  USING (
    EXISTS (
        SELECT 1 FROM public.channel_members cm
        WHERE cm.channel_id = channel_messages.channel_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Channel members can send messages."
  ON public.channel_messages FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.channel_members cm
        WHERE cm.channel_id = channel_messages.channel_id
        AND cm.user_id = auth.uid()
    )
  );

-- 7. Create a trigger to automatically make the channel creator an admin
CREATE OR REPLACE FUNCTION public.handle_new_channel_creator_as_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.channel_members (channel_id, user_id, role)
  VALUES (NEW.id, NEW.creator_id, 'admin');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_channel_created_add_creator_as_admin
  AFTER INSERT ON public.channels
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_channel_creator_as_admin();


-- 8. Enable realtime updates on the new tables
ALTER TABLE public.channels REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;

ALTER TABLE public.channel_members REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_members;

ALTER TABLE public.channel_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_messages;
