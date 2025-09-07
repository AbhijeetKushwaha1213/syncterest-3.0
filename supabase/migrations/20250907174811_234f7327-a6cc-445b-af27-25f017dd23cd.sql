-- Enhanced security fixes for live_activities location data (corrected)

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

-- 4. Update the live_activities RLS policy to be more restrictive
DROP POLICY IF EXISTS "Ultra-secure location privacy - explicit consent only" ON public.live_activities;
DROP POLICY IF EXISTS "Enhanced location privacy with audit" ON public.live_activities;

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

-- 5. Create performance indexes (without time-based predicates)
CREATE INDEX IF NOT EXISTS idx_location_access_audit_accessor ON public.location_access_audit(accessor_id, created_at);
CREATE INDEX IF NOT EXISTS idx_location_access_audit_target ON public.location_access_audit(target_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_location_sharing_permissions_lookup ON public.location_sharing_permissions(grantor_id, grantee_id);
CREATE INDEX IF NOT EXISTS idx_location_sharing_permissions_expires ON public.location_sharing_permissions(expires_at) WHERE expires_at IS NOT NULL;

-- 6. Add constraint to prevent self-permission grants
ALTER TABLE public.location_sharing_permissions 
ADD CONSTRAINT prevent_self_permission 
CHECK (grantor_id != grantee_id);