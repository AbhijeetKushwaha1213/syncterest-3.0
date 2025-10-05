-- Create groups and group_members tables for community groups feature

-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL CHECK (length(name) >= 3 AND length(name) <= 100),
    description text NOT NULL CHECK (length(description) >= 10 AND length(description) <= 1000),
    interest_tags text[] NOT NULL DEFAULT '{}',
    location_name text NOT NULL CHECK (length(location_name) >= 5 AND length(location_name) <= 200),
    latitude double precision NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude double precision NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    meeting_time text NOT NULL CHECK (length(meeting_time) >= 5 AND length(meeting_time) <= 200),
    created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create group_members table for user-group relationships
CREATE TABLE IF NOT EXISTS public.group_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(group_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_groups_interest_tags ON public.groups USING GIN (interest_tags);
CREATE INDEX IF NOT EXISTS idx_groups_location ON public.groups USING GIST (ll_to_earth(latitude, longitude));
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups (created_by);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members (group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members (user_id);

-- Create search_groups RPC function for location and text search
CREATE OR REPLACE FUNCTION public.search_groups(
    search_query text DEFAULT '',
    search_lat double precision DEFAULT NULL,
    search_long double precision DEFAULT NULL,
    search_radius_km integer DEFAULT 50
)
RETURNS TABLE(
    id uuid,
    name text,
    description text,
    interest_tags text[],
    location_name text,
    latitude double precision,
    longitude double precision,
    meeting_time text,
    created_by uuid,
    created_at timestamptz,
    member_count bigint,
    distance_km real
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    WITH group_with_members AS (
        SELECT
            g.*,
            COUNT(gm.id) as member_count,
            -- Calculate distance using earth_distance if coordinates provided
            CASE
                WHEN search_lat IS NOT NULL AND search_long IS NOT NULL
                THEN earth_distance(
                    ll_to_earth(search_lat, search_long),
                    ll_to_earth(g.latitude, g.longitude)
                ) / 1000.0 -- Convert meters to kilometers
                ELSE NULL
            END as distance_calc
        FROM public.groups g
        LEFT JOIN public.group_members gm ON g.id = gm.group_id
        GROUP BY g.id, g.name, g.description, g.interest_tags, g.location_name,
                 g.latitude, g.longitude, g.meeting_time, g.created_by, g.created_at
    ),
    filtered_groups AS (
        SELECT gw.*
        FROM group_with_members gw
        WHERE
            -- Text search: match name or interest tags
            (search_query IS NULL OR search_query = '' OR
             LOWER(gw.name) LIKE '%' || LOWER(search_query) || '%' OR
             EXISTS (
                 SELECT 1 FROM unnest(gw.interest_tags) AS tag
                 WHERE LOWER(tag) LIKE '%' || LOWER(search_query) || '%'
             ))
            AND
            -- Location filter: within radius if coordinates provided
            (search_lat IS NULL OR search_long IS NULL OR search_radius_km IS NULL OR
             gw.distance_calc IS NULL OR gw.distance_calc <= search_radius_km)
    )
    SELECT
        fg.id,
        fg.name,
        fg.description,
        fg.interest_tags,
        fg.location_name,
        fg.latitude,
        fg.longitude,
        fg.meeting_time,
        fg.created_by,
        fg.created_at,
        fg.member_count,
        fg.distance_calc
    FROM filtered_groups fg
    ORDER BY
        -- Prioritize exact matches and closer groups
        CASE
            WHEN search_query IS NOT NULL AND search_query != '' THEN
                CASE
                    -- Exact name match gets highest priority
                    WHEN LOWER(fg.name) = LOWER(search_query) THEN 1
                    -- Name starts with search term
                    WHEN LOWER(fg.name) LIKE LOWER(search_query) || '%' THEN 2
                    -- Interest tag exact match
                    WHEN EXISTS (
                        SELECT 1 FROM unnest(fg.interest_tags) AS tag
                        WHERE LOWER(tag) = LOWER(search_query)
                    ) THEN 3
                    -- Interest tag partial match
                    WHEN EXISTS (
                        SELECT 1 FROM unnest(fg.interest_tags) AS tag
                        WHERE LOWER(tag) LIKE '%' || LOWER(search_query) || '%'
                    ) THEN 4
                    -- Name partial match
                    WHEN LOWER(fg.name) LIKE '%' || LOWER(search_query) || '%' THEN 5
                    ELSE 6
                END
            ELSE 1
        END ASC,
        -- Secondary sort: distance (closer first)
        COALESCE(fg.distance_calc, 999999) ASC,
        -- Tertiary sort: member count (more popular first)
        fg.member_count DESC,
        -- Final sort: newest first
        fg.created_at DESC;
END;
$$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for groups table
-- Anyone can read groups (public visibility)
CREATE POLICY "Groups are publicly readable" ON public.groups
    FOR SELECT USING (true);

-- Only authenticated users can create groups
CREATE POLICY "Users can create groups" ON public.groups
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Only the creator can update their groups
CREATE POLICY "Users can update own groups" ON public.groups
    FOR UPDATE USING (auth.uid() = created_by);

-- Only the creator can delete their groups
CREATE POLICY "Users can delete own groups" ON public.groups
    FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for group_members table
-- Users can see all group memberships (for member counts)
CREATE POLICY "Group memberships are publicly readable" ON public.group_members
    FOR SELECT USING (true);

-- Users can join groups (insert their own membership)
CREATE POLICY "Users can join groups" ON public.group_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can leave groups (delete their own membership)
CREATE POLICY "Users can leave groups" ON public.group_members
    FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger for groups table
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_groups_updated_at
    BEFORE UPDATE ON public.groups
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.groups IS 'Community groups for local meetups and activities';
COMMENT ON TABLE public.group_members IS 'User memberships in groups';
COMMENT ON FUNCTION public.search_groups IS 'Search groups by text query and location proximity';
