
-- Create a table for groups
CREATE TABLE public.groups (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    description text NULL,
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url text NULL
);

-- Create a table for group members
CREATE TABLE public.group_members (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (group_id, user_id)
);

-- Enable Row Level Security (RLS) for both tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for groups table
CREATE POLICY "Public groups are viewable by everyone." ON public.groups FOR SELECT USING (true);
CREATE POLICY "Users can insert their own groups." ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own groups." ON public.groups FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own groups." ON public.groups FOR DELETE USING (auth.uid() = created_by);

-- RLS policies for group_members table
CREATE POLICY "Group members are public." ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Users can join and leave groups." ON public.group_members FOR ALL USING (auth.uid() = user_id);
