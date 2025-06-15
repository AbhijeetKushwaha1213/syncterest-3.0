
-- Add tsvector column to profiles table for full-text search
ALTER TABLE public.profiles ADD COLUMN search_vector tsvector;

-- Create a function to update the profile search vector
CREATE OR REPLACE FUNCTION public.update_profile_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.username, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.full_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.bio, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the search vector on profile changes
CREATE TRIGGER profiles_search_vector_update
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_profile_search_vector();

-- Create a GIN index for fast searching on profiles
CREATE INDEX profiles_search_vector_idx ON public.profiles USING GIN (search_vector);

-- Add tsvector column to groups table
ALTER TABLE public.groups ADD COLUMN search_vector tsvector;

-- Create a function to update the group search vector
CREATE OR REPLACE FUNCTION public.update_group_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the search vector on group changes
CREATE TRIGGER groups_search_vector_update
BEFORE INSERT OR UPDATE ON public.groups
FOR EACH ROW EXECUTE FUNCTION public.update_group_search_vector();

-- Create a GIN index for fast searching on groups
CREATE INDEX groups_search_vector_idx ON public.groups USING GIN (search_vector);

-- Add tsvector column to events table
ALTER TABLE public.events ADD COLUMN search_vector tsvector;

-- Create a function to update the event search vector
CREATE OR REPLACE FUNCTION public.update_event_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.location, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the search vector on event changes
CREATE TRIGGER events_search_vector_update
BEFORE INSERT OR UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.update_event_search_vector();

-- Create a GIN index for fast searching on events
CREATE INDEX events_search_vector_idx ON public.events USING GIN (search_vector);

-- Add tsvector column to live_activities table
ALTER TABLE public.live_activities ADD COLUMN search_vector tsvector;

-- Create a function to update the live_activity search vector
CREATE OR REPLACE FUNCTION public.update_live_activity_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.activity_type, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.custom_message, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the search vector on live_activity changes
CREATE TRIGGER live_activities_search_vector_update
BEFORE INSERT OR UPDATE ON public.live_activities
FOR EACH ROW EXECUTE FUNCTION public.update_live_activity_search_vector();

-- Create a GIN index for fast searching on live_activities
CREATE INDEX live_activities_search_vector_idx ON public.live_activities USING GIN (search_vector);

-- Backfill existing data for all tables
UPDATE public.profiles SET search_vector = 
    setweight(to_tsvector('english', coalesce(username, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(full_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(bio, '')), 'C');

UPDATE public.groups SET search_vector = 
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B');

UPDATE public.events SET search_vector = 
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(location, '')), 'C');

UPDATE public.live_activities SET search_vector = 
    setweight(to_tsvector('english', coalesce(activity_type, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(custom_message, '')), 'B');


-- Create a custom type for global search results
CREATE TYPE public.global_search_result AS (
  id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  image_url TEXT,
  url_path TEXT,
  rank REAL
);

-- Create a function for global search
CREATE OR REPLACE FUNCTION public.global_search(search_term TEXT)
RETURNS SETOF public.global_search_result AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    'profile' AS type,
    p.username AS title,
    p.bio AS description,
    p.avatar_url AS image_url,
    '/profile/' || p.id::text AS url_path,
    ts_rank(p.search_vector, websearch_to_tsquery('english', search_term)) as rank
  FROM public.profiles p
  WHERE p.search_vector @@ websearch_to_tsquery('english', search_term)

  UNION ALL

  SELECT
    g.id,
    'group' AS type,
    g.name AS title,
    g.description AS description,
    g.image_url AS image_url,
    '/groups/' || g.id::text AS url_path,
    ts_rank(g.search_vector, websearch_to_tsquery('english', search_term)) as rank
  FROM public.groups g
  WHERE g.search_vector @@ websearch_to_tsquery('english', search_term)

  UNION ALL

  SELECT
    e.id,
    'event' AS type,
    e.title AS title,
    e.description AS description,
    e.image_url AS image_url,
    '/events/' || e.id::text AS url_path,
    ts_rank(e.search_vector, websearch_to_tsquery('english', search_term)) as rank
  FROM public.events e
  WHERE e.search_vector @@ websearch_to_tsquery('english', search_term)

  UNION ALL

  SELECT
    la.id,
    'live_activity' AS type,
    la.activity_type AS title,
    la.custom_message AS description,
    (SELECT avatar_url FROM public.profiles WHERE id = la.user_id),
    '/profile/' || la.user_id::text AS url_path,
    ts_rank(la.search_vector, websearch_to_tsquery('english', search_term)) as rank
  FROM public.live_activities la
  WHERE la.expires_at > now() AND la.search_vector @@ websearch_to_tsquery('english', search_term)
  
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql STABLE;

