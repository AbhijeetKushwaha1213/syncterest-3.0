
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type GroupMember = Database['public']['Tables']['group_members']['Row'];

export const useGroupMembers = (groupId: string | undefined) => {
  return useQuery<GroupMember[]>({
    queryKey: ['group-members', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      if (error) {
        throw error;
      }
      return data || [];
    },
    enabled: !!groupId,
  });
};
