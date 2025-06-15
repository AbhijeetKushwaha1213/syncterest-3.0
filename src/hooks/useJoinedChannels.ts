
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useJoinedChannels = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['joined-channels', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('channels')
        .select('*, channel_members!inner(user_id)')
        .eq('channel_members.user_id', user.id)
        .order('name');

      if (error) {
        console.error('Error fetching joined channels:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
  });
};
