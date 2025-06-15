
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const fetchChannel = async (channelId: string) => {
  const { data, error } = await supabase
    .from('channels')
    .select('*, channel_members(count)')
    .eq('id', channelId)
    .single();

  if (error) {
    console.error('Error fetching channel:', error);
    if(error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

export const useChannel = (channelId: string | undefined) => {
  return useQuery({
    queryKey: ['channel', channelId],
    queryFn: () => fetchChannel(channelId!),
    enabled: !!channelId,
  });
};
