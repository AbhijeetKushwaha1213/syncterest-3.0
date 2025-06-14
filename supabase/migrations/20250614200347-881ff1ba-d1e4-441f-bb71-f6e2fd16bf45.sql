
-- Create a table for events
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX events_created_by_idx ON public.events(created_by);
CREATE INDEX events_event_time_idx ON public.events(event_time);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policies for the 'events' table

-- 1. Allow authenticated users to view all events.
CREATE POLICY "Allow authenticated read access"
ON public.events
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow authenticated users to create events.
CREATE POLICY "Allow user to create events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- 3. Allow event creator to update their events.
CREATE POLICY "Allow user to update their own events"
ON public.events
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- 4. Allow event creator to delete their events.
CREATE POLICY "Allow user to delete their own events"
ON public.events
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);
