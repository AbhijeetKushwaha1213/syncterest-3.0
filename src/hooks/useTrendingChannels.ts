
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  
  return data;
};

export const useTrendingChannels = () => {
  return useQuery({
    queryKey: ['trending-channels'],
    queryFn: fetchTrendingChannels,
  });
};
