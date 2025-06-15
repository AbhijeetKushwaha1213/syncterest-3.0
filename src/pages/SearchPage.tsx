
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import SearchResultItem from '@/components/search/SearchResultItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, LayoutGrid, List } from 'lucide-react';
import SearchFilters, { SearchFiltersState } from '@/components/search/SearchFilters';
import UserCard from '@/components/UserCard';
import type { GlobalSearchResult } from '@/hooks/useSearch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Card, CardContent } from '@/components/ui/card';

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

  const { data: results, isLoading, error } = useAdvancedSearch(query, filters);

  const handleFiltersChange = (newFilters: Partial<SearchFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleViewChange = (value: 'grid' | 'list') => {
    if (value) setViewMode(value);
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
                    {results.map((profile) => (
                      <UserCard key={profile.id} profile={profile} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((profile) => {
                      const resultItem: GlobalSearchResult = {
                        id: profile.id,
                        type: 'profile',
                        title: profile.username || 'Unnamed User',
                        description: profile.bio || '',
                        image_url: profile.avatar_url,
                        url_path: `/profile/${profile.id}`,
                        rank: 0,
                      };
                      return <SearchResultItem key={resultItem.id} result={resultItem} />;
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
