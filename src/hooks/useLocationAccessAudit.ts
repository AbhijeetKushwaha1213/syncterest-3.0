import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type LocationAccessAuditRecord = {
  id: string;
  accessor_id: string;
  target_user_id: string;
  activity_id: string | null;
  access_type: string;
  created_at: string;
  accessor_profile?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  target_profile?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
};

export const useLocationAccessAudit = () => {
  const { user } = useAuth();

  // Get audit records where current user's location was accessed by others
  const { data: accessToMyLocation, isLoading: isLoadingAccessToMe } = useQuery({
    queryKey: ['location-access-audit', 'to-me', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('location_access_audit')
        .select(`
          id,
          accessor_id,
          target_user_id,
          activity_id,
          access_type,
          created_at
        `)
        .eq('target_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Fetch profiles separately since we don't have foreign keys set up yet
      const accessorIds = [...new Set(data.map(d => d.accessor_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', accessorIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(record => ({
        ...record,
        accessor_profile: profileMap.get(record.accessor_id) || null,
        target_profile: null
      })) as LocationAccessAuditRecord[];
    },
    enabled: !!user,
  });

  // Get audit records of current user accessing others' location data
  const { data: myAccessToOthers, isLoading: isLoadingMyAccess } = useQuery({
    queryKey: ['location-access-audit', 'by-me', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('location_access_audit')
        .select(`
          id,
          accessor_id,
          target_user_id,
          activity_id,
          access_type,
          created_at
        `)
        .eq('accessor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Fetch profiles separately since we don't have foreign keys set up yet
      const targetIds = [...new Set(data.map(d => d.target_user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', targetIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(record => ({
        ...record,
        accessor_profile: null,
        target_profile: profileMap.get(record.target_user_id) || null
      })) as LocationAccessAuditRecord[];
    },
    enabled: !!user,
  });

  return {
    accessToMyLocation: accessToMyLocation || [],
    myAccessToOthers: myAccessToOthers || [],
    isLoadingAccessToMe,
    isLoadingMyAccess,
    isLoading: isLoadingAccessToMe || isLoadingMyAccess,
  };
};