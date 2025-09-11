import { Badge } from '@/components/ui/badge';
import { ProfileWithCompatibility } from '@/hooks/useAdvancedSearch';

interface SearchDebugInfoProps {
  profile: ProfileWithCompatibility;
  searchTerm: string;
}

const SearchDebugInfo = ({ profile, searchTerm }: SearchDebugInfoProps) => {
  if (!searchTerm) return null;

  const getMatchType = () => {
    const term = searchTerm.toLowerCase();
    
    // Check ID match
    if (profile.id.toString() === searchTerm) return 'ID Match';
    
    // Check exact name matches
    if (profile.username?.toLowerCase() === term) return 'Username Exact';
    if (profile.full_name?.toLowerCase() === term) return 'Name Exact';
    
    // Check starts with
    if (profile.username?.toLowerCase().startsWith(term)) return 'Username Start';
    if (profile.full_name?.toLowerCase().startsWith(term)) return 'Name Start';
    
    // Check interest matches
    if (profile.interests?.some(interest => {
      const interestLower = interest.toLowerCase();
      const interestPart = interest.split(':').pop()?.toLowerCase() || '';
      return interestLower === term || 
             interestLower.includes(':' + term) || 
             interestPart === term;
    })) return 'Interest Exact';
    
    if (profile.interests?.some(interest => {
      const interestLower = interest.toLowerCase();
      const interestPart = interest.split(':').pop()?.toLowerCase() || '';
      return interestLower.includes(term) || interestPart.includes(term);
    })) return 'Interest Partial';
    
    // Check contains
    if (profile.username?.toLowerCase().includes(term)) return 'Username Contains';
    if (profile.full_name?.toLowerCase().includes(term)) return 'Name Contains';
    if (profile.bio?.toLowerCase().includes(term)) return 'Bio Contains';
    
    return 'Text Search';
  };

  const matchType = getMatchType();
  
  return (
    <div className="absolute top-2 left-2 flex flex-col gap-1">
      <Badge variant="secondary" className="text-xs bg-green-500/80 text-white">
        {matchType}
      </Badge>
      {profile.search_rank && profile.search_rank > 0 && (
        <Badge variant="secondary" className="text-xs bg-blue-500/80 text-white">
          Rank: {Math.round(profile.search_rank)}
        </Badge>
      )}
      {profile.distance_km && (
        <Badge variant="secondary" className="text-xs bg-orange-500/80 text-white">
          {Math.round(profile.distance_km)}km
        </Badge>
      )}
    </div>
  );
};

export default SearchDebugInfo;