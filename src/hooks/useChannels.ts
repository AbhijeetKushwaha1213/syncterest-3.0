
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const fetchChannels = async () => {
  const { data, error } = await supabase
    .from('channels')
    .select('*, channel_members(count)')
    .eq('visibility', 'public')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching channels:", error);
    throw error;
  }
  
  return data;
};

export const useChannels = () => {
  return useQuery({
    queryKey: ['channels'],
    queryFn: fetchChannels,
  });
};
