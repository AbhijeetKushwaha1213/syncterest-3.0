
import { useSearchParams } from 'react-router-dom';
import { useGlobalSearch } from '@/hooks/useSearch';
import SearchResultItem from '@/components/search/SearchResultItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { data: results, isLoading, error } = useGlobalSearch(query);

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Search Results
      </h1>
      <p className="text-muted-foreground mb-6">
        {query ? `Showing results for "${query}"` : 'Please enter a search term.'}
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

      {!isLoading && !error && query && (!results || results.length === 0) && (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg mt-4 text-center p-4">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">No results found</h3>
          <p className="text-muted-foreground mt-2">Try searching for something else.</p>
        </div>
      )}

      {!isLoading && !error && results && results.length > 0 && (
        <div className="space-y-4">
          {results.map((result) => (
            <SearchResultItem key={`${result.type}-${result.id}`} result={result} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
