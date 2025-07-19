
-- Create a table to store user personality responses
CREATE TABLE public.personality_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gender TEXT,
  height TEXT,
  ethnicity TEXT,
  conversation_style TEXT,
  values_in_partner TEXT,
  sports_excitement TEXT,
  trip_handling TEXT,
  group_behavior TEXT,
  social_energy TEXT,
  day_planning TEXT,
  weekend_recharge TEXT,
  new_experiences TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.personality_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own personality responses" 
  ON public.personality_responses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personality responses" 
  ON public.personality_responses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personality responses" 
  ON public.personality_responses 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personality responses" 
  ON public.personality_responses 
  FOR DELETE 
  USING (auth.uid() = user_id);
