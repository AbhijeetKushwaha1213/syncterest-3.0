import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, User, Tag, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

const EnhancedSearchInput = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Common search suggestions based on interests and activities
  const searchSuggestions = [
    { type: 'interest', label: 'Cricket', icon: Tag },
    { type: 'interest', label: 'Football', icon: Tag },
    { type: 'interest', label: 'Basketball', icon: Tag },
    { type: 'interest', label: 'Gaming', icon: Tag },
    { type: 'interest', label: 'Music', icon: Tag },
    { type: 'interest', label: 'Art', icon: Tag },
    { type: 'interest', label: 'Travel', icon: Tag },
    { type: 'interest', label: 'Photography', icon: Tag },
    { type: 'search', label: 'Search by username', icon: User },
    { type: 'search', label: 'Search by ID', icon: Hash },
  ];

  const filteredSuggestions = query 
    ? searchSuggestions.filter(s => 
        s.label.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : searchSuggestions.slice(0, 8);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/search');
    }
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleSuggestionClick = (suggestion: typeof searchSuggestions[0]) => {
    if (suggestion.type === 'interest') {
      setQuery(suggestion.label);
      navigate(`/search?q=${encodeURIComponent(suggestion.label)}`);
    }
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    navigate('/search');
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search by name, interest, or ID..."
          className="w-full pl-9 pr-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {showSuggestions && (
        <div className="absolute top-full mt-1 w-full bg-background border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {query ? 'Matching suggestions' : 'Popular searches'}
            </p>
            <div className="space-y-1">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-2 p-2 text-sm rounded-md hover:bg-muted text-left"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <suggestion.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{suggestion.label}</span>
                  {suggestion.type === 'interest' && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Interest
                    </Badge>
                  )}
                </button>
              ))}
            </div>
            
            {query && (
              <>
                <div className="border-t my-2" />
                <button
                  className="w-full flex items-center gap-2 p-2 text-sm rounded-md hover:bg-muted text-left"
                  onClick={handleSubmit}
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span>Search for "{query}"</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchInput;