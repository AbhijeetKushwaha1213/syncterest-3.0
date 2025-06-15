
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from '@/hooks/useLocation';
import type { SearchFiltersState } from '@/components/search/SearchFilters';
import type { GlobalSearchResult } from '@/hooks/useSearch';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useAdvancedSearch = (searchTerm: string, filters: SearchFiltersState) => {
  const { location } = useLocation();

  const isSearchTermPresent = searchTerm.trim().length > 0;
  const arePersonalityTagsPresent = filters.personality_tags.length > 0;
  const isIntentPresent = filters.intent !== 'all';
  
  const shouldPerformSearch = isSearchTermPresent || arePersonalityTagsPresent || isIntentPresent;

  return useQuery<GlobalSearchResult[]>({
    queryKey: ['advanced_search', searchTerm, filters, location],
    queryFn: async () => {
      // The RPC function expects personality_tags to be null if empty, not an empty array.
      const personalityTags = filters.personality_tags.length > 0 ? filters.personality_tags : null;

      const { data, error } = await supabase.rpc('advanced_search_users', {
        p_search_term: searchTerm.trim(),
        p_intent: filters.intent === 'all' ? null : filters.intent,
        p_personality_tags: personalityTags,
        p_latitude: location?.latitude ?? null,
        p_longitude: location?.longitude ?? null,
        p_radius_km: filters.distance,
        p_sort_by: filters.sortBy,
      });

      if (error) {
        console.error('Advanced search error:', error);
        throw new Error(error.message);
      }

      if (!data) {
        return [];
      }

      // Map profiles to GlobalSearchResult to reuse the SearchResultItem component
      const results: GlobalSearchResult[] = (data as Profile[]).map((profile: Profile) => ({
        id: profile.id,
        type: 'profile',
        title: profile.username || 'Unnamed User',
        description: profile.bio || '',
        image_url: profile.avatar_url,
        url_path: `/profile/${profile.id}`,
        rank: 0, // rank is not applicable here as sorting is handled by the function
      }));

      return results;
    },
    enabled: shouldPerformSearch,
  });
};
