
-- Add latitude and longitude columns to the events table
ALTER TABLE public.events 
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;

-- Add an index for location-based queries (optional but recommended for performance)
CREATE INDEX idx_events_location ON public.events USING GIST (
  ll_to_earth(latitude, longitude)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Update the search vector function to include location data
DROP TRIGGER IF EXISTS update_events_search_vector ON public.events;

CREATE OR REPLACE FUNCTION public.update_event_search_vector()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.location, '')), 'C');
  RETURN NEW;
END;
$function$;

CREATE TRIGGER update_events_search_vector
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION update_event_search_vector();
