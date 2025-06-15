
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Channel } from '@/types';

const fetchChannels = async (): Promise<(Channel & { channel_members: { count: number }[] })[]> => {
  const { data, error } = await supabase
    .from('channels')
    .select('*, channel_members(count)')
    .eq('visibility', 'public')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching channels:", error);
    throw error;
  }
  
  return data as unknown as (Channel & { channel_members: { count: number }[] })[];
};

export const useChannels = () => {
  return useQuery({
    queryKey: ['channels'],
    queryFn: fetchChannels,
  });
};
