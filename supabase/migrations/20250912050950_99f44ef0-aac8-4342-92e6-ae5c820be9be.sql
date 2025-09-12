-- Fix the enhanced_search_users function to return correct column structure
DROP FUNCTION IF EXISTS public.enhanced_search_users(text, text, text[], double precision, double precision, integer, text);

CREATE OR REPLACE FUNCTION public.enhanced_search_users(
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
    updated_at timestamp with time zone,
    username text,
    full_name text,
    avatar_url text,
    bio text,
    interests text[],
    status text,
    last_active_at timestamp with time zone,
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
    created_at timestamp with time zone,
    profile_visibility text,
    location_sharing_enabled boolean,
    show_location_on_profile boolean,
    show_activity_status boolean,
    compatibility_score real,
    search_rank real,
    distance_km real
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
            END as distance_calc
            
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
    ), filtered_results AS (
        SELECT sr.*
        FROM search_results sr
        WHERE (
            p_latitude IS NULL OR p_longitude IS NULL OR p_radius_km IS NULL OR 
            sr.distance_calc IS NULL OR
            sr.distance_calc <= p_radius_km
        )
    )
    SELECT 
        fr.id,
        fr.updated_at,
        fr.username,
        fr.full_name,
        fr.avatar_url,
        fr.bio,
        fr.interests,
        fr.status,
        fr.last_active_at,
        fr.profile_latitude,
        fr.profile_longitude,
        fr.search_vector,
        fr.email_notifications_enabled,
        fr.push_notifications_enabled,
        fr.new_message_notifications,
        fr.new_follower_notifications,
        fr.group_activity_notifications,
        fr.event_reminder_notifications,
        fr.language,
        fr.intent,
        fr.personality_tags,
        fr.cultural_preferences,
        fr.location_city,
        fr.location_postal_code,
        fr.created_at,
        fr.profile_visibility,
        fr.location_sharing_enabled,
        fr.show_location_on_profile,
        fr.show_activity_status,
        fr.comp_score,
        fr.rank_score,
        fr.distance_calc
    FROM filtered_results fr
    ORDER BY 
        CASE 
            WHEN p_sort_by = 'compatible' THEN -fr.comp_score
            WHEN p_sort_by = 'distance' THEN COALESCE(fr.distance_calc, 999999)
            WHEN p_sort_by = 'recent' THEN 
                CASE WHEN fr.show_activity_status AND fr.last_active_at IS NOT NULL 
                     THEN EXTRACT(EPOCH FROM (NOW() - fr.last_active_at))
                     ELSE 999999999 
                END
            WHEN p_sort_by = 'new' THEN EXTRACT(EPOCH FROM (NOW() - fr.created_at))
            ELSE -fr.rank_score -- Default: search relevance
        END ASC,
        -- Secondary sort: prioritize nearby and recently active users
        COALESCE(fr.distance_calc, 999999) ASC,
        CASE WHEN fr.show_activity_status AND fr.last_active_at IS NOT NULL 
             THEN EXTRACT(EPOCH FROM (NOW() - fr.last_active_at))
             ELSE 999999999 
        END ASC;
END;
$$;