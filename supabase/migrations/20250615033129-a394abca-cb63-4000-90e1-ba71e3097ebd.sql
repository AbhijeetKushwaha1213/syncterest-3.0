
-- Create a table for live activities
CREATE TABLE public.live_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  custom_message TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_live_activities_user_id ON public.live_activities(user_id);
CREATE INDEX idx_live_activities_expires_at ON public.live_activities(expires_at);

-- Add Row Level Security (RLS)
ALTER TABLE public.live_activities ENABLE ROW LEVEL SECURITY;

-- Users can view all non-expired live activities
CREATE POLICY "Users can view non-expired live activities"
  ON public.live_activities
  FOR SELECT
  USING (expires_at > now());

-- Users can create their own live activities
CREATE POLICY "Users can create their own live activities"
  ON public.live_activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own live activities
CREATE POLICY "Users can update their own live activities"
  ON public.live_activities
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own live activities
CREATE POLICY "Users can delete their own live activities"
  ON public.live_activities
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable real-time updates on the new table
ALTER TABLE public.live_activities REPLICA IDENTITY FULL;

DO
$$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.live_activities;
  END IF;
END
$$;
