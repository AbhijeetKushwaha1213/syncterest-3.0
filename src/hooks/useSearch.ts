
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type GlobalSearchResult = {
  id: string;
  type: 'profile' | 'group' | 'event' | 'live_activity';
  title: string;
  description: string | null;
  image_url: string | null;
  url_path: string;
  rank: number;
};

export const useGlobalSearch = (searchTerm: string) => {
  return useQuery<GlobalSearchResult[]>({
    queryKey: ['global_search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }
      const { data, error } = await supabase.rpc('global_search', {
        search_term: searchTerm.trim(),
      });

      if (error) {
        console.error('Global search error:', error);
        throw new Error(error.message);
      }
      return data || [];
    },
    enabled: !!searchTerm && searchTerm.trim().length >= 2,
  });
};
