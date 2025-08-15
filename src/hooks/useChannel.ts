
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Channel } from '@/types';

const fetchChannel = async (channelId: string): Promise<Channel | null> => {
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
  return data as unknown as Channel | null;
};

export const useChannel = (channelId: string | undefined) => {
  return useQuery({
    queryKey: ['channel', channelId],
    queryFn: () => fetchChannel(channelId!),
    enabled: !!channelId,
  });
};
