
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from '@/hooks/useLocation';
import type { SearchFiltersState } from '@/components/search/SearchFilters';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useAdvancedSearch = (searchTerm: string, filters: SearchFiltersState) => {
  const { profileLocation } = useLocation();

  const isSearchTermPresent = searchTerm.trim().length > 0;
  const arePersonalityTagsPresent = filters.personality_tags.length > 0;
  const isIntentPresent = filters.intent !== 'all';
  
  const shouldPerformSearch = isSearchTermPresent || arePersonalityTagsPresent || isIntentPresent;

  return useQuery<Profile[]>({
    queryKey: ['advanced_search', searchTerm, filters, profileLocation],
    queryFn: async () => {
      // The RPC function expects personality_tags to be null if empty, not an empty array.
      const personalityTags = filters.personality_tags.length > 0 ? filters.personality_tags : null;

      const { data, error } = await supabase.rpc('advanced_search_users', {
        p_search_term: searchTerm.trim(),
        p_intent: filters.intent === 'all' ? null : filters.intent,
        p_personality_tags: personalityTags,
        p_latitude: profileLocation?.latitude ?? null,
        p_longitude: profileLocation?.longitude ?? null,
        p_radius_km: filters.distance,
        p_sort_by: filters.sortBy,
      });

      if (error) {
        console.error('Advanced search error:', error);
        throw new Error(error.message);
      }

      return (data as Profile[]) || [];
    },
    enabled: shouldPerformSearch,
  });
};
