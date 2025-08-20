-- Enhanced security fixes for live_activities location data

-- 1. Create audit table for location access tracking
CREATE TABLE IF NOT EXISTS public.location_access_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  accessor_id uuid NOT NULL, -- who accessed the data
  target_user_id uuid NOT NULL, -- whose location was accessed
  activity_id uuid, -- which activity was accessed
  access_type text NOT NULL, -- 'view', 'query', etc.
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.location_access_audit ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own audit records (what they accessed)
CREATE POLICY "Users can view their own access audit" 
ON public.location_access_audit 
FOR SELECT 
USING (accessor_id = auth.uid());

-- Only allow users to view audit records of their data being accessed
CREATE POLICY "Users can view access to their data" 
ON public.location_access_audit 
FOR SELECT 
USING (target_user_id = auth.uid());

-- 2. Create function to audit location access
CREATE OR REPLACE FUNCTION public.audit_location_access(
  p_target_user_id uuid,
  p_activity_id uuid DEFAULT NULL,
  p_access_type text DEFAULT 'view'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only audit if different users
  IF auth.uid() != p_target_user_id THEN
    INSERT INTO public.location_access_audit (
      accessor_id,
      target_user_id,
      activity_id,
      access_type
    ) VALUES (
      auth.uid(),
      p_target_user_id,
      p_activity_id,
      p_access_type
    );
  END IF;
END;
$$;

-- 3. Enhanced location permission check function
CREATE OR REPLACE FUNCTION public.has_location_permission(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  has_permission boolean := false;
BEGIN
  -- User can always access their own data
  IF auth.uid() = target_user_id THEN
    RETURN true;
  END IF;
  
  -- Check for explicit location sharing permission
  SELECT EXISTS (
    SELECT 1 FROM public.location_sharing_permissions lsp
    WHERE lsp.grantor_id = target_user_id 
    AND lsp.grantee_id = auth.uid() 
    AND (lsp.expires_at IS NULL OR lsp.expires_at > now())
  ) INTO has_permission;
  
  -- Audit the access attempt
  PERFORM public.audit_location_access(target_user_id, null, 'permission_check');
  
  RETURN has_permission;
END;
$$;

-- 4. Function to get live activities with proper permission filtering
CREATE OR REPLACE FUNCTION public.get_permitted_live_activities()
RETURNS SETOF live_activities
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Audit this query
  PERFORM public.audit_location_access(auth.uid(), null, 'query_activities');
  
  RETURN QUERY
  SELECT la.*
  FROM public.live_activities la
  WHERE la.expires_at > now()
    AND (
      -- User's own activities
      la.user_id = auth.uid()
      OR
      -- Activities from users who granted permission
      public.has_location_permission(la.user_id)
    )
  ORDER BY la.created_at DESC;
END;
$$;

-- 5. Function to get live activity with location masking
CREATE OR REPLACE FUNCTION public.get_live_activity_safe(activity_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  activity_type text,
  custom_message text,
  latitude double precision,
  longitude double precision,
  expires_at timestamp with time zone,
  created_at timestamp with time zone,
  has_precise_location boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  activity_record live_activities%ROWTYPE;
  has_permission boolean;
BEGIN
  -- Get the activity
  SELECT * INTO activity_record
  FROM public.live_activities la
  WHERE la.id = activity_id AND la.expires_at > now();
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check permission
  has_permission := public.has_location_permission(activity_record.user_id);
  
  -- Audit the access
  PERFORM public.audit_location_access(activity_record.user_id, activity_id, 'view_activity');
  
  -- Return data with location masking if no permission
  RETURN QUERY SELECT
    activity_record.id,
    activity_record.user_id,
    activity_record.activity_type,
    activity_record.custom_message,
    CASE 
      WHEN has_permission THEN activity_record.latitude
      ELSE NULL 
    END as latitude,
    CASE 
      WHEN has_permission THEN activity_record.longitude
      ELSE NULL 
    END as longitude,
    activity_record.expires_at,
    activity_record.created_at,
    has_permission as has_precise_location;
END;
$$;

-- 6. Update the live_activities RLS policy to be more restrictive
DROP POLICY IF EXISTS "Ultra-secure location privacy - explicit consent only" ON public.live_activities;

CREATE POLICY "Enhanced location privacy with audit" 
ON public.live_activities 
FOR SELECT 
USING (
  expires_at > now() 
  AND (
    -- User can see their own activities
    auth.uid() = user_id 
    OR 
    -- User has explicit permission and we audit the access
    (
      public.has_location_permission(user_id)
    )
  )
);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_location_access_audit_accessor ON public.location_access_audit(accessor_id, created_at);
CREATE INDEX IF NOT EXISTS idx_location_access_audit_target ON public.location_access_audit(target_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_location_sharing_permissions_active ON public.location_sharing_permissions(grantor_id, grantee_id) WHERE expires_at IS NULL OR expires_at > now();

-- 8. Add rate limiting table
CREATE TABLE IF NOT EXISTS public.location_access_rate_limit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  access_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on rate limit table
ALTER TABLE public.location_access_rate_limit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rate limit data" 
ON public.location_access_rate_limit 
FOR SELECT 
USING (user_id = auth.uid());

-- 9. Function to check and enforce rate limiting
CREATE OR REPLACE FUNCTION public.check_location_access_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count integer := 0;
  rate_limit integer := 100; -- Max 100 location accesses per hour
  window_minutes integer := 60;
BEGIN
  -- Get current access count in the time window
  SELECT COALESCE(SUM(access_count), 0) INTO current_count
  FROM public.location_access_rate_limit
  WHERE user_id = auth.uid()
    AND window_start > (now() - (window_minutes || ' minutes')::interval);
  
  -- Check if over limit
  IF current_count >= rate_limit THEN
    RETURN false;
  END IF;
  
  -- Increment counter
  INSERT INTO public.location_access_rate_limit (user_id, access_count, window_start)
  VALUES (auth.uid(), 1, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    access_count = location_access_rate_limit.access_count + 1,
    window_start = CASE 
      WHEN location_access_rate_limit.window_start < (now() - (window_minutes || ' minutes')::interval)
      THEN now()
      ELSE location_access_rate_limit.window_start
    END;
  
  RETURN true;
END;
$$;