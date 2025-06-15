
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import SearchResultItem from '@/components/search/SearchResultItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import SearchFilters, { SearchFiltersState } from '@/components/search/SearchFilters';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [filters, setFilters] = useState<SearchFiltersState>({
    intent: 'all',
    personality_tags: [],
    distance: 50,
    sortBy: 'compatible',
  });

  const { data: results, isLoading, error } = useAdvancedSearch(query, filters);

  const handleFiltersChange = (newFilters: Partial<SearchFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
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
          <p className="text-muted-foreground mb-4">
            {query ? `Showing results for "${query}"` : 'Explore people using search and filters.'}
          </p>

          {isLoading && (
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
          )}

          {error && (
            <p className="text-destructive">Error: {error.message}</p>
          )}

          {!isLoading && !error && results && results.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg mt-4 text-center p-4">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No results found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
            </div>
          )}

          {!isLoading && !error && results && results.length > 0 && (
            <div className="space-y-4">
              {results.map((result) => (
                <SearchResultItem key={`${result.type}-${result.id}`} result={result} />
              ))}
            </div>
          )}
          
          {!isLoading && !error && (!results || results.length === 0) && (
             <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg mt-4 text-center p-4">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">Discover your people</h3>
              <p className="text-muted-foreground mt-2">Use the search bar and filters to find exactly who you're looking for.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
