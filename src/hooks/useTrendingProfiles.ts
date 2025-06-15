
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useTrendingProfiles = (limit: number) => {
  return useQuery<Profile[]>({
    queryKey: ['trending_profiles', limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_trending_profiles', {
        limit_count: limit,
      });

      if (error) {
        console.error('Error fetching trending profiles:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
  });
};
