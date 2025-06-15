
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileWithCompatibility = Profile & { compatibility_score: number };

const MatchesList = () => {
  const { data: matchedProfiles, isLoading: isLoadingMatches, error } = useQuery<ProfileWithCompatibility[]>({
    queryKey: ['matches_with_compatibility'],
    queryFn: async () => {
      console.log("Fetching matches with compatibility...");
      // 1. Get the IDs and scores of matched users
      const { data: matchesData, error: rpcError } = await supabase.rpc('get_matches');
      console.log("RPC get_matches result:", { matchesData, rpcError });

      if (rpcError) {
        console.error('Error fetching matches:', rpcError);
        throw rpcError;
      }
      
      if (!matchesData || matchesData.length === 0) {
        console.log("No matches found.");
        return [];
      }

      const profileIds = matchesData.map(match => match.profile_id);
      console.log(`Fetching profiles for ${profileIds.length} matched IDs.`);
      
      // 2. Fetch the profiles for those IDs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', profileIds);

      if (profilesError) {
        console.error('Error fetching matched profiles:', profilesError);
        throw profilesError;
      }

      if (!profiles) {
        return [];
      }

      // 3. Combine profiles with compatibility scores
      const profilesWithScores = profiles.map(profile => {
        const matchData = matchesData.find(m => m.profile_id === profile.id);
        return {
          ...profile,
          compatibility_score: matchData?.compatibility_score ?? 0,
        };
      });

      // 4. Sort by compatibility score (descending)
      profilesWithScores.sort((a, b) => b.compatibility_score - a.compatibility_score);

      console.log("Successfully fetched and sorted matched profiles:", profilesWithScores);
      return profilesWithScores;
    },
  });

  if (error) {
    console.error("Error loading matches:", error);
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg mt-4">
        <p className="text-muted-foreground text-red-500">Could not load matches. Please try again later.</p>
      </div>
    );
  }

  if (isLoadingMatches) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 md:px-0">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
      </div>
    );
  }

  if (!matchedProfiles || matchedProfiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg mt-4">
        <p className="text-muted-foreground">No matches found yet. Keep exploring!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 md:px-0">
      {matchedProfiles.map(profile => (
        <Card key={profile.id} className="overflow-hidden relative group">
          <CardContent className="p-0 text-center">
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 z-10 bg-black/50 text-white backdrop-blur-sm"
            >
              {Math.round(profile.compatibility_score * 100)}% Match
            </Badge>
            <Link to={`/profile/${profile.id}`}>
              <Avatar className="h-32 w-full rounded-none">
                <AvatarImage src={profile.avatar_url || `https://avatar.vercel.sh/${profile.username}`} alt={profile.full_name || profile.username || 'user'} className="object-cover" />
                <AvatarFallback className="rounded-none">{(profile.full_name || profile.username || 'U').charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="p-4">
              <Link to={`/profile/${profile.id}`}>
                <h3 className="font-semibold text-base truncate">{profile.full_name || profile.username}</h3>
              </Link>
              <p className="text-xs text-muted-foreground h-8 overflow-hidden">{profile.bio || ''}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MatchesList;
