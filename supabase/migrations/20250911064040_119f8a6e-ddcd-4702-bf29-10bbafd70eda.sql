-- Create an enhanced search function that handles ID, name, and interests more effectively
CREATE OR REPLACE FUNCTION public.enhanced_search_users(
    p_search_term TEXT,
    p_intent TEXT,
    p_personality_tags TEXT[],
    p_latitude DOUBLE PRECISION,
    p_longitude DOUBLE PRECISION,
    p_radius_km INTEGER,
    p_sort_by TEXT
)
RETURNS TABLE(
    id UUID,
    updated_at TIMESTAMP WITH TIME ZONE,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    interests TEXT[],
    status TEXT,
    last_active_at TIMESTAMP WITH TIME ZONE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    search_vector TSVECTOR,
    email_notifications_enabled BOOLEAN,
    push_notifications_enabled BOOLEAN,
    new_message_notifications BOOLEAN,
    new_follower_notifications BOOLEAN,
    group_activity_notifications BOOLEAN,
    event_reminder_notifications BOOLEAN,
    language TEXT,
    intent TEXT,
    personality_tags TEXT[],
    cultural_preferences JSONB,
    location_city TEXT,
    location_postal_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    profile_visibility TEXT,
    location_sharing_enabled BOOLEAN,
    show_location_on_profile BOOLEAN,
    show_activity_status BOOLEAN,
    compatibility_score REAL,
    search_rank REAL,
    distance_km REAL
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    WITH search_results AS (
        SELECT 
            p.*,
            CASE 
                WHEN (auth.uid() = p.id) OR (p.location_sharing_enabled = true AND has_location_permission(p.id))
                THEN p.latitude 
                ELSE NULL 
            END as profile_latitude,
            CASE 
                WHEN (auth.uid() = p.id) OR (p.location_sharing_enabled = true AND has_location_permission(p.id))
                THEN p.longitude 
                ELSE NULL 
            END as profile_longitude,
            calculate_compatibility_score(auth.uid(), p.id) as comp_score,
            
            -- Enhanced search ranking that considers multiple factors
            CASE 
                WHEN p_search_term IS NULL OR p_search_term = '' THEN 0.5
                ELSE (
                    -- ID exact match gets highest priority
                    CASE WHEN p.id::text = p_search_term THEN 100.0
                    -- Username exact match
                    WHEN LOWER(p.username) = LOWER(p_search_term) THEN 90.0
                    -- Full name exact match
                    WHEN LOWER(p.full_name) = LOWER(p_search_term) THEN 85.0
                    -- Username starts with search term
                    WHEN LOWER(p.username) LIKE LOWER(p_search_term || '%') THEN 80.0
                    -- Full name starts with search term
                    WHEN LOWER(p.full_name) LIKE LOWER(p_search_term || '%') THEN 75.0
                    -- Interest exact match (highest interest priority)
                    WHEN EXISTS (
                        SELECT 1 FROM unnest(p.interests) AS interest 
                        WHERE LOWER(interest) = LOWER(p_search_term)
                           OR LOWER(interest) LIKE '%:' || LOWER(p_search_term)
                           OR LOWER(split_part(interest, ':', 2)) = LOWER(p_search_term)
                    ) THEN 70.0
                    -- Interest partial match
                    WHEN EXISTS (
                        SELECT 1 FROM unnest(p.interests) AS interest 
                        WHERE LOWER(interest) LIKE '%' || LOWER(p_search_term) || '%'
                           OR LOWER(split_part(interest, ':', 2)) LIKE '%' || LOWER(p_search_term) || '%'
                    ) THEN 60.0
                    -- Username contains search term
                    WHEN LOWER(p.username) LIKE '%' || LOWER(p_search_term) || '%' THEN 50.0
                    -- Full name contains search term
                    WHEN LOWER(p.full_name) LIKE '%' || LOWER(p_search_term) || '%' THEN 45.0
                    -- Bio contains search term
                    WHEN LOWER(p.bio) LIKE '%' || LOWER(p_search_term) || '%' THEN 40.0
                    -- Full text search fallback
                    WHEN p.search_vector @@ websearch_to_tsquery('english', p_search_term) THEN 
                        ts_rank(p.search_vector, websearch_to_tsquery('english', p_search_term)) * 30.0
                    ELSE 0.0
                    END
                )
            END as rank_score,
            
            -- Calculate distance if location is available
            CASE 
                WHEN p_latitude IS NOT NULL AND p_longitude IS NOT NULL 
                     AND p.location_sharing_enabled = true AND has_location_permission(p.id)
                     AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
                THEN (6371 * acos(
                    cos(radians(p_latitude)) * cos(radians(p.latitude)) *
                    cos(radians(p.longitude) - radians(p_longitude)) +
                    sin(radians(p_latitude)) * sin(radians(p.latitude))
                ))
                ELSE NULL
            END as calc_distance
            
        FROM public.profiles p
        WHERE
            p.id != auth.uid()
            AND p.profile_visibility = 'public'
            -- Enhanced search conditions
            AND (
                p_search_term IS NULL OR p_search_term = '' OR
                -- ID search
                p.id::text = p_search_term OR
                -- Name search (case insensitive)
                LOWER(p.username) LIKE '%' || LOWER(p_search_term) || '%' OR
                LOWER(p.full_name) LIKE '%' || LOWER(p_search_term) || '%' OR
                -- Interest search (comprehensive)
                EXISTS (
                    SELECT 1 FROM unnest(p.interests) AS interest 
                    WHERE LOWER(interest) LIKE '%' || LOWER(p_search_term) || '%'
                       OR LOWER(split_part(interest, ':', 2)) LIKE '%' || LOWER(p_search_term) || '%'
                ) OR
                -- Bio search
                LOWER(p.bio) LIKE '%' || LOWER(p_search_term) || '%' OR
                -- Full text search
                p.search_vector @@ websearch_to_tsquery('english', p_search_term)
            )
            AND (p_intent IS NULL OR p_intent = 'all' OR p.intent = p_intent)
            AND (
                array_length(p_personality_tags, 1) IS NULL OR 
                array_length(p_personality_tags, 1) = 0 OR 
                p.personality_tags && p_personality_tags
            )
            AND (
                p_latitude IS NULL OR p_longitude IS NULL OR p_radius_km IS NULL OR 
                NOT (p.location_sharing_enabled = true AND has_location_permission(p.id)) OR 
                p.latitude IS NULL OR p.longitude IS NULL OR
                calc_distance <= p_radius_km
            )
    )
    SELECT 
        sr.id,
        sr.updated_at,
        sr.username,
        sr.full_name,
        sr.avatar_url,
        sr.bio,
        sr.interests,
        sr.status,
        sr.last_active_at,
        sr.profile_latitude,
        sr.profile_longitude,
        sr.search_vector,
        sr.email_notifications_enabled,
        sr.push_notifications_enabled,
        sr.new_message_notifications,
        sr.new_follower_notifications,
        sr.group_activity_notifications,
        sr.event_reminder_notifications,
        sr.language,
        sr.intent,
        sr.personality_tags,
        sr.cultural_preferences,
        sr.location_city,
        sr.location_postal_code,
        sr.created_at,
        sr.profile_visibility,
        sr.location_sharing_enabled,
        sr.show_location_on_profile,
        sr.show_activity_status,
        sr.comp_score,
        sr.rank_score,
        sr.calc_distance
    FROM search_results sr
    ORDER BY 
        CASE 
            WHEN p_sort_by = 'compatible' THEN -sr.comp_score
            WHEN p_sort_by = 'distance' THEN COALESCE(sr.calc_distance, 999999)
            WHEN p_sort_by = 'recent' THEN 
                CASE WHEN sr.show_activity_status AND sr.last_active_at IS NOT NULL 
                     THEN EXTRACT(EPOCH FROM (NOW() - sr.last_active_at))
                     ELSE 999999999 
                END
            WHEN p_sort_by = 'new' THEN EXTRACT(EPOCH FROM (NOW() - sr.created_at))
            ELSE -sr.rank_score -- Default: search relevance
        END ASC,
        -- Secondary sort: prioritize nearby and recently active users
        COALESCE(sr.calc_distance, 999999) ASC,
        CASE WHEN sr.show_activity_status AND sr.last_active_at IS NOT NULL 
             THEN EXTRACT(EPOCH FROM (NOW() - sr.last_active_at))
             ELSE 999999999 
        END ASC;
END;
$$;