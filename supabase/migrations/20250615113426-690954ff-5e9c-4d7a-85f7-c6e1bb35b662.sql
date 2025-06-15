
-- Phase 4: Implement Advanced Search Logic (Database Part)

-- Step 1: Add a 'created_at' column to the 'profiles' table to allow sorting by new users.
-- The default value now() will apply to new rows. Existing rows will have NULL,
-- which is handled by the search function.
ALTER TABLE public.profiles
ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();

-- Step 2: Create the advanced search function for users.
-- This function will handle filtering by intent, personality, and distance, as well as sorting.
CREATE OR REPLACE FUNCTION advanced_search_users(
    p_search_term text,
    p_intent text,
    p_personality_tags text[],
    p_latitude double precision,
    p_longitude double precision,
    p_radius_km integer,
    p_sort_by text
)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    -- Common WHERE clause to be reused
    where_clause TEXT := '
        WHERE
            p.id != auth.uid()
            AND (' || quote_nullable(p_search_term) || ' IS NULL OR ' || quote_nullable(p_search_term) || ' = '''' OR p.search_vector @@ websearch_to_tsquery(''english'', ' || quote_nullable(p_search_term) || '))
            AND (' || quote_nullable(p_intent) || ' IS NULL OR ' || quote_nullable(p_intent) || ' = ''all'' OR p.intent = ' || quote_nullable(p_intent) || ')
            AND (array_length(' || quote_nullable(p_personality_tags) || ', 1) IS NULL OR array_length(' || quote_nullable(p_personality_tags) || ', 1) = 0 OR p.personality_tags && ' || quote_nullable(p_personality_tags) || ')
            AND (
                ' || quote_nullable(p_latitude) || ' IS NULL OR ' || quote_nullable(p_longitude) || ' IS NULL OR ' || quote_nullable(p_radius_km) || ' IS NULL OR p.latitude IS NULL OR p.longitude IS NULL OR
                (6371 * acos(
                    cos(radians(' || p_latitude || ')) * cos(radians(p.latitude)) *
                    cos(radians(p.longitude) - radians(' || p_longitude || ')) +
                    sin(radians(' || p_latitude || ')) * sin(radians(p.latitude))
                )) <= ' || p_radius_km || '
            )
    ';
    query TEXT;
BEGIN
    IF p_sort_by = 'distance' THEN
        query := 'SELECT * FROM public.profiles p ' || where_clause || '
                  ORDER BY (CASE
                                WHEN ' || quote_nullable(p_latitude) || ' IS NOT NULL AND ' || quote_nullable(p_longitude) || ' IS NOT NULL AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
                                THEN (6371 * acos(
                                        cos(radians(' || p_latitude || ')) * cos(radians(p.latitude)) *
                                        cos(radians(p.longitude) - radians(' || p_longitude || ')) +
                                        sin(radians(' || p_latitude || ')) * sin(radians(p.latitude))
                                    ))
                                ELSE NULL
                            END) ASC NULLS LAST';
    ELSIF p_sort_by = 'recent' THEN
        query := 'SELECT * FROM public.profiles p ' || where_clause || ' ORDER BY p.last_active_at DESC NULLS LAST';
    ELSIF p_sort_by = 'new' THEN
        query := 'SELECT * FROM public.profiles p ' || where_clause || ' ORDER BY p.created_at DESC NULLS LAST';
    ELSE -- 'compatible' and other fallbacks
        query := 'SELECT * FROM public.profiles p ' || where_clause || ' ORDER BY ts_rank(p.search_vector, websearch_to_tsquery(''english'', ' || quote_nullable(p_search_term) || ')) DESC';
    END IF;

    RETURN QUERY EXECUTE query;
END;
$$;
