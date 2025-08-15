
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const fetchChannelRole = async (channelId: string, userId: string) => {
  const { data, error } = await supabase
    .from('channel_members')
    .select('role')
    .eq('channel_id', channelId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Not found, user is not a member
      return null;
    }
    console.error('Error fetching channel role:', error);
    throw error;
  }
  return data?.role;
};

export const useChannelRole = (channelId: string | undefined) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['channel-role', channelId, user?.id],
    queryFn: () => fetchChannelRole(channelId!, user!.id),
    enabled: !!channelId && !!user?.id,
  });
};
