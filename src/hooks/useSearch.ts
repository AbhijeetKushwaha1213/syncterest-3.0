
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
  return useQuery({
    queryKey: ['global_search', searchTerm],
    queryFn: async (): Promise<GlobalSearchResult[]> => {
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
      
      if (!data) {
        return [];
      }

      const validTypes: GlobalSearchResult['type'][] = ['profile', 'group', 'event', 'live_activity'];
      
      // The data from supabase.rpc is loosely typed. We need to filter out invalid items
      // and ensure the shape conforms to our strict GlobalSearchResult type.
      const cleanedData = data.reduce((acc: GlobalSearchResult[], item) => {
        if (
            item.id && 
            item.type && 
            validTypes.includes(item.type as any) &&
            item.title && 
            item.url_path && 
            item.rank !== null
        ) {
          acc.push({
            id: item.id,
            type: item.type as GlobalSearchResult['type'],
            title: item.title,
            description: item.description,
            image_url: item.image_url,
            url_path: item.url_path,
            rank: item.rank,
          });
        }
        return acc;
      }, []);

      return cleanedData;
    },
    enabled: !!searchTerm && searchTerm.trim().length >= 2,
  });
};
