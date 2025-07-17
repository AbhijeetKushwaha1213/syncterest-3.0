
-- Enhanced compatibility score function with weighted components
CREATE OR REPLACE FUNCTION public.calculate_compatibility_score(user1_id uuid, user2_id uuid)
RETURNS real
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    -- User 1 data
    interests1 text[];
    personality_tags1 text[];
    intent1 text;
    cultural_preferences1 jsonb;
    
    -- User 2 data
    interests2 text[];
    personality_tags2 text[];
    intent2 text;
    cultural_preferences2 jsonb;
    
    -- Score components
    interests_score real := 0;
    personality_score real := 0;
    intent_score real := 0;
    cultural_score real := 0;
    
    -- Helper variables
    common_interests_count integer;
    total_interests_count integer;
    union_interests text[];
    shared_personality_tags integer;
    cultural_key text;
    matching_cultural_prefs integer := 0;
    
    -- Final weighted score
    final_score real := 0;
BEGIN
    -- Get data for both users
    SELECT interests, personality_tags, intent, cultural_preferences 
    INTO interests1, personality_tags1, intent1, cultural_preferences1
    FROM public.profiles WHERE id = user1_id;
    
    SELECT interests, personality_tags, intent, cultural_preferences 
    INTO interests2, personality_tags2, intent2, cultural_preferences2
    FROM public.profiles WHERE id = user2_id;

    -- 1. SHARED INTERESTS (50% weight) - Keep existing Jaccard index logic
    -- Handle cases where interests might be null or empty
    IF interests1 IS NULL OR array_length(interests1, 1) IS NULL THEN
        interests1 := '{}';
    END IF;
    IF interests2 IS NULL OR array_length(interests2, 1) IS NULL THEN
        interests2 := '{}';
    END IF;

    -- Calculate common interests (intersection)
    SELECT count(*) INTO common_interests_count
    FROM (
        SELECT unnest(interests1)
        INTERSECT
        SELECT unnest(interests2)
    ) AS common;

    -- Calculate total unique interests (union)
    IF common_interests_count > 0 THEN
        SELECT array_agg(DISTINCT interest) INTO union_interests
        FROM (
            SELECT unnest(interests1)
            UNION ALL
            SELECT unnest(interests2)
        ) AS all_interests(interest);

        total_interests_count := array_length(union_interests, 1);
        
        IF total_interests_count > 0 THEN
            interests_score := common_interests_count::real / total_interests_count::real;
        END IF;
    END IF;

    -- 2. PERSONALITY TAGS (30% weight)
    -- Handle null or empty personality tags
    IF personality_tags1 IS NULL OR array_length(personality_tags1, 1) IS NULL THEN
        personality_tags1 := '{}';
    END IF;
    IF personality_tags2 IS NULL OR array_length(personality_tags2, 1) IS NULL THEN
        personality_tags2 := '{}';
    END IF;

    -- Count shared personality tags
    SELECT count(*) INTO shared_personality_tags
    FROM (
        SELECT unnest(personality_tags1)
        INTERSECT
        SELECT unnest(personality_tags2)
    ) AS shared_tags;

    -- Apply personality scoring logic
    IF shared_personality_tags = 1 THEN
        personality_score := 0.5; -- 0.15 out of 0.30 max = 0.5
    ELSIF shared_personality_tags >= 2 THEN
        personality_score := 1.0; -- 0.30 out of 0.30 max = 1.0
    END IF;

    -- 3. USER INTENT (10% weight)
    -- Handle null intents
    IF intent1 IS NOT NULL AND intent2 IS NOT NULL AND intent1 = intent2 THEN
        intent_score := 1.0; -- 0.10 out of 0.10 max = 1.0
    END IF;

    -- 4. CULTURAL PREFERENCES (10% weight)
    -- Handle null cultural preferences
    IF cultural_preferences1 IS NOT NULL AND cultural_preferences2 IS NOT NULL THEN
        -- Iterate through keys in cultural_preferences1 and check for matches
        FOR cultural_key IN SELECT jsonb_object_keys(cultural_preferences1)
        LOOP
            -- Check if the same key exists in cultural_preferences2 with the same value
            IF cultural_preferences2 ? cultural_key AND 
               (cultural_preferences1->>cultural_key) = (cultural_preferences2->>cultural_key) THEN
                matching_cultural_prefs := matching_cultural_prefs + 1;
            END IF;
        END LOOP;
        
        -- Each match adds 0.033, max 3 matches = 0.10 (normalized to 1.0)
        cultural_score := LEAST(matching_cultural_prefs * 0.33, 1.0);
    END IF;

    -- Calculate final weighted score
    final_score := (interests_score * 0.5) + (personality_score * 0.3) + (intent_score * 0.1) + (cultural_score * 0.1);

    -- Ensure score is between 0 and 1
    final_score := GREATEST(0, LEAST(1, final_score));

    RETURN final_score;
END;
$$;
