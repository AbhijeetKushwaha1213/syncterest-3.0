
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Channel } from '@/types';

const fetchTrendingChannels = async () => {
  const { data, error } = await supabase
    .from('channels')
    .select('*, channel_members(count)')
    .eq('visibility', 'public')
    .order('count', { foreignTable: 'channel_members', ascending: false })
    .limit(6);

  if (error) {
    console.error("Error fetching trending channels:", error);
    throw error;
  }
  
  return data as unknown as (Channel & { channel_members: { count: number }[] })[];
};

export const useTrendingChannels = () => {
  return useQuery({
    queryKey: ['trending-channels'],
    queryFn: fetchTrendingChannels,
  });
};
