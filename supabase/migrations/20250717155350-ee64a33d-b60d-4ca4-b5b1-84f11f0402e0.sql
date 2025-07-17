
-- Update the advanced_search_users function to use the enhanced compatibility score
CREATE OR REPLACE FUNCTION advanced_search_users(
    p_search_term text,
    p_intent text,
    p_personality_tags text[],
    p_latitude double precision,
    p_longitude double precision,
    p_radius_km integer,
    p_sort_by text
)
RETURNS TABLE(
    id uuid,
    updated_at timestamptz,
    username text,
    full_name text,
    avatar_url text,
    bio text,
    interests text[],
    status text,
    last_active_at timestamptz,
    latitude double precision,
    longitude double precision,
    search_vector tsvector,
    email_notifications_enabled boolean,
    push_notifications_enabled boolean,
    new_message_notifications boolean,
    new_follower_notifications boolean,
    group_activity_notifications boolean,
    event_reminder_notifications boolean,
    language text,
    intent text,
    personality_tags text[],
    cultural_preferences jsonb,
    location_city text,
    location_postal_code text,
    created_at timestamptz,
    profile_visibility text,
    location_sharing_enabled boolean,
    show_location_on_profile boolean,
    show_activity_status boolean,
    compatibility_score real
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    where_clause TEXT;
    query TEXT;
    order_by_clause TEXT;
    -- The SELECT clause now includes a call to calculate_compatibility_score
    select_clause TEXT := '
        SELECT p.*, calculate_compatibility_score(auth.uid(), p.id) as compatibility_score
        FROM public.profiles p
    ';
BEGIN
    -- Construct the WHERE clause with privacy checks
    where_clause := '
        WHERE
            p.id != auth.uid()
            AND p.profile_visibility = ''public''
            AND (' || quote_nullable(p_search_term) || ' IS NULL OR ' || quote_nullable(p_search_term) || ' = '''' OR p.search_vector @@ websearch_to_tsquery(''english'', ' || quote_nullable(p_search_term) || '))
            AND (' || quote_nullable(p_intent) || ' IS NULL OR ' || quote_nullable(p_intent) || ' = ''all'' OR p.intent = ' || quote_nullable(p_intent) || ')
            AND (array_length(' || quote_nullable(p_personality_tags) || ', 1) IS NULL OR array_length(' || quote_nullable(p_personality_tags) || ', 1) = 0 OR p.personality_tags && ' || quote_nullable(p_personality_tags) || ')
            AND (
                ' || quote_nullable(p_latitude) || ' IS NULL OR ' || quote_nullable(p_longitude) || ' IS NULL OR ' || quote_nullable(p_radius_km) || ' IS NULL OR p.location_sharing_enabled IS NOT TRUE OR p.latitude IS NULL OR p.longitude IS NULL OR
                (6371 * acos(
                    cos(radians(' || p_latitude || ')) * cos(radians(p.latitude)) *
                    cos(radians(p.longitude) - radians(' || p_longitude || ')) +
                    sin(radians(' || p_latitude || ')) * sin(radians(p.latitude))
                )) <= ' || p_radius_km || '
            )
    ';

    -- Construct the full query based on the sort option
    IF p_sort_by = 'compatible' THEN
        -- Sort by the newly calculated compatibility score using the enhanced function
        order_by_clause := 'ORDER BY compatibility_score DESC';
    ELSIF p_sort_by = 'distance' THEN
        order_by_clause := 'ORDER BY (CASE WHEN ' || quote_nullable(p_latitude) || ' IS NOT NULL AND ' || quote_nullable(p_longitude) || ' IS NOT NULL AND p.location_sharing_enabled IS TRUE AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL THEN (6371 * acos(cos(radians(' || p_latitude || ')) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(' || p_longitude || ')) + sin(radians(' || p_latitude || ')) * sin(radians(p.latitude)))) ELSE NULL END) ASC NULLS LAST';
    ELSIF p_sort_by = 'recent' THEN
        order_by_clause := 'ORDER BY (CASE WHEN p.show_activity_status THEN p.last_active_at ELSE NULL END) DESC NULLS LAST';
    ELSIF p_sort_by = 'new' THEN
        order_by_clause := 'ORDER BY p.created_at DESC NULLS LAST';
    ELSE -- fallback to text search ranking
        order_by_clause := 'ORDER BY ts_rank(p.search_vector, websearch_to_tsquery(''english'', ' || quote_nullable(p_search_term) || ')) DESC';
    END IF;

    query := select_clause || where_clause || order_by_clause;

    RETURN QUERY EXECUTE query;
END;
$$;
