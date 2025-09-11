
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdvancedSearch, ProfileWithCompatibility } from '@/hooks/useAdvancedSearch';
import SearchResultItem from '@/components/search/SearchResultItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, LayoutGrid, List, Heart, Tag } from 'lucide-react';
import SearchFilters, { SearchFiltersState } from '@/components/search/SearchFilters';
import UserCard from '@/components/UserCard';
import type { GlobalSearchResult } from '@/hooks/useSearch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [filters, setFilters] = useState<SearchFiltersState>({
    intent: 'all',
    personality_tags: [],
    distance: 50,
    sortBy: 'compatible',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { user } = useAuth();
  const { data: currentUserProfile } = useProfile(user?.id);
  const { data: results, isLoading, error } = useAdvancedSearch(query, filters);

  const handleFiltersChange = (newFilters: Partial<SearchFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleViewChange = (value: string | undefined) => {
    if (value && (value === 'grid' || value === 'list')) {
      setViewMode(value);
    }
  };
  
  const getMatchingPersonalityTags = (profileTags: string[] | null) => {
    if (!profileTags || !currentUserProfile?.personality_tags) {
      return [];
    }
    const currentUserTags = new Set(currentUserProfile.personality_tags);
    return profileTags.filter(tag => currentUserTags.has(tag));
  };

  const getMatchingInterests = (profileInterests: string[] | null) => {
    if (!profileInterests || !currentUserProfile?.interests) {
      return [];
    }
    const currentUserInterests = new Set(currentUserProfile.interests);
    return profileInterests.filter(interest => currentUserInterests.has(interest));
  };

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        Discover
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        <aside className="space-y-6">
          <SearchFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </aside>

        <main>
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">
              {query ? `Showing results for "${query}"` : 'Explore people using search and filters.'}
            </p>
             <ToggleGroup type="single" value={viewMode} onValueChange={handleViewChange} defaultValue="grid">
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {isLoading && (
             viewMode === 'list' ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="rounded-lg aspect-[3/4]" />
                  ))}
                </div>
              )
          )}

          {error && (
            <p className="text-destructive">Error: {error.message}</p>
          )}

          {!isLoading && !error && (
            <>
              {results === undefined && (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg mt-4 text-center p-4">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold">Discover your people</h3>
                  <p className="text-muted-foreground mt-2">Use the search bar and filters to find exactly who you're looking for.</p>
                </div>
              )}
              {results && results.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg mt-4 text-center p-4">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold">No results found</h3>
                  <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
                </div>
              )}
              {results && results.length > 0 && (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {results.map((profile: ProfileWithCompatibility) => {
                      const matchingTags = getMatchingPersonalityTags(profile.personality_tags);
                      const matchingInterests = getMatchingInterests(profile.interests);
                      
                      return (
                        <div key={profile.id} className="relative group">
                          <UserCard profile={profile} />
                          {filters.sortBy === 'compatible' && typeof profile.compatibility_score === 'number' && profile.compatibility_score > 0 && (
                            <Badge variant="destructive" className="absolute top-2 right-2 flex items-center gap-1 bg-pink-500 hover:bg-pink-600">
                              <Heart className="h-3 w-3" />
                              {Math.round(profile.compatibility_score * 100)}%
                            </Badge>
                          )}
                          {(matchingTags.length > 0 || matchingInterests.length > 0) && (
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                              {matchingTags.length > 0 && (
                                <div className="mb-1">
                                  <p className="text-xs font-semibold text-white mb-1">Matching Vibes:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {matchingTags.slice(0, 2).map(tag => (
                                      <Badge key={tag} variant="secondary" className="text-xs px-2 py-1 backdrop-blur-sm bg-purple-500/80 text-white">
                                        {tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {matchingInterests.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-white mb-1">Shared Interests:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {matchingInterests.slice(0, 2).map(interest => (
                                      <Badge key={interest} variant="secondary" className="text-xs px-2 py-1 backdrop-blur-sm bg-blue-500/80 text-white">
                                        {interest.split(':').pop()?.replace(/_/g, ' ')}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((profile: ProfileWithCompatibility) => {
                      const matchingTags = getMatchingPersonalityTags(profile.personality_tags);
                      const matchingInterests = getMatchingInterests(profile.interests);
                      const allMatching = [...matchingTags, ...matchingInterests.map(i => i.split(':').pop() || i)];
                      
                      const resultItem: GlobalSearchResult = {
                        id: profile.id,
                        type: 'profile',
                        title: profile.full_name || profile.username || 'Unnamed User',
                        description: profile.bio || '',
                        image_url: profile.avatar_url,
                        url_path: `/profile/${profile.id}`,
                        rank: 0,
                      };
                      return (
                        <SearchResultItem 
                          key={resultItem.id} 
                          result={resultItem} 
                          compatibilityScore={profile.compatibility_score} 
                          showCompatibility={filters.sortBy === 'compatible'} 
                          matchingTags={allMatching}
                        />
                      );
                    })}
                  </div>
                )
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
