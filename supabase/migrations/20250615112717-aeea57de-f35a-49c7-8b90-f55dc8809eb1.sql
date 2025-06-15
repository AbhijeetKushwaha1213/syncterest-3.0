
-- Phase 1: Database Schema Enhancement for Personality-Based Matching

-- Step 1: Add new columns to the 'profiles' table to store user's intent, personality, and cultural data.
ALTER TABLE public.profiles
ADD COLUMN intent TEXT,
ADD COLUMN personality_tags TEXT[],
ADD COLUMN cultural_preferences JSONB,
ADD COLUMN location_city TEXT,
ADD COLUMN location_postal_code TEXT;

-- Step 2: Create a table to store predefined user intents.
CREATE TABLE public.intent_options (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Step 3: Enable RLS for the new table. Everyone authenticated should be able to read it.
ALTER TABLE public.intent_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view intent options" ON public.intent_options FOR SELECT TO authenticated USING (true);

-- Step 4: Populate the 'intent_options' table with initial values.
INSERT INTO public.intent_options (name, description) VALUES
('collaborate', 'Collaborate on a project'),
('deep_conversation', 'Have a deep conversation'),
('play_games', 'Play games'),
('plan_travel', 'Plan travel or meetups'),
('brainstorm_study', 'Brainstorm or study'),
('create_content', 'Create content together');

-- Step 5: Create a table for predefined personality vibes/tags.
CREATE TABLE public.personality_tags_options (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Step 6: Enable RLS for the new table. Everyone authenticated should be able to read it.
ALTER TABLE public.personality_tags_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view personality tag options" ON public.personality_tags_options FOR SELECT TO authenticated USING (true);

-- Step 7: Populate the 'personality_tags_options' table with initial values.
INSERT INTO public.personality_tags_options (name, description) VALUES
('thinker_deep_talker', 'Thinkers / Deep Talkers'),
('action_driven_hustler', 'Action-driven / Hustlers'),
('spiritual_calm', 'Spiritual / Calm'),
('logical_skeptical', 'Logical / Skeptical'),
('curious_explorer', 'Curious / Explorers');

-- Step 8: Add a foreign key constraint from profiles.intent to intent_options.name
-- This enforces that the intent must be one of the predefined options.
ALTER TABLE public.profiles
ADD CONSTRAINT fk_intent
FOREIGN KEY (intent)
REFERENCES public.intent_options(name)
ON DELETE SET NULL;
