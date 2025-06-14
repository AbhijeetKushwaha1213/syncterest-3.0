
-- Add latitude and longitude columns to the profiles table
ALTER TABLE public.profiles
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;

-- Add an index for location columns to speed up queries
CREATE INDEX idx_profiles_location ON public.profiles (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create a function to find nearby users within a given radius
CREATE OR REPLACE FUNCTION public.get_nearby_users(
    p_latitude double precision,
    p_longitude double precision,
    p_radius_km integer
)
RETURNS SETOF profiles
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT *
  FROM public.profiles
  WHERE
    id != auth.uid() AND
    latitude IS NOT NULL AND
    longitude IS NOT NULL AND
    -- Using the haversine formula to calculate distance in kilometers.
    -- 6371 is the Earth's radius in km.
    6371 * acos(
        cos(radians(p_latitude)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians(p_longitude)) +
        sin(radians(p_latitude)) * sin(radians(latitude))
    ) <= p_radius_km
$$;
